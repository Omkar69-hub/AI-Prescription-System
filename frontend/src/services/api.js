// src/services/api.js

import axios from "axios";
import { getToken } from "../utils/auth";

// ----------------------------
// Axios instance with defaults
// ----------------------------
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // <-- your FastAPI base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------
// Request interceptor to add token
// ----------------------------
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // Use the helper function to get token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// Response interceptor for global error handling
// ----------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data.message || error.message);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ----------------------------
// API FUNCTIONS
// ----------------------------

// 1️⃣ User Authentication
export const signupUser = async (data) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// 2️⃣ Symptom Search & AI Recommendations
export const getSymptomRecommendation = async (symptoms) => {
  const response = await api.post("/symptoms/recommend", { symptoms });
  return response.data;
};

// 3️⃣ Prescription Upload (Note matching backend /ocr/upload)
export const uploadPrescription = async (formData) => {
  const response = await api.post("/ocr/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 4️⃣ Get Recommendations (based on uploaded prescription)
export const getRecommendationByPrescription = async (prescriptionId) => {
  const response = await api.get(`/medicine/recommend/${prescriptionId}`);
  return response.data;
};

// 5️⃣ User History
export const getUserHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};

// 6️⃣ Generic Medicines Suggestion
export const getGenericMedicine = async (brandName) => {
  const response = await api.get(`/medicine/generic/${brandName}`);
  return response.data;
};

// ----------------------------
// Export the Axios instance if needed
// ----------------------------
export default api;
