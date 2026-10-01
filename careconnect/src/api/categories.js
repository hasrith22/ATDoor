import apiClient from "./client";

export const categoriesApi = {
  getAll: (all = false) => apiClient.get(`/categories?all=${all}`),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post("/categories", data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};
