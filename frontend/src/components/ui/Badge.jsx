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
      borderColor: 'rgba(16, 185, 129, 0.25)'
    },
    warning: {
      backgroundColor: 'var(--status-warning-bg)',
      color: 'var(--status-warning)',
      borderColor: 'rgba(245, 158, 11, 0.25)'
    },
    danger: {
      backgroundColor: 'var(--status-danger-bg)',
      color: 'var(--status-danger)',
      borderColor: 'rgba(239, 68, 68, 0.25)'
    },
    info: {
      backgroundColor: 'var(--status-info-bg)',
      color: 'var(--accent-cyan)',
      borderColor: 'rgba(14, 165, 233, 0.25)'
    },
    cyan: {
      backgroundColor: 'var(--status-info-bg)',
      color: 'var(--accent-cyan)',
      borderColor: 'rgba(14, 165, 233, 0.25)'
    },
    purple: {
      backgroundColor: 'var(--bg-surface-elevated)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-default)'
    },
    neutral: {
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-secondary)',
      borderColor: 'var(--border-subtle)'
    }
  };

  const sizeStyles = {
    sm: { padding: '2px 7px', fontSize: '0.75rem', height: '20px' },
    md: { padding: '3px 9px', fontSize: '0.8125rem', height: '24px' }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontWeight: 500,
        fontFamily: 'var(--font-mono)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid transparent',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...(variantStyles[variant] || variantStyles.neutral),
        ...style
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: 'currentColor'
          }}
        />
      )}
      {children}
    </span>
  );
}
