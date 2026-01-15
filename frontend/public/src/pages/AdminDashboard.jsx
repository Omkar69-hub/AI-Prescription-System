import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [brand, setBrand] = useState("");
  const [generic, setGeneric] = useState("");
  const [disease, setDisease] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all medicines
  const fetchMedicines = async () => {
    try {
      const res = await api.get("/admin/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(res.data);
    } catch {
      alert("Failed to fetch medicines");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Add new medicine
  const handleAdd = async () => {
    if (!brand || !generic || !disease) return;

    setLoading(true);
    try {
      await api.post(
        "/admin/medicines",
        { brand, generic, disease },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBrand("");
      setGeneric("");
      setDisease("");
      fetchMedicines();
    } catch {
      alert("Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <h2 className="text-3xl font-bold text-red-700 mb-6">
        Admin Dashboard
      </h2>

      {/* Add Medicine */}
      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-indigo-700">
          Add Medicine Mapping
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Brand Name"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Generic Name"
            value={generic}
            onChange={(e) => setGeneric(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Disease"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Medicine"}
        </button>
      </div>

      {/* Medicine List */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-700">
          Existing Medicine Records
        </h3>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Generic</th>
              <th className="border p-2">Disease</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, index) => (
              <tr key={index}>
                <td className="border p-2">{med.brand}</td>
                <td className="border p-2 text-green-700">
                  {med.generic}
                </td>
                <td className="border p-2">{med.disease}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-6">
        ⚠️ Only authorized admins can modify medicine data.
      </p>
    </div>
  );
}
