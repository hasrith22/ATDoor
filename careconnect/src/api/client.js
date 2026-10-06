import axios from "axios";

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== "undefined";
  const isPublicDomain =
    isBrowser &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  // When deployed on Vercel / production, route to live Render backend
  if (isPublicDomain || import.meta.env.PROD) {
    if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
      return "https://atdoor.onrender.com/api";
    }
  }

  const raw = (envUrl || "http://localhost:5000/api").trim().replace(/\/+$/, "");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token & auto-redirect localhost calls to production backend when hosted on Vercel
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isPublicDomain =
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1";

    if (
      isPublicDomain &&
      (!config.baseURL || config.baseURL.includes("localhost") || config.baseURL.includes("127.0.0.1"))
    ) {
      config.baseURL = "https://atdoor.onrender.com/api";
    }

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
