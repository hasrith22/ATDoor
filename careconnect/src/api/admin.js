import apiClient from "./client";

export const adminApi = {
  getAnalytics: () => apiClient.get("/analytics/admin"),
  getOperationsAnalytics: () => apiClient.get("/analytics/operations"),
  getUsers: (params) => apiClient.get("/users", { params }),
  verifyProvider: (id, status, reason) => apiClient.put(`/users/provider/${id}/verify`, { status, reason }),
  updateUserStatus: (id, isActive) => apiClient.put(`/users/${id}/status`, { isActive }),
  getAuditLogs: (params) => apiClient.get("/audit-logs", { params }),
  getPricingRules: () => apiClient.get("/pricing"),
  createPricingRule: (data) => apiClient.post("/pricing", data),
  updatePricingRule: (id, data) => apiClient.put(`/pricing/${id}`, data),
  getDisputes: () => apiClient.get("/disputes"),
  resolveDispute: (id, status, resolution) => apiClient.put(`/disputes/${id}/resolve`, { status, resolution }),
  getSkills: () => apiClient.get("/skills"),
  createSkill: (data) => apiClient.post("/skills", data),
  deleteSkill: (id) => apiClient.delete(`/skills/${id}`),
};
