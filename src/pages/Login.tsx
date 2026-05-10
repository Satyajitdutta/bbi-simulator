import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabase";
import { motion } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/admin",
        },
      });

      if (error) throw error;
      setMessage("Check your email for the magic link!");
    } catch (error: any) {
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app flex items-center justify-center p-6">
      <motion.div 
        className="card w-full max-w-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="brand mb-8 justify-center">
          <div className="brand-mark">B</div>
          <div className="brand-name text-xl">BBI Admin Portal</div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="fgrp">
            <label className="flabel">Admin Email</label>
            <input
              type="email"
              className="finput"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-full"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-sm text-[var(--gold)]">{message}</p>
        )}
      </motion.div>
    </div>
  );
}
