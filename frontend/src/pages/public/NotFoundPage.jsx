import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 16px',
        textAlign: 'center'
      }}
    >
      <SEO
        title="404: Page Not Found"
        description="The migration workspace or requested route does not exist or has been moved."
        canonicalPath="/404"
        noIndex={true}
      />

      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Breadcrumbs items={[{ label: '404' }]} />
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '3.5rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginBottom: '16px'
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '10px',
            letterSpacing: '-0.015em'
          }}
        >
          Workspace or Route Not Found
        </h1>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '28px'
          }}
        >
          The requested migration partition or URL does not exist on this cluster. Check the path or navigate to a verified destination.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '32px'
          }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">
              Home
            </Button>
          </Link>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="primary">
              Dashboard
            </Button>
          </Link>
          <Link to="/migrations" style={{ textDecoration: 'none' }}>
            <Button variant="outline">
              Migrations
            </Button>
          </Link>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left',
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
            AVAILABLE_SLUGS:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            <Link to="/#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>• Architecture</Link>
            <Link to="/#workflow" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>• Transformation</Link>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>• Sign In</Link>
            <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>• Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
