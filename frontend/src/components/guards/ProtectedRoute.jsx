import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        <div style={{ fontSize: '2.5rem' }}>🦋</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)' }}>
          <Loader2 size={20} className="animate-spin" style={{ animation: 'spinSlow 1s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading Metamorph Workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
