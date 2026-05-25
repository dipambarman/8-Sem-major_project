import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getToken } from '../../utils/storage';

export const getApiBaseUrl = () => {
  // Use explicitly set environment variable if available
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('📡 Using configured API URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // FORCE localhost for browser to avoid network routing issues
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (isBrowser || Platform.OS === 'web') {
    console.log('🌐 Browser/Web platform detected, using localhost');
    return 'http://localhost:3000';
  }

  // For Expo Go with tunnel mode, use the host machine's IP
  // Try debuggerHost (packager) and expoConfig hostUri for local dev
  const debuggerHost = (Constants.manifest && (Constants.manifest as any).debuggerHost) || (Constants.expoConfig && (Constants.expoConfig as any).hostUri);
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    const url = `http://${host}:3000`;
    console.log('🔗 Detected dev host from Expo/packager:', url);
    return url;
  }

  // Fallback to localhost for web/iOS emulator, or 10.0.2.2 for Android emulator
  const fallbackUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  console.log('📱 Platform:', Platform.OS, '| Fallback URL:', fallbackUrl);
  return fallbackUrl;
};

export const API_BASE_URL = getApiBaseUrl();
console.log('✅ API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Automatically attach Bearer token and bypass localtunnel warnings
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (config.headers) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Bypass localtunnel warning screen
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
  }
  
  console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  if (config.data) {
    console.log('📤 Request Data:', JSON.stringify(config.data, null, 2));
  }
  
  return config;
});

// Enhanced response interceptor with better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`🟢 API Response: ${response.status} ${response.config.url}`);
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`🔴 API Error Response: ${error.response.status} ${error.config.url}`);
      console.error('📥 Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Request made but no response
      console.error('🔴 No response received from server');
      console.error('📤 Request made to:', error.config.url);
      console.error('❌ Network Error Details:', error.message);
    } else {
      // Error in request setup
      console.error('🔴 Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
