import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2,
  Loader2, ArrowRight, Stethoscope, ShieldCheck
} from "lucide-react";
import { loginUser } from "../services/api";
import { addNotification } from "../utils/notifications";

// ─── Floating animated particles ─────────────────────────────────────────────
function Particles() {
  const pts = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    dur: Math.random() * 12 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.5 + 0.15,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
            opacity: p.opacity,
            animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (location.state?.message) setSuccessMsg(location.state.message);
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError(""); setSuccessMsg(""); setLoading(true);
    try {
      localStorage.removeItem("auth");
      const data = await loginUser({ email: email.trim().toLowerCase(), password });
      localStorage.setItem("auth", JSON.stringify({
        token: data.access_token,
        role: data.role,
        user: data.user,
      }));
      // Notify
      addNotification({
        type: "login",
        title: "🔐 Login Successful",
        message: `Welcome back! Signed in as ${data.user?.full_name || email}. Redirecting to your dashboard.`,
      });
      setRedirecting(true);
      const path = data.redirect ||
        (data.role === "admin" ? "/admin/dashboard"
          : data.role === "doctor" ? "/doctor/history"
            : "/user/symptom-search");
      setTimeout(() => navigate(path), 1200);
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to the server. Please ensure the backend is running.");
      } else {
        setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Background */}
      <div className="auth-bg" />
      <div className="auth-overlay" />
      <Particles />

      {/* Card */}
      <div className="auth-card-wrap">
        <div className="auth-card">

          {/* Logo */}
          <div className="auth-logo-wrap">
            <div className="auth-logo-icon">
              <Stethoscope size={28} strokeWidth={2} color="#fff" />
            </div>
            <span className="auth-brand">AI Prescription</span>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your medical dashboard</p>

          {/* Banners */}
          {successMsg && (
            <div className="auth-banner auth-banner-success">
              <CheckCircle2 size={17} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {error && (
            <div className="auth-banner auth-banner-error">
              <AlertCircle size={17} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {redirecting && (
            <div className="auth-banner auth-banner-success">
              <CheckCircle2 size={17} className="shrink-0" />
              <span>Login successful! Redirecting…</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form" noValidate>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={16} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="name@example.com"
                  className="auth-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" size={16} />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="off"
                  required
                  placeholder="••••••••"
                  className="auth-input pr-12"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || redirecting}
              className="auth-submit-btn"
            >
              {loading
                ? <><Loader2 className="animate-spin" size={18} /> Signing in…</>
                : redirecting
                  ? <><CheckCircle2 size={18} /> Redirecting…</>
                  : <>Sign In <ArrowRight size={18} /></>
              }
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <ShieldCheck size={13} className="text-cyan-400/60" />
            <span>Secure • HIPAA Compliant</span>
            <span className="auth-divider-dot">·</span>
            <span>Don't have an account?{" "}
              <Link to="/signup" className="auth-link">Create one</Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
