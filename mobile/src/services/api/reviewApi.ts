import apiClient from './apiClient';

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
  createReview: async (data: { menuItemId: number; rating: number; comment?: string }): Promise<Review> => {
    const response = await apiClient.post('/api/reviews', data);
    return response.data.data;
  },

  getReviewsByMenuItem: async (menuItemId: number, page = 1, limit = 10): Promise<{ reviews: Review[], pagination: any }> => {
    const response = await apiClient.get(`/api/reviews/menu-item/${menuItemId}?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  }
};

export { reviewApi };
