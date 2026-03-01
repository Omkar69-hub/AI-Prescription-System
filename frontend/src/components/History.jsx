import React, { useEffect, useState } from "react";
import {
  History as HistoryIcon,
  Search,
  Upload,
  Clock,
  ChevronRight,
  Calendar,
  Activity,
  Pill,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getUserHistory } from "../services/api";
import Layout from "./Layout";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getUserHistory();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setError("We're having trouble retrieving your medical history. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-3 flex items-center gap-3">
              <HistoryIcon className="text-indigo-500" /> Medical History
            </h1>
            <p className="text-slate-500 max-w-xl leading-relaxed">
              Review your past AI analyses, symptoms, and prescription extractions in one secure location.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest">
              {history.length} Records Found
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Loading your records...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex flex-col items-center text-center gap-4 animate-in fade-in duration-300">
            <AlertCircle size={40} />
            <div>
              <p className="font-bold text-lg">Oops! Something went wrong</p>
              <p className="text-sm opacity-80 mt-1">{error}</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6 group transition-all duration-500 hover:rotate-12">
              <Clock size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-400 font-outfit">No Records Yet</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-xs leading-relaxed">Complete your first symptom analysis or prescription upload to see your history here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((item, index) => {
              const isSymptomSearch = item.type === "symptom" || item.symptoms;
              const date = new Date(item.created_at || Date.now());

              return (
                <div key={index} className="glass-card p-6 rounded-3xl border border-white/50 shadow-xl flex items-center gap-6 group hover:translate-x-2 transition-all duration-300 hover:border-emerald-200">
                  {/* Type Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${isSymptomSearch ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-indigo-500 text-white shadow-indigo-100"
                    }`}>
                    {isSymptomSearch ? <Activity size={24} /> : <Upload size={24} />}
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isSymptomSearch ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
                        }`}>
                        {isSymptomSearch ? "AI Analysis" : "Prescription OCR"}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Calendar size={12} />
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors">
                      {item.disease || "Health Analysis Report"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 truncate">
                      <Pill size={14} className="text-emerald-400 shrink-0" />
                      {item.medicines?.map(m => m.brand).join(", ") || "No medicines listed"}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="shrink-0 flex items-center gap-4">
                    <div className="hidden md:block text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                      <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
                        <CheckCircle2 size={12} /> Finalized
                      </p>
                    </div>
                    <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-100">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 flex items-start gap-4 p-6 bg-slate-100/50 rounded-2xl border border-slate-200 border-dashed">
          <AlertCircle className="text-slate-400 shrink-0 mt-0.5" size={20} />
          <p className="text-xs text-slate-500 leading-relaxed">
            History is stored locally and on your secure account profile. This data is used to provide better personalized health insights. AI predictions may vary and should always be validated by medical specialists.
          </p>
        </div>
      </div>
    </Layout>
  );
}
