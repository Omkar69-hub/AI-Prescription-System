import History from "../components/History";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">

      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-lg max-w-3xl w-full p-8 text-center">
        {/* Logo / Header */}
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
          AI Prescription System
        </h1>
        <p className="text-gray-600 mb-6">
          Analyze your symptoms, upload prescriptions, and get AI-based medicine recommendations.  
          Save money with generic alternatives.
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-blue-50 p-4 rounded shadow">
            <h3 className="font-semibold text-blue-700 mb-1">Symptom Search</h3>
            <p className="text-gray-600 text-sm">
              Enter your symptoms and let AI recommend medicines & care.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded shadow">
            <h3 className="font-semibold text-purple-700 mb-1">Upload Prescription</h3>
            <p className="text-gray-600 text-sm">
              Upload prescription images. AI extracts medicine names and suggests generics.
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded shadow">
            <h3 className="font-semibold text-yellow-700 mb-1">History Tracking</h3>
            <p className="text-gray-600 text-sm">
              Keep track of your past searches and prescription uploads securely.
            </p>
          </div>
        </div>

        {/* Footer / Disclaimer */}
        <p className="text-xs text-gray-400 mt-6">
          ⚠️ AI-based medical assistant. Always consult a certified doctor before taking medicines.
        </p>
      </div>
    </div>
  );
}
