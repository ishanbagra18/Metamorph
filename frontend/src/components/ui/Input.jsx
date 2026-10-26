import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  id,
  className = '',
  style = {},
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--status-danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon size={18} />
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          style={{
            width: '100%',
            padding: `10px 14px 10px ${Icon ? '40px' : '14px'}`,
            paddingRight: isPassword ? '42px' : '14px',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--status-danger)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            fontSize: '0.925rem',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = 'var(--border-focus)';
            e.target.style.boxShadow = error ? '0 0 0 2px rgba(244, 63, 94, 0.2)' : '0 0 0 2px rgba(2, 132, 199, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--status-danger)' : 'var(--border-default)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px'
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--status-danger)' }}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
