import apiClient from "./client";

export const bookingsApi = {
  create: (data) => apiClient.post("/bookings", data),
  getMy: () => apiClient.get("/bookings/my"),
  getAll: (params) => apiClient.get("/bookings", { params }),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  updateStatus: (id, status) => apiClient.put(`/bookings/${id}/status`, { status }),
  cancel: (id, reason) => apiClient.put(`/bookings/${id}/cancel`, { reason }),
  assign: (id, providerId, reason) => apiClient.put(`/bookings/${id}/assign`, { providerId, reason }),
  submitReview: (data) => apiClient.post("/reviews", data),
  createDispute: (data) => apiClient.post("/disputes", data),
};
