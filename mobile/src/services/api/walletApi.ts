import apiClient from './apiClient';
import { ApiResponse, Wallet, Transaction } from '../../types/api';

const walletApi = {
  getWallet: async (): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.get('/api/wallet');
    return response.data;
  },

  topUp: async (amount: number): Promise<ApiResponse<{ wallet: Wallet; transaction: Transaction }>> => {
    const response = await apiClient.post('/api/wallet/topup', { amount });
    return response.data;
  },

  getTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
    const response = await apiClient.get('/api/wallet/transactions');
    return response.data;
  },

  enableAutoReload: async (_threshold: number, _amount: number): Promise<ApiResponse<Wallet>> => {
    // Auto-reload feature not yet implemented on backend
    console.warn('⚠️ enableAutoReload: Backend endpoint not implemented yet');
    return { success: false, data: {} as Wallet, error: 'Feature not available yet' };
  },
};

export { walletApi };
