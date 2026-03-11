import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  const manifestUrl = Constants.expoConfig?.hostUri;
  if (manifestUrl) {
    const host = manifestUrl.split(':')[0];
    return `http://${host}:3000`;
  }
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const notificationApi = {
  getNotifications: async (token: string, page = 1, limit = 20): Promise<{ notifications: Notification[], pagination: any }> => {
    const response = await axios.get(`${API_BASE_URL}/api/notifications?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  getUnreadCount: async (token: string): Promise<number> => {
    const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.unreadCount;
  },

  markAsRead: async (token: string, notificationId: number): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  markAllAsRead: async (token: string): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export { notificationApi };
