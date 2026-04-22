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
        <header className="mb-8 pb-4 border-b border-[var(--bd)]">
          <h1 className="text-2xl font-bold text-[var(--gold)] mb-2">Hiring Manager Post-Hire Review</h1>
          <p className="text-sm text-[var(--tdim)]">
            Vision Layer 3: Validate the BBI Simulator predictions against actual 90/180-day performance.
          </p>
        </header>

        {reportData && (
          <div className="mb-8 p-6 bg-[var(--s1)] border border-[var(--bd)] rounded">
            <h2 className="text-lg font-semibold mb-4 text-[#4da6ff]">Candidate Profile: {reportData.candidate_name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><span className="text-[var(--tdim)] text-xs uppercase tracking-wider block">Role</span>{reportData.role_title}</div>
              <div><span className="text-[var(--tdim)] text-xs uppercase tracking-wider block">Predicted Fit</span>{reportData.fit_signal}</div>
            </div>

            <div className="text-sm leading-relaxed mb-6">
               <h3 className="text-xs uppercase text-[var(--gold)] font-bold mb-2 tracking-wider">Executive Summary</h3>
               <p>{reportData.executive_summary}</p>
            </div>

            <div className="text-sm leading-relaxed border-t border-[var(--bd)] pt-4">
               <h3 className="text-[10px] uppercase text-[#4da6ff] font-bold mb-2 tracking-wider">GOT Consistency Score</h3>
               <div className="text-2xl font-bold text-white mb-2">{reportData.got_consistency_score || "N/A"}/100</div>
            </div>
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
