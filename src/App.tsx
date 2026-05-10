import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSupabase } from "./lib/supabase";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Simulator from "./pages/Simulator";
import Review from "./pages/Review";

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/assess/:token" element={<Simulator isCandidateView={true} />} />
        <Route path="/review/:candidateId" element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        } />
        {/* Catch-all to prevent blank pages */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
