import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginResponse, RegisterResponse } from './authTypes';
import { loginApi, registerApi } from './authService';
import { getLocalUser, setLocalUser, removeLocalUser } from '../../services/tokenService';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';

const initialState: AuthState = {
  user: getLocalUser(),
  isLoading: false,
  error: null,
  successMessage: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      if (response.success && response.data) {
        setLocalUser(response.data.user);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await registerApi(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// The auth cookie is httpOnly, so the server has to clear it. Sign out locally even if that request fails.
export const logoutThunk = createAsyncThunk('auth/logoutRequest', async (_, { dispatch }) => {
  try {
    await api.post(API_ENDPOINTS.LOGOUT);
  } catch {
    // ignore, the cookie expires on its own
  }
  dispatch(logout());
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.successMessage = null;
      removeLocalUser();
    },
    // Refreshes the stored user (e.g. after an admin changes their role)
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      if (action.payload) setLocalUser(action.payload);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.successMessage = action.payload.message || 'Login successful!';
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<RegisterResponse>) => {
        state.isLoading = false;
        state.successMessage = action.payload.message || 'Registration successful!';
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, clearAuthError, clearAuthSuccess } = authSlice.actions;
export default authSlice.reducer;
