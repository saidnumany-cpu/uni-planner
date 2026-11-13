import React, { useState, useEffect, useRef, useCallback } from 'react';
import useNotes from '../hooks/useNotes';
import { CheckIcon, AlertCircleIcon } from '../icons/SVGIcons';

const SAVE_DELAY = 1200; // ms — yazmayı bıraktıktan sonra otomatik kayıt

/**
 * Ders notları düzenleyicisi (haftalık, otomatik kayıtlı)
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export default function WeeklyNotes({ userId, courseId, weeks, currentWeek }) {
  const { notes, saveNote, loading } = useNotes(userId, courseId);
  // Dönem başlangıcı ayarlıysa bu haftanın notuyla aç
  const [activeWeek, setActiveWeek] = useState(() => (currentWeek >= 1 && currentWeek <= weeks ? currentWeek : 1));
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

  const weekStripRef = useRef(null);
  // Seçili hafta görünür olsun (yatay kaydırmalı listede)
  useEffect(() => {
    weekStripRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activeWeek]);

  return (
    <div className="stack weekly-notes">
      <div className="scroll-row week-pills" ref={weekStripRef} role="group" aria-label="Hafta seç">
        {Array.from({ length: weeks }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            type="button"
            className={`week-pill${week === currentWeek ? ' is-current' : ''}`}
            onClick={() => handleWeekChange(week)}
            aria-pressed={activeWeek === week}
            aria-label={`${week}. hafta${weeksWithNotes.has(week) ? ', not var' : ''}${week === currentWeek ? ', bu hafta' : ''}`}
          >
            {week}
            {weeksWithNotes.has(week) && <span className="has-note" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div className="stack-sm">
        <div className="row-between">
          <label htmlFor="notes-editor" className="field-label">
            {activeWeek}. hafta notları{activeWeek === currentWeek ? ' · bu hafta' : ''}
          </label>
          <span
            className={`save-state${status === 'saved' ? ' ok' : status === 'error' ? ' err' : ''}`}
            aria-live="polite"
          >
            {status === 'pending' && <><span className="spinner spinner-sm" aria-hidden="true" /> Kaydediliyor…</>}
            {status === 'saved' && <><CheckIcon size={14} /> Kaydedildi</>}
            {status === 'error' && <><AlertCircleIcon size={14} /> Kaydedilemedi</>}
          </span>
        </div>
        <textarea
          id="notes-editor"
          className="textarea notes-editor"
          placeholder={loading ? 'Notlar yükleniyor…' : 'Derste neler işlendi? Önemli noktalar, sınav ipuçları, okuma listesi…'}
          value={content}
          onChange={handleChange}
          onBlur={flush}
          disabled={loading}
        />
        <span className="subtle text-xs">{wordCount} kelime · yazdıkça otomatik kaydedilir</span>
      </div>
    </div>
  );
}
