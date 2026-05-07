import apiClient from './apiClient';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const notificationApi = {
  getNotifications: async (): Promise<{ notifications: Notification[], unreadCount: number }> => {
    const response = await apiClient.get('/api/notifications');
    // Backend returns { success, data: [...notifications], unreadCount }
    return {
      notifications: response.data.data,
      unreadCount: response.data.unreadCount || 0,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    // No dedicated endpoint — piggyback off getNotifications
    const response = await apiClient.get('/api/notifications');
    return response.data.unreadCount || 0;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.put(`/api/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/api/notifications/read-all');
  }
};

export { notificationApi };

