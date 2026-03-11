import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, ApiResponse } from '../../types/api';
import { authApi } from '../../services/api/authApi';
import { storeToken, removeToken, getToken } from '../../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Initialize auth from stored token
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    console.log('🔵 initializeAuth thunk called');
    const token = await getToken();
    console.log('🔵 Token from storage:', token ? 'exists' : 'null');
    if (token) {
      return { token };
    }
    return null;
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🔵 loginUser thunk called');
      const response = await authApi.login(credentials);
      console.log('✅ Login API successful');
      return response;
    } catch (error: any) {
      console.error('❌ Login API failed:', error);
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

// Register user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; fullName: string; phone: string }, { rejectWithValue }) => {
    try {
      console.log('🔵 registerUser thunk called');
      const response = await authApi.register(userData);
      console.log('✅ Registration API successful');
      return response;
    } catch (error: any) {
      console.error('❌ Registration API failed:', error);
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

// Logout user (async)
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔴 logoutUser THUNK started');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const state = getState() as { auth: AuthState };
      const token = state.auth.token;

      // 1. Attempt API logout (if token exists)
      // We don't await this or we catch it so it doesn't block local logout
      if (token) {
        try {
          console.log('🔴 Calling API logout...');
          await authApi.logout(token);
          console.log('✅ API logout successful');
        } catch (apiError) {
          console.warn('⚠️ API logout failed (continuing with local logout):', apiError);
        }
      }

      // 2. Always remove local token
      await removeToken();

      console.log('✅ Token removed from storage');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    } catch (error: any) {
      console.error('❌ Error in logout thunk:', error);
      // Even if this fails, we want the reducer to clear the state
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // Emergency logout reducer (sync)
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.isAuthenticated = true;
          console.log('✅ Auth initialized - authenticated: true');
        } else {
          console.log('✅ Auth initialized - authenticated: false');
        }
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        storeToken(action.payload.token);
        console.log('✅ Login state updated - authenticated: true');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Login failed';
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        storeToken(action.payload.token);
        console.log('✅ Registration state updated - authenticated: true');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Registration failed';
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔴 Logout PENDING state');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Logout FULFILLED - Clearing state');
        console.log('   - Setting user: null');
        console.log('   - Setting token: null');
        console.log('   - Setting isAuthenticated: false');

        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;

        console.log('✅ State cleared successfully');
        console.log('   - isAuthenticated:', state.isAuthenticated);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Logout REJECTED - Forcing state clear anyway');
        console.error('   - Error:', action.error);

        // Force clear state even on error
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;

        console.error('✅ State forced cleared');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
  },
});

export const { clearError, setUser, forceLogout } = authSlice.actions;
export default authSlice.reducer;
