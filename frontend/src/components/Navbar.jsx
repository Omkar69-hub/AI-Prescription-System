import { useNavigate } from "react-router-dom";
import { logoutUser, getRole } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold text-blue-700">
        AI Prescription
      </h1>

      <div className="flex gap-4 items-center">
        {role === "admin" && (
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Dashboard
          </button>
        )}

        {role === "patient" && (
          <>
            <button
              onClick={() => navigate("/user/symptom-search")}
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Symptoms
            </button>

            <button
              onClick={() => navigate("/user/history")}
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              History
            </button>
          </>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
