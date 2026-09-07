import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Glassmorphic Confirmation Dialog Component
 */
const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Sil',
  cancelText = 'İptal',
  variant = 'danger'
}) => {
  const cancelBtnRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus cancel button on open (safe default)
      setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      // Focus trapping
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const confirmBtnClass = `glass-button ${isDanger ? 'glass-button-danger' : ''}`;
  const confirmBtnStyle = isWarning ? {
    background: 'rgba(217, 119, 6, 0.2)',
    borderColor: 'rgba(217, 119, 6, 0.4)',
    color: '#fcd34d'
  } : {};

  return createPortal(
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={handleOverlayClick}
      style={{ zIndex: 1000 }} // Ensure it's above other modals
    >
      <div 
        ref={modalRef}
        className="glass modal-content glass-card animate-slide-up"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        style={{ maxWidth: '400px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {isDanger && (
            <div style={{ marginBottom: 'var(--space-md)', color: 'var(--accent-red)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          )}
          {isWarning && (
            <div style={{ marginBottom: 'var(--space-md)', color: 'var(--accent-amber)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          )}
          
          <h2 id="confirm-dialog-title" style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
            {title}
          </h2>
          
          <p id="confirm-dialog-desc" className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
            {message}
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--space-md)', width: '100%', justifyContent: 'center' }}>
            <button
              ref={cancelBtnRef}
              type="button"
              className="glass-button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              style={{ flex: 1, minHeight: '44px' }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={confirmBtnClass}
              style={{ flex: 1, minHeight: '44px', ...confirmBtnStyle }}
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
