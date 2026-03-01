import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Stethoscope, Mail, Lock, AlertCircle, ArrowRight,
  ShieldCheck, Loader2, User, Users, Phone, Eye, EyeOff
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { signupUser } from "../services/api";
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

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoad] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  const handle = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    setPhoneTouched(true);
    if (digits.length === 0) setPhoneError("");
    else if (raw !== digits) setPhoneError("Only numbers are allowed in this field.");
    else if (digits.length < 10) setPhoneError("Phone number must be at least 10 digits.");
    else setPhoneError("");
    setFormData((p) => ({ ...p, phone: digits }));
  };

  // ── After successful Google signup/login ──────────────────────────────────
  const onGoogleSuccess = (data) => {
    localStorage.setItem("auth", JSON.stringify({
      token: data.access_token,
      role: data.role,
      user: data.user,
    }));
    const redirectPath =
      data.redirect ||
      (data.role === "admin" ? "/admin/dashboard" :
        data.role === "doctor" ? "/doctor/history" :
          "/user/symptom-search");
    navigate(redirectPath);
  };

  // ── Google signup ─────────────────────────────────────────────────────────
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoad(true); setError("");
      try {
        localStorage.removeItem("auth");
        const res = await api.post("/auth/google", {
          access_token: tokenResponse.access_token,
          role: formData.role,
        });
        onGoogleSuccess(res.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Google signup failed. Please try again or register manually."
        );
      } finally {
        setGoogleLoad(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled or failed. Please try again."),
  });

  // ── Email/password signup ─────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify them.");
      return;
    }
    if (!formData.phone || !/^\d{10,15}$/.test(formData.phone)) {
      setError("Please enter a valid 10-15 digit phone number (numbers only).");
      return;
    }

    setLoading(true);
    try {
      localStorage.removeItem("auth");
      await signupUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
      });
      navigate("/login", { state: { message: "Account created successfully! Please sign in." } });
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. This email might already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "input-field pl-11";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-lg">
        <div className="glass-card p-10 rounded-3xl shadow-2xl border border-white/40">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 mb-4">
              <Stethoscope size={30} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 font-outfit text-center">Join Us</h2>
            <p className="text-slate-500 mt-2 text-center text-balance px-4">
              Get started with your intelligent health management system
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Name + Account Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User size={18} /></div>
                  <input type="text" required className={inputCls} placeholder="John Doe" value={formData.full_name} onChange={handle("full_name")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Account Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Users size={18} /></div>
                  <select className="input-field pl-11 appearance-none" value={formData.role} onChange={handle("role")}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Mail size={18} /></div>
                  <input type="email" required className={inputCls} placeholder="name@example.com" value={formData.email} onChange={handle("email")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Phone Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Phone size={18} /></div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    className={`${inputCls} ${phoneTouched && phoneError ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""}`}
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    maxLength={15}
                    onChange={handlePhoneChange}
                    onBlur={() => {
                      setPhoneTouched(true);
                      if (formData.phone.length > 0 && formData.phone.length < 10)
                        setPhoneError("Phone number must be at least 10 digits.");
                      else if (formData.phone.length === 0)
                        setPhoneError("");
                    }}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
                        e.preventDefault();
                    }}
                  />
                </div>
                {phoneTouched && phoneError && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                    <span>⚠</span> {phoneError}
                  </p>
                )}
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handle("password")}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Confirm Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handle("confirmPassword")}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Create Account</>}
            </button>
          </form>

          {/* Divider + Google */}
          <div className="mt-5">
            <Divider />
            <button
              type="button"
              disabled={googleLoading}
              onClick={() => googleSignup()}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
              Continue with Google
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">Login</Link>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck size={14} />
            Your data is protected by secure encryption
          </div>
        </div>
      </div>
    </div>
  );
}
