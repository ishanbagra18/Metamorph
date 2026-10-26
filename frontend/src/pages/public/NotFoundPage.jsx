import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        textAlign: 'center'
      }}
      className="bg-glow-radial"
    >
      <div style={{ maxWidth: '480px' }} className="animate-fade-in">
        <div style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.04em' }} className="gradient-text-cyan">
          404
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
          The migration workspace or requested route does not exist or has been moved to another repository partition.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" icon={ArrowLeft}>
              Back Home
            </Button>
          </Link>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={Home}>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
