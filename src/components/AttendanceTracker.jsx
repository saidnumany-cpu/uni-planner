import React, { useState } from 'react';
import useAttendance from '../hooks/useAttendance';
import { SEMESTER_WEEKS } from '../utils/constants';

/**
 * Yoklama takibi bileşeni
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export default function AttendanceTracker({ userId, courseId }) {
  const { attendance, toggleAttendance, stats, loading } = useAttendance(userId, courseId);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [missedNote, setMissedNote] = useState('');

  const getWeekStatus = (weekNumber) => {
    const record = attendance.find(a => String(a.week) === String(weekNumber));
    if (!record) return 'unrecorded';
    return record.attended ? 'attended' : 'missed';
  };

  const getWeekNote = (weekNumber) => {
    const record = attendance.find(a => String(a.week) === String(weekNumber));
    return record?.note || '';
  };

  const handleToggle = async (weekNumber) => {
    const currentStatus = getWeekStatus(weekNumber);
    
    if (currentStatus === 'unrecorded') {
      await toggleAttendance(weekNumber, true, '');
    } else if (currentStatus === 'attended') {
      setSelectedWeek(weekNumber);
      setMissedNote('');
      setNoteModalOpen(true);
    } else {
      await toggleAttendance(weekNumber, true, '');
    }
  };

  const handleSaveMissedNote = async () => {
    if (selectedWeek) {
      await toggleAttendance(selectedWeek, false, missedNote);
    }
    setNoteModalOpen(false);
    setSelectedWeek(null);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ padding: 'var(--space-xl)' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="flex-col gap-lg">
      {/* İstatistikler */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--accent-emerald)' }}>
            {stats.attended}
          </div>
          <div className="stat-label">Katıldım</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: stats.missed > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
            {stats.missed}
          </div>
          <div className="stat-label">Devamsızlık</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{
            color: stats.percentage >= 70 ? 'var(--accent-emerald)' :
                   stats.percentage >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)'
          }}>
            {stats.attended + stats.missed > 0 ? `%${stats.percentage}` : '—'}
          </div>
          <div className="stat-label">Devam Oranı</div>
        </div>
      </div>

      {/* Yoklama Grid */}
      <div className="glass glass-card">
        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          Haftalık Yoklama Çizelgesi
        </h3>
        <p className="text-xs text-tertiary" style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          Tıklayarak değiştir: Boş → ✓ Katıldım → ✗ Devamsız → ✓ Katıldım
        </p>
        <div className="attendance-grid">
          {Array.from({ length: SEMESTER_WEEKS }, (_, i) => i + 1).map(week => {
            const status = getWeekStatus(week);
            const note = getWeekNote(week);
            
            return (
              <div key={week} className="flex-col" style={{ alignItems: 'center', gap: 'var(--space-xs)' }}>
                <button
                  className={`attendance-toggle ${status === 'attended' ? 'checked' : ''} ${status === 'missed' ? 'missed' : ''}`}
                  onClick={() => handleToggle(week)}
                  title={note || `${week}. Hafta`}
                  style={{ width: '48px', height: '48px', fontSize: status === 'unrecorded' ? '0.85rem' : '1.1rem' }}
                >
                  {status === 'attended' ? '✓' : status === 'missed' ? '✗' : week}
                </button>
                <span className="text-xs text-tertiary">{week}. Hafta</span>
                {note && (
                  <span className="text-xs" style={{ color: 'var(--accent-amber)', maxWidth: '60px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📝
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Devamsızlık Notu Modalı */}
      {noteModalOpen && (
        <div className="modal-overlay" onClick={() => setNoteModalOpen(false)}>
          <div className="modal-content glass glass-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--accent-red)', marginBottom: 'var(--space-md)' }}>
              Devamsızlık Notu
            </h3>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
              {selectedWeek}. hafta için devamsızlık nedenini not alabilirsiniz. (İsteğe bağlı)
            </p>
            <textarea
              className="glass-textarea"
              placeholder="Örn: Hastaydım..."
              value={missedNote}
              onChange={e => setMissedNote(e.target.value)}
              style={{ marginBottom: 'var(--space-md)' }}
            />
            <div className="flex" style={{ justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button className="glass-button" onClick={() => setNoteModalOpen(false)}>
                İptal
              </button>
              <button className="glass-button glass-button-danger" onClick={handleSaveMissedNote}>
                Devamsız Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
