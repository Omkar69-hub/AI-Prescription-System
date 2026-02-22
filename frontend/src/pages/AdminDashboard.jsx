import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

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
    <>
      {/* ✅ Navbar Added Here */}
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <h2 className="text-3xl font-bold text-red-700 mb-6">
          Admin Dashboard
        </h2>

        {/* Add Medicine */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700">
            Add Medicine Mapping
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Brand Name"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <input
              className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Generic Name"
              value={generic}
              onChange={(e) => setGeneric(e.target.value)}
            />
            <input
              className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Disease"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={loading}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Medicine"}
          </button>
        </div>

        {/* Medicine List */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-700">
            Existing Medicine Records
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left">Brand</th>
                  <th className="border p-3 text-left">Generic</th>
                  <th className="border p-3 text-left">Disease</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-3">{med.brand}</td>
                    <td className="border p-3 text-green-700 font-medium">
                      {med.generic}
                    </td>
                    <td className="border p-3">{med.disease}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 mt-6 text-center">
          ⚠️ Only authorized admins can modify medicine data.
        </p>
      </div>
    </>
  );
}
