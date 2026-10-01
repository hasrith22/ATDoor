import apiClient from "./client";

export const requestsApi = {
  classifyText: (payload) => {
    const data = typeof payload === "string" ? { text: payload } : payload;
    return apiClient.post("/requests/ai-classify", data);
  },
  create: (data) => apiClient.post("/requests", data),
  getMy: () => apiClient.get("/requests/my"),
  getOpen: () => apiClient.get("/requests/open"),
  getById: (id) => apiClient.get(`/requests/${id}`),
  getQuotes: (requestId) => apiClient.get(`/quotes/request/${requestId}`),
  submitQuote: (data) => apiClient.post("/quotes", data),
  acceptQuote: (quoteId) => apiClient.put(`/quotes/${quoteId}/accept`),
};
