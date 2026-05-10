import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Link as LinkIcon, Mail, FileText, ChevronRight, Check, X, LogOut, Clock, Play } from "lucide-react";
import { COMP_LIBRARY, CAT_META, DNA_CATEGORIES, TEAM_DYNAMIC_TEMPLATES, INDUSTRIES } from "../data/bbi_metadata";
import CompIcon from "../components/CompIcon";
import CustomSelect from "../components/CustomSelect";

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Form State
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0].value);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [orgDNA, setOrgDNA] = useState(DNA_CATEGORIES[0].options[0].value);
  const [teamContext, setTeamContext] = useState(TEAM_DYNAMIC_TEMPLATES[0].options[0].value);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('bbi_assessments')
        .select(`
          *,
          report:report_id (
            overall_score,
            fit_signal
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (e) {
      console.error("Error fetching assessments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const createAssessment = async () => {
    if (!candidateName || !candidateEmail || !roleTitle || selectedIds.length === 0) return;
    setIsCreating(true);
    try {
      const supabase = getSupabase();
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
          created_by: session?.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setShowCreateModal(false);
      fetchAssessments();
      // Reset form
      setCandidateName("");
      setCandidateEmail("");
      setRoleTitle("");
      setSelectedIds([]);
    } catch (e) {
      console.error("Error creating assessment:", e);
      alert("Failed to create assessment.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/assess/${token}`;
    navigator.clipboard.writeText(url);
    alert("Candidate link copied to clipboard!");
  };

  const sendEmail = (assessment: any) => {
    const url = `${window.location.origin}/assess/${assessment.token}`;
    const subject = encodeURIComponent(`Action Required: Behavioral Interview for ${assessment.role_title} Role`);
    const body = encodeURIComponent(`Hi ${assessment.candidate_name},\n\nYou have been invited to complete a behavioral assessment for the ${assessment.role_title} position.\n\nPlease use the following secure link to start the simulation:\n${url}\n\nGood luck!`);
    window.location.href = `mailto:${assessment.candidate_email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <div className="brand-name">BBI Admin Console</div>
            <div className="brand-sub">Manage Candidate Assessments</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--muted)]">{session?.user?.email}</span>
          <button onClick={handleLogout} className="btn btn-sm btn-ghost">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="main">
        <div className="flex justify-between items-center mb-8">
          <div className="sh !mb-0">
            <h1>Active Assessments</h1>
            <p>Track and manage your candidates' interview progress.</p>
          </div>
          <button 
            className="btn btn-gold"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> New Assessment
          </button>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-[var(--dim)] mb-4">
              <FileText size={48} className="mx-auto opacity-20" />
            </div>
            <h3 className="text-[var(--muted)] font-bold uppercase tracking-widest text-sm mb-2">No Assessments Yet</h3>
            <p className="text-[var(--dim)] text-xs mb-6">Create your first assessment link to invite candidates.</p>
            <button className="btn btn-outline" onClick={() => setShowCreateModal(true)}>
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assessments.map((a) => (
              <motion.div 
                key={a.id}
                className="card p-5 flex flex-col md:flex-row justify-between items-center gap-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${a.status === 'completed' ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-[var(--gold)]/10 text-[var(--gold)]'}`}>
                    {a.status === 'completed' ? <Check size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{a.candidate_name}</div>
                    <div className="text-[11px] text-[var(--muted)]">{a.candidate_email}</div>
                  </div>
                  <div className="hidden md:block h-8 w-px bg-[var(--br)]" />
                  <div>
                    <div className="text-[10px] text-[var(--dim)] uppercase font-bold mb-0.5">Role / Industry</div>
                    <div className="text-[11px] text-[var(--muted)]">{a.role_title} • {a.industry}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {a.status === 'pending' ? (
                    <>
                      <button className="btn btn-sm btn-ghost" onClick={() => copyLink(a.token)}>
                        <LinkIcon size={14} /> Copy Link
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => sendEmail(a)}>
                        <Mail size={14} /> Send Email
                      </button>
                      <a href={`/assess/${a.token}`} target="_blank" className="btn btn-sm btn-outline">
                         <Play size={14} /> Preview
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="text-right mr-4">
                        <div className="text-[10px] text-[var(--dim)] uppercase font-bold">Fit Score</div>
                        <div className="text-sm font-bold text-[var(--gold)]">{a.report?.overall_score}/5.0</div>
                      </div>
                      <a href={`/review/${a.report_id}`} className="btn btn-sm btn-gold">
                        View Report <ChevronRight size={14} />
                      </a>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              className="card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-[501]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="card-hd border-b border-[var(--br)] flex justify-between items-center bg-[var(--s1)]">
                <h3>New Candidate Assessment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-[var(--dim)] hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="fgrp">
                      <label className="flabel">Candidate Name</label>
                      <input className="finput" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Full Name" />
                    </div>
                    <div className="fgrp">
                      <label className="flabel">Candidate Email</label>
                      <input className="finput" type="email" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="fgrp">
                      <label className="flabel">Target Role</label>
                      <input className="finput" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. Director of Engineering" />
                    </div>
                    <div className="fgrp">
                      <label className="flabel">Industry Sector</label>
                      <CustomSelect value={industry} onChange={setIndustry} options={INDUSTRIES} placeholder="Select industry..." />
                    </div>
                  </div>

                  <div>
                    <label className="flabel mb-3">Selected Competencies ({selectedIds.length})</label>
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                      {Object.values(COMP_LIBRARY).map(comp => (
                        <div 
                          key={comp.id}
                          className={`p-3 rounded border text-xs cursor-pointer flex justify-between items-center transition-colors ${selectedIds.includes(comp.id) ? 'border-[var(--gold)] bg-[var(--gold)]/5' : 'border-[var(--br)] bg-black/20'}`}
                          onClick={() => {
                            setSelectedIds(prev => prev.includes(comp.id) ? prev.filter(x => x !== comp.id) : [...prev, comp.id]);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <CompIcon iconName={comp.icon} category={comp.category} size={12} />
                            <span className={selectedIds.includes(comp.id) ? 'text-[var(--gold)] font-bold' : 'text-[var(--muted)]'}>{comp.label}</span>
                          </div>
                          {selectedIds.includes(comp.id) && <Check size={12} className="text-[var(--gold)]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--br)] bg-[var(--s1)] flex justify-end gap-4">
                <button className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button 
                  className="btn btn-gold" 
                  onClick={createAssessment}
                  disabled={isCreating || !candidateName || !candidateEmail || !roleTitle || selectedIds.length === 0}
                >
                  {isCreating ? "Generating..." : "Generate Candidate Link"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
