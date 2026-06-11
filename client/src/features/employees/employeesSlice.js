import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  employees: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const addEmployee = createAsyncThunk(
  'employees/addEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/employees', employeeData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const toggleEmployeeActive = createAsyncThunk(
  'employees/toggleEmployeeActive',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/employees/${id}/toggle-active`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle employee status');
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Add Employee
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
        state.employees.sort((a, b) => a.srNo - b.srNo); // Keep sorted by srNo
      })
      // Update Employee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      // Toggle Employee Status
      .addCase(toggleEmployeeActive.fulfilled, (state, action) => {
        const index = state.employees.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      });
  },
});

export default employeesSlice.reducer;
