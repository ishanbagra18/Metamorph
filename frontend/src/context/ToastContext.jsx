import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    dismiss: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100% - 48px)'
        }}
        aria-live="polite"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {t.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--status-success)', flexShrink: 0 }} />}
            {t.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--status-danger)', flexShrink: 0 }} />}
            {t.type === 'warning' && <AlertTriangle size={18} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />}
            {t.type === 'info' && <Info size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />}

            <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              style={{
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Dismiss toast"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
