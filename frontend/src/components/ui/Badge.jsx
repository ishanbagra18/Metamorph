import React from 'react';

export function Badge({
  children,
  variant = 'neutral',
  dot = false,
  size = 'sm',
  style = {},
  ...props
}) {
  const variantStyles = {
    success: {
      backgroundColor: 'var(--status-success-bg)',
      color: 'var(--status-success)',
      borderColor: 'rgba(16, 185, 129, 0.3)'
    },
    warning: {
      backgroundColor: 'var(--status-warning-bg)',
      color: 'var(--status-warning)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    danger: {
      backgroundColor: 'var(--status-danger-bg)',
      color: 'var(--status-danger)',
      borderColor: 'rgba(244, 63, 94, 0.3)'
    },
    info: {
      backgroundColor: 'var(--status-info-bg)',
      color: 'var(--accent-cyan)',
      borderColor: 'rgba(6, 182, 212, 0.3)'
    },
    purple: {
      backgroundColor: 'rgba(139, 92, 246, 0.12)',
      color: 'var(--accent-purple)',
      borderColor: 'rgba(139, 92, 246, 0.3)'
    },
    cyan: {
      backgroundColor: 'rgba(6, 182, 212, 0.12)',
      color: 'var(--accent-cyan)',
      borderColor: 'rgba(6, 182, 212, 0.3)'
    },
    neutral: {
      backgroundColor: 'var(--bg-surface-elevated)',
      color: 'var(--text-secondary)',
      borderColor: 'var(--border-default)'
    }
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.75rem' },
    md: { padding: '4px 12px', fontSize: '0.8125rem' }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        border: '1px solid',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        userSelect: 'none',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block',
            boxShadow: '0 0 6px currentColor'
          }}
        />
      )}
      {children}
    </span>
  );
}
