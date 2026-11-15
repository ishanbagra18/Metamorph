import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  style = {},
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    transition: 'background-color 100ms ease, border-color 100ms ease, color 100ms ease, opacity 100ms ease',
    border: '1px solid transparent',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.5 : 1,
    letterSpacing: '-0.01em'
  };

  const sizeStyles = {
    sm: { padding: '5px 10px', fontSize: '0.8125rem', height: '28px' },
    md: { padding: '7px 14px', fontSize: '0.875rem', height: '34px' },
    lg: { padding: '10px 18px', fontSize: '0.9375rem', height: '40px' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--text-primary)',
      color: 'var(--bg-primary)',
      borderColor: 'var(--text-primary)',
      fontWeight: 600
    },
    secondary: {
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-default)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-default)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)'
    },
    danger: {
      backgroundColor: 'var(--status-danger)',
      color: '#ffffff',
      borderColor: 'var(--status-danger)'
    }
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant] || variantStyles.secondary,
        ...style
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" style={{ animation: 'spinSlow 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  );
}
