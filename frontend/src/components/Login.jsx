import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Stethoscope, Mail, Lock, AlertCircle, ArrowRight,
  ShieldCheck, Loader2, CheckCircle2, Eye, EyeOff, Bell
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { loginUser } from "../services/api";
import api from "../services/api";

// ─── Google icon SVG ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107" />
    <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00" />
    <path d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.6 36.9 26.9 38 24 38c-6.1 0-10.7-3.9-11.8-9.3L5.1 34.1C8.5 40.5 15.6 46 24 46z" fill="#4CAF50" />
    <path d="M44.5 20H24v8.5h11.8c-0.6 2.6-2.1 4.8-4.3 6.3l6.6 5.6C42.3 37.3 45 31 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2" />
  </svg>
);

// ─── Welcome toast ────────────────────────────────────────────────────────────
function WelcomeToast({ user, role, onDismiss }) {
  const roleLabel = role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Patient";
  const first = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="flex items-start gap-3 bg-white border border-emerald-200 shadow-2xl shadow-emerald-100 rounded-2xl px-5 py-4 max-w-xs">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5">
          <Bell size={18} />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">Welcome, {first}! 👋</p>
          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
            You're now signed in to the AI Prescription System.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-100 text-emerald-700 border-emerald-200">
            {roleLabel} Portal
          </div>
        </div>
        <button onClick={onDismiss} className="text-slate-300 hover:text-slate-500 text-lg leading-none ml-1 mt-0.5 transition-colors shrink-0" aria-label="Dismiss">
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 font-medium">or</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ─── Main Login component ─────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoad] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastData, setToastData] = useState(null);

  useEffect(() => {
    if (location.state?.message) setSuccessMsg(location.state.message);
  }, [location.state]);

  // ── After successful auth (shared by password + Google) ──────────────────
  const onAuthSuccess = (data) => {
    localStorage.setItem("auth", JSON.stringify({
      token: data.access_token,
      role: data.role,
      user: data.user,
    }));
    setToastData({ user: data.user, role: data.role });
    const redirectPath =
      data.redirect ||
      (data.role === "admin" ? "/admin/dashboard" :
        data.role === "doctor" ? "/doctor/history" :
          "/user/symptom-search");
    setTimeout(() => navigate(redirectPath), 1800);
  };

  // ── Email + password login ────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg(""); setLoading(true);
    try {
      localStorage.removeItem("auth");
      // Only send email + password — role is determined by the server from the DB
      const data = await loginUser({ email: email.trim(), password });
      onAuthSuccess(data);
    } catch (err) {
      const detail = err.response?.data?.detail || "";
      // Network / CORS failure
      if (!err.response) {
        setError("Cannot reach the server. Please make sure the backend is running on port 8000.");
      } else {
        setError(detail || "Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoad(true); setError("");
      try {
        localStorage.removeItem("auth");
        const res = await api.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });
        onAuthSuccess(res.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Google login failed. Please try again or use email/password."
        );
      } finally {
        setGoogleLoad(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled or failed. Please try again."),
  });

  return (
    <>
      {toastData && (
        <WelcomeToast user={toastData.user} role={toastData.role} onDismiss={() => setToastData(null)} />
      )}

      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card p-10 rounded-3xl shadow-2xl border border-white/40">

            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 mb-4">
                <Stethoscope size={30} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 font-outfit text-center">Welcome Back</h2>
              <p className="text-slate-500 mt-2 text-center">Access your personalized medical assistant</p>
            </div>

            {/* Success banner */}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{successMsg}</p>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input-field pl-11"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                  <button
                    type="button"
                    className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                    onClick={() => setError("Password reset: please contact the admin or re-register.")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !!toastData}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {loading
                  ? <Loader2 className="animate-spin" size={20} />
                  : toastData
                    ? <><CheckCircle2 size={20} /> Redirecting…</>
                    : <>Sign In <ArrowRight size={20} /></>
                }
              </button>
            </form>

            {/* Divider + Google */}
            <div className="mt-5">
              <Divider />
              <button
                type="button"
                disabled={googleLoading || !!toastData}
                onClick={() => googleLogin()}
                className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                {googleLoading ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
                Continue with Google
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                Create Account
              </Link>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <ShieldCheck size={14} />
              Secure, HIPAA compliant encryption
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
