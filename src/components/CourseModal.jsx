import React, { useState, useEffect } from 'react';
import { DAYS, TIME_SLOTS, COURSE_COLORS } from '../utils/constants';

/**
 * Ders ekleme/düzenleme modali
 */
const CourseModal = ({ isOpen, onClose, onSave, onDelete, course }) => {
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    day: DAYS[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    color: COURSE_COLORS[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        instructor: course.instructor || '',
        day: course.day || DAYS[0],
        startTime: course.startTime || '09:00',
        endTime: course.endTime || '10:00',
        location: course.location || '',
        color: course.color || COURSE_COLORS[0]
      });
    } else {
      setFormData({
        name: '',
        instructor: '',
        day: DAYS[0],
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        color: COURSE_COLORS[0]
      });
    }
    setErrors({});
  }, [course, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Ders adı zorunludur';
    if (!formData.day) newErrors.day = 'Gün seçimi zorunludur';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="glass modal-content glass-card">
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>
          {course ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ders Adı *</label>
            <input 
              type="text" 
              name="name"
              className="glass-input" 
              value={formData.name}
              onChange={handleChange}
              placeholder="Örn: Matematik 101"
              autoFocus
            />
            {errors.name && <div className="text-xs text-secondary" style={{ color: 'var(--accent-red)', marginTop: '4px' }}>{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Öğretim Üyesi</label>
            <input 
              type="text" 
              name="instructor"
              className="glass-input" 
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Örn: Dr. Ahmet Yılmaz"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gün *</label>
              <select name="day" className="glass-input" value={formData.day} onChange={handleChange}>
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Başlangıç</label>
              <input 
                type="time" 
                name="startTime" 
                className="glass-input" 
                value={formData.startTime} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Bitiş</label>
              <input 
                type="time" 
                name="endTime" 
                className="glass-input" 
                value={formData.endTime} 
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Derslik</label>
            <input 
              type="text" 
              name="location"
              className="glass-input" 
              value={formData.location}
              onChange={handleChange}
              placeholder="Örn: A-201"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Renk</label>
            <div className="flex" style={{ gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              {COURSE_COLORS.map(color => (
                <div 
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '2px solid white' : '2px solid transparent',
                    boxShadow: formData.color === color ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex-between" style={{ marginTop: 'var(--space-xl)' }}>
            <div>
              {course && onDelete && (
                <button type="button" className="glass-button glass-button-danger" onClick={() => {
                  if (window.confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
                    onDelete(course.id);
                  }
                }}>
                  Sil
                </button>
              )}
            </div>
            
            <div className="flex gap-sm">
              <button type="button" className="glass-button" onClick={onClose}>
                İptal
              </button>
              <button type="submit" className="glass-button glass-button-primary">
                Kaydet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
