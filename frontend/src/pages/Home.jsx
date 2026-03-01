import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  UploadCloud, 
  History as HistoryIcon, 
  ShieldCheck, 
  ArrowRight,
  Pill,
  Activity
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Navigation Header */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit">AI Prescription</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/login")} className="text-slate-600 font-medium hover:text-emerald-600 transition-colors">Login</button>
          <button onClick={() => navigate("/signup")} className="btn-primary flex items-center gap-2 px-5 py-2.5">
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-100">
            <ShieldCheck size={16} /> Advanced AI Medical Assistant
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight font-outfit">
            Revolutionize Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600">Health Management</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-inter">
            Analyze symptoms, upload prescriptions, and discover more affordable generic medicine alternatives with our cutting-edge AI technology.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/signup")} className="btn-primary px-8 py-4 text-lg">
              Start Diagnosis Now
            </button>
            <button className="btn-secondary px-8 py-4 text-lg flex items-center gap-2 text-slate-700">
              Learn How It Works
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Activity className="text-emerald-500" size={32} />}
            title="Symptom Search"
            description="Enter your symptoms and receive AI-powered insights and care recommendations instantly."
            bgColor="bg-emerald-50"
          />
          <FeatureCard 
            icon={<UploadCloud className="text-indigo-500" size={32} />}
            title="Smart OCR Analysis"
            description="Upload images of your prescriptions. Our AI extracts medicine names and identifies key details."
            bgColor="bg-indigo-50"
          />
          <FeatureCard 
            icon={<Pill className="text-purple-500" size={32} />}
            title="Generic Alternatives"
            description="Save money by finding equivalent generic medicines with the same active ingredients."
            bgColor="bg-purple-50"
          />
        </div>

        {/* Footer / Medical Disclaimer */}
        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-4">
            <ShieldCheck size={16} />
            Secure & Confidential Data Handling
          </div>
          <p className="text-xs text-slate-400 max-w-xl mx-auto italic">
            Disclaimer: This is an AI-assisted tool meant for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a certified healthcare provider.
          </p>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, bgColor }) {
  return (
    <div className="glass-card p-8 rounded-3xl group hover:border-emerald-200 transition-all duration-300">
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3 font-outfit">{title}</h3>
      <p className="text-slate-600 leading-relaxed font-inter">
        {description}
      </p>
    </div>
  );
}
