/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
// @google/genai SDK kept for type compatibility only — API calls use direct REST fetch
import { Check, ChevronRight, Mic, MicOff, Play, Square, Link as LinkIcon, Plus, FileText, Clock, Mail, X } from "lucide-react";
import { COMP_LIBRARY, CAT_META, DNA_CATEGORIES, TEAM_DYNAMIC_TEMPLATES, INDUSTRIES } from "../data/bbi_metadata";
import CompIcon from "../components/CompIcon";
import CustomSelect from "../components/CustomSelect";

/* ─── GEMINI REST API ─────────────────────────────────────── */

async function listGeminiModels(key: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const json = await res.json();
    if (!res.ok) return [];
    return (json.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => (m.name as string).replace("models/", ""));
  } catch { return []; }
}

async function callGenAI(prompt: string, schema: any): Promise<any> {
  const key = import.meta.env.VITE_GEMINI_API_KEY
    || (process.env as any).VITE_GEMINI_API_KEY
    || (process.env as any).GEMINI_API_KEY
    || "";
  if (!key || key === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API key not found. Set GEMINI_API_KEY in Vercel → Settings → Environment Variables.");
  }

  const available = await listGeminiModels(key);
  const PREFERRED = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  const toTry = available.length > 0
    ? PREFERRED.filter(m => available.includes(m)).concat(available.filter(m => !PREFERRED.includes(m)))
    : PREFERRED;

  if (toTry.length === 0) {
    throw new Error(`No models found.`);
  }

  let lastErr = "";
  for (const model of toTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.7,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        lastErr = `${model} (${res.status}): ${json?.error?.message || res.statusText}`;
        continue;
      }

      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastErr = `${model}: empty response`; continue; }

      return JSON.parse(text);
    } catch (e: any) {
      lastErr = `${model}: ${e?.message || e}`;
    }
  }

  throw new Error(`All models failed: ${lastErr}`);
}

/* ─── TTS TEXT BUILDER ────────────────────────────────────────────── */
function buildTTSText(scenario: { scene_setter: string; cta: string }): string {
  const clean = (s: string) =>
    s
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/[*_#>|\[\]{}\\]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

  const intro = clean(scenario.scene_setter).slice(0, 600);
  const question = clean(scenario.cta).slice(0, 200);
  return `${intro}. ${question}`.replace(/\.\s*\./g, ".").trim();
}

/* ─── SARVAM TTS ─── */
async function fetchSarvamTTS(text: string): Promise<string | null> {
  try {
    const clean = text.slice(0, 1000);
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    return data.audio as string;
  } catch (e) {
    return null;
  }
}

function SARVAM_KEY() {
  return import.meta.env.VITE_SARVAM_KEY || "";
}

async function fetchSarvamSTT(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");
    formData.append("language_code", "en-IN");
    formData.append("model", "saaras:v1");
    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": SARVAM_KEY() },
      body: formData
    });
    const data = await response.json();
    return data.transcript || "";
  } catch (e) {
    console.error("Sarvam STT Error:", e);
    return "";
  }
}

async function uploadToSupabase(blob: Blob, path: string): Promise<string | null> {
  try {
    const { getSupabase } = await import("../lib/supabase");
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from('candidate-recordings')
      .upload(path, blob, { contentType: blob.type, upsert: true });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('candidate-recordings').getPublicUrl(path);
    return publicUrl;
  } catch (e) {
    return null;
  }
}

/* ─── PROMPTS ─────────────────────────────────────────────── */
function scenarioPrompt(comp: any, roleTitle: string, industry: string, orgDNA: string, previousContext: string) {
  return `Expert BBI scenario designer. INDUSTRY: ${industry}. COMP: ${comp.label}. ROLE: ${roleTitle}. RESEARCH: ${comp.research}. DNA: ${orgDNA}. PREV: ${previousContext}. Rules: Unique industry scenario, different types, urgency, STAR-based CTA.`;
}

function securityAnalysisPrompt(transcript: string) {
  return `Analyze interview response for integrity (stress, prompting, AI patterns). TRANSCRIPT: ${transcript}. JSON Schema: stress_level, prompting_detected, ai_pattern_detected, confidence_score, integrity_signal, reasoning.`;
}

function scoringPrompt(comp: any, scenario: any, response: any, orgDNA: string) {
  return `Senior TA Evaluator. COMP: ${comp.label}. DNA: ${orgDNA}. SCENARIO: ${scenario.scene_setter}, ${scenario.cta}. RESPONSE: ${response.transcript}. Rules: CRITICAL SKEPTIC, mandatory relevance check (score 1 if irrelevant), authenticity check. JSON Schema: score, score_label, relevance_score, alignment_check (matches_scene, answers_cta, mismatch_reason), is_authentic, bos_match, star_completeness, evidence, gaps, probe_questions, reasoning.`;
}

function characterReportPrompt(roleTitle: string, candidateName: string, compResults: any[], teamContext: string) {
  return `Psychologist profile for ${candidateName} (VP). RESULTS: ${JSON.stringify(compResults)}. TEAM: ${teamContext}. Generate rich profile. JSON Schema: overall_score, overall_verdict, executive_summary, leadership_archetype (name, description), character_dimensions (dimension, trait, score, description), top_strengths, development_focus, fit_signal, fit_rationale, interview_priorities.`;
}

const gotSystemPrompt = `You are the GOT (Graph of Thought) Consistency Engine.
Analyze the provided behavioral evidence from multiple interview scenarios for structural and behavioral consistency.

YOUR MISSION:
1. Identify RESONANCE: Where do the candidate's strengths and logic repeat consistently across different contexts?
2. Detect CONTRADICTIONS: Does the candidate claim one behavior in Scenario A but demonstrate the opposite in Scenario B? (e.g., claiming "extreme transparency" but then choosing "closed-door decision making" later).
3. Calculate CONSISTENCY SCORE: 0-100 score on how reliable their behavioral profile is based on cross-scenario mapping.

INPUT DATA:
- All competency results, scenarios, and verbatim transcripts.

Return ONLY valid JSON:
{
  "consistency_score": number (0-100),
  "resonance_patterns": ["string"],
  "contradictions_found": ["string"],
  "got_summary": "Brief overall synthesis of behavioral reliability"
}`;

/* ─── SCHEMAS ───── */
const scenarioSchema = { type: "object", properties: { title: { type: "string" }, type: { type: "string" }, scene_setter: { type: "string" }, trigger_content: { type: "string" }, cta: { type: "string" } }, required: ["title", "type", "scene_setter", "trigger_content", "cta"] };
const securitySchema = { type: "object", properties: { stress_level: { type: "string" }, prompting_detected: { type: "boolean" }, ai_pattern_detected: { type: "boolean" }, confidence_score: { type: "integer" }, integrity_signal: { type: "string" }, reasoning: { type: "string" } }, required: ["stress_level", "prompting_detected", "ai_pattern_detected", "confidence_score", "integrity_signal", "reasoning"] };
const scoringSchema = { type: "object", properties: { score: { type: "number" }, score_label: { type: "string" }, relevance_score: { type: "number" }, alignment_check: { type: "object", properties: { matches_scene: { type: "boolean" }, answers_cta: { type: "boolean" }, mismatch_reason: { type: "string" } }, required: ["matches_scene", "answers_cta"] }, is_authentic: { type: "boolean" }, bos_match: { type: "string" }, star_completeness: { type: "object", properties: { situation: { type: "boolean" }, task: { type: "boolean" }, action: { type: "boolean" }, result: { type: "boolean" } } }, evidence: { type: "array", items: { type: "string" } }, gaps: { type: "array", items: { type: "string" } }, probe_questions: { type: "array", items: { type: "string" } }, reasoning: { type: "string" } }, required: ["score", "score_label", "bos_match", "star_completeness", "evidence", "gaps", "probe_questions", "reasoning"] };
const reportSchema = { type: "object", properties: { overall_score: { type: "number" }, overall_verdict: { type: "string" }, executive_summary: { type: "string" }, leadership_archetype: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } }, character_dimensions: { type: "array", items: { type: "object", properties: { dimension: { type: "string" }, trait: { type: "string" }, score: { type: "number" }, description: { type: "string" } } } }, top_strengths: { type: "array", items: { type: "string" } }, development_focus: { type: "array", items: { type: "string" } }, fit_signal: { type: "string" }, fit_rationale: { type: "string" }, interview_priorities: { type: "array", items: { type: "string" } } }, required: ["overall_score", "overall_verdict", "executive_summary", "leadership_archetype", "character_dimensions", "top_strengths", "development_focus", "fit_signal", "fit_rationale", "interview_priorities"] };

const gotSchema = {
  type: "object",
  properties: {
    consistency_score: { type: "number" },
    resonance_patterns: { type: "array", items: { type: "string" } },
    contradictions_found: { type: "array", items: { type: "string" } },
    got_summary: { type: "string" }
  },
  required: ["consistency_score", "resonance_patterns", "contradictions_found", "got_summary"]
};

/* ─── COMPONENTS ─────────────────────────────────────── */
function CompCard({ comp, sel, meta, index, onSelect }: { comp: any; sel: boolean; meta: any; index: number; onSelect: (id: string) => void; }) {
  const [hovered, setHovered] = React.useState(false);
  const snippet = comp.research ? comp.research.slice(0, 110) + "…" : "";
  return (
    <motion.div className={`comp-card ${sel ? "sel" : ""}`} onClick={() => onSelect(comp.id)} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.025 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} style={{ cursor: "pointer" }}>
      <div className="cc-top"> <CompIcon iconName={comp.icon} category={comp.category} size={15} /> <span className="cc-name">{comp.label}</span> </div>
      <div className="mt-3 flex items-center justify-between"> <span className="cc-tag" style={{ backgroundColor: meta.bg, color: meta.accent }}>{comp.category}</span> <span className="text-[9px] text-[var(--dim)] uppercase tracking-wide">BOS 5</span> </div>
      <AnimatePresence> {hovered && snippet && ( <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}> <div style={{ borderTop: `1px solid ${meta.accent}33`, paddingTop: 8, fontSize: 10, color: "var(--dim)" }}>{snippet}</div> </motion.div> )} </AnimatePresence>
      {sel && ( <motion.div className="cc-check" initial={{ scale: 0 }} animate={{ scale: 1 }}> <Check size={12} strokeWidth={3} /> </motion.div> )}
    </motion.div>
  );
}

function GlowInput({ label, value, onChange, placeholder, accent = "var(--gold)" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; accent?: string; }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="fgrp">
      <motion.label className="flabel block" animate={{ color: focused ? accent : "var(--dim)" }}>{label}</motion.label>
      <motion.div animate={{ boxShadow: focused ? `0 0 0 3px rgba(201,149,58,0.12)` : "none" }} style={{ borderRadius: 4 }}>
        <input className="finput w-full" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      </motion.div>
    </div>
  );
}

function WaveformBars() {
  const heights = [4, 8, 14, 20, 14, 8, 4, 12, 18, 12, 6, 16, 10, 6];
  return (
    <div className="flex items-center gap-[3px] h-6">
      {heights.map((h, i) => ( <motion.div key={i} className="w-[3px] rounded-full bg-[var(--red)]" animate={{ height: [h, h * 1.8, h] }} transition={{ repeat: Infinity, duration: 0.6 + i * 0.07 }} style={{ height: h }} /> ))}
    </div>
  );
}

type AppPhase = "SETUP" | "INTERVIEW" | "REPORT_LOADING" | "REPORT_VIEW" | "PUBLISH_DASHBOARD";

export default function App({ isCandidateView = false }: { isCandidateView?: boolean }) {
  const { token } = useParams<{ token?: string }>();
  const [phase, setPhase] = useState<AppPhase>("SETUP");
  const [catFilter, setCatFilter] = useState("all");
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(isCandidateView);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  // States
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [industry, setIndustry] = useState("Technology / SaaS");
  const [managerName, setManagerName] = useState("");
  const [managerPhoto, setManagerPhoto] = useState<string>("");
  const [orgDNA, setOrgDNA] = useState(DNA_CATEGORIES[0].options[0].value);
  const [teamContext, setTeamContext] = useState(TEAM_DYNAMIC_TEMPLATES[0].options[0].value);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scenarios, setScenarios] = useState<Record<string, any>>({});
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<Record<string, any>>({});
  const [currentResponse, setCurrentResponse] = useState<{ transcript: string; videoBlob?: Blob }>({ transcript: "" });
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [fetchingScoreId, setFetchingScoreId] = useState<string | null>(null);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingManager, setIsSpeakingManager] = useState(false);
  const [isSarvamProcessing, setIsSarvamProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [report, setReport] = useState<any>(null);
  const [isGotEngineRunning, setIsGotEngineRunning] = useState(false);
  const [isAssessmentCreating, setIsAssessmentCreating] = useState(false);
  const [lastGeneratedAssessment, setLastGeneratedAssessment] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const ttsAutoPlayedRef = useRef<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isCandidateView && token) {
      const load = async () => {
        try {
          const { getSupabase } = await import("../lib/supabase");
          const supabase = getSupabase();
          const { data, error } = await supabase.from('bbi_assessments').select('*').eq('token', token).single();
          if (error || !data || data.status === 'completed') throw new Error("Assessment unavailable.");
          setAssessmentData(data);
          setCandidateName(data.candidate_name);
          setRoleTitle(data.role_title);
          setIndustry(data.industry);
          setOrgDNA(data.org_dna);
          setTeamContext(data.team_context);
          setSelectedIds(data.selected_competencies);
          if (data.custom_scenarios) setScenarios(data.custom_scenarios);
          setPhase("INTERVIEW");
        } catch (e: any) { setAssessmentError(e.message); }
        finally { setIsAssessmentLoading(false); }
      };
      load();
    }
  }, [isCandidateView, token]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      return true;
    } catch (e) {
      setPermissionError("Permissions required.");
      return false;
    }
  };

  const publishAsAssessment = async () => {
    if (!candidateEmail) return alert("Email required.");
    
    setIsAssessmentCreating(true);
    try {
      const { getSupabase } = await import("../lib/supabase");
      const supabase = getSupabase();

      // 1. Check for existing assessments for this email
      const { data: existing } = await supabase
        .from('bbi_assessments')
        .select('id, status, created_at')
        .eq('candidate_email', candidateEmail)
        .order('created_at', { ascending: false });

      if (existing && existing.length > 0) {
        const lastDate = new Date(existing[0].created_at).toLocaleDateString();
        const msg = `Candidate ${candidateEmail} was previously interviewed on ${lastDate}.\nStatus: ${existing[0].status.toUpperCase()}.\n\nDo you want to proceed with creating a NEW assessment session?`;
        if (!window.confirm(msg)) {
          setIsAssessmentCreating(false);
          return;
        }
      }

      // 2. Proceed with creation
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('bbi_assessments')
        .insert({ 
          candidate_name: candidateName, 
          candidate_email: candidateEmail, 
          role_title: roleTitle, 
          industry, 
          org_dna: orgDNA, 
          team_context: teamContext, 
          selected_competencies: selectedIds, 
          deadline: deadline || null, 
          created_by: session?.user?.id 
        })
        .select()
        .single();
      
      if (error) throw error;
      setLastGeneratedAssessment(data);
      setPhase("PUBLISH_DASHBOARD");
    } catch (e) { 
      console.error(e);
      alert("Failed to publish assessment."); 
    } finally { 
      setIsAssessmentCreating(false); 
    }
  };

  const playTTS = async (text: string) => {
    if (isSpeakingManager) return;
    setIsSpeakingManager(true);
    const base64 = await fetchSarvamTTS(text);
    if (!base64) return setIsSpeakingManager(false);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
    const audio = new Audio(url);
    audioPlayerRef.current = audio;
    audio.onended = () => { setIsSpeakingManager(false); startRecording(); };
    audio.play().catch(() => setIsSpeakingManager(false));
  };

  const startRecording = async () => {
    if (isRecording || isSpeakingManager) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const combined = cameraStream ? new MediaStream([...cameraStream.getVideoTracks(), ...stream.getAudioTracks()]) : stream;
      const mr = new MediaRecorder(combined, { mimeType: 'video/webm;codecs=vp8,opus' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setCurrentResponse(r => ({ ...r, videoBlob: blob }));
        setIsSarvamProcessing(true);
        const text = await fetchSarvamSTT(blob);
        if (text) setCurrentResponse(r => ({ ...r, transcript: (r.transcript ? r.transcript + " " : "") + text.trim() }));
        setIsSarvamProcessing(false);
        setIsRecording(false);
      };
      mr.start();
      setIsRecording(true);
      recordingTimerRef.current = setTimeout(() => stopRecording(), 30000);
    } catch {}
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const fetchScenario = async (compId: string) => {
    setIsGeneratingScenario(true);
    try {
      const data = await callGenAI(scenarioPrompt(COMP_LIBRARY[compId], roleTitle, industry, orgDNA, ""), scenarioSchema);
      if (data) setScenarios(prev => ({ ...prev, [compId]: data }));
    } catch (e: any) { setScenarioError(e.message); }
    setIsGeneratingScenario(false);
  };

  useEffect(() => {
    if (phase === "INTERVIEW" && isStarted) {
      const id = selectedIds[currentIdx];
      if (!scenarios[id] && !isGeneratingScenario) fetchScenario(id);
      else if (scenarios[id] && !ttsAutoPlayedRef.current.has(id)) {
        ttsAutoPlayedRef.current.add(id);
        playTTS(buildTTSText(scenarios[id]));
      }
    }
  }, [phase, isStarted, currentIdx, scenarios]);

  const handleSubmitResponse = async (skip: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    stopRecording();
    setIsSpeakingManager(false);
    try {
      const id = selectedIds[currentIdx];
      const payload: any = skip ? { transcript: "" } : { ...currentResponse };
      setFetchingScoreId(id);
      if (!skip && payload.transcript) callGenAI(securityAnalysisPrompt(payload.transcript), securitySchema).then(s => setResponses(p => ({ ...p, [id]: { ...p[id], security: s } })));
      if (!skip && payload.videoBlob) uploadToSupabase(payload.videoBlob, `recordings/${id}_${Date.now()}.webm`).then(u => setResponses(p => ({ ...p, [id]: { ...p[id], videoUrl: u } })));
      setResponses(p => ({ ...p, [id]: payload }));
      const sc = await callGenAI(scoringPrompt(COMP_LIBRARY[id], scenarios[id], payload, orgDNA), scoringSchema);
      setScores(p => ({ ...p, [id]: sc }));
      setFetchingScoreId(null);
      if (currentIdx < selectedIds.length - 1) {
        setCurrentIdx(i => i + 1);
        setCurrentResponse({ transcript: "" });
      } else setPhase("REPORT_LOADING");
    } finally { setIsSubmitting(false); }
  };

  useEffect(() => {
    if (phase === "REPORT_LOADING" && selectedIds.every(id => scores[id] !== undefined)) generateReport();
  }, [phase, scores]);

  const generateReport = async () => {
    const res = selectedIds.map(id => ({ 
      comp: COMP_LIBRARY[id], 
      scenario: scenarios[id], 
      response: responses[id], 
      scoreData: scores[id] 
    }));

    // 1. Parallel calls for Character Report and GOT Consistency
    const [rep, got] = await Promise.all([
      callGenAI(characterReportPrompt(roleTitle, candidateName, res, teamContext), reportSchema),
      callGenAI(gotSystemPrompt + "\n\nDATA:\n" + JSON.stringify(res), gotSchema).catch(e => {
        console.error("GOT Engine failed:", e);
        return { consistency_score: 0, got_summary: "Consistency analysis unavailable." };
      })
    ]);

    const { getSupabase } = await import("../lib/supabase");
    const supabase = getSupabase();
    const sid = crypto.randomUUID();

    // 2. Save complete data to Supabase
    await supabase.from("bbi_reports").insert({ 
      id: sid, 
      candidate_name: candidateName, 
      role_title: roleTitle, 
      industry, 
      overall_score: rep.overall_score, 
      fit_signal: rep.fit_signal, 
      executive_summary: rep.executive_summary, 
      got_consistency_score: got.consistency_score, // SAVING THE SCORE
      integrity_warnings: focusLossCount, 
      full_report_json: { 
        ...rep, 
        compResults: res,
        got_consistency: got // SAVING FULL GOT DETAILS
      }, 
      created_at: new Date().toISOString() 
    });

    if (isCandidateView && token) {
      await supabase.from('bbi_assessments').update({ 
        status: 'completed', 
        report_id: sid 
      }).eq('token', token);
    }

    setReport({ ...rep, _dbId: sid, compResults: res, got_consistency: got });
    setPhase("REPORT_VIEW");
  };

  useEffect(() => {
    if (videoRef.current && cameraStream) videoRef.current.srcObject = cameraStream;
  }, [cameraStream, phase]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"> <div className="brand-mark">B</div> <div className="brand-name">BBI Simulator</div> </div>
        <div className="phase-pills">
          <div className={`ppill ${phase === "SETUP" ? "active" : "done"}`}>Setup</div>
          <div className={`ppill ${phase === "INTERVIEW" ? "active" : "done"}`}>Interview</div>
          <div className={`ppill ${phase === "REPORT_VIEW" ? "active" : ""}`}>Report</div>
        </div>
      </header>
      <main className="main">
        {isCandidateView && phase === "INTERVIEW" && !isStarted && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-[var(--bg)] p-4">
            <div className="card w-full max-w-lg p-10 text-center">
              <Play size={40} className="mx-auto mb-6 text-[var(--gold)]" />
              <h1 className="text-2xl font-bold mb-4">Ready to Begin?</h1>
              <p className="mb-8 text-sm text-[var(--muted)]">Welcome {candidateName}. This is your behavioral assessment.</p>
              <button className="btn btn-gold btn-full h-14" onClick={async () => { if (await requestPermissions()) setIsStarted(true); }}>Start Assessment Now</button>
              {permissionError && <p className="text-red-400 text-xs mt-4">{permissionError}</p>}
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {phase === "SETUP" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="g2">
                <div className="card p-6">
                  <GlowInput label="Candidate Name" value={candidateName} onChange={setCandidateName} />
                  <GlowInput label="Candidate Email" value={candidateEmail} onChange={setCandidateEmail} />
                  <GlowInput label="Role" value={roleTitle} onChange={setRoleTitle} />
                  <div className="fgrp">
                    <label className="flabel">Deadline (TAT)</label>
                    <input type="datetime-local" className="finput" style={{ colorScheme: "dark" }} value={deadline} onChange={e => setDeadline(e.target.value)} />
                  </div>
                  <CustomSelect value={industry} onChange={setIndustry} options={INDUSTRIES} label="Industry" />
                  <button className="btn btn-gold btn-full mt-6" onClick={publishAsAssessment} disabled={isAssessmentCreating}>Create & Publish Assessment</button>
                </div>
                <div className="g4">
                  {Object.values(COMP_LIBRARY).map((c, i) => <CompCard key={c.id} comp={c} index={i} sel={selectedIds.includes(c.id)} meta={CAT_META[c.category] || {}} onSelect={id => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} />)}
                </div>
              </div>
            </motion.div>
          )}
          {phase === "INTERVIEW" && isStarted && (
            <motion.div key="interview" className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="card p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--gold)]">
                      <img src={managerPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a"} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--gold)]">{managerName || "Manager"}</p>
                      <div className="flex gap-2 mt-2">
                         {isSpeakingManager && <button className="btn btn-sm btn-red-ghost" onClick={() => { audioPlayerRef.current?.pause(); setIsSpeakingManager(false); }}><MicOff size={10} /> Stop</button>}
                         <button className="btn btn-sm btn-outline" onClick={() => playTTS(buildTTSText(scenarios[selectedIds[currentIdx]]))}>Replay</button>
                      </div>
                    </div>
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-[var(--br)] ml-auto">
                       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
                    </div>
                  </div>
                  {isRecording && <div className="mt-4"><WaveformBars /></div>}
                </div>
                <div className="card p-6">
                  <textarea className="finput w-full h-40" value={currentResponse.transcript} onChange={e => setCurrentResponse({ ...currentResponse, transcript: e.target.value })} placeholder="Your answer..." />
                  <div className="flex gap-4 mt-4">
                    <button className="btn btn-ghost" onClick={() => stopRecording()}>{isRecording ? "Stop" : "Speak"}</button>
                    <button className="btn btn-gold flex-1" onClick={() => handleSubmitResponse(false)} disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Submit & Next"}</button>
                  </div>
                </div>
              </div>
              <div className="card p-6 lockdown"
                   onContextMenu={e => e.preventDefault()}
                   onCopy={e => e.preventDefault()}
                   onPaste={e => e.preventDefault()}>
                {scenarios[selectedIds[currentIdx]] ? (
                  <>
                    <h3 className="text-[var(--gold)] mb-4">{scenarios[selectedIds[currentIdx]].title}</h3>
                    <p className="text-sm italic mb-4">{scenarios[selectedIds[currentIdx]].scene_setter}</p>
                    <div className="bg-black/20 p-4 border-l-2 border-[var(--gold)] mb-4">{scenarios[selectedIds[currentIdx]].trigger_content}</div>
                    <p className="text-[var(--gold)] font-bold">{scenarios[selectedIds[currentIdx]].cta}</p>
                  </>
                ) : <div className="spinner mx-auto" />}
              </div>
            </motion.div>
          )}
          {phase === "PUBLISH_DASHBOARD" && lastGeneratedAssessment && (
            <motion.div key="publish" className="card p-12 text-center max-w-2xl mx-auto">
               <Check size={48} className="mx-auto mb-6 text-[var(--green)]" />
               <h2 className="mb-4 text-white">Assessment Created</h2>
               <p className="mb-8 text-[var(--muted)]">Send this link to {lastGeneratedAssessment.candidate_name}:</p>
               <div className="flex gap-4 bg-black/40 p-4 rounded border border-[var(--br)] mb-8">
                 <input readOnly className="finput flex-1 border-none" value={`${window.location.origin}/assess/${lastGeneratedAssessment.token}`} />
                 <button className="btn btn-gold" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/assess/${lastGeneratedAssessment.token}`); alert("Copied"); }}>Copy</button>
               </div>
               <div className="flex gap-4 justify-center">
                 <button className="btn btn-outline" onClick={() => setPhase("SETUP")}>New Assessment</button>
                 <a href="/admin" className="btn btn-ghost">View History</a>
               </div>
            </motion.div>
          )}
          {phase === "REPORT_VIEW" && report && (
            <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {isCandidateView ? (
                <div className="card my-12 py-24 text-center">
                  <motion.div className="w-20 h-20 rounded-full bg-[var(--green)]/10 text-[var(--green)] flex items-center justify-center mx-auto mb-6 border border-[var(--green)]/20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-4">Assessment Completed</h1>
                  <p className="text-[var(--muted)] text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, {candidateName}. Your behavioral simulation is complete and has been submitted to the hiring team for review. You may now close this window.
                  </p>
                </div>
              ) : (
                <div className="space-y-8 pb-12">
                  <div className="sh flex justify-between items-end">
                    <div>
                      <h1>Behavioral Character Profile</h1>
                      <p>{candidateName} — Assessed for {roleTitle}</p>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Overall Score</div>
                        <div className="text-3xl font-bold text-[var(--gold)]">
                          {report.overall_score?.toFixed(1)} <span className="text-base text-[var(--dim)]">/ 5.0</span>
                        </div>
                      </div>
                      <button className="btn btn-outline h-fit no-print" onClick={() => window.print()}>Print Report</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card md:col-span-2 p-6">
                      <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-4 tracking-wider">Executive Summary</h3>
                      <p className="text-[var(--text)] leading-relaxed text-sm">{report.executive_summary}</p>
                    </div>
                    <div className="card p-6">
                      <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-4 tracking-wider">Leadership Archetype</h3>
                      <h4 className="text-white font-bold text-lg mb-2">{report.leadership_archetype?.name}</h4>
                      <p className="text-[var(--muted)] text-xs leading-relaxed">{report.leadership_archetype?.description}</p>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-hd flex justify-between items-center bg-[var(--s1)]">
                      <h3 className="text-xs uppercase text-[var(--gold)] font-bold tracking-wider">Character Dimensions</h3>
                      <div className="text-[10px] text-[var(--green)] font-semibold px-2 py-0.5 bg-[var(--green)]/10 border border-[var(--green)]/20 rounded-full">{report.fit_signal}</div>
                    </div>
                    <div className="card-body p-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border-t border-[var(--br)]">
                        {report.character_dimensions?.map((dim: any, i: number) => (
                          <div key={i} className="p-5 border-b sm:border-b-0 sm:border-r border-[var(--br)] hover:bg-white/5 transition-colors">
                            <div className="text-[9px] font-bold text-[var(--muted)] tracking-widest uppercase mb-1">{dim.dimension}</div>
                            <div className="text-sm font-semibold text-white mb-3">{dim.trait}</div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-1 h-1 bg-[var(--s3)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--gold)] rounded-full" style={{ width: `${(dim.score / 5) * 100}%` }} />
                              </div>
                              <span className="text-xs font-mono text-[var(--muted)]">{dim.score}/5</span>
                            </div>
                            <p className="text-[10px] text-[var(--muted)] leading-relaxed line-clamp-3">{dim.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {report.got_consistency && (
                    <div className="card border-[rgba(77,166,255,0.3)] bg-[rgba(77,166,255,0.02)]">
                      <div className="card-hd border-b border-[rgba(77,166,255,0.2)] flex justify-between items-center">
                        <h3 className="text-[#4da6ff] flex items-center gap-2 text-xs uppercase tracking-widest">Behavioral Consistency (GOT Engine)</h3>
                        <div className="px-3 py-1 rounded bg-[rgba(77,166,255,0.1)] text-white text-xs font-bold font-mono">SCORE: {report.got_consistency.consistency_score}/100</div>
                      </div>
                      <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <h4 className="text-[9px] text-red-400 uppercase tracking-widest font-bold mb-3">Detected Contradictions</h4>
                           <ul className="space-y-2">
                             {report.got_consistency.contradictions_found?.map((c: string, idx: number) => (
                               <li key={idx} className="text-xs text-[var(--text)] flex gap-2"><span className="text-red-500">⚠️</span> {c}</li>
                             ))}
                           </ul>
                        </div>
                        <div>
                           <h4 className="text-[9px] text-green-400 uppercase tracking-widest font-bold mb-3">Resonance Patterns</h4>
                           <ul className="space-y-2">
                             {report.got_consistency.resonance_patterns?.map((r: string, idx: number) => (
                               <li key={idx} className="text-xs text-[var(--text)] flex gap-2"><span className="text-green-500">❖</span> {r}</li>
                             ))}
                           </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-6">
                      <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-4 tracking-wider">Top Strengths</h3>
                      <ul className="space-y-3">
                        {report.top_strengths?.map((str: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-[var(--text)] leading-relaxed"><Check className="text-[var(--green)] shrink-0 mt-0.5" size={16} /> <span>{str}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="card p-6">
                      <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-4 tracking-wider">Development Focus</h3>
                      <ul className="space-y-3">
                        {report.development_focus?.map((dev: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-[var(--text)] leading-relaxed"><div className="w-2 h-2 rounded-full bg-[var(--amber)] mt-1.5 shrink-0" /> <span>{dev}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="card p-6 border-[var(--gold)] bg-gradient-to-r from-[rgba(201,149,58,0.05)] to-transparent">
                     <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-4 tracking-wider">Interview Priorities (Live Probe)</h3>
                     <ul className="space-y-3 mb-6">
                       {report.interview_priorities?.map((ip: string, i: number) => (
                         <li key={i} className="text-sm text-white pl-4 border-l-2 border-[var(--gold)] py-1 leading-relaxed italic">"{ip}"</li>
                       ))}
                     </ul>
                     <div className="text-sm text-[var(--muted)] pt-5 border-t border-[var(--br)]">
                       <strong className="text-[var(--gold)] mr-2">Fit Rationale:</strong> {report.fit_rationale}
                     </div>
                  </div>

                  <div className="flex gap-4 justify-between items-center pt-8">
                    <button className="btn btn-outline" onClick={() => window.location.reload()}>Start New Assessment</button>
                    {report._dbId && (
                      <a href={`/review/${report._dbId}`} target="_blank" className="btn btn-gold gap-2">
                         <FileText size={16} /> Open Detailed Audit Dashboard (Layer 3)
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {phase === "REPORT_LOADING" && (
            <div className="card p-24 text-center"> <div className="spinner mx-auto" /> <p className="mt-8 text-[var(--gold)]">Analyzing responses...</p> </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
