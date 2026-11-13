import React, { useState, useEffect, useRef, useCallback } from 'react';
import useNotes from '../hooks/useNotes';
import { SEMESTER_WEEKS } from '../utils/constants';
import { SaveIcon } from '../icons/SVGIcons';

const SAVE_DELAY = 1200; // ms — yazmayı bıraktıktan sonra otomatik kayıt

/**
 * Ders notları düzenleyicisi (haftalık, otomatik kayıtlı)
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export default function WeeklyNotes({ userId, courseId }) {
  const { notes, saveNote, loading } = useNotes(userId, courseId);
  const [activeWeek, setActiveWeek] = useState(1);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(''); // '' | 'pending' | 'saved' | 'error'

  const timerRef = useRef(null);
  const pendingRef = useRef(null);   // { week, value } — henüz kaydedilmemiş içerik
  const loadedWeekRef = useRef(null); // textarea'ya en son hangi haftanın notu yüklendi
  const saveNoteRef = useRef(saveNote);
  saveNoteRef.current = saveNote;

  /** Bekleyen değişikliği hemen kaydeder */
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    // Firestore yerel önbelleğe anında yazar; sunucu onayını beklemiyoruz
    saveNoteRef.current(pending.week, pending.value).catch((err) => {
      console.error('Not kaydetme hatası:', err);
      setStatus('error');
    });
    setStatus('saved');
  }, []);

  // Notu yalnızca hafta değiştiğinde (veya ilk yüklemede) textarea'ya aktar.
  // Firestore'dan gelen her güncellemede içeriği ezmeyelim — aksi halde
  // yazarken metin geri sarılıyordu.
  useEffect(() => {
    if (loading) return;
    if (loadedWeekRef.current === activeWeek) return;
    const note = notes.find(n => String(n.week) === String(activeWeek));
    setContent(note?.content || '');
    setStatus('');
    loadedWeekRef.current = activeWeek;
  }, [activeWeek, loading, notes]);

  // Ders değişirse baştan yükle
  useEffect(() => {
    loadedWeekRef.current = null;
  }, [courseId]);

  // Bileşen kapanırken (sekme değişimi, geri tuşu) bekleyen kaydı gönder
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      flush();
    };
  }, [flush]);

  const handleWeekChange = (week) => {
    if (week === activeWeek) return;
    flush();
    setActiveWeek(week);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    setStatus('pending');
    pendingRef.current = { week: activeWeek, value };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, SAVE_DELAY);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const weeksWithNotes = new Set(
    notes.filter(n => n.content && n.content.trim()).map(n => Number(n.week))
  );

  const statusText = {
    pending: 'Kaydediliyor...',
    saved: 'Kaydedildi ✓',
    error: 'Kayıt hatası!'
  }[status] || '';

  return (
    <div className="weekly-notes flex-col gap-md">
      {/* Hafta Seçici */}
      <div className="week-selector flex gap-sm pb-2" style={{ flexWrap: 'wrap' }}>
        {Array.from({ length: SEMESTER_WEEKS }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            className={`glass-button ${activeWeek === week ? 'text-white' : 'text-secondary'}`}
            onClick={() => handleWeekChange(week)}
            aria-pressed={activeWeek === week}
            style={{
              ...(activeWeek === week ? { background: 'var(--glass-bg-active)' } : {}),
              minHeight: '44px',
              padding: '0 12px',
              position: 'relative'
            }}
          >
            {week}. Hafta
            {weeksWithNotes.has(week) && (
              <span
                aria-label="not var"
                style={{
                  position: 'absolute', top: 6, right: 6, width: 6, height: 6,
                  borderRadius: '50%', background: 'var(--accent-emerald)'
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <div className="flex-between text-xs text-tertiary mb-2">
          <span>{wordCount} kelime</span>
          <span
            className={status === 'error' ? 'text-red-400' : 'text-emerald-400'}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {statusText && <SaveIcon size={14} />}
            {statusText}
          </span>
        </div>

        <textarea
          className="glass-textarea"
          placeholder={loading ? 'Notlar yükleniyor...' : `${activeWeek}. Hafta notlarınızı buraya yazın...`}
          value={content}
          onChange={handleChange}
          onBlur={flush}
          disabled={loading}
          aria-label={`${activeWeek}. hafta notları`}
          style={{ width: '100%', minHeight: '300px' }}
        />
      </div>
    </div>
  );
}
