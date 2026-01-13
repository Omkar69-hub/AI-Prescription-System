import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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

// Optional: PrivateRoute to protect routes for authenticated users
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // JWT stored in localStorage
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/user/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/symptom-search"
          element={
            <PrivateRoute>
              <SymptomSearch />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/upload-prescription"
          element={
            <PrivateRoute>
              <UploadPrescription />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/recommendation"
          element={
            <PrivateRoute>
              <Recommendation />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
