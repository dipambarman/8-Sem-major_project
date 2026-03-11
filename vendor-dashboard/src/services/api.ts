import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vendorToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const vendorApi = {
  // Auth
  login: (credentials) => apiClient.post('/vendor/auth/login', credentials),
  logout: () => apiClient.post('/vendor/auth/logout'),

  // Dashboard
  getDashboardStats: () => apiClient.get('/vendor/dashboard'),
  getSalesData: (period = '7d') => apiClient.get(`/vendor/sales?period=${period}`),

  // Orders
  getOrders: (filters = {}) => apiClient.get('/vendor/orders', { params: filters }),
  updateOrderStatus: (orderId, status, estimatedTime) =>
    apiClient.put(`/vendor/orders/${orderId}`, { status, estimatedTime }),
  getOrderDetails: (orderId) => apiClient.get(`/vendor/orders/${orderId}`),

  // Menu
  getMenuItems: () => apiClient.get('/vendor/menu'),
  createMenuItem: (itemData) => apiClient.post('/vendor/menu', itemData),
  updateMenuItem: (itemId, itemData) => apiClient.put(`/vendor/menu/${itemId}`, itemData),
  deleteMenuItem: (itemId) => apiClient.delete(`/vendor/menu/${itemId}`),

  // Reservations
  getReservations: (date) => apiClient.get(`/vendor/reservations?date=${date}`),
  updateReservation: (reservationId, status) =>
    apiClient.put(`/vendor/reservations/${reservationId}`, { status }),

  // Analytics
  getAnalytics: (period = '30d') => apiClient.get(`/vendor/analytics?period=${period}`),
};

export default apiClient;
