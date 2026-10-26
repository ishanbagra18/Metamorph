import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        <Loader2 size={24} className="animate-spin" style={{ animation: 'spinSlow 1s linear infinite' }} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
