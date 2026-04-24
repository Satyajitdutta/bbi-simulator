/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
// @google/genai SDK kept for type compatibility only — API calls use direct REST fetch
import { Check, ChevronRight, Mic, MicOff, Play, Square } from "lucide-react";
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

  // Step 1: discover which models this key can actually use
  console.log("[BBI] Discovering available models for this key...");
  const available = await listGeminiModels(key);
  console.log("[BBI] Available models:", available);

  // Preferred order — pick first match found in the available list
  const PREFERRED = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  // Use discovered models if available, else fall back to preferred list anyway
  const toTry = available.length > 0
    ? PREFERRED.filter(m => available.includes(m)).concat(available.filter(m => !PREFERRED.includes(m)))
    : PREFERRED;

  if (toTry.length === 0) {
    throw new Error(
      `No generateContent-capable models found for your API key.\n` +
      `Discovered models: ${available.join(", ") || "none"}.\n` +
      `Make sure your key is a Google AI Studio key (aistudio.google.com/apikey) — NOT a Vertex AI or Cloud key.`
    );
  }

  let lastErr = "";
  for (const model of toTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      console.log(`[BBI] Trying ${model}...`);
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
        console.warn(`[BBI] ✗ ${lastErr}`);
        continue;
      }

      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastErr = `${model}: empty response`; continue; }

      console.log(`[BBI] ✓ ${model}`);
      return JSON.parse(text);
    } catch (e: any) {
      lastErr = `${model}: ${e?.message || e}`;
      console.warn(`[BBI]`, e);
    }
  }

  throw new Error(
    `All models failed.\n` +
    `Key ending: ...${key.slice(-6)}\n` +
    `Models tried: ${toTry.join(", ")}\n` +
    `Last error: ${lastErr}\n\n` +
    `Get a fresh key at aistudio.google.com/apikey and update it in Vercel → Settings → Environment Variables.`
  );
}

/* ─── SARVAM AI ───────────────────────────────────────────── */
const SARVAM_KEY = () => import.meta.env.VITE_SARVAM_KEY || "";

async function fetchSarvamTTS(text: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_KEY(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        target_language_code: "en-IN",
        speaker: "ritu",
        model: "bulbul:v3"
      })
    });
    if (!response.ok) {
      console.error("Sarvam TTS Error:", response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return data.audio_content || null;
  } catch (e) {
    console.error("Sarvam TTS Error:", e);
    return null;
  }
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

/* ─── PROMPTS ─────────────────────────────────────────────── */
function scenarioPrompt(comp: any, roleTitle: string, industry: string, orgDNA: string, previousContext: string) {
  return `You are an expert BBI scenario designer. Generate a completely unique, realistic immersive trigger scenario for a leadership assessment session.

INDUSTRY CONTEXT: ${industry}
COMPETENCY: ${comp.label}
ROLE BEING ASSESSED: ${roleTitle}
RESEARCH BASIS: ${comp.research}
${orgDNA ? `ORG-SPECIFIC BEHAVIORAL DNA: ${orgDNA}` : ""}
${previousContext ? `PREVIOUS ASSESSMENT CONTEXT (VISION LAYER 5: ANTI-GAMING PRESSURE):\n${previousContext}` : ""}

Rules:
- The scenario must feel like it happened TODAY in the ${industry} sector — use real terminology, realistic tensions, specific operational details related to ${industry}.
- It should be a DIFFERENT scenario type each time (email thread, dashboard, memo, 360 report, incident log, customer complaint, board slide, chat message)
- It must create genuine urgency relevant to the competency and the pressures of the ${industry} industry.
- Never repeat patterns from common examples. Be creative and highly specific to the industry.
- The CTA must ask the candidate to draw on PAST BEHAVIOR, not hypotheticals
${previousContext ? `- CRITICAL: Based on the Previous Assessment Context, dynamically adapt this scenario's difficulty or pressure points to specifically stress-test any weaknesses, platitudes, or patterns observed in previous answers.` : ""}`;
}

function scoringPrompt(comp: any, scenario: any, response: any, orgDNA: string) {
  const r = response;
  const answered = r.transcript && r.transcript.trim().length > 10;
  return `You are a senior Talent Acquisition evaluator scoring a Behavior-Based Interview response.

COMPETENCY: ${comp.label}
RESEARCH BASIS: ${comp.research}
${orgDNA ? `ORG-SPECIFIC BEHAVIORAL DNA (Baseline for "Excellent"): ${orgDNA}` : ""}

SCENARIO PRESENTED TO CANDIDATE:
${scenario.scene_setter}
${scenario.trigger_content}
${scenario.cta}

BEHAVIORAL OBSERVATION SCALE (BOS):
1 - ${comp.bos[1]}
2 - ${comp.bos[2]}
3 - ${comp.bos[3]}
4 - ${comp.bos[4]}
5 - ${comp.bos[5]}

CANDIDATE'S SPOKEN RESPONSE:
Transcript: ${r.transcript || "NOT PROVIDED"}

${!answered ? "NOTE: Candidate skipped this competency entirely. Score accordingly." : ""}

Evaluate the quality of behavioral evidence from their spoken transcript. Look for specificity, ownership of action, measurable outcomes, and depth of reflection indicating standard STAR format. ${orgDNA ? "Calibrate your definition of a '5' against the provided ORG-SPECIFIC BEHAVIORAL DNA." : ""}`;
}

function characterReportPrompt(roleTitle: string, candidateName: string, compResults: any[], teamContext: string) {
  const summary = compResults.map(r =>
    `${r.comp.label} [Score: ${r.scoreData?.score ?? "Skipped"}]: ${r.scoreData?.reasoning ?? "Candidate skipped this competency."}`
  ).join("\n\n");

  return `You are an organizational psychologist generating a behavioral character profile from a completed Behavior-Based Interview simulation for ${candidateName} (Role: ${roleTitle}).

COMPETENCY EVALUATION RESULTS:
${summary}

${teamContext ? `EXISTING TEAM DYNAMIC (For Layer 4 Composition Fit Analysis): ${teamContext}` : ""}

Based on the patterns across all responses, generate a rich character mapping profile. Be direct and evidence-based. ${teamContext ? "Include a strict analysis on whether their demonstrated behaviors act as a synergistic addition or a disruptive risk to the existing team dynamic." : ""}`;
}

/* ─── SCHEMAS (plain JSON Schema — no SDK types needed) ───── */
const scenarioSchema = {
  type: "object",
  properties: {
    title:           { type: "string" },
    type:            { type: "string" },
    scene_setter:    { type: "string" },
    trigger_content: { type: "string" },
    cta:             { type: "string" },
  },
  required: ["title", "type", "scene_setter", "trigger_content", "cta"],
};

const scoringSchema = {
  type: "object",
  properties: {
    score:         { type: "number" },
    score_label:   { type: "string" },
    bos_match:     { type: "string" },
    star_completeness: {
      type: "object",
      properties: {
        situation: { type: "boolean" },
        task:      { type: "boolean" },
        action:    { type: "boolean" },
        result:    { type: "boolean" },
      }
    },
    evidence:        { type: "array", items: { type: "string" } },
    gaps:            { type: "array", items: { type: "string" } },
    probe_questions: { type: "array", items: { type: "string" } },
    reasoning:       { type: "string" },
  },
  required: ["score", "score_label", "bos_match", "star_completeness", "evidence", "gaps", "probe_questions", "reasoning"],
};

const reportSchema = {
  type: "object",
  properties: {
    overall_score:    { type: "number" },
    overall_verdict:  { type: "string" },
    executive_summary:{ type: "string" },
    leadership_archetype: {
      type: "object",
      properties: { name: { type: "string" }, description: { type: "string" } }
    },
    character_dimensions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dimension:   { type: "string" },
          trait:       { type: "string" },
          score:       { type: "number" },
          description: { type: "string" },
        }
      }
    },
    top_strengths:       { type: "array", items: { type: "string" } },
    development_focus:   { type: "array", items: { type: "string" } },
    fit_signal:          { type: "string" },
    fit_rationale:       { type: "string" },
    interview_priorities:{ type: "array", items: { type: "string" } },
    skipped_competencies_note: { type: "string" },
  },
  required: ["overall_score", "overall_verdict", "executive_summary", "leadership_archetype", "character_dimensions", "top_strengths", "development_focus", "fit_signal", "fit_rationale", "interview_priorities"],
};

/* ─── COMPETENCY CARD ─────────────────────────────────────── */
function CompCard({ comp, sel, meta, index, onSelect }: {
  comp: any; sel: boolean; meta: any; index: number; onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const snippet = comp.research ? comp.research.slice(0, 110) + "…" : "";
  return (
    <motion.div
      className={`comp-card ${sel ? "sel" : ""}`}
      onClick={() => onSelect(comp.id)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.025 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{ cursor: "pointer" }}
    >
      <div className="cc-top">
        <CompIcon iconName={comp.icon} category={comp.category} size={15} />
        <span className="cc-name">{comp.label}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="cc-tag" style={{ backgroundColor: meta.bg, color: meta.accent }}>{comp.category}</span>
        <span className="text-[9px] text-[var(--dim)] uppercase tracking-wide">BOS {comp.bos ? "5" : "–"}</span>
      </div>

      {/* Research reveal on hover */}
      <AnimatePresence>
        {hovered && snippet && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: `1px solid ${meta.accent}33`,
              paddingTop: 8,
              fontSize: 10,
              color: "var(--dim)",
              lineHeight: 1.5,
            }}>{snippet}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {sel && (
        <motion.div
          className="cc-check"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Check size={12} strokeWidth={3} />
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── GLOW INPUT ──────────────────────────────────────────── */
function GlowInput({ label, value, onChange, placeholder, accent = "var(--gold)" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; accent?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="fgrp">
      <motion.label
        className="flabel block"
        animate={{ color: focused ? accent : "var(--dim)" }}
        transition={{ duration: 0.15 }}
      >{label}</motion.label>
      <motion.div
        animate={{
          boxShadow: focused ? `0 0 0 3px rgba(201,149,58,0.12), 0 0 12px rgba(201,149,58,0.08)` : "0 0 0 0px transparent"
        }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: 4 }}
      >
        <input
          className="finput w-full"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ borderColor: focused ? accent : undefined }}
        />
      </motion.div>
    </div>
  );
}

/* ─── WAVEFORM BARS ────────────────────────────────────────── */
function WaveformBars() {
  const heights = [4, 8, 14, 20, 14, 8, 4, 12, 18, 12, 6, 16, 10, 6];
  return (
    <div className="flex items-center gap-[3px] h-6">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-[var(--red)]"
          animate={{ height: [h, h * 1.8, h] }}
          transition={{ repeat: Infinity, duration: 0.6 + i * 0.07, ease: "easeInOut", delay: i * 0.04 }}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

type AppPhase = "SETUP" | "INTERVIEW" | "REPORT_LOADING" | "REPORT_VIEW";

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("SETUP");
  const [catFilter, setCatFilter] = useState("all");

  const [candidateName, setCandidateName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [industry, setIndustry] = useState("Technology / SaaS");
  const [orgDNA, setOrgDNA] = useState(DNA_CATEGORIES[0].options[0].value);
  const [teamContext, setTeamContext] = useState(TEAM_DYNAMIC_TEMPLATES[0].options[0].value);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Interview State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scenarios, setScenarios] = useState<Record<string, any>>({});
  const [responses, setResponses] = useState<Record<string, { transcript: string }>>({});
  const [scores, setScores] = useState<Record<string, any>>({});
  const [currentResponse, setCurrentResponse] = useState({ transcript: "" });
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [fetchingScoreId, setFetchingScoreId] = useState<string | null>(null);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingManager, setIsSpeakingManager] = useState(false);
  const [isSarvamProcessing, setIsSarvamProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const ttsAutoPlayedRef = useRef<Set<string>>(new Set());

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Report State
  const [report, setReport] = useState<any>(null);
  const [isGotEngineRunning, setIsGotEngineRunning] = useState(false);

  // DNA & Team selectors
  const [dnaCategory, setDnaCategory] = useState(DNA_CATEGORIES[0].id);
  const [dnaOption, setDnaOption] = useState(DNA_CATEGORIES[0].options[0].id);
  const [teamCategory, setTeamCategory] = useState(TEAM_DYNAMIC_TEMPLATES[0].id);
  const [teamOption, setTeamOption] = useState(TEAM_DYNAMIC_TEMPLATES[0].options[0].id);

  const compList = Object.values(COMP_LIBRARY);
  const filteredList = catFilter === "all" ? compList : compList.filter(c => c.category === catFilter);

  const filteredDNA = DNA_CATEGORIES.filter(c =>
    c.industryTags.includes("all") ||
    c.industryTags.some(tag => industry.toLowerCase().includes(tag.toLowerCase()))
  );

  // When industry changes, reset DNA selection to first valid category
  useEffect(() => {
    const valid = DNA_CATEGORIES.filter(c =>
      c.industryTags.includes("all") ||
      c.industryTags.some(tag => industry.toLowerCase().includes(tag.toLowerCase()))
    );
    if (valid.length > 0 && !valid.find(c => c.id === dnaCategory)) {
      setDnaCategory(valid[0].id);
      setDnaOption(valid[0].options[0].id);
      setOrgDNA(valid[0].options[0].value);
    }
  }, [industry]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const startSimulation = () => {
    if (!candidateName || !roleTitle || selectedIds.length === 0) return;
    setPhase("INTERVIEW");
    setCurrentIdx(0);
  };

  /* ─── SARVAM TTS ──────────────────────────────────────────── */
  const playTTS = async (text: string) => {
    if (isSpeakingManager) return;
    setIsSpeakingManager(true);
    const base64 = await fetchSarvamTTS(text);
    if (!base64) {
      setIsSpeakingManager(false);
      return;
    }
    // Stop any prior audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    const audio = new Audio("data:audio/wav;base64," + base64);
    audioPlayerRef.current = audio;
    audio.onended = () => {
      setIsSpeakingManager(false);
      audioPlayerRef.current = null;
      // Auto-start recording after manager finishes speaking
      startRecording();
    };
    audio.onerror = () => {
      setIsSpeakingManager(false);
      audioPlayerRef.current = null;
    };
    audio.play().catch(e => {
      console.error("Audio play error:", e);
      setIsSpeakingManager(false);
      audioPlayerRef.current = null;
    });
  };

  /* ─── SARVAM STT ──────────────────────────────────────────── */
  const startRecording = async () => {
    if (isRecording || isSpeakingManager) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setIsSarvamProcessing(true);
        const text = await fetchSarvamSTT(audioBlob);
        setIsSarvamProcessing(false);
        if (text && text.trim().length > 0) {
          setCurrentResponse(r => ({
            ...r,
            transcript: (r.transcript ? r.transcript + " " : "") + text.trim()
          }));
        }
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      recordingTimerRef.current = setTimeout(() => stopRecording(), 30000);
    } catch (e) {
      console.error("Mic access denied:", e);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  /* ─── SCENARIO FETCH ──────────────────────────────────────── */
  const fetchScenario = async (compId: string) => {
    setIsGeneratingScenario(true);
    setScenarioError(null);
    const comp = COMP_LIBRARY[compId];
    let previousContext = "";
    const answeredIds = selectedIds.slice(0, currentIdx);
    if (answeredIds.length > 0) {
      previousContext = answeredIds.map(id => {
        const _comp = COMP_LIBRARY[id];
        const _score = scores[id];
        return _score
          ? `In '${_comp.label}', candidate scored ${_score.score}/5. Evaluator noted: "${_score.reasoning}".`
          : `In '${_comp.label}', candidate skipped/no-score.`;
      }).join("\n");
    }
    try {
      const data = await callGenAI(scenarioPrompt(comp, roleTitle, industry, orgDNA, previousContext), scenarioSchema);
      if (data) {
        setScenarios(prev => ({ ...prev, [compId]: data }));
      } else {
        setScenarioError("Gemini API returned no data. Check that VITE_GEMINI_API_KEY is set in Vercel Environment Variables and redeploy.");
      }
    } catch (e: any) {
      const msg = e?.message || String(e) || "Unknown error";
      console.error("[BBI] fetchScenario error:", e);
      setScenarioError(msg);
    }
    setIsGeneratingScenario(false);
  };

  useEffect(() => {
    if (phase === "INTERVIEW") {
      const currentCompId = selectedIds[currentIdx];
      if (!scenarios[currentCompId] && !isGeneratingScenario && !scenarioError) {
        fetchScenario(currentCompId);
      }
    }
  }, [phase, currentIdx, selectedIds, scenarioError]);

  // Auto-play TTS when scenario is ready
  useEffect(() => {
    if (phase === "INTERVIEW") {
      const currentCompId = selectedIds[currentIdx];
      const scenario = scenarios[currentCompId];
      if (scenario && !isGeneratingScenario && !ttsAutoPlayedRef.current.has(currentCompId)) {
        ttsAutoPlayedRef.current.add(currentCompId);
        const ttsText = `${scenario.scene_setter}. ${scenario.trigger_content}. ${scenario.cta}`;
        playTTS(ttsText);
      }
    }
  }, [phase, currentIdx, scenarios, isGeneratingScenario]);

  /* ─── SUBMIT / NAVIGATION ─────────────────────────────────── */
  const handleSubmitResponse = async (skip: boolean = false) => {
    stopRecording();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsSpeakingManager(false);

    const compId = selectedIds[currentIdx];
    const comp = COMP_LIBRARY[compId];
    const scenario = scenarios[compId];
    const resPayload = skip ? { transcript: "" } : currentResponse;

    setResponses(prev => ({ ...prev, [compId]: resPayload }));
    setFetchingScoreId(compId);
    callGenAI(scoringPrompt(comp, scenario, resPayload, orgDNA), scoringSchema).then(score => {
      setScores(prev => ({ ...prev, [compId]: score }));
      setFetchingScoreId(null);
    });

    if (currentIdx < selectedIds.length - 1) {
      setCurrentIdx(i => i + 1);
      setCurrentResponse({ transcript: "" });
      setScenarioError(null);
    } else {
      setPhase("REPORT_LOADING");
    }
  };

  useEffect(() => {
    if (phase === "REPORT_LOADING") {
      const allScored = selectedIds.every(id => scores[id] !== undefined);
      if (allScored && !fetchingScoreId) generateReport();
    }
  }, [phase, scores, fetchingScoreId]);

  const generateReport = async () => {
    const compResults = selectedIds.map(id => ({
      comp: COMP_LIBRARY[id],
      scenario: scenarios[id],
      response: responses[id],
      scoreData: scores[id]
    }));

    const finalReportPromise = callGenAI(characterReportPrompt(roleTitle, candidateName, compResults, teamContext), reportSchema);

    setIsGotEngineRunning(true);
    let gotData = null;
    try {
      const gotSystemPrompt = `You are the Graph of Thought (GOT) Reasoning Engine.
Your task is to analyze the candidate's interview responses across multiple competencies to detect BEHAVIORAL CONSISTENCY.
Look for contradictions (e.g., high autonomy here, but high dependency there).
Look for resonance (e.g., consistent calculated risk-taking).

Return ONLY valid JSON with this schema:
{
  "consistency_score": 85,
  "contradictions_found": ["issue 1", "issue 2"],
  "resonance_patterns": ["pattern 1"],
  "got_summary": "Detailed cross-competency breakdown"
}`;

      const res = await window.fetch("https://got-engine.vercel.app/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "gemini",
          model: "gemini-1.5-pro",
          system: gotSystemPrompt,
          user: JSON.stringify({ candidateName, roleTitle, industry, compResults }),
          isJson: true
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.text) gotData = JSON.parse(d.text);
      }
    } catch (e) {
      console.error("Failed to hit GOT engine API:", e);
    }
    setIsGotEngineRunning(false);

    const finalReport = await finalReportPromise;
    if (gotData && finalReport) finalReport.got_consistency = gotData;

    let savedId = null;
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { getSupabase } = await import("../lib/supabase");
        const supabase = getSupabase();
        savedId = crypto.randomUUID();
        const { error } = await supabase.from("bbi_reports").insert({
          id: savedId,
          candidate_name: candidateName,
          role_title: roleTitle,
          industry,
          overall_score: finalReport?.overall_score,
          fit_signal: finalReport?.fit_signal,
          executive_summary: finalReport?.executive_summary,
          got_consistency_score: gotData?.consistency_score,
          full_report_json: finalReport,
          created_at: new Date().toISOString()
        });
        if (error) { console.error("Supabase insert error:", error); savedId = null; }
      }
    } catch (err) {
      console.error("Supabase saving failed:", err);
    }

    setReport({ ...finalReport, _dbId: savedId });
    setPhase("REPORT_VIEW");
  };

  const restartSimulation = () => {
    stopRecording();
    if (audioPlayerRef.current) { audioPlayerRef.current.pause(); audioPlayerRef.current = null; }
    ttsAutoPlayedRef.current.clear();
    setPhase("SETUP");
    setCurrentIdx(0);
    setScenarios({});
    setResponses({});
    setScores({});
    setReport(null);
    setCurrentResponse({ transcript: "" });
    setScenarioError(null);
  };

  // Camera
  useEffect(() => {
    if (phase === "INTERVIEW") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => setCameraStream(stream))
        .catch(err => console.error("Camera access denied", err));
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
    }
    return () => { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()); };
  }, [phase]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.error("Video play failed", e));
    }
  }, [cameraStream, phase, currentIdx, isGeneratingScenario]);

  /* ─── RECORDING STATUS TEXT ────────────────────────────────── */
  const recordingStatusText = () => {
    if (isSpeakingManager) return "Manager speaking...";
    if (isSarvamProcessing) return "Transcribing your answer...";
    if (isRecording) return "Recording — speak your answer, then stop (auto-stops in 30s)";
    return "";
  };

  /* ─── RENDER ──────────────────────────────────────────────── */
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <motion.div
            className="brand-mark"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >B</motion.div>
          <div>
            <div className="brand-name">BBI Simulator</div>
            <div className="brand-sub">AI-Assisted Behavioral Assessment</div>
          </div>
        </div>
        <div className="phase-pills">
          <div className={`ppill ${phase === "SETUP" ? "active" : "done"}`}>Setup</div>
          <div className={`ppill ${phase === "INTERVIEW" ? "active" : phase === "REPORT_LOADING" || phase === "REPORT_VIEW" ? "done" : ""}`}>Interview</div>
          <div className={`ppill ${phase === "REPORT_LOADING" || phase === "REPORT_VIEW" ? "active" : ""}`}>Report</div>
        </div>
      </header>

      <main className="main">
        <AnimatePresence mode="wait">

          {/* ─── SETUP PHASE ──────────────────────────────────── */}
          {phase === "SETUP" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="sh">
                <h1>Session Configuration</h1>
                <p>Configure the assessment parameters and select the behavioral competencies you wish to evaluate.</p>
              </div>
              <div className="g2">
                <div className="card h-fit">
                  <div className="card-hd">
                    <h3>Candidate Details</h3>
                  </div>
                  <div className="card-body">
                    <GlowInput label="Candidate Name" value={candidateName} onChange={setCandidateName} placeholder="e.g. Jane Doe" />
                    <GlowInput label="Role Assessed For" value={roleTitle} onChange={setRoleTitle} placeholder="e.g. Senior Director of Product" />
                    <div className="fgrp">
                      <motion.label className="flabel block">Industry Sector</motion.label>
                      <CustomSelect value={industry} onChange={setIndustry} options={INDUSTRIES} placeholder="Select industry..." />
                    </div>
                    {/* ── DNA CARD PICKER (Layer 1) ── */}
                    <div className="fgrp">
                      <label className="flabel mt-2" style={{ color: "var(--gold)" }}>
                        Org-Specific Behavioral DNA
                        <span className="ml-2 text-[9px] font-normal opacity-60 normal-case tracking-normal">Vision Layer 1</span>
                      </label>
                      {/* Category pill row */}
                      <div className="flex gap-2 flex-wrap mb-3">
                        {filteredDNA.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setDnaCategory(c.id);
                              setDnaOption(c.options[0].id);
                              setOrgDNA(c.options[0].value);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border transition-all"
                            style={dnaCategory === c.id
                              ? { borderColor: "var(--gold)", color: "var(--gold)", background: "rgba(201,149,58,0.12)" }
                              : { borderColor: "var(--br)", color: "var(--dim)", background: "transparent" }}
                          >{c.label}</button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setDnaCategory("other"); setOrgDNA(""); }}
                          className="text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border transition-all"
                          style={dnaCategory === "other"
                            ? { borderColor: "var(--gold)", color: "var(--gold)", background: "rgba(201,149,58,0.12)" }
                            : { borderColor: "var(--br)", color: "var(--dim)", background: "transparent" }}
                        >Custom</button>
                      </div>

                      {/* Option cards */}
                      {dnaCategory !== "other" && (() => {
                        const cat = filteredDNA.find(c => c.id === dnaCategory);
                        return cat ? (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {cat.options.map(opt => {
                              const sel = dnaOption === opt.id;
                              return (
                                <motion.button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => { setDnaOption(opt.id); setOrgDNA(opt.value); }}
                                  whileTap={{ scale: 0.97 }}
                                  className="text-left p-3 rounded-lg border text-[11px] font-semibold transition-all leading-snug"
                                  style={sel
                                    ? { borderColor: "var(--gold)", color: "var(--gold)", background: "rgba(201,149,58,0.1)" }
                                    : { borderColor: "var(--br)", color: "var(--muted)", background: "rgba(17,21,32,0.5)" }}
                                >
                                  {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--gold)] mr-1.5 mb-0.5" />}
                                  {opt.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        ) : null;
                      })()}

                      {/* Selected preview / custom textarea */}
                      <AnimatePresence mode="wait">
                        <motion.textarea
                          key={dnaCategory + dnaOption}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="finput bg-[#0a0d14] text-xs"
                          style={{ minHeight: 72, resize: "vertical" }}
                          placeholder={dnaCategory === "other" ? "Describe the behavioral traits of your top 10% performers..." : ""}
                          value={orgDNA}
                          onChange={e => setOrgDNA(e.target.value)}
                          readOnly={dnaCategory !== "other" && dnaOption !== "custom"}
                        />
                      </AnimatePresence>
                    </div>

                    {/* ── TEAM DYNAMIC CARD PICKER (Layer 4) ── */}
                    <div className="fgrp">
                      <label className="flabel mt-2" style={{ color: "var(--blue-light)" }}>
                        Existing Team Dynamic
                        <span className="ml-2 text-[9px] font-normal opacity-60 normal-case tracking-normal">Vision Layer 4</span>
                      </label>
                      {/* Category pill row */}
                      <div className="flex gap-2 flex-wrap mb-3">
                        {TEAM_DYNAMIC_TEMPLATES.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setTeamCategory(c.id);
                              setTeamOption(c.options[0].id);
                              setTeamContext(c.options[0].value);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border transition-all"
                            style={teamCategory === c.id
                              ? { borderColor: "var(--blue-light)", color: "var(--blue-light)", background: "rgba(77,166,255,0.1)" }
                              : { borderColor: "var(--br)", color: "var(--dim)", background: "transparent" }}
                          >{c.label}</button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setTeamCategory("other"); setTeamContext(""); }}
                          className="text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border transition-all"
                          style={teamCategory === "other"
                            ? { borderColor: "var(--blue-light)", color: "var(--blue-light)", background: "rgba(77,166,255,0.1)" }
                            : { borderColor: "var(--br)", color: "var(--dim)", background: "transparent" }}
                        >Custom</button>
                      </div>

                      {/* Option cards */}
                      {teamCategory !== "other" && (() => {
                        const cat = TEAM_DYNAMIC_TEMPLATES.find(c => c.id === teamCategory);
                        return cat ? (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {cat.options.map(opt => {
                              const sel = teamOption === opt.id;
                              return (
                                <motion.button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => { setTeamOption(opt.id); setTeamContext(opt.value); }}
                                  whileTap={{ scale: 0.97 }}
                                  className="text-left p-3 rounded-lg border text-[11px] font-semibold transition-all leading-snug"
                                  style={sel
                                    ? { borderColor: "var(--blue-light)", color: "var(--blue-light)", background: "rgba(77,166,255,0.08)" }
                                    : { borderColor: "var(--br)", color: "var(--muted)", background: "rgba(17,21,32,0.5)" }}
                                >
                                  {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--blue-light)] mr-1.5 mb-0.5" />}
                                  {opt.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        ) : null;
                      })()}

                      {/* Selected preview / custom textarea */}
                      <AnimatePresence mode="wait">
                        <motion.textarea
                          key={teamCategory + teamOption}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="finput bg-[#0a0d14] text-xs"
                          style={{ minHeight: 72, resize: "vertical" }}
                          placeholder={teamCategory === "other" ? "Describe the existing team the candidate will join..." : ""}
                          value={teamContext}
                          onChange={e => setTeamContext(e.target.value)}
                          readOnly={teamCategory !== "other" && teamOption !== "custom"}
                        />
                      </AnimatePresence>
                    </div>
                    <div className="mt-8">
                      <motion.button
                        className="btn btn-gold btn-full"
                        onClick={startSimulation}
                        disabled={!candidateName || !roleTitle || selectedIds.length === 0 || !industry}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Start Simulation <ChevronRight size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="catfilter overflow-x-auto pb-2 flex-nowrap whitespace-nowrap">
                    <button className={`cfbtn ${catFilter === "all" ? "fa" : ""}`} onClick={() => setCatFilter("all")}>All</button>
                    <button className={`cfbtn ${catFilter === "GCC Leadership" ? "fb" : ""}`} onClick={() => setCatFilter("GCC Leadership")}>GCC</button>
                    <button className={`cfbtn ${catFilter === "BFSI & FinTech" ? "fb" : ""}`} onClick={() => setCatFilter("BFSI & FinTech")}>BFSI</button>
                    <button className={`cfbtn ${catFilter === "Product & Engineering" ? "fc" : ""}`} onClick={() => setCatFilter("Product & Engineering")}>Prod/Eng</button>
                    <button className={`cfbtn ${catFilter === "BPO & Mid-to-Large Ent." ? "fd" : ""}`} onClick={() => setCatFilter("BPO & Mid-to-Large Ent.")}>Enterprise</button>
                    <button className={`cfbtn ${catFilter === "Healthcare & Life Sciences" ? "fa" : ""}`} onClick={() => setCatFilter("Healthcare & Life Sciences")}>Healthcare</button>
                    <button className={`cfbtn ${catFilter === "Sales & Commercial" ? "fb" : ""}`} onClick={() => setCatFilter("Sales & Commercial")}>Sales</button>
                    <button className={`cfbtn ${catFilter === "Digital & Technology" ? "fc" : ""}`} onClick={() => setCatFilter("Digital & Technology")}>Digital</button>
                    <button className={`cfbtn ${catFilter === "Universal" ? "fd" : ""}`} onClick={() => setCatFilter("Universal")}>Universal</button>
                  </div>
                  <div className="ccount flex items-center gap-3">
                    <span>Selected:</span>
                    <motion.strong
                      key={selectedIds.length}
                      initial={{ scale: 1.5, color: "var(--gold3)" }}
                      animate={{ scale: 1, color: "var(--gold)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >{selectedIds.length}</motion.strong>
                    <span>competencies</span>
                  </div>
                  <div className="g4">
                    {filteredList.map((comp, index) => {
                      const sel = selectedIds.includes(comp.id);
                      const meta = CAT_META[comp.category] || { bg: "", accent: "" };
                      return (
                        <CompCard
                          key={comp.id}
                          comp={comp}
                          sel={sel}
                          meta={meta}
                          index={index}
                          onSelect={handleSelect}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── INTERVIEW PHASE ──────────────────────────────── */}
          {phase === "INTERVIEW" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="sh flex justify-between items-end">
                <div>
                  <h1>Simulation in Progress</h1>
                  <p>Scenario {currentIdx + 1} of {selectedIds.length} — Assessing {COMP_LIBRARY[selectedIds[currentIdx]]?.label || "Competency"}</p>
                </div>
              </div>

              {/* ── Step progress bar ── */}
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-2">
                  {selectedIds.map((id, i) => {
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    const comp = COMP_LIBRARY[id];
                    const meta = CAT_META[comp?.category] || { accent: "var(--gold)" };
                    return (
                      <motion.div
                        key={id}
                        title={comp?.label}
                        className="relative flex-1 h-1.5 rounded-full overflow-hidden cursor-default"
                        style={{ background: "var(--s3)" }}
                      >
                        {(done || active) && (
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: done ? "var(--green)" : meta.accent }}
                            initial={{ width: 0 }}
                            animate={{ width: done ? "100%" : active ? "60%" : "0%" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        )}
                        {active && (
                          <motion.div
                            className="absolute inset-y-0 right-0 w-4 rounded-full"
                            style={{ background: `linear-gradient(to left, transparent, ${meta.accent}66)` }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.4 }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  {selectedIds.map((id, i) => {
                    const done = scores[id] !== undefined;
                    const active = i === currentIdx;
                    const comp = COMP_LIBRARY[id];
                    const meta = CAT_META[comp?.category] || { accent: "var(--gold)" };
                    return (
                      <motion.div
                        key={id}
                        className="flex-1 flex justify-center"
                        initial={false}
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          animate={{
                            scale: active ? [1, 1.4, 1] : 1,
                            background: done ? "var(--green)" : active ? meta.accent : "var(--s4)",
                            boxShadow: active ? `0 0 8px ${meta.accent}88` : "none",
                          }}
                          transition={{ repeat: active ? Infinity : 0, duration: 1.2 }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {scenarioError ? (
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="loading-wrap gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-[var(--red)] bg-[rgba(232,85,85,0.08)]"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <span className="text-[var(--red)] text-2xl font-bold">!</span>
                    </motion.div>
                    <p className="text-[var(--red)] font-semibold text-sm text-center max-w-[480px]">Scenario generation failed</p>
                    <p className="text-[var(--muted)] text-xs text-center max-w-[480px] leading-relaxed">{scenarioError}</p>
                    <div className="flex gap-3 mt-2">
                      <motion.button
                        className="btn btn-gold"
                        onClick={() => { setScenarioError(null); fetchScenario(selectedIds[currentIdx]); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >Retry</motion.button>
                      <motion.button
                        className="btn btn-ghost"
                        onClick={restartSimulation}
                        whileTap={{ scale: 0.97 }}
                      >Back to Setup</motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : isGeneratingScenario || !scenarios[selectedIds[currentIdx]] ? (
                <motion.div
                  className="card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="loading-wrap gap-5">
                    <div style={{ position: "relative", width: 56, height: 56 }}>
                      <motion.div
                        style={{
                          position: "absolute", inset: 0, borderRadius: "50%",
                          border: "3px solid var(--s3)", borderTopColor: "var(--gold)"
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                      <motion.div
                        style={{
                          position: "absolute", inset: 6, borderRadius: "50%",
                          border: "2px solid transparent", borderTopColor: "var(--gold3)", opacity: 0.5
                        }}
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                      />
                    </div>
                    <div className="text-center">
                      <motion.p
                        className="text-[var(--gold)] font-semibold text-sm"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                      >Generating immersive scenario...</motion.p>
                      <p className="text-[var(--dim)] text-xs mt-1">Crafting a {COMP_LIBRARY[selectedIds[currentIdx]]?.short || ""} scenario for {industry}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="g2r"
                  key={`scenario-${currentIdx}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* LEFT: Response */}
                  <div className="card">
                    <div className="card-hd bg-[var(--s2)] border-b border-[var(--br)]">
                      <h3 className="!text-[14px] !text-[var(--text)] !mb-0 flex justify-between items-center">
                        <span>Your Spoken Answer</span>
                        <motion.button
                          className={`btn btn-sm ${isRecording ? "btn-red-ghost" : "btn-ghost"}`}
                          onClick={toggleRecording}
                          disabled={isSpeakingManager || isSarvamProcessing}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isRecording ? <><Square size={12} /> Stop</> : <><Mic size={14} /> Speak</>}
                        </motion.button>
                      </h3>
                      <p className="text-[10px] mt-1">Use the STAR method (Situation, Task, Action, Result)</p>
                    </div>
                    <div className="card-body">
                      <div className="fgrp h-[200px]">
                        <textarea
                          className="finput w-full h-full resize-none bg-[var(--bg)] border border-[var(--br)] rounded p-4 text-sm leading-relaxed"
                          placeholder={
                            isSpeakingManager
                              ? "Manager is briefing you..."
                              : isRecording
                              ? "Recording... speak your answer, then stop."
                              : isSarvamProcessing
                              ? "Transcribing..."
                              : "Your transcribed answer will appear here. You may also type directly."
                          }
                          value={currentResponse.transcript}
                          onChange={e => setCurrentResponse({ transcript: e.target.value })}
                          disabled={isRecording || isSarvamProcessing}
                        />
                      </div>

                      {/* Voice status indicator */}
                      <AnimatePresence>
                        {(isRecording || isSpeakingManager || isSarvamProcessing) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 overflow-hidden"
                          >
                            <div className="flex items-center gap-3 py-2">
                              {isRecording && <WaveformBars />}
                              {(isSpeakingManager || isSarvamProcessing) && (
                                <motion.div
                                  className="flex gap-1"
                                  animate={{ opacity: [1, 0.4, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.2 }}
                                >
                                  {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                                  ))}
                                </motion.div>
                              )}
                              <span className="text-xs text-[var(--muted)]">{recordingStatusText()}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-4 mt-6">
                        <motion.button
                          className="btn btn-ghost flex-1 justify-center"
                          onClick={() => handleSubmitResponse(true)}
                          whileTap={{ scale: 0.97 }}
                        >Skip</motion.button>
                        <motion.button
                          className="btn btn-gold flex-[2] justify-center"
                          onClick={() => handleSubmitResponse(false)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                        >Submit & Next <ChevronRight size={16} /></motion.button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Manager + Scenario + Competency */}
                  <div className="flex flex-col gap-5">
                    <div className="card">
                      <div className="p-4 flex gap-4 items-center bg-[var(--bg)] border-b border-[var(--br)]">
                        {/* Manager avatar */}
                        <div className="relative">
                          {isSpeakingManager && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-[var(--gold)]"
                              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.2, 0.8] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                          )}
                          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0 transition-colors duration-500 ${isSpeakingManager ? "border-[var(--gold)] shadow-[0_0_15px_rgba(201,149,58,0.5)]" : "border-[var(--s3)]"}`}>
                            <motion.img
                              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
                              alt="Manager Avatar"
                              className="w-full h-full object-cover origin-bottom"
                              animate={
                                isSpeakingManager
                                  ? { y: [0, -2, 0, -1, 0], rotate: [-1, 1, -1], scale: [1.02, 1.05, 1.02] }
                                  : isRecording
                                    ? { rotate: [0, -2, 0], y: [0, 1, 0], scale: [1, 1.02, 1] }
                                    : { y: [0, -1, 0], scale: [1, 1.01, 1] }
                              }
                              transition={{
                                repeat: Infinity,
                                duration: isSpeakingManager ? 2 : isRecording ? 4 : 6,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-[13px] text-[var(--gold)]">Hiring Manager</h4>
                          <AnimatePresence mode="wait">
                            {isSpeakingManager ? (
                              <motion.p
                                key="speaking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[11px] text-[var(--gold)] mt-1 animate-pulse"
                              >Speaking...</motion.p>
                            ) : isRecording ? (
                              <motion.p
                                key="listening"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[11px] text-[var(--red)] mt-1"
                              >Listening...</motion.p>
                            ) : (
                              <motion.p
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[11px] text-[var(--muted)] mt-1"
                              >Standing by</motion.p>
                            )}
                          </AnimatePresence>
                          <motion.button
                            className="btn btn-sm btn-outline mt-2 h-7"
                            onClick={() => {
                              const s = scenarios[selectedIds[currentIdx]];
                              if (s) playTTS(`${s.scene_setter}. ${s.trigger_content}. ${s.cta}`);
                            }}
                            disabled={isSpeakingManager}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play size={10} className="mr-1" /> Replay
                          </motion.button>
                        </div>

                        <div className="ml-auto w-24 h-24 bg-black rounded-lg overflow-hidden relative border border-[var(--s3)] shadow-inner">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                          <div className="absolute bottom-1 left-1 bg-black/60 px-1 rounded text-[8px] text-white">You</div>
                        </div>
                      </div>

                      <div className="card-hd bg-[var(--s2)] border-b border-[var(--br)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CompIcon iconName={COMP_LIBRARY[selectedIds[currentIdx]]?.icon || "Globe2"} category={COMP_LIBRARY[selectedIds[currentIdx]]?.category || "Universal"} size={14} />
                          <h3 className="!text-[12px] !text-[var(--text)] !mb-0">{scenarios[selectedIds[currentIdx]].title}</h3>
                        </div>
                        <span className="text-[10px] bg-[var(--dim)]/30 px-2 py-1 rounded text-[var(--muted)] uppercase">Type: {scenarios[selectedIds[currentIdx]].type}</span>
                      </div>
                      <div className="card-body bg-[var(--s2)]">
                        <p className="text-sm text-[var(--text)] italic mb-4">{scenarios[selectedIds[currentIdx]].scene_setter}</p>
                        <div className="p-4 bg-[var(--s3)] border-l-4 border-[var(--gold)] rounded text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap mb-4">
                          {scenarios[selectedIds[currentIdx]].trigger_content}
                        </div>
                        <p className="text-xs font-bold text-[var(--gold)] mb-2 uppercase tracking-wide">Prompt:</p>
                        <div className="text-sm text-[var(--text)] mt-2">
                          {scenarios[selectedIds[currentIdx]].cta}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-hd"><h3>Competency Focus</h3></div>
                      <div className="card-body">
                        <p className="text-sm text-[var(--muted)] leading-relaxed">{COMP_LIBRARY[selectedIds[currentIdx]].research}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── REPORT LOADING ────────────────────────────────── */}
          {phase === "REPORT_LOADING" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card my-12">
                <div className="loading-wrap py-24">
                  <motion.div
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                  <motion.p
                    className="mt-6 text-[var(--gold)] font-medium text-lg"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    Evaluating Candidate Responses...
                  </motion.p>
                  <p className="mt-2 text-[var(--muted)] text-sm">
                    {fetchingScoreId
                      ? "Scoring latest response..."
                      : isGotEngineRunning
                        ? "Running Graph of Thought (GOT) cross-competency analysis..."
                        : "Synthesizing comprehensive character report..."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── REPORT VIEW ───────────────────────────────────── */}
          {phase === "REPORT_VIEW" && report && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="sh flex justify-between items-end">
                <div>
                  <h1>Behavioral Character Profile</h1>
                  <p>{candidateName} — Assessed for {roleTitle}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Overall Score</div>
                    <motion.div
                      className="text-3xl font-bold font-['Syne'] text-[var(--gold)]"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      {report.overall_score?.toFixed(1)} <span className="text-base text-[var(--dim)]">/ 5.0</span>
                    </motion.div>
                  </div>
                  <motion.button
                    className="btn btn-outline h-fit"
                    onClick={restartSimulation}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >New Session</motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <motion.div
                  className="card md:col-span-2"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="card-hd"><h3>Executive Summary</h3></div>
                  <div className="card-body">
                    <p className="text-[var(--text)] leading-relaxed text-sm">{report.executive_summary}</p>
                  </div>
                </motion.div>
                <motion.div
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="card-hd"><h3>Leadership Archetype</h3></div>
                  <div className="card-body">
                    <h4 className="text-[var(--gold)] font-bold text-lg mb-2">{report.leadership_archetype?.name}</h4>
                    <p className="text-[var(--muted)] text-sm">{report.leadership_archetype?.description}</p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="card mb-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="card-hd flex justify-between items-center">
                  <h3>Character Dimensions</h3>
                  <div className="text-xs text-[var(--green)] font-semibold px-3 py-1 bg-[rgba(61,214,140,0.1)] border border-[rgba(61,214,140,0.3)] rounded-full">{report.fit_signal}</div>
                </div>
                <div className="card-body p-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border-t border-[var(--br)]">
                    {report.character_dimensions?.map((dim: any, i: number) => (
                      <motion.div
                        key={i}
                        className="p-5 border-b sm:border-b-0 sm:border-r border-[var(--br)] hover:bg-[var(--s2)] transition-colors"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.06 }}
                      >
                        <div className="text-xs font-bold text-[var(--muted)] tracking-wider uppercase mb-1 truncate">{dim.dimension}</div>
                        <div className="text-sm font-semibold text-[var(--text)] mb-3">{dim.trait}</div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-1.5 bg-[var(--s3)] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[var(--gold)] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(dim.score / 5) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-xs font-mono text-[var(--muted)]">{dim.score}/5</span>
                        </div>
                        <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3" title={dim.description}>{dim.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="card-hd"><h3>Top Strengths</h3></div>
                  <div className="card-body">
                    <ul className="space-y-3 pl-1">
                      {report.top_strengths?.map((str: string, i: number) => (
                        <motion.li
                          key={i}
                          className="flex gap-3 text-sm text-[var(--text)] leading-relaxed"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.06 }}
                        >
                          <Check className="shrink-0 text-[var(--green)] mt-0.5" size={16} />
                          <span>{str}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
                <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <div className="card-hd"><h3>Development Focus</h3></div>
                  <div className="card-body">
                    <ul className="space-y-3 pl-1">
                      {report.development_focus?.map((dev: string, i: number) => (
                        <motion.li
                          key={i}
                          className="flex gap-3 text-sm text-[var(--text)] leading-relaxed"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.06 }}
                        >
                          <div className="shrink-0 w-2 h-2 rounded-full bg-[var(--amber)] mt-1.5" />
                          <span>{dev}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>

              {report.got_consistency && (
                <motion.div
                  className="card mb-6 border-[var(--blue-light)] bg-[rgba(77,166,255,0.02)]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="card-hd border-b border-[var(--blue-dark)] flex justify-between items-center">
                    <h3 className="text-[var(--blue-light)] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      Behavioral Consistency Graph (GOT Layer 2)
                    </h3>
                    <div className="px-3 py-1 rounded bg-[var(--blue-dark)] text-white text-xs font-mono font-bold tracking-widest">
                      SCORE: {report.got_consistency.consistency_score || "N/A"}/100
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="text-[10px] text-[var(--red)] uppercase tracking-widest font-bold mb-3 border-b border-[var(--red)] pb-1 inline-block">Detected Contradictions</h4>
                        {(!report.got_consistency.contradictions_found || report.got_consistency.contradictions_found.length === 0) ? (
                          <p className="text-xs text-[var(--muted)]">No significant behavioral contradictions detected across scenarios.</p>
                        ) : (
                          <ul className="space-y-2">
                            {report.got_consistency.contradictions_found.map((c: string, idx: number) => (
                              <li key={idx} className="text-xs text-[var(--text)] flex items-start gap-2">
                                <span className="text-[var(--red)] mt-0.5 shrink-0">⚠️</span>
                                <span dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[10px] text-[var(--green)] uppercase tracking-widest font-bold mb-3 border-b border-[var(--green)] pb-1 inline-block">Resonance Patterns</h4>
                        {(!report.got_consistency.resonance_patterns || report.got_consistency.resonance_patterns.length === 0) ? (
                          <p className="text-xs text-[var(--muted)]">No significant repeating strengths detected.</p>
                        ) : (
                          <ul className="space-y-2">
                            {report.got_consistency.resonance_patterns.map((c: string, idx: number) => (
                              <li key={idx} className="text-xs text-[var(--text)] flex items-start gap-2">
                                <span className="text-[var(--green)] mt-0.5 shrink-0">❖</span>
                                <span dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    {report.got_consistency.got_summary && (
                      <div className="p-4 bg-[#06060e] border border-[var(--br)] rounded text-sm text-[var(--text)] leading-relaxed italic border-l-2 border-l-[var(--blue-light)]">
                        "{report.got_consistency.got_summary}"
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div
                className="card border-[var(--gold)] bg-gradient-to-r from-[rgba(201,149,58,0.05)] to-transparent mb-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="card-body p-6">
                  <h3 className="text-[var(--gold)] font-bold mb-4 text-base">Interview Priorities (Live Probe)</h3>
                  <ul className="space-y-3">
                    {report.interview_priorities?.map((ip: string, i: number) => (
                      <motion.li
                        key={i}
                        className="text-sm text-[var(--text)] pl-4 border-l-2 border-[var(--gold2)] py-1 leading-relaxed"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                      >{ip}</motion.li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-5 border-t border-[rgba(201,149,58,0.15)] text-sm text-[var(--text)] leading-relaxed">
                    <strong className="text-[var(--gold2)] pr-2">Fit Rationale:</strong> {report.fit_rationale}
                    {report.skipped_competencies_note && (
                      <div className="mt-3 text-[var(--amber)] italic">{report.skipped_competencies_note}</div>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="flex gap-4 justify-between items-center mb-12">
                <motion.button
                  className="btn btn-outline"
                  onClick={restartSimulation}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >Start New Assessment</motion.button>
                {report._dbId && (
                  <a href={`/review/${report._dbId}`} target="_blank" rel="noopener noreferrer" className="btn btn-gold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
                    Open Post-Hire Feedback Dashboard (Layer 3)
                  </a>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
