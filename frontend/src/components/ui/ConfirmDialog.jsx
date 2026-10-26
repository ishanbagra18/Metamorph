import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {message}
        </p>

        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
