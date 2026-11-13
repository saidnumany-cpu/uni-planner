import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { runInBackground, notify } from '../utils/toast';
import { getCurrentWeek } from '../utils/helpers';
import { DEFAULT_SEMESTER_WEEKS } from '../utils/constants';
import { SunIcon, MoonIcon, MonitorIcon, LogOutIcon, MinusIcon, PlusIcon } from '../icons/SVGIcons';
import Avatar from './Avatar';

const THEMES = [
  { id: 'system', label: 'Sistem', icon: MonitorIcon },
  { id: 'light', label: 'Açık', icon: SunIcon },
  { id: 'dark', label: 'Koyu', icon: MoonIcon }
];

/** Ayarlar: tema, dönem başlangıcı, hafta sayısı, hesap */
export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme, semesterStart, weeks, updateSettings } = useSettings();
  const { user, signOut } = useAuth();
  const [start, setStart] = useState('');
  const [weekCount, setWeekCount] = useState(DEFAULT_SEMESTER_WEEKS);

  useEffect(() => {
    if (!isOpen) return;
    setStart(semesterStart || '');
    setWeekCount(weeks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const dirty = start !== (semesterStart || '') || weekCount !== weeks;
  const preview = start ? getCurrentWeek(start, weekCount) : null;

  const save = () => {
    runInBackground(updateSettings({ semesterStart: start, weeks: weekCount }), 'Ayarlar kaydedilemedi');
    notify('Dönem ayarları kaydedildi', 'success');
    onClose();
  };

  return (
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
                  : `Bugün dönemin ${preview}. haftası. Notlar ve yoklama bu haftayla açılır.`
                : 'Girersen bulunduğun hafta otomatik işaretlenir.'}
            </span>
          </div>

          <div className="field">
            <span className="field-label" id="weeks-label">Dönem kaç hafta?</span>
            <div className="stepper" role="group" aria-labelledby="weeks-label">
              <button type="button" onClick={() => setWeekCount(w => Math.max(1, w - 1))} disabled={weekCount <= 1} aria-label="Azalt"><MinusIcon size={18} /></button>
              <output aria-live="polite">{weekCount}</output>
              <button type="button" onClick={() => setWeekCount(w => Math.min(30, w + 1))} disabled={weekCount >= 30} aria-label="Artır"><PlusIcon size={18} /></button>
            </div>
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
  );
}
