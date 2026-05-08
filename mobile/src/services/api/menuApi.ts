import apiClient from './apiClient';
import { ApiResponse, MenuItem } from '../../types/api';

const menuApi = {
  getMenu: async (vendorId?: string): Promise<ApiResponse<MenuItem[]>> => {
    const url = vendorId ? `/api/menu?vendorId=${vendorId}` : `/api/menu`;
    const response = await apiClient.get(url);
    const result = response.data;
    if (result.data && result.data.items) {
      result.data = result.data.items;
    }
    return result;
  },

  searchMenu: async (query: string): Promise<ApiResponse<MenuItem[]>> => {
    const response = await apiClient.get(`/api/menu?search=${encodeURIComponent(query)}`);
    const result = response.data;
    if (result.data && result.data.items) {
      result.data = result.data.items;
    }
    return result;
  },

  getFeaturedItems: async (): Promise<ApiResponse<MenuItem[]>> => {
    const response = await apiClient.get('/api/menu/featured');
    return response.data;
  },
};

export { menuApi };
