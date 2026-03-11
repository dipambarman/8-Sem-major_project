import axios from 'axios';
import { ApiResponse, MenuItem } from '../../types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const menuApi = {
  getMenu: async (vendorId?: string): Promise<ApiResponse<MenuItem[]>> => {
    const url = vendorId 
      ? `${API_URL}/api/menu?vendorId=${vendorId}` 
      : `${API_URL}/api/menu`;
    const response = await axios.get(url);
    return response.data;
  },

  searchMenu: async (query: string): Promise<ApiResponse<MenuItem[]>> => {
    const response = await axios.get(`${API_URL}/api/menu/search?q=${query}`);
    return response.data;
  },

  getFeaturedItems: async (): Promise<ApiResponse<MenuItem[]>> => {
    const response = await axios.get(`${API_URL}/api/menu/featured`);
    return response.data;
  },
};

export { menuApi };
