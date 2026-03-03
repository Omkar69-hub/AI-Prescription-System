import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2,
  Loader2, ArrowRight, Stethoscope, User, Phone, Users, ShieldCheck
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

// ─── Main Signup Component ────────────────────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  // Phone: digits only, max 15
  const handlePhone = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
    setForm((prev) => ({ ...prev, phone: digits }));
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ── Client-side validation ────────────────────────────────────────────────
    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!/^\d{10,15}$/.test(form.phone)) {
      setError("Phone number must be 10–15 digits (numbers only).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          full_name: form.full_name.trim(),
          phone: form.phone,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Signup failed. Please check your details and try again.");
        return;
      }

      // ── Store auth ─────────────────────────────────────────────────────────
      localStorage.setItem("auth", JSON.stringify({
        token: data.access_token,
        role: data.role,
        user: data.user,
      }));

      setSuccess(`Account created! Welcome, ${form.full_name}. Redirecting…`);

      const redirectPath = data.redirect || "/user/symptom-search";
      setTimeout(() => navigate(redirectPath), 1200);
    } catch (err) {
      setError("Cannot connect to the server. Please make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = Boolean(success) && !error;

  return (
    <div className="auth-root">
      <div className="auth-bg" />
      <div className="auth-overlay" />
      <Particles />

      <div className="auth-card-wrap">
        <div className="auth-card auth-card-wide">

          {/* Logo */}
          <div className="auth-logo-wrap">
            <div className="auth-logo-icon">
              <Stethoscope size={26} strokeWidth={2} color="#fff" />
            </div>
            <span className="auth-brand">AI Prescription</span>
          </div>

          <h1 className="auth-title">Join Us</h1>
          <p className="auth-subtitle">Get started with your intelligent health management system</p>

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
              <span>{success}</span>
            </div>
          )}

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <form onSubmit={handleSignup} className="auth-form" noValidate autoComplete="off">

            {/* Row 1: Full Name + Role */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">
                  Full Name <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" size={16} />
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="John Doe"
                    className="auth-input"
                    value={form.full_name}
                    onChange={set("full_name")}
                    disabled={isSuccess}
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Account Type</label>
                <div className="auth-input-wrap">
                  <Users className="auth-input-icon" size={16} />
                  <select
                    className="auth-input auth-select"
                    value={form.role}
                    onChange={set("role")}
                    disabled={isSuccess}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">
                  Email Address <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" size={16} />
                  <input
                    type="email"
                    autoComplete="off"
                    placeholder="name@example.com"
                    className="auth-input"
                    value={form.email}
                    onChange={set("email")}
                    disabled={isSuccess}
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">
                  Phone Number <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <Phone className="auth-input-icon" size={16} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="9876543210"
                    maxLength={15}
                    className="auth-input"
                    value={form.phone}
                    onChange={handlePhone}
                    disabled={isSuccess}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Password + Confirm */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">
                  Password <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" size={16} />
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    className="auth-input pr-12"
                    value={form.password}
                    onChange={set("password")}
                    disabled={isSuccess}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPass((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">
                  Confirm Password <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" size={16} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    className="auth-input pr-12"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    disabled={isSuccess}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isSuccess}
              className="auth-submit-btn"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} /> Creating Account…</>
                : isSuccess ? <><CheckCircle2 size={18} /> Redirecting…</>
                  : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </p>
            <div className="auth-disclaimer">
              <ShieldCheck size={16} />
              <span>Your data is protected by secure encryption</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
