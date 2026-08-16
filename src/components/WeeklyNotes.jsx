import React, { useState, useEffect, useRef } from 'react';
import useNotes from '../hooks/useNotes';
import { SEMESTER_WEEKS, WEEK_LABELS } from '../utils/constants';

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

  // Hafta değiştiğinde veya veriler yüklendiğinde notu getir
  useEffect(() => {
    if (!loading) {
      const note = getNote(activeWeek);
      setContent(note ? note.content : '');
      setSaveMessage('');
    }
  }, [activeWeek, loading, getNote]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveMessage('Kaydediliyor...');
    setIsSaving(true);

    // Debounce: 2 saniye hareketsizlik sonrası kaydet
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        await saveNote(activeWeek, newContent);
        setSaveMessage('Kaydedildi ✓');
      } catch (err) {
        setSaveMessage('Kayıt hatası!');
      } finally {
        setIsSaving(false);
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
      } catch (err) {
        setSaveMessage('Kayıt hatası!');
      }
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="weekly-notes flex-col gap-md">
      {/* Hafta Seçici */}
      <div className="week-selector flex gap-sm overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        {Array.from({ length: SEMESTER_WEEKS }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            className={`glass-button flex-shrink-0 ${activeWeek === week ? 'bg-white/10 shadow-inner text-white border-white/30' : 'text-secondary'}`}
            onClick={() => setActiveWeek(week)}
            style={activeWeek === week ? { background: 'var(--glass-bg-active)' } : {}}
          >
            {week}. Hafta
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          className="glass-textarea min-h-[300px]"
          placeholder={`${activeWeek}. Hafta notlarınızı buraya yazın...`}
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
        />
        
        <div className="flex-between text-xs text-tertiary mt-2">
          <span>{wordCount} kelime</span>
          <span className={saveMessage.includes('hata') ? 'text-red-400' : 'text-emerald-400'}>
            {saveMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
