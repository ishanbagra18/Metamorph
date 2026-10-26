import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-surface-elevated)',
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'pulseGlow 2s infinite',
        ...style
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Skeleton width="40%" height="24px" />
      <Skeleton width="80%" height="16px" />
      <Skeleton width="100%" height="60px" borderRadius="var(--radius-md)" />
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <Skeleton width="80px" height="32px" borderRadius="var(--radius-md)" />
        <Skeleton width="80px" height="32px" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton width="100%" height="36px" borderRadius="var(--radius-md)" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Skeleton width="25%" height="20px" />
          <Skeleton width="35%" height="20px" />
          <Skeleton width="20%" height="20px" />
          <Skeleton width="20%" height="20px" />
        </div>
      ))}
    </div>
  );
}
