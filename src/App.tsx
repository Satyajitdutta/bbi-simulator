import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSupabase } from "./lib/supabase";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Simulator from "./pages/Simulator";
import Review from "./pages/Review";

// Error Boundary to catch render crashes
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("BBI_CRASH:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app flex flex-col items-center justify-center p-12 text-center">
          <h1 className="text-red-400 text-xl font-bold mb-4">Application Error</h1>
          <p className="text-[var(--muted)] text-sm mb-6 max-w-md">
            Something went wrong while rendering this page. This is usually due to a missing configuration or data mismatch.
          </p>
          <pre className="bg-black/50 p-4 rounded border border-red-900/50 text-[10px] text-red-300 mb-8 max-w-full overflow-auto">
            {this.state.error?.toString()}
          </pre>
          <button className="btn btn-gold" onClick={() => window.location.href = "/"}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[BBI_AUTH] Checking session...");
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[BBI_AUTH] Session loaded:", session ? "Authenticated" : "No Session");
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[BBI_AUTH] Auth state change:", _event, session ? "Authenticated" : "No Session");
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
  if (!session) {
    console.log("[BBI_AUTH] No session found, redirecting to /login");
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
