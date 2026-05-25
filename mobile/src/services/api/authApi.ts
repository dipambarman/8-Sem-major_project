import apiClient from './apiClient';
import { User } from '../../types/api';

const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<{ user: User; token: string; wallet: any }> => {
    try {
      console.log('🔐 Attempting login with email:', credentials.email);
      const response = await apiClient.post('/api/auth/login', credentials);
      console.log('✅ Login successful');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Login API error:', error.message);
      if (error.response?.data?.error) {
        console.error('📋 Server error message:', error.response.data.error);
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string
  }): Promise<{ user: User; token: string; wallet: any }> => {
    try {
      console.log('📝 Attempting registration with email:', userData.email);
      const response = await apiClient.post('/api/auth/register', userData);
      console.log('✅ Registration successful');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Registration API error:', error.message);
      if (error.response?.data?.error) {
        console.error('📋 Server error message:', error.response.data.error);
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.details) {
        console.error('📋 Validation errors:', error.response.data.details);
        throw new Error(error.response.data.details[0]?.msg || 'Validation failed');
      }
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<string> => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response.data.message;
    } catch (error: any) {
      console.error('❌ Forgot password API error:', error.message);
      throw error;
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/api/auth/profile');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Get profile API error:', error.message);
      throw error;
    }
  },

  updateProfile: async (profileData: { fullName?: string; email?: string; phone?: string }): Promise<User> => {
    try {
      const response = await apiClient.put('/api/users/profile', profileData);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Update profile API error:', error.message);
      throw error;
    }
  },

  savePushToken: async (_pushToken: string): Promise<void> => {
    // Push token storage not yet implemented on backend — noop for now
    console.warn('⚠️ savePushToken: Backend endpoint not implemented yet');
  },

  logout: async (): Promise<string> => {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response.data.message;
    } catch (error: any) {
      console.error('❌ Logout API error:', error.message);
      throw error;
    }
  },
};

export { authApi };

