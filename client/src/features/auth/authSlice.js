import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const token = localStorage.getItem('token');
const admin = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : null;

const initialState = {
  token: token || null,
  admin: admin || null,
  isAuthenticated: !!token,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const loginAdmin = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { data } = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/password', passwords);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.admin = action.payload.admin;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logoutAdmin, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
