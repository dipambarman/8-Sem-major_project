import axios from 'axios';
import { ApiResponse, Wallet, Transaction } from '../../types/api';
import { getToken } from '../../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const walletApi = {
  getWallet: async (): Promise<ApiResponse<Wallet>> => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/api/wallet`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  topUp: async (amount: number): Promise<ApiResponse<{ wallet: Wallet; transaction: Transaction }>> => {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/api/wallet/topup`, 
      { amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/api/wallet/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  enableAutoReload: async (threshold: number, amount: number): Promise<ApiResponse<Wallet>> => {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/api/wallet/auto-reload`, 
      { threshold, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export { walletApi };
