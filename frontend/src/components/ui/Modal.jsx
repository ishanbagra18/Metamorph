import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = '540px',
  showClose = true
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 7, 12, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal Dialog */}
      <div
        className="glass-panel-elevated animate-fade-in"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginTop: '4px'
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            {showClose && (
              <button
                onClick={onClose}
                style={{
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-surface-elevated)'
                }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
