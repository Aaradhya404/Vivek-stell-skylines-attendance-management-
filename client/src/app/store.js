import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import employeesReducer from '../features/employees/employeesSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import reportsReducer from '../features/reports/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesReducer,
    attendance: attendanceReducer,
    reports: reportsReducer,
  },
});
