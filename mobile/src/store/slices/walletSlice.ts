import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Wallet, Transaction } from '../../types/api';
import { walletApi } from '../../services/api/walletApi';

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk('wallet/fetchWallet', async () => {
  const response = await walletApi.getWallet();
  return response.data;
});

export const topUpWallet = createAsyncThunk(
  'wallet/topUp',
  async (amount: number) => {
    const response = await walletApi.topUp(amount);
    return response.data;
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async () => {
    const response = await walletApi.getTransactions();
    return response.data;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    updateBalance: (state, action: PayloadAction<number>) => {
      if (state.wallet) {
        state.wallet.balance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
        state.isLoading = false;
      })
      .addCase(topUpWallet.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet;
        state.transactions.unshift(action.payload.transaction);
        state.isLoading = false;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.isLoading = false;
      });
  },
});

export const { updateBalance } = walletSlice.actions;
export default walletSlice.reducer;
