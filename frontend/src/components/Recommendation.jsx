import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity, ArrowLeft, Pill, ClipboardList, Utensils, Dumbbell,
  AlertTriangle, Clock, ExternalLink, ShoppingCart
} from "lucide-react";
import Layout from "./Layout";

export default function Recommendation() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Data Available</h2>
          <p className="text-slate-500 mb-8 max-w-md">Please perform a new symptom search to get an analysis.</p>
          <button onClick={() => navigate("/user/symptom-search")} className="btn-primary px-8">
            Start New Search
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-semibold transition-colors mb-2">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Search
            </button>
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">AI Health Recommendation</h1>
          </div>
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
            <Activity size={16} /> Analysis Completed
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main */}
          <div className="lg:col-span-8 space-y-8">
            {/* Condition */}
            <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl">
              <div className="flex items-center gap-3 text-emerald-600 font-bold mb-4 uppercase tracking-widest text-xs">
                <ClipboardList size={20} /> Preliminary Diagnosis
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 font-outfit">{data.condition}</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{data.description}</p>
            </div>

            {/* Medicines Table */}
            <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl overflow-hidden">
              <div className="flex items-center gap-3 text-indigo-600 font-bold mb-6 uppercase tracking-widest text-xs">
                <Pill size={20} /> Medication Plan
              </div>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-slate-400 text-xs font-black uppercase tracking-widest">
                      <th className="px-4 pb-2">Brand Medicine</th>
                      <th className="px-4 pb-2">Generic / Cheaper Alt.</th>
                      <th className="px-4 pb-2">Dosage & Timing</th>
                      <th className="px-4 pb-2">Buy Online</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.medicines?.map((med, i) => (
                      <tr key={i} className="group">
                        <td className="px-4 py-4 bg-slate-50/80 rounded-l-2xl border-y border-l border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                          <div className="font-bold text-slate-900">{med.brand}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 italic">Common Brand</div>
                        </td>
                        <td className="px-4 py-4 bg-slate-50/80 border-y border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                          <div className="font-bold text-emerald-600">{med.generic}</div>
                          <div className="text-[10px] font-bold text-emerald-500 mt-0.5 uppercase">Save up to 60%</div>
                        </td>
                        <td className="px-4 py-4 bg-slate-50/80 border-y border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                          <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                            <Clock size={14} className="text-indigo-400 shrink-0" /> {med.dosage}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-semibold">{med.timing}</div>
                        </td>
                        <td className="px-4 py-4 bg-slate-50/80 rounded-r-2xl border-y border-r border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                          {med.buy_link ? (
                            <a
                              href={med.buy_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                              <ShoppingCart size={12} /> Buy
                            </a>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl flex items-center gap-3 text-indigo-700 text-xs font-semibold border border-indigo-100">
                <ExternalLink size={16} /> Always verify the generic molecule name with your pharmacist before purchase. Links open Netmeds search.
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Diet */}
            <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-xl bg-gradient-to-br from-white to-amber-50/30">
              <div className="flex items-center gap-2 text-amber-600 font-bold mb-4 uppercase tracking-widest text-[10px]">
                <Utensils size={18} /> Suggested Diet
              </div>
              <p className="text-slate-700 text-sm leading-relaxed p-4 bg-white/60 rounded-2xl border border-amber-100/50 italic">
                "{data.diet}"
              </p>
            </div>

            {/* Workout */}
            <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-4 uppercase tracking-widest text-[10px]">
                <Dumbbell size={18} /> Lifestyle & Activity
              </div>
              <p className="text-slate-700 text-sm leading-relaxed p-4 bg-white/60 rounded-2xl border border-blue-100/50 italic">
                "{data.workout}"
              </p>
            </div>

            {/* Disclaimer */}
            <div className="p-6 rounded-3xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-2 text-red-600 font-bold mb-3">
                <AlertTriangle size={18} />
                <span className="text-xs uppercase tracking-tight">Disclaimer</span>
              </div>
              <p className="text-xs text-red-700/70 leading-relaxed font-medium">
                This AI tool provides educational health insights, not medical diagnosis. If symptoms persist, seek immediate help from a certified medical professional.
              </p>
            </div>

            <button onClick={() => navigate("/user/symptom-search")} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
              Start Another Analysis
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
