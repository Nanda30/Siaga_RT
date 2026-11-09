import { apiClient } from './client';

export const authApi = {
  login: (name, phone) => apiClient('/auth/login', { method: 'POST', body: { name, phone } }),
  getMe: () => apiClient('/auth/me'),
  updateFcmToken: (fcmToken) => apiClient('/auth/fcm-token', { method: 'POST', body: { fcmToken } }),
};

export const alertsApi = {
  create: (data) => apiClient('/alerts', { method: 'POST', body: data }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/alerts${query ? `?${query}` : ''}`);
  },
  getDetail: (id) => apiClient(`/alerts/${id}`),
  updateStatus: (id, status) =>
    apiClient(`/alerts/${id}/status`, { method: 'PUT', body: { status } }),
};

export const dashboardApi = {
  getSummary: () => apiClient('/dashboard'),
};

export const notificationsApi = {
  getAll: () => apiClient('/notifications'),
  markAsRead: (id) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
};
