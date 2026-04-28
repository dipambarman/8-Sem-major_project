import apiClient from './apiClient';
import { User } from '../../types/api';

const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<{ user: User; token: string; wallet: any }> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string
  }): Promise<{ user: User; token: string; wallet: any }> => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data.message;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data.data;
  },

  refreshToken: async (token: string): Promise<{ token: string }> => {
    const response = await apiClient.post('/api/auth/refresh', { token });
    return response.data.data;
  },

  updateProfile: async (profileData: { fullName?: string; email?: string; phone?: string }): Promise<User> => {
    const response = await apiClient.put('/api/auth/profile', profileData);
    return response.data.data;
  },

  savePushToken: async (pushToken: string): Promise<void> => {
    await apiClient.post('/api/auth/push-token', { pushToken });
  },

  logout: async (): Promise<string> => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data.message;
  },
};

export { authApi };
