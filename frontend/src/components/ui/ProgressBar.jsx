import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'cyan',
  height = '6px',
  showLabel = false,
  label = '',
  style = {}
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variantColors = {
    cyan: 'var(--accent-cyan)',
    purple: 'var(--text-primary)',
    success: 'var(--status-success)',
    warning: 'var(--status-warning)',
    danger: 'var(--status-danger)'
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{percentage}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: variantColors[variant] || variantColors.cyan,
            borderRadius: 'var(--radius-sm)',
            transition: 'width 200ms ease'
          }}
        />
      </div>
    </div>
  );
}
