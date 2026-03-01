import React, { useEffect, useState } from "react";
import {
  ShieldAlert, Plus, Database, RefreshCcw, Loader2,
  CheckCircle2, AlertCircle, Trash2, XCircle
} from "lucide-react";
import apiClient from "../services/api";
import Layout from "../components/Layout";

export default function AdminDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [brand, setBrand] = useState("");
  const [generic, setGeneric] = useState("");
  const [disease, setDisease] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: string }
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMedicines = async () => {
    setFetching(true);
    try {
      const res = await apiClient.get("/admin/medicines");
      setMedicines(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to load data from backend.";
      showToast("error", detail);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!brand.trim() || !generic.trim() || !disease.trim()) return;

    setLoading(true);
    try {
      await apiClient.post("/admin/medicines", { brand: brand.trim(), generic: generic.trim(), disease: disease.trim() });
      showToast("success", `"${brand}" was added successfully.`);
      setBrand("");
      setGeneric("");
      setDisease("");
      fetchMedicines();
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to add mapping. Please check backend connection.";
      showToast("error", detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/admin/medicines/${id}`);
      showToast("success", `"${name}" deleted.`);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      showToast("error", "Failed to delete mapping.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl shadow-xl border animate-in slide-in-from-top-4 duration-300 max-w-sm ${toast.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-red-50 border-red-100 text-red-700"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-500" />
            ) : (
              <XCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
            )}
            <p className="text-sm font-semibold leading-snug">{toast.msg}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-3 flex items-center gap-3">
              <ShieldAlert className="text-red-500" /> Administrative Console
            </h1>
            <p className="text-slate-500 max-w-xl leading-relaxed">
              Manage the health intelligence database. Map pharmaceutical brands to their generic equivalents and associate them with health conditions.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Database size={14} /> {medicines.length} Records
            </div>
            <button
              onClick={fetchMedicines}
              className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <RefreshCcw size={20} className={fetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-4">
            <div className="glass-card p-8 rounded-3xl border border-white/50 shadow-xl sticky top-28">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-indigo-500" /> Add New Mapping
              </h3>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Brand Name <span className="text-red-400 normal-case">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Crocin"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Generic Variant <span className="text-red-400 normal-case">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Paracetamol 500mg"
                    value={generic}
                    onChange={(e) => setGeneric(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Health Condition <span className="text-red-400 normal-case">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Fever"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn-primary flex items-center justify-center gap-2 py-4 mt-4 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Saving...</>
                  ) : (
                    <>Commit to Database <Plus size={20} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  Duplicate entries for the same brand + condition will be rejected automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-8">
            <div className="glass-card rounded-3xl border border-white/50 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Brand</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Generic</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Condition</th>
                      <th className="px-8 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {fetching ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center">
                          <Loader2 className="animate-spin inline-block text-indigo-500 mb-2" size={32} />
                          <p className="text-slate-400 font-medium">Synchronizing records...</p>
                        </td>
                      </tr>
                    ) : medicines.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center">
                          <Database className="inline-block text-slate-200 mb-3" size={48} />
                          <p className="text-slate-400 font-medium">Knowledge base is currently empty.</p>
                          <p className="text-slate-300 text-sm mt-1">Use the form on the left to add your first mapping.</p>
                        </td>
                      </tr>
                    ) : (
                      medicines.map((med) => (
                        <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="font-bold text-slate-700">{med.brand}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg text-sm">
                              <CheckCircle2 size={14} /> {med.generic}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-slate-500 font-medium italic">{med.disease}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button
                              onClick={() => handleDelete(med.id, med.brand)}
                              disabled={deletingId === med.id}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                            >
                              {deletingId === med.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
