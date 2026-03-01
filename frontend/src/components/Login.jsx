import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Stethoscope,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      // Save auth data in the format expected by utils/auth.js
      localStorage.setItem("auth", JSON.stringify({
        token: data.access_token,
        role: data.role,
        user: data.user
      }));

      // Redirect based on role
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/symptom-search");
      }

    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Aesthetic Background Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-10 rounded-3xl shadow-2xl border border-white/40">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 mb-4">
              <Stethoscope size={30} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 font-outfit text-center">
              Welcome Back
            </h2>
            <p className="text-slate-500 mt-2 text-center">
              Access your personalized medical assistant
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="input-field pl-11"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="input-field pl-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
              Create one now
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <ShieldCheck size={14} />
              Secure, HIPAA compliant encryption
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-tight">
              AI-assisted medical tool. Always consult a certified doctor for diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
