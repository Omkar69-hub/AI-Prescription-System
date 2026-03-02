// src/services/api.js

import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error code
      console.error("API Error:", error.response.status, error.response.data?.detail || error.message);
    } else if (error.request) {
      // Request made but no response — server likely down
      console.error("Network Error: No response from server. Is the backend running on port 8000?");
    } else {
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────
// Auth
// ─────────────────────────────
export const signupUser = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// ─────────────────────────────
// Symptom Recommendations (auto-saves history on backend)
// ─────────────────────────────
export const getSymptomRecommendation = async (symptoms) => {
  const res = await api.post("/symptoms/recommend", { symptoms });
  return res.data;
};

// ─────────────────────────────
// History
// ─────────────────────────────
export const getUserHistory = async () => {
  const res = await api.get("/history/");
  return res.data;
};

export const getAllPatientHistory = async () => {
  const res = await api.get("/history/all-patients");
  return res.data;
};

// ─────────────────────────────
// Prescription Upload (OCR)
// ─────────────────────────────
export const uploadPrescription = async (formData) => {
  const res = await api.post("/ocr/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─────────────────────────────
// Generic Medicines
// ─────────────────────────────
export const getGenericMedicine = async (brandName) => {
  const res = await api.get(`/medicine/generic/${brandName}`);
  return res.data;
};

// ─────────────────────────────
// Current user profile
// ─────────────────────────────
export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// ─────────────────────────────
// Notification log (admin use)
// ─────────────────────────────
export const getNotifications = async () => {
  const res = await api.get("/auth/notifications");
  return res.data;
};

export default api;
