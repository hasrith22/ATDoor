import apiClient from "./client";

export const authApi = {
  login: (email, password) => apiClient.post("/auth/login", { email, password }),
  register: (userData) => apiClient.post("/auth/register", userData),
  getMe: () => apiClient.get("/auth/me"),
  updateDetails: (data) => apiClient.put("/auth/updatedetails", data),
  updatePassword: (data) => apiClient.put("/auth/updatepassword", data),
};
