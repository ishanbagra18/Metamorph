import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Menu, Terminal, Cpu, ShieldCheck } from 'lucide-react';

export function DashboardTopbar({ onOpenMobileSidebar, onOpenNewRun }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview & Analytics';
    if (path.startsWith('/migrations/new')) return 'New Migration Job';
    if (path.startsWith('/migrations/')) return 'Migration Workspace';
    if (path === '/migrations') return 'Migration Repository History';
    if (path === '/profile') return 'User Profile';
    if (path === '/settings') return 'Preferences & Security';
    if (path === '/admin/dashboard') return 'Platform Governance';
    if (path === '/admin/users') return 'User Administration';
    return 'Metamorph Console';
  };

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-primary)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 4000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenMobileSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)'
          }}
          className="mobile-sidebar-toggle"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {getPageTitle()}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Metamorph Agent v1.0.0</span>
            <span>•</span>
            <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
              Ready
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Engine Specs Pill */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}
          className="engine-pill"
        >
          <Cpu size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>LangGraph + Qdrant RAG</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)'
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
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
            alt={user?.name || 'Avatar'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '2px solid var(--accent-cyan)'
            }}
          />
        </Link>
      </div>

      <style>{`
        @media (min-width: 901px) {
          .mobile-sidebar-toggle { display: none !important; }
          .engine-pill { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
