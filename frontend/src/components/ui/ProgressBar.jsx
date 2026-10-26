import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'cyan',
  height = '8px',
  showLabel = false,
  label = '',
  style = {}
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variantGradients = {
    cyan: 'linear-gradient(90deg, #0284c7, #06b6d4)',
    purple: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    success: 'linear-gradient(90deg, #059669, #10b981)',
    warning: 'linear-gradient(90deg, #d97706, #f59e0b)',
    danger: 'linear-gradient(90deg, #e11d48, #f43f5e)'
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{percentage}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: variantGradients[variant] || variantGradients.cyan,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease-in-out'
          }}
        />
      </div>
    </div>
  );
}
