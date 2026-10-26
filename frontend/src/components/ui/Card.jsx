import React from 'react';

export function Card({ children, className = '', style = {}, hover = false, ...props }) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '24px',
        position: 'relative',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
        ...(hover ? { cursor: 'pointer' } : {}),
        ...style
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--border-focus)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, style = {}, ...props }) {
  return (
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        ...style
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, style = {}, ...props }) {
  return (
    <p
      style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        ...style
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, style = {}, ...props }) {
  return (
    <div style={{ ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
