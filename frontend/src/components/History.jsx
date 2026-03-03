import React, { useEffect, useState } from "react";
import {
  History as HistoryIcon, Clock, Calendar, Activity,
  Pill, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import Layout from "./Layout";
import api from "../services/api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/history/");
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        setError("We're having trouble retrieving your medical history. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-3 flex items-center gap-3">
              <HistoryIcon className="text-emerald-500" /> My Search History
            </h1>
            <p className="text-slate-500 max-w-xl leading-relaxed">
              Review your past AI symptom analyses and medicine recommendations.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-widest">
              {history.length} Records
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Loading your records...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex flex-col items-center text-center gap-4">
            <AlertCircle size={40} />
            <p className="font-bold text-lg">Something went wrong</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
              <Clock size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-400 font-outfit">No Records Yet</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-xs leading-relaxed">
              Complete your first symptom analysis to see your history here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((item, index) => (
              <div key={index} className="glass-card p-6 rounded-[32px] border border-slate-100 shadow-xl flex items-start gap-6 group hover:border-emerald-200 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shrink-0 mt-1">
                  <Activity size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-600">AI Analysis</span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {item.condition || "Health Analysis"}
                  </h3>

                  {item.symptoms && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      <span className="font-semibold text-slate-600">Symptoms: </span>{item.symptoms}
                    </p>
                  )}

                  {item.medicines?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.medicines.map((m, mi) => (
                        <span key={mi} className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-lg font-semibold">
                          <Pill size={10} /> {m.brand || m.generic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-right hidden md:block">
                  <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mb-1">Status</p>
                  <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Completed
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex items-start gap-4 p-6 bg-slate-100/50 rounded-2xl border border-slate-200 border-dashed">
          <AlertCircle className="text-slate-400 shrink-0 mt-0.5" size={20} />
          <p className="text-xs text-slate-500 leading-relaxed">
            History is stored securely in your account. AI predictions are for educational purposes only and should be validated by medical specialists.
          </p>
        </div>
      </div>
    </Layout>
  );
}
