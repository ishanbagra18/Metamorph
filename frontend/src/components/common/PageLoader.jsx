import React from 'react';
import { BrandLogo } from './BrandLogo';

export function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--text-secondary)'
      }}
      role="status"
      aria-label="Loading workspace"
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)'
        }}
      >
        <BrandLogo size={20} />
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Loading workspace...
      </div>
    </div>
  );
}
