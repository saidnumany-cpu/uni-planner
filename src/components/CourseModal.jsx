import { useEffect, useState } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { DAYS, TIME_SLOTS, COURSE_COLORS, DEFAULT_ABSENCE_LIMIT, getDefaultEndTime, toMinutes } from '../utils/constants';
import { getSessions, getAbsenceLimit } from '../utils/course';
import { CheckIcon, MinusIcon, PlusIcon, TrashIcon, AlertCircleIcon } from '../icons/SVGIcons';

/** 15 dk aralıklı saat seçici. Listede olmayan eski değerleri de gösterir. */
function TimeSelect({ value, onChange, ...rest }) {
  const slots = value && !TIME_SLOTS.includes(value) ? [...TIME_SLOTS, value].sort() : TIME_SLOTS;
  return (
    <select className="select" value={value} onChange={e => onChange(e.target.value)} {...rest}>
      {slots.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

const newSession = (day = DAYS[0], startTime = '09:00') => ({
  day,
  startTime,
  endTime: getDefaultEndTime(startTime),
  location: ''
});

const emptyForm = (color = COURSE_COLORS[0].value) => ({
  name: '',
  instructor: '',
  color,
  absenceLimit: DEFAULT_ABSENCE_LIMIT,
  sessions: [newSession()]
});

/**
 * Ders ekleme / düzenleme formu.
 * Bir ders haftada birden fazla gün/saatte olabilir (oturumlar).
 */
export default function CourseModal({ isOpen, onClose, onSave, onDelete, course, defaultColor }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (course) {
      const sessions = getSessions(course);
      setForm({
        name: course.name || '',
        instructor: course.instructor || '',
        color: course.color || COURSE_COLORS[0].value,
        absenceLimit: getAbsenceLimit(course),
        sessions: sessions.length
          ? sessions.map(s => ({ ...s, location: s.location || course.location || '' }))
          : [newSession()]
      });
    } else {
      setForm(emptyForm(defaultColor));
    }
    setErrors({});
    setConfirmOpen(false);
    // Yalnızca açılışta / farklı ders seçilince doldur (canlı güncellemeler formu ezmesin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, isOpen]);

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const updateSession = (index, key, value) => {
    setForm(prev => {
      const sessions = prev.sessions.map((s, i) => {
        if (i !== index) return s;
        const next = { ...s, [key]: value };
        // Başlangıç bitişi geçerse bitişi otomatik 1 saat sonraya al
        if (key === 'startTime' && toMinutes(next.endTime) <= toMinutes(value)) {
          next.endTime = getDefaultEndTime(value);
        }
        return next;
      });
      return { ...prev, sessions };
    });
    setErrors(prev => ({ ...prev, [`session-${index}`]: undefined }));
  };

  const addSession = () => {
    setForm(prev => {
      const last = prev.sessions[prev.sessions.length - 1];
      const nextDay = last ? DAYS[Math.min(DAYS.indexOf(last.day) + 2, 4)] : DAYS[0];
      return {
        ...prev,
        sessions: [...prev.sessions, { ...newSession(nextDay, last?.startTime || '09:00'), endTime: last?.endTime || getDefaultEndTime('09:00'), location: last?.location || '' }]
      };
    });
  };

  const removeSession = (index) => {
    setForm(prev => ({ ...prev, sessions: prev.sessions.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Ders adı zorunludur';
    form.sessions.forEach((s, i) => {
      if (toMinutes(s.endTime) <= toMinutes(s.startTime)) {
        next[`session-${i}`] = 'Bitiş saati başlangıçtan sonra olmalı';
      }
    });
    if (Object.keys(next).length) {
      setErrors(next);
      // İlk hatalı alana odaklan
      requestAnimationFrame(() => document.querySelector('.modal [aria-invalid="true"]')?.focus());
      return;
    }

    const sessions = form.sessions
      .map(s => ({ day: s.day, startTime: s.startTime, endTime: s.endTime, location: (s.location || '').trim() }))
      .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || toMinutes(a.startTime) - toMinutes(b.startTime));
    const first = sessions[0];

    onSave({
      name: form.name.trim(),
      instructor: form.instructor.trim(),
      color: form.color,
      absenceLimit: Number(form.absenceLimit) || 0,
      sessions,
      // Eski sürümlerle uyumluluk için ilk oturum düz alanlarda da tutulur
      day: first.day,
      startTime: first.startTime,
      endTime: first.endTime,
      location: first.location
    });
  };

  const formId = 'course-form';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={course ? 'Dersi düzenle' : 'Yeni ders'}
        footer={
          <>
            {course && onDelete && (
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
          <div className="field">
            <label className="field-label" htmlFor="course-name">Ders adı</label>
            <input
              id="course-name"
              className="input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Örn. Tipografi II"
              autoComplete="off"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'course-name-err' : undefined}
              data-autofocus
            />
            {errors.name && <span id="course-name-err" className="field-error"><AlertCircleIcon size={14} />{errors.name}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="course-instructor">
              Öğretim üyesi <span className="optional">(isteğe bağlı)</span>
            </label>
            <input
              id="course-instructor"
              className="input"
              value={form.instructor}
              onChange={e => set('instructor', e.target.value)}
              placeholder="Örn. Dr. Ayşe Yılmaz"
              autoComplete="off"
            />
          </div>

          <fieldset className="fieldset">
            <legend className="field-label" style={{ padding: '0 4px' }}>Ders saatleri</legend>
            {form.sessions.map((s, i) => {
              const err = errors[`session-${i}`];
              return (
                <div key={i} className="session-row">
                  <div className="session-row-head">
                    <span>{form.sessions.length > 1 ? `${i + 1}. oturum` : 'Oturum'}</span>
                    {form.sessions.length > 1 && (
                      <button
                        type="button"
                        className="icon-btn danger"
                        style={{ width: 36, height: 36 }}
                        onClick={() => removeSession(i)}
                        aria-label={`${i + 1}. oturumu kaldır`}
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                  </div>
                  <div className="field full">
                    <label className="field-label sr-only" htmlFor={`s-day-${i}`}>Gün</label>
                    <select
                      id={`s-day-${i}`}
                      className="select"
                      value={s.day}
                      onChange={e => updateSession(i, 'day', e.target.value)}
                    >
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label text-xs muted" htmlFor={`s-start-${i}`}>Başlangıç</label>
                    <TimeSelect id={`s-start-${i}`} value={s.startTime} onChange={v => updateSession(i, 'startTime', v)} />
                  </div>
                  <div className="field">
                    <label className="field-label text-xs muted" htmlFor={`s-end-${i}`}>Bitiş</label>
                    <TimeSelect
                      id={`s-end-${i}`}
                      value={s.endTime}
                      onChange={v => updateSession(i, 'endTime', v)}
                      aria-invalid={!!err}
                      aria-describedby={err ? `s-err-${i}` : undefined}
                    />
                  </div>
                  {err && <span id={`s-err-${i}`} className="field-error full"><AlertCircleIcon size={14} />{err}</span>}
                  <div className="field full">
                    <label className="field-label sr-only" htmlFor={`s-loc-${i}`}>Derslik</label>
                    <input
                      id={`s-loc-${i}`}
                      className="input"
                      value={s.location}
                      onChange={e => updateSession(i, 'location', e.target.value)}
                      placeholder="Derslik (isteğe bağlı), örn. B-204"
                      autoComplete="off"
                    />
                  </div>
                </div>
              );
            })}
            <button type="button" className="btn btn-sm btn-ghost" onClick={addSession} style={{ alignSelf: 'flex-start' }}>
              <PlusIcon size={16} /> Başka gün/saat ekle
            </button>
          </fieldset>

          <div className="field">
            <span className="field-label" id="absence-label">Devamsızlık hakkı</span>
            <div className="row" style={{ gap: 'var(--s-3)', flexWrap: 'wrap' }}>
              <div className="stepper" role="group" aria-labelledby="absence-label">
                <button
                  type="button"
                  onClick={() => set('absenceLimit', Math.max(0, Number(form.absenceLimit) - 1))}
                  disabled={Number(form.absenceLimit) <= 0}
                  aria-label="Azalt"
                >
                  <MinusIcon size={18} />
                </button>
                <output aria-live="polite">{form.absenceLimit}</output>
                <button
                  type="button"
                  onClick={() => set('absenceLimit', Math.min(30, Number(form.absenceLimit) + 1))}
                  aria-label="Artır"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
              <span className="field-hint">hafta — dolmaya yaklaşınca uyarılırsın</span>
            </div>
          </div>

          <div className="field">
            <span className="field-label" id="color-label">Renk</span>
            <div className="color-options" role="radiogroup" aria-labelledby="color-label">
              {COURSE_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={form.color === c.value}
                  aria-label={c.label}
                  className="color-swatch"
                  style={{ background: c.value }}
                  onClick={() => set('color', c.value)}
                >
                  {form.color === c.value && <CheckIcon size={18} />}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onConfirm={() => { setConfirmOpen(false); onDelete(course.id); }}
        onCancel={() => setConfirmOpen(false)}
        title="Ders silinsin mi?"
        message={`"${form.name || course?.name || ''}" dersi; notları, ödevleri ve yoklama kayıtlarıyla birlikte kalıcı olarak silinecek.`}
        confirmText="Dersi sil"
      />
    </>
  );
}
