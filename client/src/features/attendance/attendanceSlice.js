import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  dailyAttendance: [],
  history: [],
  holidays: [],
  status: 'idle',
  historyStatus: 'idle',
  holidaysStatus: 'idle',
  error: null,
};

export const fetchDailyAttendance = createAsyncThunk(
  'attendance/fetchDailyAttendance',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attendance?date=${date}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchAttendanceByRange = createAsyncThunk(
  'attendance/fetchAttendanceByRange',
  async ({ start, end }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attendance/range?start=${start}&end=${end}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attendance range');
    }
  }
);

export const markAttendanceRecord = createAsyncThunk(
  'attendance/markAttendanceRecord',
  async (recordData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance', recordData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark attendance');
    }
  }
);

export const fetchHolidays = createAsyncThunk(
  'attendance/fetchHolidays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/holidays');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch holidays');
    }
  }
);

export const addHoliday = createAsyncThunk(
  'attendance/addHoliday',
  async (holidayData, { rejectWithValue }) => {
    try {
      const response = await api.post('/holidays', holidayData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add holiday');
    }
  }
);

export const removeHoliday = createAsyncThunk(
  'attendance/removeHoliday',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/holidays/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove holiday');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    updateLocalAttendanceRow: (state, action) => {
      const { employeeId, changes } = action.payload;
      const index = state.dailyAttendance.findIndex(r => r.employeeId === employeeId);
      if (index !== -1) {
        state.dailyAttendance[index] = {
          ...state.dailyAttendance[index],
          ...changes,
          isDirty: true // Mark as unsaved
        };
      }
    },
    resetDailyStatus: (state) => {
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Daily Attendance
      .addCase(fetchDailyAttendance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDailyAttendance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dailyAttendance = action.payload.map(row => ({ ...row, isDirty: false }));
      })
      .addCase(fetchDailyAttendance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch History Range
      .addCase(fetchAttendanceByRange.pending, (state) => {
        state.historyStatus = 'loading';
      })
      .addCase(fetchAttendanceByRange.fulfilled, (state, action) => {
        state.historyStatus = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchAttendanceByRange.rejected, (state, action) => {
        state.historyStatus = 'failed';
      })
      // Mark Attendance (single or bulk)
      .addCase(markAttendanceRecord.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markAttendanceRecord.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Reload daily attendance or update inline
      })
      .addCase(markAttendanceRecord.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Holidays
      .addCase(fetchHolidays.pending, (state) => {
        state.holidaysStatus = 'loading';
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.holidaysStatus = 'succeeded';
        state.holidays = action.payload;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.holidaysStatus = 'failed';
      })
      // Add Holiday
      .addCase(addHoliday.fulfilled, (state, action) => {
        state.holidays.push(action.payload);
        state.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
      })
      // Remove Holiday
      .addCase(removeHoliday.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter(h => h.id !== action.payload);
      });
  },
});

export const { updateLocalAttendanceRow, resetDailyStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;
