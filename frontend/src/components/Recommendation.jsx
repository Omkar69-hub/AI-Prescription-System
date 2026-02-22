import { useLocation, useNavigate } from "react-router-dom";

export default function Recommendation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data passed from SymptomSearch or UploadPrescription
  const data = location.state;

  if (!data) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600 mb-4">
          No recommendation data available.
        </p>
        <button
          onClick={() => navigate("/user/search")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <h2 className="text-3xl font-bold text-green-700 mb-4">
        AI Medical Recommendation
      </h2>

      <p className="text-gray-600 mb-6">
        Based on your symptoms or prescription, our AI suggests the following:
      </p>

      {/* Disease */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
        <strong>Disease Identified:</strong> {data.disease}
      </div>

      {/* Medicines */}
      <div className="bg-white shadow rounded p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2 text-purple-700">
          Medicine Recommendation
        </h3>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Branded</th>
              <th className="border p-2">Generic</th>
            </tr>
          </thead>
          <tbody>
            {data.medicines?.map((med, index) => (
              <tr key={index}>
                <td className="border p-2">{med.brand}</td>
                <td className="border p-2 text-green-700">
                  {med.generic}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Duration */}
      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded mb-4">
        <strong>Dosage Duration:</strong> {data.duration}
      </div>

      {/* Exercise */}
      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-4">
        <strong>Exercise / Care Advice:</strong> {data.exercise}
      </div>

      {/* Cost Saving Note */}
      <div className="bg-purple-100 text-purple-700 p-4 rounded mb-6">
        💡 Generic medicines provide the same effect at lower cost.
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/user/search")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Search
        </button>

        <button
          onClick={() => navigate("/user/history")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          View History
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-6">
        ⚠️ AI-based assistance only. Always consult a licensed doctor before medication.
      </p>
    </div>
  );
}
