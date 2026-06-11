import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  reports: [],
  totalDays: 0,
  status: 'idle',
  error: null,
};

export const fetchMonthlyReport = createAsyncThunk(
  'reports/fetchMonthlyReport',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/monthly?month=${month}&year=${year}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports = action.payload.reports;
        state.totalDays = action.payload.totalDays;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default reportsSlice.reducer;
