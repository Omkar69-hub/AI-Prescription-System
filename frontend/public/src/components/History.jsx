import { useEffect, useState } from "react";
import api from "../services/api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistory(response.data);
      } catch (err) {
        setError("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-blue-600">
        Loading history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">
        Medical History
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-600">
          No previous searches or prescriptions found.
        </p>
      ) : (
        <div className="space-y-6">

          {history.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow rounded p-6 border-l-4 border-indigo-600"
            >
              {/* Date */}
              <p className="text-sm text-gray-500 mb-2">
                {new Date(item.created_at).toLocaleString()}
              </p>

              {/* Type */}
              <p className="mb-2">
                <strong>Type:</strong>{" "}
                <span className="capitalize text-blue-600">
                  {item.type}
                </span>
              </p>

              {/* Symptoms or OCR */}
              {item.symptoms && (
                <p className="mb-2">
                  <strong>Symptoms:</strong> {item.symptoms}
                </p>
              )}

              {item.extracted_text && (
                <div className="mb-2">
                  <strong>Extracted Text:</strong>
                  <p className="bg-gray-100 p-2 rounded mt-1">
                    {item.extracted_text}
                  </p>
                </div>
              )}

              {/* Disease */}
              <p className="mb-2">
                <strong>Disease:</strong>{" "}
                <span className="text-green-700">
                  {item.disease}
                </span>
              </p>

              {/* Medicines */}
              <div className="mb-2">
                <strong>Medicines:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {item.medicines.map((med, i) => (
                    <li key={i}>
                      {med.brand} →{" "}
                      <span className="text-green-700">
                        {med.generic}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Duration */}
              {item.duration && (
                <p className="mb-1">
                  <strong>Duration:</strong> {item.duration}
                </p>
              )}

              {/* Exercise */}
              {item.exercise && (
                <p>
                  <strong>Advice:</strong> {item.exercise}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-6">
        ⚠️ Medical history shown for reference only.
      </p>
    </div>
  );
}
