import apiClient from './apiClient';

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const notificationApi = {
  getNotifications: async (page = 1, limit = 20): Promise<{ notifications: Notification[], pagination: any }> => {
    const response = await apiClient.get(`/api/notifications?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/api/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.put(`/api/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/api/notifications/read-all');
  }
};

export { notificationApi };
