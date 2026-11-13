import { useEffect, useState } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { toDateInputValue } from '../utils/helpers';
import { AlertCircleIcon, TrashIcon } from '../icons/SVGIcons';

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateInputValue(d);
};

/**
 * Ödev ekleme / düzenleme formu.
 * `courses` verilirse ders seçimi gösterilir (genel Ödevler sayfası için).
 * onSave(data, courseId) çağrılır.
 */
export default function HomeworkModal({ isOpen, onClose, onSave, onDelete, homework, courses, courseId: fixedCourseId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [courseId, setCourseId] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const defaultCourseId = courses?.[0]?.id || '';

  // Yalnızca açılışta / farklı ödev seçilince formu doldur
  // (canlı veri güncellemeleri yazılan metni ezmesin)
  const homeworkKey = homework?.id || null;
  useEffect(() => {
    if (!isOpen) return;
    setTitle(homework?.title || '');
    setDescription(homework?.description || '');
    setDueDate(homework?.dueDate || '');
    setCourseId(homework?.courseId || fixedCourseId || defaultCourseId);
    setErrors({});
    setConfirmOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeworkKey, isOpen]);

  const showCourseSelect = !fixedCourseId && !homework && Array.isArray(courses);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!title.trim()) next.title = 'Ödev başlığı zorunludur';
    if (showCourseSelect && !courseId) next.course = 'Bir ders seçin';
    if (Object.keys(next).length) {
      setErrors(next);
      requestAnimationFrame(() => document.querySelector('.modal [aria-invalid="true"]')?.focus());
      return;
    }
    onSave({ title: title.trim(), description: description.trim(), dueDate }, courseId);
  };

  const quickDates = [
    { label: 'Bugün', value: addDays(0) },
    { label: 'Yarın', value: addDays(1) },
    { label: '1 hafta', value: addDays(7) }
  ];

  const formId = 'homework-form';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={homework ? 'Ödevi düzenle' : 'Yeni ödev'}
        footer={
          <>
            {homework && onDelete && (
              <button type="button" className="btn btn-danger-ghost" onClick={() => setConfirmOpen(true)}>
                <TrashIcon size={18} /> Sil
              </button>
            )}
            <span className="spacer" />
            <button type="button" className="btn" onClick={onClose}>İptal</button>
            <button type="submit" form={formId} className="btn btn-primary">Kaydet</button>
          </>
        }
      >
        <form id={formId} className="form-grid" onSubmit={handleSubmit} noValidate>
          {showCourseSelect && (
            <div className="field">
              <label className="field-label" htmlFor="hw-course">Ders</label>
              <select
                id="hw-course"
                className="select"
                value={courseId}
                onChange={e => { setCourseId(e.target.value); setErrors(p => ({ ...p, course: undefined })); }}
                aria-invalid={!!errors.course}
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.course && <span className="field-error"><AlertCircleIcon size={14} />{errors.course}</span>}
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="hw-title">Başlık</label>
            <input
              id="hw-title"
              className="input"
              value={title}
              onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: undefined })); }}
              placeholder="Örn. Afiş tasarımı teslimi"
              autoComplete="off"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'hw-title-err' : undefined}
              data-autofocus
            />
            {errors.title && <span id="hw-title-err" className="field-error"><AlertCircleIcon size={14} />{errors.title}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="hw-due">
              Teslim tarihi <span className="optional">(isteğe bağlı)</span>
            </label>
            <input
              id="hw-due"
              type="date"
              className="input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {quickDates.map(q => (
                <button
                  key={q.label}
                  type="button"
                  className="chip"
                  aria-pressed={dueDate === q.value}
                  onClick={() => setDueDate(q.value)}
                >
                  {q.label}
                </button>
              ))}
              {dueDate && (
                <button type="button" className="chip" onClick={() => setDueDate('')}>Tarihi kaldır</button>
              )}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="hw-desc">
              Açıklama <span className="optional">(isteğe bağlı)</span>
            </label>
            <textarea
              id="hw-desc"
              className="textarea"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Teslim şekli, gereken malzemeler, notlar…"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onConfirm={() => { setConfirmOpen(false); onDelete?.(homework); }}
        onCancel={() => setConfirmOpen(false)}
        title="Ödev silinsin mi?"
        message={`"${homework?.title || ''}" kalıcı olarak silinecek.`}
        confirmText="Ödevi sil"
      />
    </>
  );
}
