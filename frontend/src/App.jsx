import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Route Guards
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleRoute } from './components/guards/RoleRoute';
import { PublicOnlyRoute } from './components/guards/PublicOnlyRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { VerifyEmailPage } from './pages/public/VerifyEmailPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Protected Pages
import { DashboardPage } from './pages/protected/DashboardPage';
import { MigrationsListPage } from './pages/protected/MigrationsListPage';
import { MigrationDetailPage } from './pages/protected/MigrationDetailPage';
import { ProfilePage } from './pages/protected/ProfilePage';
import { SettingsPage } from './pages/protected/SettingsPage';
import { AdminDashboardPage } from './pages/protected/AdminDashboardPage';
import { AdminUsersPage } from './pages/protected/AdminUsersPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes with Public Layout */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Restricted to unauthenticated guests */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                <Route path="/404" element={<NotFoundPage />} />
              </Route>

              {/* Protected Routes with Dashboard Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/migrations" element={<MigrationsListPage />} />
                  <Route path="/migrations/:id" element={<MigrationDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Admin Only Routes */}
                  <Route element={<RoleRoute requiredRole="admin" />}>
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all Not Found */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
