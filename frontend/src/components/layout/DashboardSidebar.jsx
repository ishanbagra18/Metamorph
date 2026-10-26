import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  User,
  Settings,
  ShieldAlert,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bot
} from 'lucide-react';

export function DashboardSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, onOpenNewRun }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemStyles = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    textDecoration: 'none',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
    boxShadow: isActive ? 'var(--shadow-glow-cyan)' : 'none',
    transition: 'all var(--transition-fast)'
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 4900
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: isCollapsed ? '72px' : '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          zIndex: 5000,
          flexShrink: 0
        }}
        className={`dashboard-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Top Header */}
        <div
          style={{
            height: '70px',
            padding: isCollapsed ? '0' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'inherit',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-cyan)',
                color: '#ffffff',
                fontSize: '1.25rem',
                flexShrink: 0
              }}
            >
              🦋
            </div>
            {!isCollapsed && (
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Metamorph
              </span>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                color: 'var(--text-muted)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center'
              }}
              className="desktop-toggle-btn"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Action Button: New Migration */}
        <div style={{ padding: isCollapsed ? '16px 8px' : '16px 14px' }}>
          <button
            onClick={onOpenNewRun}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: isCollapsed ? '10px' : '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-glow-cyan)',
              border: 'none',
              cursor: 'pointer'
            }}
            title="Start New Migration"
          >
            <PlusCircle size={18} />
            {!isCollapsed && <span>New Migration</span>}
          </button>
        </div>

        {/* Navigation Groups */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isCollapsed ? '8px' : '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {!isCollapsed && (
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 10px' }}>
              Workspace
            </div>
          )}

          <NavLink to="/dashboard" style={navItemStyles} title="Dashboard" end>
            <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Overview</span>}
          </NavLink>

          <NavLink to="/migrations" style={navItemStyles} title="Migrations">
            <Layers size={18} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Migrations</span>}
          </NavLink>

          {!isCollapsed && (
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 10px 6px' }}>
              Account & Settings
            </div>
          )}

          <NavLink to="/profile" style={navItemStyles} title="Profile">
            <User size={18} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Profile</span>}
          </NavLink>

          <NavLink to="/settings" style={navItemStyles} title="Settings">
            <Settings size={18} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          {/* Admin Section */}
          {isAdmin && (
            <>
              {!isCollapsed && (
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 10px 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={12} /> Admin Controls
                </div>
              )}

              <NavLink to="/admin/dashboard" style={navItemStyles} title="Admin Overview">
                <ShieldAlert size={18} style={{ flexShrink: 0, color: 'var(--accent-purple)' }} />
                {!isCollapsed && <span>Admin Metrics</span>}
              </NavLink>

              <NavLink to="/admin/users" style={navItemStyles} title="User Management">
                <Users size={18} style={{ flexShrink: 0, color: 'var(--accent-purple)' }} />
                {!isCollapsed && <span>User Directory</span>}
              </NavLink>
            </>
          )}
        </div>

        {/* Expand button if collapsed */}
        {isCollapsed && (
          <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setIsCollapsed(false)}
              style={{
                color: 'var(--text-muted)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* User Card & Logout */}
        <div
          style={{
            padding: isCollapsed ? '12px 8px' : '16px 14px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id || 'guest'}`}
                alt={user?.name || 'User avatar'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0
                }}
              />
              {!isCollapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user?.name || 'Developer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user?.role === 'admin' ? 'Administrator' : (user?.company || 'Developer')}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                style={{
                  color: 'var(--status-danger)',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent'
                }}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-sidebar {
            position: fixed !important;
            transform: translateX(-100%);
            width: 260px !important;
          }
          .dashboard-sidebar.mobile-open {
            transform: translateX(0);
          }
          .desktop-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
