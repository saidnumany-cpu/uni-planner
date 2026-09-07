import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Ödev Ekleme/Düzenleme Modalı
 * @param {boolean} isOpen - Modal açık mı?
 * @param {Function} onClose - Modalı kapatma fonksiyonu
 * @param {Function} onSave - Kaydetme fonksiyonu
 * @param {Object|null} homework - Düzenlenecek ödev objesi (yoksa yeni)
 */
export default function HomeworkModal({ isOpen, onClose, onSave, homework }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState('');
  const modalRef = useRef(null);
  const titleId = 'homework-modal-title';

  useEffect(() => {
    if (homework) {
      setTitle(homework.title || '');
      setDescription(homework.description || '');
      setDueDate(homework.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
    }
    setTitleError('');
    setSaving(false);
  }, [homework, isOpen]);

  /* Focus trap + ESC */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => {
        const firstInput = modalRef.current?.querySelector('input, select, textarea');
        firstInput?.focus();
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  /* Today's date for min-date validation */
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Ödev başlığı zorunludur');
      return;
    }
    setTitleError('');
    setSaving(true);
    try {
      await onSave({ title, description, dueDate });
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="modal-content glass-card glass" ref={modalRef} onClick={e => e.stopPropagation()}>
        <h2 id={titleId} className="mb-4">{homework ? 'Ödevi Düzenle' : 'Yeni Ödev Ekle'}</h2>
        
        <form onSubmit={handleSubmit} className="flex-col gap-md" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="hw-title">Ödev Başlığı *</label>
            <input 
              type="text" 
              id="hw-title"
              className={`glass-input${titleError ? ' input-error' : ''}`}
              placeholder="Ödev başlığı..."
              value={title}
              onChange={e => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
              aria-required="true"
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'hw-title-error' : undefined}
            />
            {titleError && <div id="hw-title-error" className="form-error">{titleError}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hw-duedate">Son Tarih</label>
            <input 
              type="date" 
              id="hw-duedate"
              className="glass-input" 
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              min={homework ? undefined : today}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hw-desc">Açıklama <span className="text-tertiary">(İsteğe bağlı)</span></label>
            <textarea 
              id="hw-desc"
              className="glass-textarea" 
              placeholder="Ödev detayları, notlar..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-sm mt-4">
            <button type="button" className="glass-button" onClick={onClose} disabled={saving}>
              İptal
            </button>
            <button type="submit" className="glass-button glass-button-primary" disabled={saving} aria-busy={saving}>
              {saving ? (
                <span className="flex items-center gap-xs">
                  <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Kaydediliyor...
                </span>
              ) : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
