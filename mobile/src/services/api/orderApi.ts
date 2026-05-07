import apiClient from './apiClient';
import { ApiResponse, Order } from '../../types/api';

const orderApi = {
  createOrder: async (orderData: {
    items: { menuItemId: string; quantity: number }[];
    orderType: 'delivery' | 'pickup' | 'dine_in';
    paymentMethod: 'wallet' | 'razorpay';
    slotTime?: string;
  }): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post('/api/orders', orderData);
    return response.data;
  },

  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/api/orders/my-orders');
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get(`/api/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put(`/api/orders/${orderId}/cancel`);
    return response.data;
  },
};

export { orderApi };
