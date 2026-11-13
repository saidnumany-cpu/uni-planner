import { useEffect, useState } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { EXAM_KINDS, examTitle } from '../utils/exams';
import { TIME_SLOTS } from '../utils/constants';
import { getSessions } from '../utils/course';
import { periodsOn, periodKind, periodLabel, formatRange } from '../utils/academic';
import { parseLocalDate } from '../utils/helpers';
import { useSettings } from '../contexts/SettingsContext';
import { AlertCircleIcon, TrashIcon } from '../icons/SVGIcons';

/** Sınav türünden akademik takvim dönem türüne */
const KIND_TO_PERIOD = { vize: 'midterm', final: 'final', butunleme: 'makeup' };

/**
 * Sınav ekleme / düzenleme
 * onSave(data) — data.courseId dahil
 */
export default function ExamModal({ isOpen, onClose, onSave, onDelete, exam, courses, defaultCourseId }) {
  const { periods } = useSettings();
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const examKey = exam?.id || null;
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      courseId: exam?.courseId || defaultCourseId || courses[0]?.id || '',
      kind: exam?.kind || 'vize',
      title: exam?.title || '',
      date: exam?.date || '',
      startTime: exam?.startTime || '',
      location: exam?.location || '',
      topics: exam?.topics || ''
    });
    setErrors({});
    setConfirmOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examKey, isOpen]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  // Seçilen türe uyan takvim dönemi (ör. vize haftası) — tarih seçerken ipucu
  const matchingPeriod = periods.find(p => p.kind === KIND_TO_PERIOD[form.kind] && p.end >= (form.date || '0000'))
    || periods.find(p => p.kind === KIND_TO_PERIOD[form.kind]);
  const dateHint = (() => {
    const d = parseLocalDate(form.date);
    if (!d) return null;
    const inside = periodsOn(periods, d).filter(p => periodKind(p).noClasses);
    return inside.length ? `${periodLabel(inside[0])} içinde` : null;
  })();

  // Ders saatini hızlıca doldurmak için dersin oturumları
  const course = courses.find(c => c.id === form.courseId);
  const sessionTimes = [...new Set(getSessions(course).map(s => s.startTime))];

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.courseId) next.courseId = 'Bir ders seçin';
    if (!form.date) next.date = 'Sınav tarihini girin';
    if (Object.keys(next).length) {
      setErrors(next);
      requestAnimationFrame(() => document.querySelector('.modal [aria-invalid="true"]')?.focus());
      return;
    }
    onSave({
      courseId: form.courseId,
      kind: form.kind,
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      location: form.location.trim(),
      topics: form.topics.trim()
    });
  };

  const formId = 'exam-form';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={exam ? 'Sınavı düzenle' : 'Yeni sınav'}
        footer={
          <>
            {exam && onDelete && (
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
        <form id={formId} className="form-grid" onSubmit={submit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="exam-course">Ders</label>
            <select id="exam-course" className="select" value={form.courseId || ''} onChange={set('courseId')} aria-invalid={!!errors.courseId}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.courseId && <span className="field-error"><AlertCircleIcon size={14} />{errors.courseId}</span>}
          </div>

          <div className="field">
            <span className="field-label" id="exam-kind-label">Tür</span>
            <div className="row" style={{ flexWrap: 'wrap' }} role="radiogroup" aria-labelledby="exam-kind-label">
              {EXAM_KINDS.map(k => (
                <button key={k.id} type="button" className="chip" role="radio" aria-checked={form.kind === k.id} aria-pressed={form.kind === k.id} onClick={() => set('kind')(k.id)}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="exam-title">
              Başlık <span className="optional">(isteğe bağlı)</span>
            </label>
            <input id="exam-title" className="input" value={form.title || ''} onChange={set('title')} placeholder="Örn. Ara jüri, Quiz 2" autoComplete="off" />
          </div>

          <div className="form-row-2">
            <div className="field">
              <label className="field-label" htmlFor="exam-date">Tarih</label>
              <input id="exam-date" type="date" className="input" value={form.date || ''} onChange={set('date')} aria-invalid={!!errors.date} data-autofocus />
              {errors.date
                ? <span className="field-error"><AlertCircleIcon size={14} />{errors.date}</span>
                : dateHint
                  ? <span className="field-hint">{dateHint}</span>
                  : matchingPeriod && !form.date
                    ? <span className="field-hint">{periodLabel(matchingPeriod)}: {formatRange(matchingPeriod.start, matchingPeriod.end)}</span>
                    : null}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="exam-time">Saat <span className="optional">(isteğe bağlı)</span></label>
              <select id="exam-time" className="select" value={form.startTime || ''} onChange={set('startTime')}>
                <option value="">—</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {sessionTimes.length > 0 && !form.startTime && (
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  {sessionTimes.map(t => (
                    <button key={t} type="button" className="chip" onClick={() => set('startTime')(t)}>Ders saati {t}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="exam-location">Yer <span className="optional">(isteğe bağlı)</span></label>
            <input id="exam-location" className="input" value={form.location || ''} onChange={set('location')} placeholder="Örn. B-204, Atölye 3" autoComplete="off" />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="exam-topics">Konular / notlar <span className="optional">(isteğe bağlı)</span></label>
            <textarea id="exam-topics" className="textarea" rows={3} value={form.topics || ''} onChange={set('topics')} placeholder="Sorumlu olunan haftalar, getirilecek malzemeler…" />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onConfirm={() => { setConfirmOpen(false); onDelete?.(exam); }}
        onCancel={() => setConfirmOpen(false)}
        title="Sınav silinsin mi?"
        message={`"${examTitle(exam)}" kalıcı olarak silinecek.`}
        confirmText="Sınavı sil"
      />
    </>
  );
}
