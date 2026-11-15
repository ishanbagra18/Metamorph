import React from 'react';

export function Card({ children, className = '', style = {}, hover = false, ...props }) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '20px',
        position: 'relative',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        transition: 'border-color 100ms ease',
        ...(hover ? { cursor: 'pointer' } : {}),
        ...style
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = 'var(--border-default)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
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
        marginBottom: '14px',
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

export function CardTitle({ as: Component = 'h3', children, style = {}, ...props }) {
  return (
    <Component
      style={{
        fontSize: '1.0625rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-0.015em',
        ...style
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ children, style = {}, ...props }) {
  return (
    <p
      style={{
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.45,
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
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
