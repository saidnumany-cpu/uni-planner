import { useEffect, useState } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { runInBackground, notify } from '../utils/toast';
import { DEFAULT_SEMESTER_WEEKS } from '../utils/constants';
import {
  PERIOD_KINDS, IMU_2026_27, periodKind, periodLabel, formatRange,
  currentTeachingWeek, pickPresetTerm, suggestTermName
} from '../utils/academic';
import { SunIcon, MoonIcon, MonitorIcon, LogOutIcon, MinusIcon, PlusIcon, XIcon, CalendarIcon, InboxIcon } from '../icons/SVGIcons';
import Avatar from './Avatar';

const THEMES = [
  { id: 'system', label: 'Sistem', icon: MonitorIcon },
  { id: 'light', label: 'Açık', icon: SunIcon },
  { id: 'dark', label: 'Koyu', icon: MoonIcon }
];

const newId = () => `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Akademik takvim: sınav haftaları ve tatiller */
function CalendarSection({ periods, calendarName, onChange, onApplyPreset }) {
  const [draft, setDraft] = useState({ kind: 'midterm', label: '', start: '', end: '' });
  const [adding, setAdding] = useState(false);

  const add = () => {
    if (!draft.start) return;
    const end = draft.end && draft.end >= draft.start ? draft.end : draft.start;
    onChange([...periods, { id: newId(), kind: draft.kind, label: draft.label.trim(), start: draft.start, end }]);
    setDraft({ kind: draft.kind, label: '', start: '', end: '' });
    setAdding(false);
  };

  const remove = (p) => onChange(periods.filter(x => x !== p));
  const term = pickPresetTerm(IMU_2026_27);

  return (
    <section className="field">
      <span className="field-label">Akademik takvim</span>
      <span className="field-hint" style={{ marginTop: 0 }}>
        Vize, final ve bütünleme haftaları programda ve Sınavlar sekmesinde görünür. Derssiz haftalar hafta sayımına katılmaz.
      </span>

      {periods.length > 0 ? (
        <div className="period-list">
          {periods.map(p => {
            const kind = periodKind(p);
            return (
              <div key={p.id || p.start} className="period-row">
                <span className={`badge ${kind.tone ? `badge-${kind.tone}` : ''}`}>{kind.short}</span>
                <span className="grow truncate">{periodLabel(p)}</span>
                <span className="subtle text-sm tabular">{formatRange(p.start, p.end)}</span>
                <button type="button" className="btn btn-sm btn-icon btn-ghost" onClick={() => remove(p)} aria-label={`${periodLabel(p)} kaldır`}>
                  <XIcon size={16} />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {calendarName && <span className="field-hint">Kaynak: {calendarName}</span>}

      {adding ? (
        <div className="fieldset" style={{ marginTop: 'var(--s-2)' }}>
          <div className="form-row-2">
            <div className="field">
              <label className="field-label text-xs muted" htmlFor="p-kind">Tür</label>
              <select id="p-kind" className="select" value={draft.kind} onChange={e => setDraft(d => ({ ...d, kind: e.target.value }))}>
                {Object.entries(PERIOD_KINDS).map(([id, k]) => <option key={id} value={id}>{k.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label text-xs muted" htmlFor="p-label">Ad <span className="optional">(isteğe bağlı)</span></label>
              <input id="p-label" className="input" value={draft.label} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))} placeholder={PERIOD_KINDS[draft.kind].label} />
            </div>
            <div className="field">
              <label className="field-label text-xs muted" htmlFor="p-start">Başlangıç</label>
              <input id="p-start" type="date" className="input" value={draft.start} onChange={e => setDraft(d => ({ ...d, start: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label text-xs muted" htmlFor="p-end">Bitiş</label>
              <input id="p-end" type="date" className="input" value={draft.end} min={draft.start || undefined} onChange={e => setDraft(d => ({ ...d, end: e.target.value }))} />
            </div>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-sm" onClick={() => setAdding(false)}>Vazgeç</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={add} disabled={!draft.start}>Ekle</button>
          </div>
        </div>
      ) : (
        <div className="row" style={{ flexWrap: 'wrap', marginTop: 'var(--s-2)' }}>
          <button type="button" className="btn btn-sm" onClick={() => setAdding(true)}>
            <PlusIcon size={16} /> Dönem ekle
          </button>
          <button type="button" className="btn btn-sm" onClick={onApplyPreset} title={`${term.name}: dersler ${formatRange(term.start, term.start, true)} başlıyor`}>
            <CalendarIcon size={16} /> {IMU_2026_27.name} takvimini yükle
          </button>
        </div>
      )}
    </section>
  );
}

/** Ayarlar: tema, dönem, akademik takvim, arşiv, hesap */
export default function SettingsModal({ isOpen, onClose, activeCourseCount = 0, onArchiveTerm }) {
  const { theme, setTheme, semesterStart, weeks, periods, calendarName, updateSettings } = useSettings();
  const { user, signOut } = useAuth();
  const [start, setStart] = useState('');
  const [weekCount, setWeekCount] = useState(DEFAULT_SEMESTER_WEEKS);
  const [termName, setTermName] = useState('');
  const [confirmArchive, setConfirmArchive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStart(semesterStart || '');
    setWeekCount(weeks);
    setTermName(suggestTermName(semesterStart));
    setConfirmArchive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const dirty = start !== (semesterStart || '') || weekCount !== weeks;
  const preview = start ? currentTeachingWeek(start, weekCount, periods) : null;

  const save = () => {
    runInBackground(updateSettings({ semesterStart: start, weeks: weekCount }), 'Ayarlar kaydedilemedi');
    notify('Dönem ayarları kaydedildi', 'success');
    onClose();
  };

  const setPeriods = (list) => {
    runInBackground(updateSettings({ academicCalendar: list }), 'Takvim kaydedilemedi');
  };

  const applyPreset = () => {
    const term = pickPresetTerm(IMU_2026_27);
    runInBackground(updateSettings({
      // Kullanıcının kendi eklediği dönemler (tatil vb.) korunur
      academicCalendar: [...periods.filter(p => !String(p.id || '').startsWith('imu-')), ...IMU_2026_27.periods],
      calendarName: IMU_2026_27.name,
      semesterStart: term.start,
      weeks: term.weeks
    }), 'Takvim kaydedilemedi');
    setStart(term.start);
    setWeekCount(term.weeks);
    notify(`${term.name} takvimi yüklendi`, 'success');
  };

  const archive = () => {
    setConfirmArchive(false);
    onArchiveTerm?.(termName.trim() || suggestTermName(semesterStart));
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Ayarlar"
        footer={
          <>
            <span className="spacer" />
            <button type="button" className="btn" onClick={onClose}>Kapat</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty}>Kaydet</button>
          </>
        }
      >
        <div className="form-grid" style={{ gap: 'var(--s-6)' }}>
          <section className="field">
            <span className="field-label" id="theme-label">Görünüm</span>
            <div className="segmented" role="radiogroup" aria-labelledby="theme-label">
              {THEMES.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)}>
                    <Icon size={16} /> {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="form-grid">
            <div className="field">
              <label className="field-label" htmlFor="semester-start">Dönem başlangıcı</label>
              <input id="semester-start" type="date" className="input" value={start} onChange={e => setStart(e.target.value)} />
              <span className="field-hint">
                {start
                  ? preview === 0 ? 'Dönem henüz başlamadı.'
                    : preview > weekCount ? 'Bu dönem tamamlanmış görünüyor.'
                    : `Bugün dönemin ${preview}. ders haftası. Notlar ve yoklama bu haftayla açılır.`
                  : 'Girersen bulunduğun hafta otomatik işaretlenir.'}
              </span>
            </div>

            <div className="field">
              <span className="field-label" id="weeks-label">Dönem kaç ders haftası?</span>
              <div className="stepper" role="group" aria-labelledby="weeks-label">
                <button type="button" onClick={() => setWeekCount(w => Math.max(1, w - 1))} disabled={weekCount <= 1} aria-label="Azalt"><MinusIcon size={18} /></button>
                <output aria-live="polite">{weekCount}</output>
                <button type="button" onClick={() => setWeekCount(w => Math.min(30, w + 1))} disabled={weekCount >= 30} aria-label="Artır"><PlusIcon size={18} /></button>
              </div>
            </div>
          </section>

          <CalendarSection periods={periods} calendarName={calendarName} onChange={setPeriods} onApplyPreset={applyPreset} />

          <section className="field">
            <span className="field-label">Dönemi arşivle</span>
            <span className="field-hint" style={{ marginTop: 0 }}>
              Dönem bitince şu anki {activeCourseCount} dersi notları, ödevleri ve yoklamasıyla birlikte arşive taşı.
              Özet → Geçmiş dönemler'den istediğin zaman açabilirsin.
            </span>
            <div className="row" style={{ marginTop: 'var(--s-2)' }}>
              <input
                className="input grow"
                aria-label="Arşiv dönem adı"
                value={termName}
                onChange={e => setTermName(e.target.value)}
                placeholder="Örn. 2026–2027 Güz"
              />
              <button type="button" className="btn" onClick={() => setConfirmArchive(true)} disabled={!activeCourseCount}>
                <InboxIcon size={16} /> Arşivle
              </button>
            </div>
          </section>

          {user && (
            <section className="field">
              <span className="field-label">Hesap</span>
              <div className="row" style={{ gap: 'var(--s-3)' }}>
                <Avatar user={user} />
                <div className="grow">
                  <div className="truncate" style={{ fontWeight: 600 }}>{user.displayName || 'Kullanıcı'}</div>
                  <div className="subtle text-sm truncate">{user.email}</div>
                </div>
                <button type="button" className="btn btn-sm" onClick={() => { onClose(); signOut().catch(() => notify('Çıkış yapılamadı', 'error')); }}>
                  <LogOutIcon size={16} /> Çıkış
                </button>
              </div>
            </section>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmArchive}
        onConfirm={archive}
        onCancel={() => setConfirmArchive(false)}
        title="Dönem arşivlensin mi?"
        message={`${activeCourseCount} ders "${termName.trim() || suggestTermName(semesterStart)}" adıyla arşive taşınacak. Program boşalır; yeni dönemin derslerini ve başlangıç tarihini girebilirsin. İstersen dersleri sonra arşivden geri çıkarabilirsin.`}
        confirmText="Arşivle"
        variant="primary"
      />
    </>
  );
}
