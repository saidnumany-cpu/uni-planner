import { useState } from 'react';
import Modal from './Modal';
import { getAbsenceLimit } from '../utils/course';
import { CheckIcon, XIcon, FileTextIcon, AlertTriangleIcon } from '../icons/SVGIcons';

const statusOf = (record) => {
  if (!record || record.attended === null || record.attended === undefined) return 'none';
  return record.attended ? 'attended' : 'missed';
};

/** Devamsızlık hakkı özeti için renk ve metin */
export const absenceSummary = (missed, limit) => {
  const left = limit - missed;
  if (limit <= 0) return { tone: '', text: 'Devamsızlık sınırı tanımlı değil' };
  if (left < 0) return { tone: 'danger', text: `Sınır ${Math.abs(left)} hafta aşıldı` };
  if (left === 0) return { tone: 'danger', text: 'Devamsızlık hakkın doldu' };
  if (left === 1) return { tone: 'warning', text: 'Son 1 devamsızlık hakkın kaldı' };
  return { tone: 'success', text: `${left} devamsızlık hakkın var` };
};

/**
 * Haftalık yoklama: her hafta için Boş → Katıldım → Gelmedim → Boş döngüsü.
 * "Gelmedim" seçilince isteğe bağlı not sorulur.
 */
export default function AttendanceTracker({ course, records, stats, weeks, currentWeek, onSet }) {
  const [noteFor, setNoteFor] = useState(null); // hafta numarası
  const [note, setNote] = useState('');
  const limit = getAbsenceLimit(course);
  const summary = absenceSummary(stats.missed, limit);

  const recordOf = (week) => records.find(r => String(r.week) === String(week));

  const cycle = (week) => {
    const status = statusOf(recordOf(week));
    if (status === 'none') onSet(week, true, '');
    else if (status === 'attended') { setNote(recordOf(week)?.note || ''); setNoteFor(week); }
    else onSet(week, null, '');
  };

  const saveMissed = () => {
    onSet(noteFor, false, note.trim());
    setNoteFor(null);
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
        <p className={`meta`}>{summary.text}{limit > 0 ? ` (sınır ${limit} hafta)` : ''}</p>
      )}

      <section className="card card-tight">
        <div className="card-header" style={{ flexWrap: 'wrap' }}>
          <h3>Haftalar</h3>
          <div className="legend">
            <span><i style={{ background: 'var(--success-solid)' }} />Katıldım</span>
            <span><i style={{ background: 'var(--danger-solid)' }} />Gelmedim</span>
            <span><i style={{ border: '2px dashed var(--border-strong)' }} />Girilmedi</span>
          </div>
        </div>
        <p className="subtle text-sm" style={{ marginBottom: 'var(--s-3)' }}>
          Bir haftaya dokun: boş → katıldım → gelmedim → boş
        </p>
        <div className="attendance-grid">
          {Array.from({ length: weeks }, (_, i) => i + 1).map(week => {
            const record = recordOf(week);
            const status = statusOf(record);
            const label = status === 'attended' ? 'katıldım' : status === 'missed' ? 'gelmedim' : 'girilmedi';
            return (
              <button
                key={week}
                type="button"
                className={`att-cell ${status}${week === currentWeek ? ' is-current' : ''}`}
                onClick={() => cycle(week)}
                aria-label={`${week}. hafta: ${label}${record?.note ? `. Not: ${record.note}` : ''}${week === currentWeek ? ' (bu hafta)' : ''}`}
                title={record?.note || undefined}
              >
                <span className="state" aria-hidden="true">
                  {status === 'attended' && <CheckIcon size={16} strokeWidth={3} />}
                  {status === 'missed' && <XIcon size={16} strokeWidth={3} />}
                </span>
                <span className="wk">{week}. hafta</span>
                {record?.note && <FileTextIcon size={12} className="note-flag" />}
              </button>
            );
          })}
        </div>
      </section>

      <Modal
        isOpen={noteFor !== null}
        onClose={() => setNoteFor(null)}
        size="sm"
        title={`${noteFor}. hafta — gelmedim`}
        footer={
          <>
            <span className="spacer" />
            <button type="button" className="btn" onClick={() => setNoteFor(null)}>İptal</button>
            <button type="button" className="btn btn-danger" onClick={saveMissed}>Kaydet</button>
          </>
        }
      >
        <div className="field">
          <label className="field-label" htmlFor="absence-note">
            Not <span className="optional">(isteğe bağlı)</span>
          </label>
          <textarea
            id="absence-note"
            className="textarea"
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Örn. Raporluydum, rapor teslim edildi"
            data-autofocus
          />
        </div>
      </Modal>
    </div>
  );
}
