import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity, ArrowLeft, Pill, ClipboardList, Utensils, Dumbbell,
  AlertTriangle, Clock, ExternalLink, ShoppingCart
} from "lucide-react";
import Layout from "./Layout";

const card = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
  padding: 32,
};

/* Pharmacy buy button */
function BuyBtn({ href, label, color, hoverColor, shadow }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: color, color: "#fff",
        padding: "6px 11px", borderRadius: 9,
        fontWeight: 700, fontSize: "0.7rem",
        textDecoration: "none", whiteSpace: "nowrap",
        boxShadow: shadow, fontFamily: "Outfit,sans-serif",
        transition: "background 0.18s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = hoverColor}
      onMouseLeave={e => e.currentTarget.style.background = color}
    >
      <ShoppingCart size={11} /> {label}
    </a>
  );
}

export default function Recommendation() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <Layout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 24px" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: "1px solid rgba(245,158,11,0.3)" }}>
            <AlertTriangle size={38} style={{ color: "#f59e0b" }} />
          </div>
          <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#0f172a", margin: "0 0 8px" }}>No Data Available</h2>
          <p style={{ color: "#64748b", marginBottom: 28, maxWidth: 380, lineHeight: 1.6, fontFamily: "Inter,sans-serif" }}>Please perform a new symptom search to receive an AI-powered analysis.</p>
          <button onClick={() => navigate("/user/symptom-search")} style={{
            padding: "12px 28px", borderRadius: 12, border: "none",
            background: "#10b981",
            color: "#fff", fontWeight: 700, fontFamily: "Outfit,sans-serif",
            cursor: "pointer", fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
          }}>
            Start New Search
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1060, margin: "0 auto 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <button onClick={() => navigate(-1)} style={{
              display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem",
              cursor: "pointer", marginBottom: 6, padding: 0, fontFamily: "Inter,sans-serif",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#10b981"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
            >
              <ArrowLeft size={16} /> Back to Search
            </button>
            <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#0f172a", margin: 0 }}>
              AI Health Recommendation
            </h1>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "#f0fdf4", border: "1px solid #dcfce7",
            color: "#10b981", padding: "7px 16px", borderRadius: 999,
            fontSize: "0.85rem", fontWeight: 700, fontFamily: "Outfit,sans-serif",
          }}>
            <Activity size={15} /> Analysis Completed
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 22, alignItems: "start" }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Condition */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontWeight: 700, fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                <ClipboardList size={18} /> Preliminary Diagnosis
              </div>
              <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "2rem", color: "#0f172a", margin: "0 0 12px" }}>
                {data.condition}
              </h2>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem", fontFamily: "Inter,sans-serif" }}>
                {data.description}
              </p>
            </div>

            {/* Medicines */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6366f1", fontWeight: 700, fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18 }}>
                <Pill size={18} /> Medication Plan
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
                  <thead>
                    <tr style={{ color: "#94a3b8", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      <th style={{ textAlign: "left", padding: "0 10px 4px" }}>Brand Name</th>
                      <th style={{ textAlign: "left", padding: "0 10px 4px" }}>Generic / Cheaper</th>
                      <th style={{ textAlign: "left", padding: "0 10px 4px" }}>Dosage &amp; Timing</th>
                      <th style={{ textAlign: "left", padding: "0 10px 4px" }}>Buy Online</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.medicines?.map((med, i) => (
                      <tr key={i}>
                        {/* Brand */}
                        <td style={{ padding: "13px 10px", borderRadius: "14px 0 0 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRight: "none" }}>
                          <a
                            href={med.brand_link || med.buy_link} target="_blank" rel="noopener noreferrer"
                            title={`Search "${med.brand}" on 1mg`}
                            style={{ fontWeight: 700, color: "#4f46e5", fontSize: "0.88rem", textDecoration: "none", fontFamily: "Inter,sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                          >
                            {med.brand}
                          </a>
                          <div style={{ fontSize: "0.67rem", color: "#94a3b8", marginTop: 2, fontFamily: "Inter,sans-serif" }}>Brand — click to search</div>
                        </td>

                        {/* Generic */}
                        <td style={{ padding: "13px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "none", borderRight: "none" }}>
                          <a
                            href={med.buy_link} target="_blank" rel="noopener noreferrer"
                            title={`Search "${med.generic}" on 1mg`}
                            style={{ fontWeight: 700, color: "#10b981", fontSize: "0.88rem", textDecoration: "none", fontFamily: "Inter,sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                          >
                            {med.generic}
                          </a>
                          <div style={{ fontSize: "0.64rem", fontWeight: 700, color: "#10b981", marginTop: 2, textTransform: "uppercase", fontFamily: "Inter,sans-serif" }}>
                            Save up to 60%
                          </div>
                        </td>

                        {/* Dosage */}
                        <td style={{ padding: "13px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "none", borderRight: "none" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, color: "#374151", fontSize: "0.84rem", fontWeight: 600, fontFamily: "Inter,sans-serif" }}>
                            <Clock size={12} style={{ color: "#818cf8", flexShrink: 0, marginTop: 3 }} />
                            {med.dosage}
                          </div>
                          <div style={{ fontSize: "0.71rem", color: "#64748b", marginTop: 4, fontFamily: "Inter,sans-serif", fontWeight: 500 }}>{med.timing}</div>
                        </td>

                        {/* Buy buttons */}
                        <td style={{ padding: "13px 10px", borderRadius: "0 14px 14px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "none" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                            {med.buy_link && (
                              <BuyBtn href={med.buy_link} label="1mg" color="#4f46e5" hoverColor="#4338ca" shadow="0 2px 7px rgba(79,70,229,0.28)" />
                            )}
                            {med.pharmeasy_link && (
                              <BuyBtn href={med.pharmeasy_link} label="PharmEasy" color="#f97316" hoverColor="#ea580c" shadow="0 2px 7px rgba(249,115,22,0.28)" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{
                marginTop: 14, padding: "11px 14px", background: "#eef2ff",
                borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 8,
                color: "#4f46e5", fontSize: "0.75rem", fontWeight: 600,
                border: "1px solid #e0e7ff", fontFamily: "Inter,sans-serif", lineHeight: 1.55,
              }}>
                <ExternalLink size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  Click the <strong>brand</strong> or <strong>generic</strong> name to search directly.
                  If a medicine shows "Not for sale" on 1mg, try <strong style={{ color: "#f97316" }}>PharmEasy</strong> — it may be available there or require uploading a prescription.
                </span>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ ...card, padding: 24, background: "rgba(255,251,235,0.93)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#d97706", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                <Utensils size={16} /> Suggested Diet
              </div>
              <p style={{ color: "#78350f", fontSize: "0.875rem", lineHeight: 1.72, margin: 0, fontFamily: "Inter,sans-serif", fontWeight: 400 }}>
                {data.diet}
              </p>
            </div>

            <div style={{ ...card, padding: 24, background: "rgba(239,246,255,0.93)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#2563eb", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                <Dumbbell size={16} /> Lifestyle &amp; Activity
              </div>
              <p style={{ color: "#1e3a8a", fontSize: "0.875rem", lineHeight: 1.72, margin: 0, fontFamily: "Inter,sans-serif", fontWeight: 400 }}>
                {data.workout}
              </p>
            </div>

            <div style={{ padding: 20, borderRadius: 18, background: "rgba(254,242,242,0.93)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#dc2626", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                <AlertTriangle size={16} /> Disclaimer
              </div>
              <p style={{ color: "rgba(153,27,27,0.8)", fontSize: "0.78rem", lineHeight: 1.65, margin: 0, fontWeight: 500, fontFamily: "Inter,sans-serif" }}>
                This AI tool provides educational health insights, not medical diagnosis. If symptoms persist, seek immediate help from a certified medical professional.
              </p>
            </div>

            <button onClick={() => navigate("/user/symptom-search")} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "13px 0", borderRadius: 14,
              background: "#ffffff", border: "1px solid #e2e8f0",
              color: "#475569", fontWeight: 700, fontSize: "0.875rem",
              cursor: "pointer", fontFamily: "Outfit,sans-serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              Start Another Analysis
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
