import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, AlertTriangle,
  CheckCircle2, Loader2, ArrowRight, Stethoscope,
  User, Phone, Users, ShieldCheck
} from "lucide-react";
import { signupUser } from "../services/api";
import { addNotification } from "../utils/notifications";

// ─── Floating particles (same as Login) ──────────────────────────────────────
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
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");

  const handle = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  // Phone: digits only
  const handlePhone = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
    setForm((p) => ({ ...p, phone: digits }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); setWarning(""); setSuccess("");

    // ── Client-side validation ─────────────────────────────────────────
    if (!form.full_name.trim()) {
      setError("Full name is required."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (form.phone && !/^\d{10,15}$/.test(form.phone)) {
      setError("Phone number must be 10–15 digits (numbers only)."); return;
    }

    setLoading(true);
    try {
      localStorage.removeItem("auth");
      const data = await signupUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        phone: form.phone,
        role: form.role,
      });

      // Store JWT from signup response
      localStorage.setItem("auth", JSON.stringify({
        token: data.access_token,
        role: data.role,
        user: data.user,
      }));

      // Notify
      addNotification({
        type: "signup",
        title: "🎉 Account Created",
        message: `Welcome, ${form.full_name}! Your ${form.role} account is ready. Enjoy AI-powered health insights.`,
      });

      // Surface soft name-duplicate warning if present
      if (data.name_warning) {
        setWarning(data.name_warning);
        // Still redirect after short delay so user can read the warning
        setSuccess("Account created! Redirecting…");
        setTimeout(() => navigateToApp(data), 3000);
      } else {
        setSuccess("Account created successfully! Redirecting…");
        setTimeout(() => navigateToApp(data), 1400);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "";
      if (!err.response) {
        setError("Cannot connect to the server. Please ensure the backend is running.");
      } else if (detail.toLowerCase().includes("already exists")) {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(detail || "Registration failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToApp = (data) => {
    const path = data.redirect ||
      (data.role === "admin" ? "/admin/dashboard"
        : data.role === "doctor" ? "/doctor/history"
          : "/user/symptom-search");
    navigate(path);
  };

  return (
    <div className="auth-root">
      {/* Background */}
      <div className="auth-bg" />
      <div className="auth-overlay" />
      <Particles />

      {/* Card */}
      <div className="auth-card-wrap">
        <div className="auth-card auth-card-wide">

          {/* Logo */}
          <div className="auth-logo-wrap">
            <div className="auth-logo-icon">
              <Stethoscope size={28} strokeWidth={2} color="#fff" />
            </div>
            <span className="auth-brand">AI Prescription</span>
          </div>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the intelligent health management system</p>

          {/* Banners */}
          {error && (
            <div className="auth-banner auth-banner-error">
              <AlertCircle size={17} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {warning && (
            <div className="auth-banner auth-banner-warning">
              <AlertTriangle size={17} className="shrink-0" />
              <span>{warning}</span>
            </div>
          )}
          {success && (
            <div className="auth-banner auth-banner-success">
              <CheckCircle2 size={17} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="auth-form" noValidate>

            {/* Row 1: Full Name + Account Type */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">Full Name <span className="text-rose-400">*</span></label>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" size={16} />
                  <input
                    type="text" required placeholder="John Doe"
                    className="auth-input"
                    value={form.full_name} onChange={handle("full_name")}
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Account Type</label>
                <div className="auth-input-wrap">
                  <Users className="auth-input-icon" size={16} />
                  <select
                    className="auth-input auth-select"
                    value={form.role} onChange={handle("role")}
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
                <label className="auth-label">Email Address <span className="text-rose-400">*</span></label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" size={16} />
                  <input
                    type="email" required placeholder="name@example.com"
                    className="auth-input"
                    value={form.email} onChange={handle("email")}
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Phone Number</label>
                <div className="auth-input-wrap">
                  <Phone className="auth-input-icon" size={16} />
                  <input
                    type="text" inputMode="numeric"
                    placeholder="9876543210" maxLength={15}
                    className="auth-input"
                    value={form.phone} onChange={handlePhone}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Password + Confirm */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">Password <span className="text-rose-400">*</span></label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" size={16} />
                  <input
                    type={showPass ? "text" : "password"}
                    required placeholder="Min. 6 characters"
                    className="auth-input pr-12"
                    value={form.password} onChange={handle("password")}
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirm Password <span className="text-rose-400">*</span></label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" size={16} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required placeholder="Repeat password"
                    className="auth-input pr-12"
                    value={form.confirmPassword} onChange={handle("confirmPassword")}
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="auth-submit-btn"
            >
              {loading
                ? <><Loader2 className="animate-spin" size={18} /> Creating Account…</>
                : success
                  ? <><CheckCircle2 size={18} /> Redirecting…</>
                  : <><ArrowRight size={18} /> Create Account</>
              }
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <ShieldCheck size={13} className="text-cyan-400/60" />
            <span>Secure • HIPAA Compliant</span>
            <span className="auth-divider-dot">·</span>
            <span>Already registered?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
