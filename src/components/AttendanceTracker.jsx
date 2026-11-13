import { useState } from 'react';
import Modal from './Modal';
import { getAbsenceLimit } from '../utils/course';
import { ATTENDANCE_STATUSES, attendanceStatus } from '../utils/attendance';
import { CheckIcon, XIcon, FileTextIcon, AlertTriangleIcon, MinusIcon, UserIcon, RotateCcwIcon } from '../icons/SVGIcons';

/** Devamsızlık hakkı özeti için renk ve metin */
export const absenceSummary = (missed, limit) => {
  const left = limit - missed;
  if (limit <= 0) return { tone: '', text: 'Devamsızlık sınırı tanımlı değil' };
  if (left < 0) return { tone: 'danger', text: `Sınır ${Math.abs(left)} hafta aşıldı` };
  if (left === 0) return { tone: 'danger', text: 'Devamsızlık hakkın doldu' };
  if (left === 1) return { tone: 'warning', text: 'Son 1 devamsızlık hakkın kaldı' };
  return { tone: 'success', text: `${left} devamsızlık hakkın var` };
};

const STATUS_ICON = {
  attended: <CheckIcon size={16} strokeWidth={3} />,
  missed: <XIcon size={16} strokeWidth={3} />,
  cancelled: <MinusIcon size={16} strokeWidth={3} />,
  noTeacher: <UserIcon size={15} strokeWidth={2.5} />
};

const OPTIONS = [
  { id: 'attended', hint: 'Derse girdim' },
  { id: 'missed', hint: 'Devamsızlığa sayılır' },
  { id: 'cancelled', hint: 'Devamsızlığa sayılmaz' },
  { id: 'noTeacher', hint: 'Devamsızlığa sayılmaz' }
];

/**
 * Haftalık yoklama. Boş haftaya dokunmak "katıldım" yapar;
 * dolu haftaya dokununca durum seçici açılır (gelmedim, ders iptal, hoca gelmedi…).
 */
export default function AttendanceTracker({ course, records, stats, weeks, currentWeek, weekList = [], onSet }) {
  const [editWeek, setEditWeek] = useState(null);
  const [choice, setChoice] = useState(null);
  const [note, setNote] = useState('');
  const limit = getAbsenceLimit(course);
  const summary = absenceSummary(stats.missed, limit);
  const cancelled = stats.cancelled || 0;

  const recordOf = (week) => records.find(r => String(r.week) === String(week));
  const dateOf = (week) => weekList.find(w => w.week === week)?.start;

  const openEditor = (week) => {
    const r = recordOf(week);
    const st = attendanceStatus(r);
    setChoice(st === 'none' ? 'missed' : st);
    setNote(r?.note || '');
    setEditWeek(week);
  };

  const tap = (week) => {
    if (attendanceStatus(recordOf(week)) === 'none') onSet(week, 'attended', '');
    else openEditor(week);
  };

  const save = () => {
    onSet(editWeek, choice, note.trim());
    setEditWeek(null);
  };
  const clear = () => {
    onSet(editWeek, null, '');
    setEditWeek(null);
  };

  const recorded = stats.attended + stats.missed;

  return (
    <div className="stack">
      <div className="stat-grid cols-3">
        <div className="stat">
          <span className="stat-label">Katıldım</span>
          <span className="stat-value success">{stats.attended}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Gelmedim</span>
          <span className={`stat-value ${stats.missed > 0 ? 'danger' : ''}`}>
            {stats.missed}<span className="subtle text-sm" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}> / {limit}</span>
          </span>
        </div>
        <div className="stat stat-wide-mobile">
          <span className="stat-label">Devam oranı</span>
          <span className={`stat-value ${recorded ? (stats.percentage >= 70 ? 'success' : stats.percentage >= 50 ? 'warning' : 'danger') : ''}`}>
            {recorded ? `%${stats.percentage}` : '—'}
          </span>
        </div>
      </div>

      {limit > 0 && (summary.tone === 'danger' || summary.tone === 'warning') ? (
        <div className={`alert alert-${summary.tone}`} role="status">
          <AlertTriangleIcon size={18} />
          <span><strong>{summary.text}</strong>Sınır: {limit} hafta. Kalan dersleri kaçırmamaya çalış.</span>
        </div>
      ) : (
        <p className="meta">
          {summary.text}{limit > 0 ? ` (sınır ${limit} hafta)` : ''}
          {cancelled > 0 ? ` · ${cancelled} hafta ders yapılmadı` : ''}
        </p>
      )}

      <section className="card card-tight">
        <div className="card-header" style={{ flexWrap: 'wrap' }}>
          <h3>Haftalar</h3>
          <div className="legend">
            <span><i style={{ background: 'var(--success-solid)' }} />Katıldım</span>
            <span><i style={{ background: 'var(--danger-solid)' }} />Gelmedim</span>
            <span><i style={{ background: 'var(--text-3)' }} />Ders yapılmadı</span>
            <span><i style={{ border: '2px dashed var(--border-strong)' }} />Girilmedi</span>
          </div>
        </div>
        <p className="subtle text-sm" style={{ marginBottom: 'var(--s-3)' }}>
          Boş haftaya dokun: katıldım. Dolu haftaya dokun: gelmedim, ders iptal, hoca gelmedi…
        </p>
        <div className="attendance-grid">
          {Array.from({ length: weeks }, (_, i) => i + 1).map(week => {
            const record = recordOf(week);
            const status = attendanceStatus(record);
            const label = status === 'none' ? 'girilmedi' : ATTENDANCE_STATUSES[status].label.toLowerCase();
            const date = dateOf(week);
            return (
              <button
                key={week}
                type="button"
                className={`att-cell ${status}${week === currentWeek ? ' is-current' : ''}`}
                onClick={() => tap(week)}
                aria-label={`${week}. hafta: ${label}${record?.note ? `. Not: ${record.note}` : ''}${week === currentWeek ? ' (bu hafta)' : ''}`}
                title={record?.note || undefined}
              >
                <span className="state" aria-hidden="true">{STATUS_ICON[status]}</span>
                <span className="wk">{week}. hafta</span>
                {(status === 'cancelled' || status === 'noTeacher')
                  ? <span className="att-tag">{ATTENDANCE_STATUSES[status].short}</span>
                  : date && <span className="att-date">{date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>}
                {record?.note && <FileTextIcon size={12} className="note-flag" />}
              </button>
            );
          })}
        </div>
      </section>

      <Modal
        isOpen={editWeek !== null}
        onClose={() => setEditWeek(null)}
        size="sm"
        title={`${editWeek}. hafta`}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={clear}><RotateCcwIcon size={16} /> Temizle</button>
            <span className="spacer" />
            <button type="button" className="btn" onClick={() => setEditWeek(null)}>İptal</button>
            <button type="button" className="btn btn-primary" onClick={save}>Kaydet</button>
          </>
        }
      >
        <div className="form-grid">
          <div className="att-options" role="radiogroup" aria-label="Bu haftanın durumu">
            {OPTIONS.map(o => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={choice === o.id}
                className={`att-option ${o.id}`}
                onClick={() => setChoice(o.id)}
              >
                <span className="state" aria-hidden="true">{STATUS_ICON[o.id]}</span>
                <span className="grow">
                  <strong>{ATTENDANCE_STATUSES[o.id].label}</strong>
                  <small>{o.hint}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="field">
            <label className="field-label" htmlFor="absence-note">
              Not <span className="optional">(isteğe bağlı)</span>
            </label>
            <textarea
              id="absence-note"
              className="textarea"
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={choice === 'missed' ? 'Örn. Raporluydum, rapor teslim edildi' : 'Örn. Telafi dersi 20 Kasım'}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
