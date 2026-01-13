// src/components/SymptomSearch.jsx
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SymptomSearch() {
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("token");

  const handleSearch = async () => {
    if (!symptoms.trim()) {
      setError("Please enter your symptoms");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post(
        "/symptoms/recommend", // <- Correct endpoint from api.js
        { symptoms },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      setResult(response.data); // Store API result
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to analyze symptoms"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* Header */}
      <h2 className="text-3xl font-bold text-blue-700 mb-4">
        Symptom-Based AI Recommendation
      </h2>

      <p className="text-gray-600 mb-6">
        Enter your symptoms in simple language.  
        Our AI will analyze and recommend medicines & generics.
      </p>

      {/* Input */}
      <textarea
        className="w-full h-28 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Example: fever, headache, body pain..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      {/* Button */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Symptoms"}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {/* AI Result */}
      {result && (
        <div className="mt-8 bg-white shadow rounded p-6">
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            AI Recommendation Result
          </h3>

          {/* Disease */}
          <div className="mb-3">
            <strong>Disease:</strong> {result.disease || "Not specified"}
          </div>

          {/* Medicines */}
          <div className="mb-3">
            <strong>Recommended Medicines:</strong>
            {result.medicines?.length > 0 ? (
              <ul className="list-disc ml-6">
                {result.medicines.map((med, index) => (
                  <li key={index}>
                    {med.brand} →{" "}
                    <span className="text-green-700">{med.generic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No medicines found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
