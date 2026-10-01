import apiClient from "./client";

export const providersApi = {
  getAll: (params) => apiClient.get("/providers", { params }),
  getRecommended: (data) => apiClient.post("/providers/recommended", data),
  getById: (id) => apiClient.get(`/providers/${id}`),
  updateMyProfile: (data) => apiClient.put("/providers/me", data),
  getMyEarnings: () => apiClient.get("/providers/me/earnings"),
  getMyJobs: () => apiClient.get("/jobs/my"),
  updateJobStatus: (jobId, status, notes) => apiClient.put(`/jobs/${jobId}/status`, { status, notes }),
  uploadEvidence: (jobId, type, photoUrl) => apiClient.post(`/jobs/${jobId}/evidence`, { type, photoUrl }),
  onboard: (data) => apiClient.post("/providers/onboard", data),
  getReviews: (providerId) => apiClient.get(`/reviews/provider/${providerId}`),
};
