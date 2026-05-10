import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Link as LinkIcon, Mail, FileText, ChevronRight, Check, X, LogOut, Clock, Play, Edit3 } from "lucide-react";
import { COMP_LIBRARY, CAT_META, DNA_CATEGORIES, TEAM_DYNAMIC_TEMPLATES, INDUSTRIES } from "../data/bbi_metadata";
import CompIcon from "../components/CompIcon";
import CustomSelect from "../components/CustomSelect";
import Simulator from "./Simulator";

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<"LIST" | "SIMULATOR">("LIST");

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

  const updateAssessment = async (id: string, currentName: string, currentEmail: string, currentRole: string) => {
    const name = prompt("Update Candidate Name:", currentName);
    const email = prompt("Update Candidate Email:", currentEmail);
    const role = prompt("Update Role Title:", currentRole);
    
    if (!name || !email || !role) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('bbi_assessments')
        .update({ candidate_name: name, candidate_email: email, role_title: role })
        .eq('id', id);

      if (error) throw error;
      fetchAssessments();
    } catch (e) {
      console.error(e);
      alert("Update failed.");
    }
  };

  const deleteAssessment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('bbi_assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAssessments();
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    }
  };

  if (view === "SIMULATOR") {
    return (
      <div className="relative">
        <button 
          onClick={() => { setView("LIST"); fetchAssessments(); }}
          className="fixed top-20 right-8 z-[300] btn btn-sm btn-ghost bg-black/40 backdrop-blur"
        >
          <X size={14} /> Close Simulator
        </button>
        <Simulator />
      </div>
    );
  }

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
            onClick={() => setView("SIMULATOR")}
          >
            <Plus size={16} /> New Assessment (Immersive Mode)
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
            <button className="btn btn-outline" onClick={() => setView("SIMULATOR")}>
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
                      <button className="btn btn-sm btn-ghost" title="Edit Assessment" onClick={() => updateAssessment(a.id, a.candidate_name, a.candidate_email, a.role_title)}>
                        <Edit3 size={14} />
                      </button>
                      <button className="btn btn-sm btn-ghost text-red-400 hover:text-red-300" title="Delete" onClick={() => deleteAssessment(a.id)}>
                        <X size={14} />
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => {
                        const url = `${window.location.origin}/assess/${a.token}`;
                        navigator.clipboard.writeText(url);
                        alert("Link copied!");
                      }}>
                        <LinkIcon size={14} /> Copy Link
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => {
                        const url = `${window.location.origin}/assess/${a.token}`;
                        const subject = encodeURIComponent(`Action Required: Behavioral Interview for ${a.role_title} Role`);
                        const body = encodeURIComponent(`Hi ${a.candidate_name},\n\nYou have been invited to complete a behavioral assessment for the ${a.role_title} position.\n\nPlease use the following secure link to start the simulation:\n${url}\n\nGood luck!`);
                        window.location.href = `mailto:${a.candidate_email}?subject=${subject}&body=${body}`;
                      }}>
                        <Mail size={14} /> Email
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
                      <button className="btn btn-sm btn-ghost text-red-400 hover:text-red-300 ml-2" title="Delete Assessment" onClick={() => deleteAssessment(a.id)}>
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
