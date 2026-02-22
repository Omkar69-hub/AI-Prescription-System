import { useState } from "react";
import api from "../services/api";

export default function UploadPrescription() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("token");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a prescription image");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/ocr/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(response.data);

    } catch (err) {
      setError("Failed to process prescription. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <h2 className="text-3xl font-bold text-purple-700 mb-4">
        Upload Prescription
      </h2>

      <p className="text-gray-600 mb-6">
        Upload a handwritten or printed prescription.  
        Our AI will extract medicine names and suggest generic alternatives.
      </p>

      {/* File Input */}
      <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-purple-50">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <p className="text-sm text-gray-500">
          Supported formats: JPG, PNG
        </p>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Upload & Analyze"}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-100 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 bg-white shadow rounded p-6">

          <h3 className="text-xl font-semibold text-green-700 mb-4">
            OCR & AI Result
          </h3>

          {/* Extracted Text */}
          <div className="mb-4">
            <strong>Extracted Text:</strong>
            <p className="bg-gray-100 p-3 rounded mt-1 whitespace-pre-wrap">
              {result.extracted_text}
            </p>
          </div>

          {/* Medicines */}
          <div className="mb-4">
            <strong>Detected Medicines:</strong>
            <ul className="list-disc ml-6 mt-1">
              {result.medicines?.map((med, index) => (
                <li key={index}>
                  {med.brand} →{" "}
                  <span className="text-green-700">
                    {med.generic}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dosage */}
          {result.duration && (
            <div className="mb-2">
              <strong>Dosage Duration:</strong> {result.duration}
            </div>
          )}

          {/* Advice */}
          <div className="bg-yellow-100 text-yellow-700 p-3 rounded mt-4">
            💡 Generic medicines are cheaper and medically equivalent.
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-6">
        ⚠️ AI-based interpretation only. Always confirm with a doctor or pharmacist.
      </p>
    </div>
  );
}
