import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getToken, getRole } from "./utils/auth";

// Pages  
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

// Components
import Login from "./components/Login";
import Signup from "./components/Signup";
import SymptomSearch from "./components/SymptomSearch";
import UploadPrescription from "./components/UploadPrescription";
import Recommendation from "./components/Recommendation";
import History from "./components/History";

/* ===========================
   AUTH PROTECTION COMPONENTS
=========================== */

// 🔐 Check if user is logged in
const RequireAuth = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
};

// 🛡 Check if user has required role
const RequireRole = ({ children, allowedRole }) => {
  const role = getRole();
  return role === allowedRole ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= USER ROUTES ================= */}
        <Route
          path="/user/dashboard"
          element={
            <RequireAuth>
              <UserDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/user/symptom-search"
          element={
            <RequireAuth>
              <SymptomSearch />
            </RequireAuth>
          }
        />
        <Route
          path="/user/upload-prescription"
          element={
            <RequireAuth>
              <UploadPrescription />
            </RequireAuth>
          }
        />
        <Route
          path="/user/recommendation"
          element={
            <RequireAuth>
              <Recommendation />
            </RequireAuth>
          }
        />
        <Route
          path="/user/history"
          element={
            <RequireAuth>
              <History />
            </RequireAuth>
          }
        />

        {/* ================= ADMIN ROUTE ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <RequireRole allowedRole="admin">
                <AdminDashboard />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
