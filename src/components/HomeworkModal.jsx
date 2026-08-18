import React, { useState, useEffect } from 'react';
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
  }, [homework, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, dueDate });
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card glass" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4">{homework ? 'Ödevi Düzenle' : 'Yeni Ödev Ekle'}</h2>
        
        <form onSubmit={handleSubmit} className="flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Ödev Başlığı</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Ödev başlığı..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Son Tarih</label>
            <input 
              type="date" 
              className="glass-input" 
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea 
              className="glass-textarea" 
              placeholder="Ödev detayları, notlar..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-sm mt-4">
            <button type="button" className="glass-button" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="glass-button-primary">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
