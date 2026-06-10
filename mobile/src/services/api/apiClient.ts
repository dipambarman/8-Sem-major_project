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
  timeout: 90000, // 90 second timeout — Render free-tier cold starts can take 30-60s + DB connection time
  headers: {
    'Content-Type': 'application/json',
  }
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // Base delay between retries (doubles each attempt)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
  if (config.data) {
    console.log('📤 Request Data:', JSON.stringify(config.data, null, 2));
  }
  
  return config;
});

// Enhanced response interceptor with retry logic for network errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`🟢 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const config = error.config;

    // Only retry on network errors or 5xx server errors (not on 4xx client errors)
    const isNetworkError = !error.response && error.message === 'Network Error';
    const isTimeoutError = error.code === 'ECONNABORTED';
    const isServerError = error.response && error.response.status >= 500;
    const isRetryable = isNetworkError || isTimeoutError || isServerError;

    if (isRetryable && config && (!config.__retryCount || config.__retryCount < MAX_RETRIES)) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const delay = RETRY_DELAY_MS * Math.pow(2, config.__retryCount - 1);
      console.warn(`⚠️ Request failed (attempt ${config.__retryCount}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
      console.warn(`   Reason: ${isNetworkError ? 'Network Error' : isTimeoutError ? 'Timeout' : `Server Error ${error.response?.status}`}`);
      await sleep(delay);
      return apiClient(config);
    }

    // Final failure — log details
    if (error.response) {
      console.warn(`🔴 API Error Response: ${error.response.status} ${error.config?.url}`);
      console.warn('📥 Error Data:', JSON.stringify(error.response.data, null, 2));

      // Handle token expiration automatically (but NOT on auth endpoints where 401 = wrong credentials)
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (error.response.status === 401 && !isAuthEndpoint) {
        console.warn('⚠️ Token expired or invalid. Forcing logout...');
        // Remove expired token from storage so it doesn't reload on next launch
        import('../../utils/storage').then(({ removeToken }) => {
          removeToken();
        });
        import('../../store/store').then(({ store }) => {
          import('../../store/slices/authSlice').then(({ forceLogout }) => {
            store.dispatch(forceLogout());
          });
        });
      }
    } else if (error.request) {
      console.error('🔴 No response received from server after all retries');
      const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      console.error('📤 Request made to:', fullUrl);
      console.error('❌ Network Error Details:', error.message);
      // Override error message with user-friendly text
      error.message = 'Server is starting up. Please wait a moment and try again.';
    } else {
      console.error('🔴 Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
