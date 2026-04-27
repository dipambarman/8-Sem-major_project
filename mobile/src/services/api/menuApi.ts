import apiClient from './apiClient';
import { ApiResponse, MenuItem } from '../../types/api';

const menuApi = {
  getMenu: async (vendorId?: string): Promise<ApiResponse<MenuItem[]>> => {
    const url = vendorId ? `/api/menu?vendorId=${vendorId}` : `/api/menu`;
    const response = await apiClient.get(url);
    return response.data;
  },

  searchMenu: async (query: string): Promise<ApiResponse<MenuItem[]>> => {
    const response = await apiClient.get(`/api/menu/search?q=${query}`);
    return response.data;
  },

  getFeaturedItems: async (): Promise<ApiResponse<MenuItem[]>> => {
    const response = await apiClient.get('/api/menu/featured');
    return response.data;
  },
};

export { menuApi };
