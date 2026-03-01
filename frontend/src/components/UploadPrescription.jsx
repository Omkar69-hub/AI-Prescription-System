import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  FileImage,
  Pill,
  File as FileIcon
} from "lucide-react";
import { uploadPrescription } from "../services/api";
import Layout from "./Layout";

export default function UploadPrescription() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPdf, setIsPdf] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const isPdfFile = selectedFile.type === "application/pdf";
      setIsPdf(isPdfFile);
      setFile(selectedFile);

      if (!isPdfFile) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a prescription image or PDF to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await uploadPrescription(formData);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("We encountered an error processing your prescription. Please ensure the file is clear and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-3 flex items-center justify-center lg:justify-start gap-3">
            <FileText className="text-indigo-500" /> Digital Prescription Analysis
          </h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            Upload your prescription (JPG, PNG, or PDF) for instant AI analysis. We'll extract medications, understand dosages, and suggest equivalent generic alternatives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Upload Panel */}
          <div className="lg:col-span-5">
            <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[300px] ${file ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:border-indigo-300"
                  }`}
              >
                {file ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {isPdf ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <FileIcon size={40} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 max-w-[200px] truncate">{file.name}</p>
                      </div>
                    ) : (
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-inner border border-white/50 bg-white">
                        <img src={preview} alt="Prescription Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <button
                      onClick={() => { setFile(null); setPreview(null); setIsPdf(false); }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                    >
                      <AlertCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mb-4">
                      <FileImage size={32} />
                    </div>
                    <label className="cursor-pointer">
                      <span className="text-indigo-600 font-bold hover:underline">Click to upload</span>
                      <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG, PDF (Max 10MB)</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2 py-4 shadow-indigo-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Run AI Analysis <Zap size={20} className="fill-white" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center gap-3 text-slate-400 text-xs justify-center italic">
                <ShieldCheck size={14} />
                Secure OCR Data Extraction
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7">
            {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-start gap-3 animate-in fade-in duration-300">
                <AlertCircle className="shrink-0 mt-0.5" />
                <p className="font-medium text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 font-outfit text-4xl font-bold italic">
                  AI
                </div>
                <h3 className="text-xl font-bold text-slate-400 font-outfit">Waiting for Analysis</h3>
                <p className="text-sm text-slate-300 mt-2 max-w-xs leading-relaxed">Your extracted medication details and genetic suggestions will appear here after upload.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] bg-white/50 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-12 text-center border border-slate-100 animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-500 font-outfit">Deep Semantic Search</h3>
                <p className="text-sm text-slate-400 mt-2">Extracting pharmacy data and cross-referencing...</p>
              </div>
            )}

            {result && (
              <div className="glass-card rounded-3xl overflow-hidden border border-emerald-100 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="bg-emerald-500 px-8 py-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={22} className="text-white/80" />
                    <span className="font-bold tracking-tight">AI Extraction Report</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Confidence High</span>
                </div>

                <div className="p-8">
                  {/* Extracted Text Summary */}
                  <div className="mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Raw Transcription</p>
                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-[150px] overflow-y-auto">
                      {result.extracted_text || "No legible text found in document."}
                    </p>
                  </div>

                  {/* Medications List */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Pill size={18} className="text-emerald-500" /> Verified Medications
                    </h4>

                    <div className="space-y-3">
                      {result.medicines?.length > 0 ? (
                        result.medicines.map((med, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:border-emerald-200">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{med.brand}</p>
                              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{med.dosage || "Standard Dose"}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter mb-1 border border-emerald-200/50 px-1 rounded">Generic SUGGESTION</span>
                              <p className="text-sm font-bold text-emerald-600">{med.generic}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-6 text-sm italic border border-dashed border-slate-100 rounded-2xl">No medicine matches found in our database.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-start gap-3 text-[11px] text-slate-400 leading-relaxed italic">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-500" />
                      Our AI identifies medicines by cross-referencing established brand names. Always consult a pharmacist before purchasing generic alternatives.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
