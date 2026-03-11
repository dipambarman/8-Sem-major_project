import axios from 'axios';
import { ApiResponse, Order, MenuItem } from '../../types/api';
import { getToken } from '../../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const orderApi = {
  createOrder: async (orderData: {
    items: { menuItemId: string; quantity: number }[];
    orderType: 'delivery' | 'pickup' | 'dine_in';
    paymentMethod: 'wallet' | 'razorpay';
    slotTime?: string;
  }): Promise<ApiResponse<Order>> => {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/api/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/api/orders/${orderId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export { orderApi };
