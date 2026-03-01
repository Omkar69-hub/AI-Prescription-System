import React, { useEffect, useState } from "react";
import {
    Stethoscope, Users, Loader2, AlertCircle, Calendar,
    Pill, ChevronDown, ChevronUp, Phone, Mail, Activity
} from "lucide-react";
import Layout from "./Layout";
import api from "../services/api";

export default function DoctorPatientHistory() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/history/all-patients")
            .then((res) => setRecords(res.data))
            .catch(() => setError("Failed to load patient history. Make sure you are logged in as a Doctor."))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (i) => setExpanded((p) => ({ ...p, [i]: !p[i] }));

    const filtered = records.filter((r) =>
        !search ||
        r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.patient_email?.toLowerCase().includes(search.toLowerCase()) ||
        r.symptoms?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-3 flex items-center gap-3">
                        <Stethoscope className="text-emerald-500" /> Patient History Dashboard
                    </h1>
                    <p className="text-slate-500 max-w-2xl leading-relaxed">
                        View all patient symptom searches, diagnoses, and medicine recommendations.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search by name, email, or symptom..."
                        className="input-field max-w-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm">
                        {filtered.length} / {records.length} records
                    </div>
                </div>

                {loading ? (
                    <div className="h-80 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p>Loading patient records...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-4">
                        <AlertCircle size={32} className="shrink-0" />
                        <p className="font-semibold">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="h-80 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                        <Users size={40} className="text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No Patient Records</h3>
                        <p className="text-sm text-slate-300 mt-2">No searches have been made yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((record, i) => (
                            <div
                                key={i}
                                className="glass-card rounded-3xl border border-white/50 shadow-xl overflow-hidden transition-all duration-300 hover:border-emerald-100"
                            >
                                {/* Summary Row */}
                                <button
                                    onClick={() => toggle(i)}
                                    className="w-full flex items-center gap-5 p-6 text-left"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shrink-0">
                                        <Activity size={22} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-1">
                                            <span className="font-bold text-slate-900 text-base">{record.patient_name || "Unknown Patient"}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-600">
                                                {record.condition || "Analysis"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium flex-wrap">
                                            {record.patient_email && (
                                                <span className="flex items-center gap-1"><Mail size={11} /> {record.patient_email}</span>
                                            )}
                                            {record.patient_phone && (
                                                <span className="flex items-center gap-1"><Phone size={11} /> {record.patient_phone}</span>
                                            )}
                                            <span className="flex items-center gap-1"><Calendar size={11} />
                                                {record.created_at ? new Date(record.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-slate-400">
                                        {expanded[i] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </button>

                                {/* Expanded Detail */}
                                {expanded[i] && (
                                    <div className="px-6 pb-6 border-t border-slate-100 pt-4 space-y-4 animate-in fade-in duration-200">
                                        {record.symptoms && (
                                            <div>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Symptoms Described</p>
                                                <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100">{record.symptoms}</p>
                                            </div>
                                        )}

                                        {record.medicines?.length > 0 && (
                                            <div>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Medicines Suggested</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {record.medicines.map((m, mi) => (
                                                        <div key={mi} className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                                            <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm">
                                                                <Pill size={13} /> {m.brand || m.generic}
                                                            </div>
                                                            {m.generic && m.generic !== m.brand && (
                                                                <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">Generic: {m.generic}</div>
                                                            )}
                                                            {m.dosage && (
                                                                <div className="text-[10px] text-slate-500 mt-0.5">{m.dosage}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
