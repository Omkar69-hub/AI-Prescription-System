import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  UploadCloud,
  History as HistoryIcon,
  ShieldCheck,
  ArrowRight,
  Pill,
  Activity,
  Zap,
  Heart,
  Star,
  ChevronRight,
} from "lucide-react";

// ─── Floating animated particles (same style as Login/Signup) ──────────────────
function Particles() {
  const pts = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    dur: Math.random() * 12 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.5 + 0.15,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-emerald-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, accent }) {
  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 24,
        padding: "36px 30px",
        transition: "transform 0.3s, border-color 0.3s, box-shadow 0.3s",
        cursor: "default",
        opacity: 0.95,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.borderColor = `${accent}`;
        e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.06)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          background: `${accent}22`,
          border: `1px solid ${accent}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 800,
          fontSize: "1.2rem",
          color: "var(--color-brand-primary)",
          margin: "0 0 10px 0",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--color-brand-secondary)",
          fontSize: "0.95rem",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}

// ─── Stat Badge ────────────────────────────────────────────────────────────────
function StatBadge({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 800,
          fontSize: "1.9rem",
          color: "#10b981",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div style={{ color: "var(--color-brand-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Background image (same as auth pages) ── */}
      <div className="auth-bg" />
      <div className="auth-overlay" />

      {/* ── Floating particles ── */}
      <Particles />

      {/* ── Navigation ── */}
      <nav
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 48px",
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: 0.9,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="auth-logo-icon">
            <Stethoscope size={26} strokeWidth={2} color="#fff" />
          </div>
          <span className="auth-brand" style={{ fontSize: "1.25rem" }}>
            AI Prescription
          </span>
        </div>

        {/* Nav links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "transparent",
              border: "1px solid transparent",
              borderRadius: 12,
              color: "#475569",
              padding: "10px 24px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#475569";
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "#10b981",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              padding: "10px 26px",
              fontSize: "0.95rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
              fontFamily: "Outfit, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#059669";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#10b981";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.2)";
            }}
          >
            Get Started <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "72px 40px 80px",
        }}
      >
        {/* ── Hero Section ── */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 18px",
              borderRadius: 999,
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.3)",
              color: "#67e8f9",
              fontSize: "0.78rem",
              fontWeight: 600,
              marginBottom: 28,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Zap size={14} /> Advanced AI Medical Assistant
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 950,
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              color: "var(--color-brand-primary)",
              margin: "0 0 20px 0",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            Revolutionize Your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Health Management
            </span>
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
              marginTop: 48,
            }}
          >
            <button
              onClick={() => navigate("/signup")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 32px",
                borderRadius: 13,
                border: "none",
                background: "#10b981",
                color: "#fff",
                fontSize: "1.05rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(16,185,129,0.25)",
                fontFamily: "Outfit, sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.background = "#059669";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(16,185,129,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "#10b981";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(16,185,129,0.25)";
              }}
            >
              Start Diagnosis Now <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 32px",
                borderRadius: 13,
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-brand-secondary)",
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.05)";
                e.currentTarget.style.borderColor = "#10b981";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-bg-card)";
                e.currentTarget.style.borderColor = "var(--color-border-subtle)";
              }}
            >
              Login to Dashboard
            </button>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 48,
              marginTop: 52,
              padding: "24px 40px",
              borderRadius: 18,
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-subtle)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              flexWrap: "wrap",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              opacity: 0.9,
            }}
          >
            <StatBadge value="50K+" label="Patients Helped" />
            <div
              style={{
                width: 1,
                background: "#e2e8f0",
                alignSelf: "stretch",
              }}
            />
            <StatBadge value="98.4%" label="AI Accuracy" />
            <div
              style={{
                width: 1,
                background: "rgba(255,255,255,0.1)",
                alignSelf: "stretch",
              }}
            />
            <StatBadge value="200+" label="Conditions Covered" />
            <div
              style={{
                width: 1,
                background: "rgba(255,255,255,0.1)",
                alignSelf: "stretch",
              }}
            />
            <StatBadge value="24/7" label="Availability" />
          </div>
        </div>

        {/* ── Feature Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 64,
          }}
        >
          <FeatureCard
            icon={<Activity size={26} color="#10b981" />}
            title="Symptom Analysis"
            description="Describe your symptoms in natural language. Our AI analyzes patterns and delivers precise care insights within seconds."
            accent="#10b981"
          />
          <FeatureCard
            icon={<UploadCloud size={26} color="#818cf8" />}
            title="Smart OCR Upload"
            description="Upload prescription images (PNG, JPG, PDF). Our OCR engine extracts medicine names and key details automatically."
            accent="#818cf8"
          />
          <FeatureCard
            icon={<Pill size={26} color="#34d399" />}
            title="Generic Alternatives"
            description="Save money by discovering equivalent generic medicines with the same active ingredients and verified efficacy."
            accent="#34d399"
          />
          <FeatureCard
            icon={<HistoryIcon size={26} color="#f472b6" />}
            title="Prescription History"
            description="Access your complete prescription and consultation history, with doctor-reviewed summaries and follow-up tracking."
            accent="#f472b6"
          />
          <FeatureCard
            icon={<Heart size={26} color="#fb923c" />}
            title="Dosage Reminders"
            description="Get timely reminders for your medicine schedules. Never miss a dose with our smart notification system."
            accent="#fb923c"
          />
          <FeatureCard
            icon={<ShieldCheck size={26} color="#facc15" />}
            title="HIPAA Compliant"
            description="Your medical data is encrypted and stored securely. We follow industry-leading privacy and security standards."
            accent="#facc15"
          />
        </div>

        {/* ── How It Works ── */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 32,
            padding: "52px 40px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            marginBottom: 48,
          }}
        >
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: "1.8rem",
              color: "var(--color-brand-primary)",
              margin: "0 0 10px 0",
              textAlign: "center",
            }}
          >
            How It Works
          </h2>
          <p
            style={{
              color: "#64748b",
              textAlign: "center",
              fontSize: "0.95rem",
              margin: "0 0 44px 0",
              fontWeight: 500,
            }}
          >
            Get started in just 3 easy steps
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 24,
            }}
          >
            {[
              {
                step: "01",
                title: "Create an Account",
                desc: "Sign up as a patient or doctor in under a minute.",
              },
              {
                step: "02",
                title: "Describe Symptoms",
                desc: "Enter symptoms naturally or upload your prescription image.",
              },
              {
                step: "03",
                title: "Get AI Insights",
                desc: "Receive medicine recommendations, generics & diet advice instantly.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
              >
                <div
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 800,
                    fontSize: "2.4rem",
                    background: "linear-gradient(135deg,#10b981,#059669)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                    marginBottom: 12,
                  }}
                >
                  {step}
                </div>
                <div
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#0f172a",
                    marginBottom: 6,
                  }}
                >
                  {title}
                </div>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.95rem",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <div
          style={{
            textAlign: "center",
            padding: "52px 40px",
            borderRadius: 24,
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
            border: "1px solid #dcfce7",
            boxShadow: "0 10px 30px rgba(16,185,129,0.05)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 16,
              color: "#10b981",
              fontSize: "0.85rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            <Star size={14} fill="#10b981" /> Free to Start
          </div>
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: "2.2rem",
              color: "#0f172a",
              margin: "0 0 12px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to take control of your health?
          </h2>
          <p
            style={{
              color: "#475569",
              fontSize: "1.1rem",
              marginBottom: 32,
              maxWidth: 480,
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            Join thousands of users already benefiting from AI-powered health management.
          </p>
          <button
            onClick={() => navigate("/signup")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 36px",
              borderRadius: 13,
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 25px rgba(16,185,129,0.25)",
              fontFamily: "Outfit, sans-serif",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(6,182,212,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(6,182,212,0.45)";
            }}
          >
            Create Free Account <ChevronRight size={18} />
          </button>
        </div>

        {/* ── Footer Disclaimer ── */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "#94a3b8",
              fontSize: "0.85rem",
              marginBottom: 10,
            }}
          >
            <ShieldCheck size={14} />
            Secure &amp; Confidential Data Handling • HIPAA Compliant
          </div>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.8rem",
              maxWidth: 620,
              margin: "0 auto",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            Disclaimer: This is an AI-assisted tool meant for informational purposes only. It is not a
            substitute for professional medical advice, diagnosis, or treatment. Always consult a
            certified healthcare provider.
          </p>
        </div>
      </main>
    </div>
  );
}
