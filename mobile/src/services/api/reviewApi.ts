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

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    fullName: string;
  };
}

const reviewApi = {
  createReview: async (token: string, data: { menuItemId: number; rating: number; comment?: string }): Promise<Review> => {
    const response = await axios.post(`${API_BASE_URL}/api/menu/reviews`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  getReviewsByMenuItem: async (menuItemId: number, page = 1, limit = 10): Promise<{ reviews: Review[], pagination: any }> => {
    const response = await axios.get(`${API_BASE_URL}/api/menu/${menuItemId}/reviews?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  deleteReview: async (token: string, reviewId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/menu/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export { reviewApi };
