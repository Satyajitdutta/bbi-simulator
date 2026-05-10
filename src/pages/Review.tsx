import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSupabase } from "../lib/supabase";

export default function Review() {
  const { candidateId } = useParams();
  const [reportData, setReportData] = useState<any>(null);
  const [reviewData, setReviewData] = useState({ rating: 3, notes: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("bbi_reports")
          .select("*")
          .eq("id", candidateId)
          .single();

        if (error) throw error;
        setReportData(data);
        if (data.manager_review_rating) {
          setReviewData({ rating: data.manager_review_rating, notes: data.manager_review_notes || "" });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load report. Ensure Supabase credentials are set and the table exists.");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [candidateId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("bbi_reports")
        .update({
          manager_review_rating: reviewData.rating,
          manager_review_notes: reviewData.notes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", candidateId);

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
       setError(err.message || "Failed to save review.");
    } finally {
       setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading candidate report...</div>;
  if (error && !reportData) return <div className="p-8 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-[#06060e] text-[var(--txt)] font-['DM_Sans'] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 pb-4 border-b border-[var(--bd)] flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-[var(--gold)] mb-2">Hiring Manager Post-Hire Review</h1>
            <p className="text-sm text-[var(--tdim)]">
              Vision Layer 3: Validate the BBI Simulator predictions against actual 90/180-day performance.
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="btn btn-outline btn-sm no-print mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Review
          </button>
        </header>

        {reportData && (
          <div className="mb-8 p-6 bg-[var(--s1)] border border-[var(--bd)] rounded">
            <h2 className="text-lg font-semibold mb-4 text-[#4da6ff]">Candidate Profile: {reportData.candidate_name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><span className="text-[var(--tdim)] text-xs uppercase tracking-wider block">Role</span>{reportData.role_title}</div>
              <div><span className="text-[var(--tdim)] text-xs uppercase tracking-wider block">Predicted Fit</span>{reportData.fit_signal}</div>
            </div>

            {/* INTEGRITY METRICS */}
            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-[var(--bd)]">
              <div>
                <span className="text-[var(--tdim)] text-[10px] uppercase tracking-wider block mb-1">Tab-Switch Warnings</span>
                <span className={`text-sm font-bold ${reportData.integrity_warnings > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {reportData.integrity_warnings || 0} detections
                </span>
              </div>
              <div>
                <span className="text-[var(--tdim)] text-[10px] uppercase tracking-wider block mb-1">Focus Mode</span>
                <span className="text-sm font-bold text-white">Virtual Proctoring Active</span>
              </div>
            </div>

            <div className="text-sm leading-relaxed mb-6">
               <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-2 tracking-wider">Executive Summary</h3>
               <p>{reportData.executive_summary}</p>
            </div>

            {reportData.full_report_json && (
              <>
                <div className="text-sm leading-relaxed mb-6 border-t border-[var(--bd)] pt-4">
                  <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-2 tracking-wider">Leadership Archetype</h3>
                  <h4 className="font-bold text-white mb-1">{reportData.full_report_json.leadership_archetype?.name}</h4>
                  <p className="text-[var(--tdim)]">{reportData.full_report_json.leadership_archetype?.description}</p>
                </div>

                <div className="mb-6 border-t border-[var(--bd)] pt-4">
                  <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-4 tracking-wider">Character Dimensions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportData.full_report_json.character_dimensions?.map((dim: any, i: number) => (
                      <div key={i} className="bg-[#0a0d14] p-4 rounded border border-[var(--bd)]">
                        <div className="text-[10px] font-bold text-[var(--tdim)] tracking-wider uppercase mb-1">{dim.dimension}</div>
                        <div className="text-sm font-semibold text-white mb-2">{dim.trait}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 bg-[var(--s3)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--gold)] rounded-full" style={{ width: `${(dim.score / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs font-mono text-[var(--tdim)]">{dim.score}/5</span>
                        </div>
                        <p className="text-xs text-[var(--tdim)] leading-relaxed">{dim.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-t border-[var(--bd)] pt-4">
                  <div>
                    <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-3 tracking-wider">Top Strengths</h3>
                    <ul className="space-y-2">
                      {reportData.full_report_json.top_strengths?.map((str: string, i: number) => (
                        <li key={i} className="text-sm flex gap-2"><span className="text-[var(--green)]">✓</span> {str}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-3 tracking-wider">Development Focus</h3>
                    <ul className="space-y-2">
                      {reportData.full_report_json.development_focus?.map((dev: string, i: number) => (
                        <li key={i} className="text-sm flex gap-2"><span className="text-[var(--amber)]">❖</span> {dev}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-6 border-t border-[var(--bd)] pt-4">
                  <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-3 tracking-wider">Interview Priorities (Live Probe)</h3>
                  <ul className="space-y-2 mb-4">
                    {reportData.full_report_json.interview_priorities?.map((ip: string, i: number) => (
                      <li key={i} className="text-sm pl-3 border-l-2 border-[var(--gold)] text-[var(--tdim)]">{ip}</li>
                    ))}
                  </ul>
                  <div className="text-sm pt-4 border-t border-dashed border-[var(--bd)]">
                    <strong className="text-[var(--gold)]">Fit Rationale:</strong> <span className="text-[var(--tdim)]">{reportData.full_report_json.fit_rationale}</span>
                  </div>
                </div>
              </>
            )}

            <div className="text-sm leading-relaxed border-t border-[var(--bd)] pt-4 mb-6">
               <h3 className="text-[10px] uppercase text-[#4da6ff] font-bold mb-2 tracking-wider">GOT Consistency Score</h3>
               <div className="text-2xl font-bold text-white mb-2">{reportData.got_consistency_score || "N/A"}/100</div>
            </div>

            {/* ── VIDEO & SECURITY AUDIT ── */}
            {reportData.full_report_json?.competency_details && (
              <div className="border-t border-[var(--bd)] pt-6">
                <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-4 tracking-wider">Interview Recording & Security Audit</h3>
                <div className="space-y-6">
                  {reportData.full_report_json.competency_details.map((item: any, idx: number) => (
                    <div key={idx} className="bg-[#0a0d14] rounded-lg border border-[var(--bd)] overflow-hidden">
                      <div className="p-3 bg-[var(--s2)] flex justify-between items-center border-b border-[var(--bd)]">
                        <span className="text-xs font-bold text-white">{item.comp.label}</span>
                        <span className="text-[10px] text-[var(--tdim)] uppercase">Score: {item.scoreData?.score}/5</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        {/* Video Column */}
                        <div className="space-y-2">
                          <p className="text-[10px] text-[var(--tdim)] uppercase font-bold">Session Recording</p>
                          {item.response?.videoUrl ? (
                            <video 
                              src={item.response.videoUrl} 
                              controls 
                              className="w-full rounded bg-black border border-[var(--bd)] aspect-video"
                            />
                          ) : (
                            <div className="w-full aspect-video bg-black/40 rounded border border-dashed border-[var(--bd)] flex items-center justify-center text-[10px] text-[var(--tdim)]">
                              No video recording available
                            </div>
                          )}
                        </div>
                        {/* Security Column */}
                        <div className="space-y-3">
                          <p className="text-[10px] text-[var(--tdim)] uppercase font-bold">AI Security Analysis</p>
                          {item.response?.security ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between bg-black/40 p-2 rounded">
                                <span className="text-[10px] text-[var(--tdim)]">Integrity Signal</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  item.response.security.integrity_signal === 'Red' ? 'bg-red-900/40 text-red-400' :
                                  item.response.security.integrity_signal === 'Amber' ? 'bg-amber-900/40 text-amber-400' :
                                  'bg-green-900/40 text-green-400'
                                }`}>{item.response.security.integrity_signal}</span>
                              </div>
                              <div className="flex items-center justify-between bg-black/40 p-2 rounded">
                                <span className="text-[10px] text-[var(--tdim)]">Stress Level</span>
                                <span className="text-[10px] text-white font-medium">{item.response.security.stress_level}</span>
                              </div>
                              <div className="flex items-center justify-between bg-black/40 p-2 rounded">
                                <span className="text-[10px] text-[var(--tdim)]">Coaching Detected</span>
                                <span className={`text-[10px] font-bold ${item.response.security.prompting_detected ? 'text-red-400' : 'text-green-400'}`}>
                                  {item.response.security.prompting_detected ? 'YES' : 'NO'}
                                </span>
                              </div>
                              <p className="text-[10px] text-[var(--tdim)] leading-relaxed italic mt-2">
                                "{item.response.security.reasoning}"
                              </p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-[var(--tdim)] italic">Security analysis not performed or unavailable.</p>
                          )}
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <p className="text-[10px] text-[var(--tdim)] uppercase font-bold mb-1">Transcript</p>
                        <p className="text-[11px] text-[var(--tdim)] line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                          {item.response?.transcript || "No transcript available."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-6 bg-[var(--s1)] border border-[var(--bd)] rounded">
          <h2 className="text-lg font-semibold mb-4 text-[var(--green)]">Submit 180-Day Review</h2>
          
          <div className="mb-6">
            <label className="block text-xs uppercase text-[var(--tdim)] font-bold tracking-widest mb-2">Real-World Performance Rating (1-5)</label>
            <div className="flex gap-4">
               {[1, 2, 3, 4, 5].map(n => (
                 <label key={n} className="flex flex-col items-center gap-2 cursor-pointer">
                   <input type="radio" name="rating" value={n} checked={reviewData.rating === n} onChange={() => setReviewData(prev => ({ ...prev, rating: n }))} className="w-4 h-4 accent-[var(--green)]" />
                   <span className="text-sm">{n}</span>
                 </label>
               ))}
            </div>
          </div>

          <div className="mb-6">
             <label className="block text-xs uppercase text-[var(--tdim)] font-bold tracking-widest mb-2">Performance Notes & Feedback</label>
             <textarea 
               className="w-full bg-[#0a0d14] border border-[var(--bd)] p-4 text-sm rounded outline-none focus:border-[var(--green)] min-h-[120px]"
               placeholder="How accurately did the AI profile match this person's actual performance? Where did it get it right or wrong?"
               value={reviewData.notes}
               onChange={(e) => setReviewData(prev => ({ ...prev, notes: e.target.value }))}
             ></textarea>
          </div>

          {error && <div className="text-red-400 text-sm mb-4 bg-red-900/20 py-2 px-3 border border-red-900 rounded">{error}</div>}
          {success && <div className="text-green-400 text-sm mb-4 bg-green-900/20 py-2 px-3 border border-green-900 rounded">Review saved successfully. Ground-truth loop updated!</div>}

          <button 
             onClick={handleSave} 
             disabled={saving}
             className="bg-[var(--green)] text-black px-6 py-3 font-semibold uppercase tracking-widest text-xs rounded hover:bg-opacity-90 disabled:opacity-50"
          >
             {saving ? "Saving..." : "Save Feedback Loop"}
          </button>
        </div>
      </div>
    </div>
  );
}
