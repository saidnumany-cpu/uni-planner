import React, { useState, useEffect, useRef } from 'react';
import useNotes from '../hooks/useNotes';
import { SEMESTER_WEEKS } from '../utils/constants';
import { SaveIcon } from '../icons/SVGIcons';

/**
 * Ders notları düzenleyicisi
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export default function WeeklyNotes({ userId, courseId }) {
  const { getNote, saveNote, loading } = useNotes(userId, courseId);
  const [activeWeek, setActiveWeek] = useState(1);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  // Hafta değiştiğinde veya veriler yüklendiğinde notu getir
  useEffect(() => {
    if (!loading) {
      const note = getNote(activeWeek);
      setContent(note ? note.content : '');
      setSaveMessage('');
    }
  }, [activeWeek, loading, getNote]);

  // Bileşen kapanırken (örn. başka bir sekmeye geçilirken) bekleyen kaydı hemen gönder
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        if (pendingRef.current) {
          const { week, value } = pendingRef.current;
          saveNote(week, value).catch(() => {});
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveMessage('Kaydediliyor...');
    setIsSaving(true);
    pendingRef.current = { week: activeWeek, value: newContent };

    // Debounce: 2 saniye hareketsizlik sonrası kaydet
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        await saveNote(activeWeek, newContent);
        setSaveMessage('Kaydedildi ✓');
      } catch (err) {
        console.error('Not kaydetme hatası:', err);
        setSaveMessage('Kayıt hatası!');
      } finally {
        setIsSaving(false);
        pendingRef.current = null;
      }
    }, 2000);
  };

  const handleBlur = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isSaving) {
      try {
        await saveNote(activeWeek, content);
        setSaveMessage('Kaydedildi ✓');
        setIsSaving(false);
        pendingRef.current = null;
      } catch (err) {
        console.error('Not kaydetme hatası:', err);
        setSaveMessage('Kayıt hatası!');
      }
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="weekly-notes flex-col gap-md">
      {/* Hafta Seçici */}
      <div className="week-selector flex gap-sm pb-2" style={{ flexWrap: 'wrap' }}>
        {Array.from({ length: SEMESTER_WEEKS }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            className={`glass-button ${activeWeek === week ? 'bg-white/10 shadow-inner text-white border-white/30' : 'text-secondary'}`}
            onClick={() => setActiveWeek(week)}
            style={{ ...(activeWeek === week ? { background: 'var(--glass-bg-active)' } : {}), minHeight: '44px', padding: '0 12px' }}
          >
            {week}. Hafta
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <div className="flex-between text-xs text-tertiary mb-2">
          <span>{wordCount} kelime</span>
          <span className={`flex items-center gap-1 ${saveMessage.includes('hata') ? 'text-red-400' : 'text-emerald-400'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {saveMessage && <SaveIcon size={14} />}
            {saveMessage}
          </span>
        </div>
        
        <textarea
          className="glass-textarea min-h-[300px]"
          placeholder={`${activeWeek}. Hafta notlarınızı buraya yazın...`}
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          style={{ width: '100%', minHeight: '300px' }}
        />
      </div>
    </div>
  );
}
