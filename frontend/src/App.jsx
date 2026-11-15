import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PageLoader } from './components/common/PageLoader';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Route Guards
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleRoute } from './components/guards/RoleRoute';
import { PublicOnlyRoute } from './components/guards/PublicOnlyRoute';

// Lazy-loaded Public Pages for Optimized Code-Splitting and Minimal Initial Bundle
const LandingPage = lazy(() => import('./pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/public/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded Protected Pages
const DashboardPage = lazy(() => import('./pages/protected/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MigrationsListPage = lazy(() => import('./pages/protected/MigrationsListPage').then(m => ({ default: m.MigrationsListPage })));
const MigrationDetailPage = lazy(() => import('./pages/protected/MigrationDetailPage').then(m => ({ default: m.MigrationDetailPage })));
const ProfilePage = lazy(() => import('./pages/protected/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/protected/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminDashboardPage = lazy(() => import('./pages/protected/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/protected/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
