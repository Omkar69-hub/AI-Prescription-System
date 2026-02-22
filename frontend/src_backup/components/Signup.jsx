import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/signup", {
        email,
        password,
        role,
      });

      alert("Signup successful! Please login.");
      navigate("/login");

    } catch (err) {
      setError("Signup failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8">

        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-green-700 mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          AI Prescription System
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-sm text-gray-600">Register As</label>
            <select
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Login
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          ⚠️ This platform provides AI-assisted medical recommendations.  
          Always consult a licensed doctor.
        </p>
      </div>
    </div>
  );
}
