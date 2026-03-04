import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getToken, getRole } from "./utils/auth";

// Pages
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";

// Components
import Login from "./components/Login";
import Signup from "./components/Signup";
import SymptomSearch from "./components/SymptomSearch";
import UploadPrescription from "./components/UploadPrescription";
import Recommendation from "./components/Recommendation";
import History from "./components/History";
import DoctorPatientHistory from "./components/DoctorPatientHistory";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

/* ===========================
   AUTH PROTECTION
=========================== */
const RequireAuth = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
};

const RequireRole = ({ children, allowedRoles }) => {
  const role = getRole();
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return allowed.includes(role) ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Patient Routes ── */}
        <Route
          path="/user/symptom-search"
          element={<RequireAuth><SymptomSearch /></RequireAuth>}
        />
        <Route
          path="/user/upload-prescription"
          element={<RequireAuth><UploadPrescription /></RequireAuth>}
        />
        <Route
          path="/user/recommendation"
          element={<RequireAuth><Recommendation /></RequireAuth>}
        />
        <Route
          path="/user/history"
          element={<RequireAuth><History /></RequireAuth>}
        />
        <Route
          path="/profile"
          element={<RequireAuth><Profile /></RequireAuth>}
        />
        <Route
          path="/settings"
          element={<RequireAuth><Settings /></RequireAuth>}
        />

        {/* ── Doctor Route ── */}
        <Route
          path="/doctor/history"
          element={
            <RequireAuth>
              <RequireRole allowedRoles={["doctor", "admin"]}>
                <DoctorPatientHistory />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* ── Admin Route ── */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <RequireRole allowedRoles={["admin"]}>
                <AdminDashboard />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Catch-all redirects */}
        <Route path="/user-dashboard" element={<Navigate to="/user/symptom-search" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
