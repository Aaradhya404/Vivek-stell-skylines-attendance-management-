import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import EmployeesPage from './pages/EmployeesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Layout wrapper for all authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
        <TopBar />
        <main className="pt-20 px-8 pb-8 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/mark"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MarkAttendancePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AttendanceHistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EmployeesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
