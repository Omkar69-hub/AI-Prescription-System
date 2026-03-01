import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Search,
  AlertCircle,
  Pill,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Info,
  Loader2
} from "lucide-react";
import { getSymptomRecommendation } from "../services/api";
import Layout from "./Layout";

export default function SymptomSearch() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms to receive an analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await getSymptomRecommendation(symptoms);
      // Navigate to the results page with data
      navigate("/user/recommendation", { state: data });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Our AI is currently unable to process your request. Please try again or consult a doctor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-3 flex items-center gap-3">
            <Activity className="text-emerald-500" /> AI Symptom Analysis
          </h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            Describe how you're feeling in natural language. Our advanced AI will analyze your symptoms and provide preliminary care insights and medicine recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Input Panel */}
          <div className="lg:col-span-12">
            <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Search size={120} />
              </div>

              <div className="relative z-10">
                <label className="block text-sm font-bold text-slate-700 mb-4 ml-1 flex items-center gap-2">
                  <Info size={16} className="text-emerald-500" /> How can we help you today?
                </label>
                <textarea
                  className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-lg placeholder:text-slate-300 resize-none"
                  placeholder="Example: I've been having a persistent dry cough and mild fever for the last two days, along with some body ache..."
                  value={symptoms}
                  onChange={(e) => {
                    setSymptoms(e.target.value);
                    if (error) setError("");
                  }}
                />

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <CheckCircle2 size={16} /> Ready for analysis
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading || !symptoms.trim()}
                    className="btn-primary flex items-center gap-2 px-8 py-4 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Symptoms <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="lg:col-span-12 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-top-4 duration-500">
              <AlertCircle size={24} />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* AI Result Section */}
          {result && (
            <div className="lg:col-span-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="glass-card rounded-3xl overflow-hidden border border-emerald-100 shadow-2xl">
                <div className="bg-emerald-500 px-8 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/90">
                      <CheckCircle2 size={24} />
                      <span className="font-bold tracking-wide uppercase text-xs">Analysis Complete</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mt-2 font-outfit">
                    {result.disease || "Predicted Health Condition"}
                  </h2>
                </div>

                <div className="p-10 bg-white">
                  <div className="mb-10">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-6 pb-2 border-b border-slate-100">
                      <Pill className="text-emerald-500" size={24} />
                      <h3>Recommended Care & Medications</h3>
                    </div>

                    {result.medicines?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.medicines.map((med, index) => (
                          <div key={index} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Prescription</p>
                              <p className="text-lg font-bold text-slate-800">{med.brand}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1 leading-none shrink-0 inline-flex items-center gap-1 bg-emerald-100/50 px-2 py-1 rounded">
                                <TrendingDown size={12} /> Generic Available
                              </p>
                              <p className="text-lg font-bold text-emerald-600">{med.generic}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium italic">No specific medications identified. Please consult a doctor for a deeper diagnosis.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                    <Info className="text-indigo-500 shrink-0 mt-1" size={22} />
                    <div>
                      <p className="text-sm font-bold text-indigo-900 mb-1 tracking-tight">AI Diagnostic Note</p>
                      <p className="text-sm text-indigo-700/80 leading-relaxed">
                        This recommendation is based on a statistical analysis of common health patterns. Always prioritize an in-person examination by a licensed medical professional before starting any treatment plan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
