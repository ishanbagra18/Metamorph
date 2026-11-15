import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import {
  Menu,
  Sun,
  Moon,
  PlusCircle,
  Cpu
} from 'lucide-react';

export function DashboardTopbar({ onOpenMobileSidebar, onOpenNewRun }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/migrations/new')) return 'New Migration Job';
    if (path.startsWith('/migrations/')) return 'Migration Workspace';
    if (path === '/migrations') return 'Migration History';
    if (path === '/profile') return 'Developer Profile';
    if (path === '/settings') return 'Preferences & Security';
    if (path === '/admin/dashboard') return 'Administrator Telemetry';
    if (path === '/admin/users') return 'User Directory';
    return 'Metamorph Console';
  };

  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 4000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onOpenMobileSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
          className="mobile-sidebar-toggle"
          aria-label="Open navigation menu"
        >
          <Menu size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
            {getPageTitle()}
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
            Ready
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* New Run Button */}
        <Button variant="primary" size="sm" icon={PlusCircle} onClick={onOpenNewRun}>
          New Run
        </Button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)'
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Profile Avatar link */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
          title="View Profile"
        >
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id || 'guest'}`}
            alt={`${user?.name || 'Developer'}'s profile avatar`}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)'
            }}
          />
        </Link>
      </div>

      <style>{`
        @media (min-width: 901px) {
          .mobile-sidebar-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
