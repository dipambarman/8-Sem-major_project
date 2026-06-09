import apiClient from './apiClient';
import { User } from '../../types/api';

/**
 * Wake up the server before making auth requests.
 * Render free tier sleeps after 15 min of inactivity; this ping wakes it up.
 */
const wakeUpServer = async (): Promise<void> => {
  try {
    console.log('🏓 Pinging server to wake it up...');
    await apiClient.get('/health', { timeout: 90000 }); // 90s for cold start
    console.log('✅ Server is awake');
  } catch (error: any) {
    // Even if health check fails, still try the actual request
    console.warn('⚠️ Server wake-up ping failed, proceeding anyway:', error.message);
  }
};

const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<{ user: User; token: string; wallet: any }> => {
    try {
      console.log('🔐 Attempting login with email:', credentials.email);
      // Wake up server first (handles Render free tier cold starts)
      await wakeUpServer();
      const response = await apiClient.post('/api/auth/login', credentials);
      console.log('✅ Login successful');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Login API error:', error.message);
      if (error.response?.data?.error) {
        console.error('📋 Server error message:', error.response.data.error);
        throw new Error(error.response.data.error);
      }
      if (!error.response) {
        throw new Error('Unable to reach server. It may be starting up — please wait a moment and try again.');
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
      // Wake up server first (handles Render free tier cold starts)
      await wakeUpServer();
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
      if (!error.response) {
        throw new Error('Unable to reach server. It may be starting up — please wait a moment and try again.');
      }
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<string> => {
    try {
      await wakeUpServer();
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response.data.message;
    } catch (error: any) {
      console.error('❌ Forgot password API error:', error.message);
      if (!error.response) {
        throw new Error('Unable to reach server. Please try again in a moment.');
      }
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

