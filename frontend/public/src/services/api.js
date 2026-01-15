// frontend/src/api.js

import axios from "axios";

// ----------------------------
// Axios instance with defaults
// ----------------------------
const api = axios.create({
  baseURL: "https://your-backend-url.com/api", // <-- Replace with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------
// Request interceptor to add token
// ----------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // JWT stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// Response interceptor for global error handling (optional)
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
  try {
    const response = await api.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2️⃣ Symptom Search & AI Recommendations
export const getSymptomRecommendation = async (symptoms) => {
  try {
    const response = await api.post("/symptoms/recommend", { symptoms });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3️⃣ Prescription Upload
export const uploadPrescription = async (formData) => {
  try {
    const response = await api.post("/prescription/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 4️⃣ Get Recommendations (based on uploaded prescription or history)
export const getRecommendationByPrescription = async (prescriptionId) => {
  try {
    const response = await api.get(`/recommendation/${prescriptionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 5️⃣ History
export const getUserHistory = async () => {
  try {
    const response = await api.get("/history");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 6️⃣ Generic Medicines Suggestion
export const getGenericMedicine = async (brandName) => {
  try {
    const response = await api.get(`/medicine/generic/${brandName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ----------------------------
// Export the axios instance if needed
// ----------------------------
export default api;
