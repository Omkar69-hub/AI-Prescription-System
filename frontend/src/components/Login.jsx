import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2,
  Loader2, ArrowRight, Stethoscope, ShieldCheck
} from "lucide-react";

// ─── Floating particles ───────────────────────────────────────────────────────
function Particles() {
  const pts = React.useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: 2 + (i * 0.3) % 4,
      x: (i * 17 + 5) % 100,
      y: (i * 23 + 10) % 100,
      dur: 8 + (i % 7) * 1.5,
      delay: (i % 6) * 1.1,
      opacity: 0.15 + (i % 5) * 0.08,
    })),
    []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pts.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "#10b981",
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Show message passed from Signup redirect
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      // Clean the state so a refresh doesn't re-show it
      window.history.replaceState({}, document.title);
    }
  }, []);

  const clearError = () => setError("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // ── Client-side guard ────────────────────────────────────────────────────
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the server's plain detail string
        setError(data.detail || "Login failed. Please check your credentials.");
        return;
      }

      // ── Store auth ────────────────────────────────────────────────────────
      localStorage.setItem("auth", JSON.stringify({
        token: data.access_token,
        role: data.role,
        user: data.user,
      }));

      setSuccessMsg(`Welcome back${data.user?.full_name ? ", " + data.user.full_name : ""}! Redirecting…`);

      const redirectPath = data.redirect || "/user/symptom-search";
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      setError("Cannot connect to the server. Please make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = Boolean(successMsg) && !error;

  return (
    <div className="auth-root">
      <div className="auth-bg" />
      <div className="auth-overlay" />
      <Particles />

      <div className="auth-card-wrap">
        <div className="auth-card">

          {/* Logo */}
          <div className="auth-logo-wrap">
            <div className="auth-logo-icon">
              <Stethoscope size={26} strokeWidth={2} color="#fff" />
            </div>
            <span className="auth-brand">AI Prescription</span>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Access your personalized medical assistant</p>

          {/* ── Banners ──────────────────────────────────────────────────── */}
          {error && (
            <div className="auth-banner auth-banner-error">
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
          {isSuccess && (
            <div className="auth-banner auth-banner-success">
              <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <form onSubmit={handleLogin} className="auth-form" noValidate autoComplete="off">

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={16} />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="off"
                  placeholder="name@example.com"
                  className="auth-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  disabled={isSuccess}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" size={16} />
                <input
                  id="auth-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="auth-input pr-12"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  disabled={isSuccess}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isSuccess}
              className="auth-submit-btn"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} /> Signing in…</>
                : isSuccess ? <><CheckCircle2 size={18} /> Redirecting…</>
                  : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/signup" className="auth-link">Create Account</Link>
            </p>
            <div className="auth-disclaimer">
              <ShieldCheck size={16} />
              <span>Secure, HIPAA compliant encryption</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
