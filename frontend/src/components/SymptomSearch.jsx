import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, Search, AlertCircle, CheckCircle2,
  ArrowRight, Info, Loader2
} from "lucide-react";
import { getSymptomRecommendation } from "../services/api";
import Layout from "./Layout";
import { addNotification, addDosageReminder, getCurrentDosageSlot } from "../utils/notifications";

const cardStyle = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
  padding: "32px",
  position: "relative",
  overflow: "hidden",
};

export default function SymptomSearch() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms to receive an analysis.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getSymptomRecommendation(symptoms);
      // Fire notifications before navigating
      addNotification({
        type: "prescription",
        title: "📋 Analysis Complete",
        message: `Diagnosed: ${data.condition}. ${data.medicines?.length || 0} medicine(s) recommended. Check your results below.`,
      });
      addDosageReminder(data.medicines || []);
      addNotification({
        type: "purchase",
        title: "🛒 Purchase Reminder",
        message: "Don't forget to purchase your prescribed medicines. Click \"Buy on 1mg\" or \"PharmEasy\" buttons on the results page.",
      });
      navigate("/user/recommendation", { state: data });
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError("Cannot connect to the server. Please make sure the backend is running on port 8000.");
      } else {
        setError(
          err.response?.data?.detail ||
          "Our AI could not process your request. Please try again or rephrase your symptoms."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.8rem",
            color: "#0f172a", margin: "0 0 8px 0",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Activity style={{ color: "#10b981" }} size={28} />
            AI Symptom Analysis
          </h1>
          <p style={{
            color: "#64748b", fontSize: "0.95rem",
            margin: 0, maxWidth: 580, lineHeight: 1.65,
          }}>
            Describe how you're feeling in natural language. Our advanced AI will analyze your
            symptoms and provide preliminary care insights and medicine recommendations.
          </p>
        </div>

        {/* Input card */}
        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 16, right: 16, opacity: 0.04 }}>
            <Search size={100} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 7,
              fontSize: "0.78rem", fontWeight: 700, color: "#1e293b",
              marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              <Info size={15} style={{ color: "#10b981" }} />
              How can we help you today?
            </label>

            <textarea
              style={{
                width: "100%", height: 150, padding: "16px",
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
                borderRadius: 14, fontSize: "1rem", color: "#1e293b",
                fontFamily: "Inter,sans-serif", lineHeight: 1.65,
                resize: "none", outline: "none", boxSizing: "border-box",
                transition: "all 0.2s",
              }}
              placeholder="Example: I've been having a persistent dry cough and mild fever for the last two days, along with some body ache…"
              value={symptoms}
              onChange={(e) => { setSymptoms(e.target.value); if (error) setError(""); }}
              onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />

            <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.8rem" }}>
                <CheckCircle2 size={15} /> Ready for analysis
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !symptoms.trim()}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 28px", borderRadius: 12, border: "none",
                  fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.9rem",
                  cursor: loading || !symptoms.trim() ? "not-allowed" : "pointer",
                  background: loading || !symptoms.trim()
                    ? "#94a3b8"
                    : "#10b981",
                  color: "#fff",
                  boxShadow: loading || !symptoms.trim() ? "none" : "0 8px 20px rgba(16,185,129,0.25)",
                  transition: "all 0.2s",
                  opacity: loading || !symptoms.trim() ? 0.6 : 1,
                }}
              >
                {loading
                  ? <><Loader2 className="animate-spin" size={18} /> Analyzing…</>
                  : <>Analyze Symptoms <ArrowRight size={18} /></>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            marginTop: 14, display: "flex", alignItems: "flex-start", gap: 10,
            padding: "13px 16px", borderRadius: 14,
            background: "rgba(254,226,226,0.95)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#dc2626", fontSize: "0.875rem", fontWeight: 500,
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

      </div>
    </Layout>
  );
}
