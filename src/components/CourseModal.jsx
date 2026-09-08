import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DAYS, TIME_SLOTS, COURSE_COLORS, getDefaultEndTime } from '../utils/constants';
import ConfirmDialog from './ConfirmDialog';

/* Human-readable color labels */
const COLOR_LABELS = {
  '#7c3aed': 'Mor',
  '#2563eb': 'Mavi',
  '#0891b2': 'Camgöbeği',
  '#059669': 'Yeşil',
  '#d97706': 'Amber',
  '#dc2626': 'Kırmızı',
  '#db2777': 'Pembe',
  '#4f46e5': 'İndigo',
  '#0d9488': 'Deniz Yeşili',
  '#ea580c': 'Turuncu'
};

/**
 * 15 dakikalık TIME_SLOTS'u saat başlıklarıyla gruplandırır.
 * <optgroup> ile daha okunaklı bir dropdown oluşturur.
 */
function TimeSelect({ id, name, value, onChange, className, ariaRequired, ariaInvalid, ariaDescribedby }) {
  // Saate göre grupla: { '08': ['08:00','08:15','08:30','08:45'], ... }
  const groups = {};
  TIME_SLOTS.forEach(slot => {
    const hour = slot.split(':')[0];
    if (!groups[hour]) groups[hour] = [];
    groups[hour].push(slot);
  });

  return (
    <select
      id={id}
      name={name}
      className={className}
      value={value}
      onChange={onChange}
      aria-required={ariaRequired}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
    >
      {Object.entries(groups).map(([hour, slots]) => (
        <optgroup key={hour} label={`${hour}:00 - ${hour}:45`}>
          {slots.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

/**
 * Ders ekleme/düzenleme modali
 */
const CourseModal = ({ isOpen, onClose, onSave, onDelete, course }) => {
  const defaultStart = '09:00';
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    day: DAYS[0],
    startTime: defaultStart,
    endTime: getDefaultEndTime(defaultStart),
    location: '',
    color: COURSE_COLORS[0]
  });

  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const modalRef = useRef(null);
  const titleId = 'course-modal-title';

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        instructor: course.instructor || '',
        day: course.day || DAYS[0],
        startTime: course.startTime || defaultStart,
        endTime: course.endTime || getDefaultEndTime(defaultStart),
        location: course.location || '',
        color: course.color || COURSE_COLORS[0]
      });
    } else {
      setFormData({
        name: '',
        instructor: '',
        day: DAYS[0],
        startTime: defaultStart,
        endTime: getDefaultEndTime(defaultStart),
        location: '',
        color: COURSE_COLORS[0]
      });
    }
    setErrors({});
  }, [course, isOpen]);

  /* Focus trap + ESC */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => {
        modalRef.current?.querySelector('input, select, textarea')?.focus();
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const next = { ...prev, [name]: value };

      // startTime değiştiğinde endTime'ı otomatik güncelle
      // (sadece endTime zaten startTime'dan önce/eşit ise)
      if (name === 'startTime' && next.endTime <= value) {
        next.endTime = getDefaultEndTime(value);
      }

      return next;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Ders adı zorunludur';
    if (!formData.day) newErrors.day = 'Gün seçimi zorunludur';
    if (formData.endTime <= formData.startTime) newErrors.endTime = 'Bitiş saati başlangıçtan sonra olmalıdır';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave(formData);
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="glass modal-content glass-card" ref={modalRef}>
        <h2 id={titleId} style={{ marginBottom: 'var(--space-lg)' }}>
          {course ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Ders Adı */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-name">Ders Adı *</label>
            <input
              type="text"
              id="course-name"
              name="name"
              className={`glass-input${errors.name ? ' input-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Örn: Matematik 101"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <div id="name-error" className="form-error">{errors.name}</div>}
          </div>

          {/* Öğretim Üyesi */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-instructor">
              Öğretim Üyesi <span className="text-tertiary">(İsteğe bağlı)</span>
            </label>
            <input
              type="text"
              id="course-instructor"
              name="instructor"
              className="glass-input"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Örn: Dr. Ahmet Yılmaz"
            />
          </div>

          {/* Gün */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-day">Gün *</label>
            <select
              id="course-day"
              name="day"
              className="glass-input"
              value={formData.day}
              onChange={handleChange}
              aria-required="true"
            >
              {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>

          {/* Başlangıç & Bitiş — 15 dk aralıklı gruplandırılmış dropdown */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="course-start">Başlangıç</label>
              <TimeSelect
                id="course-start"
                name="startTime"
                className="glass-input"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-end">Bitiş</label>
              <TimeSelect
                id="course-end"
                name="endTime"
                className={`glass-input${errors.endTime ? ' input-error' : ''}`}
                value={formData.endTime}
                onChange={handleChange}
                ariaInvalid={!!errors.endTime}
                ariaDescribedby={errors.endTime ? 'endtime-error' : undefined}
              />
              {errors.endTime && <div id="endtime-error" className="form-error">{errors.endTime}</div>}
            </div>
          </div>

          {/* Derslik */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-location">
              Derslik <span className="text-tertiary">(İsteğe bağlı)</span>
            </label>
            <input
              type="text"
              id="course-location"
              name="location"
              className="glass-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="Örn: A-201"
            />
          </div>

          {/* Renk */}
          <div className="form-group">
            <label className="form-label">Renk</label>
            <div
              className="flex"
              style={{ gap: 'var(--space-sm)', flexWrap: 'wrap' }}
              role="radiogroup"
              aria-label="Ders rengi seç"
            >
              {COURSE_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  aria-label={`Renk: ${COLOR_LABELS[color] || color}`}
                  role="radio"
                  aria-checked={formData.color === color}
                  style={{
                    width: '36px', height: '36px', minWidth: '36px', minHeight: '36px',
                    borderRadius: '50%', backgroundColor: color, cursor: 'pointer',
                    border: formData.color === color ? '2px solid white' : '2px solid transparent',
                    boxShadow: formData.color === color ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                    transition: 'all var(--transition-fast)', padding: 0
                  }}
                />
              ))}
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex-between" style={{ marginTop: 'var(--space-xl)' }}>
            <div>
              {course && onDelete && (
                <button
                  type="button"
                  className="glass-button glass-button-danger"
                  onClick={() => setConfirmOpen(true)}
                >
                  Sil
                </button>
              )}
            </div>
            <div className="flex gap-sm">
              <button type="button" className="glass-button" onClick={onClose}>İptal</button>
              <button type="submit" className="glass-button glass-button-primary">Kaydet</button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onConfirm={() => { setConfirmOpen(false); onDelete(course.id); }}
        onCancel={() => setConfirmOpen(false)}
        title="Dersi Sil"
        message={`"${formData.name}" dersini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve derse ait tüm notlar, ödevler ve yoklama verileri silinecektir.`}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
      />
    </div>,
    document.body
  );
};

export default CourseModal;
