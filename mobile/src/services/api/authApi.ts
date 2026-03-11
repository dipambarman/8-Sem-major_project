import axios from 'axios';
import { User } from '../../types/api';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ✅ Get API URL from environment with intelligent fallback
const getApiBaseUrl = () => {
  // For Expo Go with tunnel mode, use the tunnel URL
  const manifestUrl = Constants.expoConfig?.hostUri;

  if (manifestUrl) {
    // Extract the host from Expo's manifest URL
    const host = manifestUrl.split(':')[0];
    return `http://${host}:3000`;
  }

  // Fallback to localhost for web
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📡 API CONFIGURATION');
console.log('   - Mode:', Platform.OS);
console.log('   - Host URI:', Constants.expoConfig?.hostUri || 'N/A');
console.log('   - Base URL:', API_BASE_URL);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<{ user: User; token: string; wallet: any }> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    return response.data.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string
  }): Promise<{ user: User; token: string; wallet: any }> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
    return response.data.message;
  },

  getProfile: async (token: string): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  refreshToken: async (token: string): Promise<{ token: string }> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { token });
    return response.data.data;
  },

  logout: async (token: string): Promise<string> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.message;
  },
};

export { authApi };
