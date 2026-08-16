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

  const handleToggle = async (weekNumber) => {
    const currentStatus = getWeekStatus(weekNumber);
    
    if (currentStatus === 'unrecorded') {
      // Katıldı olarak işaretle
      await toggleAttendance(weekNumber, true, '');
    } else if (currentStatus === 'attended') {
      // Devamsız olarak işaretle, not ekleme modalını aç
      setSelectedWeek(weekNumber);
      setMissedNote('');
      setNoteModalOpen(true);
    } else {
      // Sıfırla (Yoklama kaydını temizle) -> Firestore'da alanları silmek yerine attended'i silebiliriz veya yeni bir duruma geçebiliriz
      // Ancak useAttendance hook'umuzda silme yok, şimdilik unrecorded'a dönmek için belki dokümanı silmek gerekir.
      // Ya da attended: null verebiliriz. Biz şimdilik unrecorded'a geçmek için varsayılan olarak tekrar katıldıya döndürebilir veya null diyebiliriz.
      // Hook setDoc ile merge: true yapıyor. Yani document silinmez. Biz basitleştirmek adına attended: true'ye geri döndürebiliriz.
      // Hook kısıtlaması nedeniyle: unrecorded -> attended -> missed -> attended şeklinde dönsün.
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

  if (loading) return <div className="text-center text-secondary p-4">Yükleniyor...</div>;

  return (
    <div className="attendance-tracker flex-col gap-lg">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-sm">
        <div className="glass-card text-center p-3 rounded-xl flex-col flex-center">
          <div className="text-sm text-secondary mb-1">Katıldım</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.attended}</div>
        </div>
        <div className="glass-card text-center p-3 rounded-xl flex-col flex-center">
          <div className="text-sm text-secondary mb-1">Devamsız</div>
          <div className="text-2xl font-bold text-red-400">{stats.missed}</div>
        </div>
        <div className="glass-card text-center p-3 rounded-xl flex-col flex-center">
          <div className="text-sm text-secondary mb-1">Devam Oranı</div>
          <div className={`text-2xl font-bold ${stats.percentage >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
            %{stats.percentage}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="glass p-4 rounded-xl">
        <h3 className="mb-4 text-center">Haftalık Yoklama Çizelgesi</h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-4 justify-items-center">
          {Array.from({ length: SEMESTER_WEEKS }, (_, i) => i + 1).map(week => {
            const status = getWeekStatus(week);
            const record = attendance.find(a => String(a.week) === String(week));
            
            return (
              <div key={week} className="flex-col flex-center gap-2">
                <button
                  className={`attendance-toggle flex-center text-lg w-12 h-12 ${status === 'attended' ? 'checked' : ''} ${status === 'missed' ? 'missed' : ''}`}
                  onClick={() => handleToggle(week)}
                  title={record?.note || `${week}. Hafta`}
                >
                  {status === 'attended' ? '✓' : status === 'missed' ? '✗' : week}
                </button>
                <span className="text-xs text-tertiary">{week}. Hafta</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note Modal */}
      {noteModalOpen && (
        <div className="modal-overlay" onClick={() => setNoteModalOpen(false)}>
          <div className="modal-content glass-card glass" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-red-400">Devamsızlık Notu Ekleyin</h3>
            <p className="text-sm text-secondary mb-4">
              {selectedWeek}. hafta için devamsızlık nedenini not alabilirsiniz. (İsteğe bağlı)
            </p>
            <textarea
              className="glass-textarea mb-4"
              placeholder="Örn: Hastaydım..."
              value={missedNote}
              onChange={e => setMissedNote(e.target.value)}
            />
            <div className="flex justify-end gap-sm">
              <button className="glass-button" onClick={() => setNoteModalOpen(false)}>
                İptal
              </button>
              <button className="glass-button-danger px-4 rounded-lg" onClick={handleSaveMissedNote}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
