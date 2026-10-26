import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Sun, Moon, Menu, X, ArrowRight, Sparkles, Layers } from 'lucide-react';

export function PublicNavbar() {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Architecture', href: '/#architecture' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5000,
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div
        className="container-custom"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px'
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit'
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
              fontSize: '1.25rem'
            }}
          >
            🦋
          </div>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)'
            }}
          >
            Metamorph
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}
          >
            JS → TS AGENT
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '28px'
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--accent-cyan)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          {isAuthenticated ? (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" icon={Layers}>
                Dashboard
              </Button>
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" icon={Sparkles}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-surface-elevated)'
            }}
            className="mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="glass-panel-elevated animate-fade-in"
          style={{
            padding: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '8px 0'
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" style={{ width: '100%' }}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" style={{ width: '100%' }}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" style={{ width: '100%' }}>
                    Create Free Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
