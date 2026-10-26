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
    gap: '8px',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    border: '1px solid transparent',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.8125rem' },
    md: { padding: '9px 18px', fontSize: '0.875rem' },
    lg: { padding: '12px 24px', fontSize: '1rem' }
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-glow-cyan)'
    },
    gradient: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #0284c7 50%, #06b6d4 100%)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-glow-purple)'
    },
    secondary: {
      background: 'var(--bg-surface-elevated)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-default)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-default)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)'
    },
    danger: {
      background: 'var(--status-danger)',
      color: '#ffffff'
    }
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" style={{ animation: 'spinSlow 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}
