import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests if present in localStorage (client-side only)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("atdoor_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignored in non-browser or sandbox environments
    }
  }
  return config;
});

// Handle global responses & unauthorized redirection
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("atdoor_token");
      } catch (e) {
        // Ignored
      }
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export default apiClient;
