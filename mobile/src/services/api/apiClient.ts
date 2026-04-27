import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getToken } from '../../utils/storage';

export const getApiBaseUrl = () => {
  // Use explicitly set environment variable if available
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // For Expo Go with tunnel mode, use the host machine's IP
  const manifestUrl = Constants.expoConfig?.hostUri;
  if (manifestUrl) {
    const host = manifestUrl.split(':')[0];
    return `http://${host}:3000`;
  }

  // Fallback to localhost for web/iOS emulator, or 10.0.2.2 for Android emulator
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach Bearer token if it exists
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
