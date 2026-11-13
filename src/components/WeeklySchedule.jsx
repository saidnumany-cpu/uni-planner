import React, { useState, useEffect } from 'react';
import { DAYS, TIME_SLOTS, isFullHour } from '../utils/constants';
import CourseCard from './CourseCard';
import { PlusIcon } from '../icons/SVGIcons';

// Her slot 15 dakika. Piksel başına 1px = 15 dk baz alındı.
// Daha okunaklı bir grid için: 1 slot = 16px → 1 saat = 64px
const SLOT_HEIGHT = 16; // px per 15-min slot

const toMinutes = (time) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(time || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const GRID_START_MIN = toMinutes(TIME_SLOTS[0]);

/**
 * Ana haftalık program görünümü
 */
export default function WeeklySchedule({ courses = [], loading = false, onCourseClick, onAddCourse }) {
  const currentDayIndex = new Date().getDay() - 1;
  const initialSelectedDay = currentDayIndex >= 0 && currentDayIndex <= 4 ? currentDayIndex : 0;

  const [viewMode, setViewMode] = useState('week');
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e) => {
      setViewMode(e.matches ? 'day' : 'week');
    };
    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  /**
   * Dersin grid pozisyonunu hesaplar (15 dk'lık grid satırları)
   * rowStart 2'den başlar (ilk satır = başlık)
   */
  const getGridArea = (course) => {
    const dayIndex = DAYS.indexOf(course.day);
    // Saati dakikaya çevirip en yakın 15 dk'lık satıra yerleştir.
    // (indexOf kullanılınca 09:10 gibi listede olmayan saatler en üste kayıyordu.)
    const lastRow = TIME_SLOTS.length + 2;
    const toRow = (time, roundUp) => {
      const mins = toMinutes(time);
      if (mins === null) return null;
      const slot = (mins - GRID_START_MIN) / 15;
      const idx = roundUp ? Math.ceil(slot) : Math.floor(slot);
      return Math.min(Math.max(idx + 2, 2), lastRow);
    };

    const col = dayIndex !== -1 ? dayIndex + 2 : 2;
    const rowStart = Math.min(toRow(course.startTime, false) ?? 2, lastRow - 1);
    const endRow = toRow(course.endTime, true);
    // endTime yoksa / hatalıysa varsayılan 4 slot (1 saat)
    const rowEnd = endRow && endRow > rowStart ? endRow : Math.min(rowStart + 4, lastRow);

    return {
      gridColumn: col,
      gridRow: `${rowStart} / ${rowEnd}`
    };
  };

  /**
   * Aynı gün çakışan dersleri yan yana sıralamak için şerit (lane) hesabı.
   * Dönüş: { [courseId]: { lane, lanes } }
   */
  const layout = {};
  DAYS.forEach(day => {
    const list = courses
      .filter(c => c.day === day)
      .map(c => {
        const start = toMinutes(c.startTime) ?? 0;
        const end = toMinutes(c.endTime);
        return { id: c.id, start, end: end && end > start ? end : start + 60 };
      })
      .sort((a, b) => a.start - b.start || a.end - b.end);

    let group = [];
    let groupEnd = -1;
    const closeGroup = () => {
      const lanes = Math.max(1, ...group.map(g => g.lane + 1));
      group.forEach(g => { layout[g.id] = { lane: g.lane, lanes }; });
      group = [];
    };
    list.forEach(item => {
      if (group.length && item.start >= groupEnd) closeGroup();
      const laneEnds = [];
      group.forEach(g => { laneEnds[g.lane] = Math.max(laneEnds[g.lane] ?? 0, g.end); });
      let lane = laneEnds.findIndex(e => e <= item.start);
      if (lane === -1) lane = laneEnds.length;
      group.push({ ...item, lane });
      groupEnd = Math.max(groupEnd, item.end);
    });
    if (group.length) closeGroup();
  });

  const selectedDayName = DAYS[selectedDay];
  const dayCourses = courses
    .filter(c => c.day === selectedDayName)
    .sort((a, b) => (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0));

  return (
    <div className="schedule-container relative">
      {loading ? (
        <div className="flex-center" style={{ padding: 'var(--space-2xl) 0' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          {viewMode === 'day' && (
            <div
              className="day-selector flex gap-sm overflow-x-auto pb-4 mb-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  className={`glass-button flex-shrink-0 ${selectedDay === idx ? 'text-white' : 'text-secondary'}`}
                  aria-pressed={selectedDay === idx}
                  onClick={() => setSelectedDay(idx)}
                  style={selectedDay === idx ? { background: 'var(--glass-bg-active)' } : {}}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="text-4xl mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <h3>Henüz ders eklenmedi</h3>
              <p className="text-secondary">Sağ alttaki + butonuna tıklayarak ders ekleyin</p>
            </div>
          ) : viewMode === 'day' ? (
            <div className="day-view-list flex-col gap-md">
              {dayCourses.length > 0 ? (
                dayCourses.map(course => (
                  <div key={course.id} style={{ height: 'auto', minHeight: '80px' }}>
                    <CourseCard course={course} onClick={() => onCourseClick(course)} />
                  </div>
                ))
              ) : (
                <div className="text-center text-secondary py-8">Bu gün için ders bulunmuyor.</div>
              )}
            </div>
          ) : (
            /* ─── Haftalık Grid ─── */
            <div
              className="schedule-grid"
              style={{
                // Her TIME_SLOT satırı SLOT_HEIGHT px
                gridTemplateRows: `auto repeat(${TIME_SLOTS.length}, ${SLOT_HEIGHT}px)`
              }}
            >
              {/* Sol üst boş köşe */}
              <div className="schedule-day-header" style={{ gridColumn: 1, gridRow: 1 }} />

              {/* Gün başlıkları */}
              {DAYS.map((day, index) => (
                <div
                  key={day}
                  className={`schedule-day-header glass-surface flex-center ${new Date().getDay() === index + 1 ? 'text-white' : ''}`}
                  style={{ gridColumn: index + 2, gridRow: 1 }}
                >
                  {day}
                </div>
              ))}

              {/* Saat etiketleri + ızgara hücreleri */}
              {TIME_SLOTS.map((time, timeIndex) => {
                const fullHour = isFullHour(time);
                return (
                  <React.Fragment key={time}>
                    {/* Saat etiketi — sadece tam saatlerde */}
                    <div
                      className="schedule-time-label"
                      style={{
                        gridColumn: 1,
                        gridRow: timeIndex + 2,
                        opacity: fullHour ? 1 : 0,
                        fontSize: '0.75rem',
                        // Tam saatlerde üst sınır belirgin
                        borderTop: fullHour ? '1px solid rgba(255,255,255,0.12)' : undefined
                      }}
                    >
                      {fullHour ? time : ''}
                    </div>

                    {/* Izgara hücreleri — tam saatte daha belirgin çizgi */}
                    {DAYS.map((day, dayIndex) => (
                      <div
                        key={`${day}-${time}`}
                        className="schedule-cell"
                        style={{
                          gridColumn: dayIndex + 2,
                          gridRow: timeIndex + 2,
                          borderTop: fullHour
                            ? '1px solid rgba(255,255,255,0.1)'
                            : '1px solid rgba(255,255,255,0.03)',
                          minHeight: `${SLOT_HEIGHT}px`
                        }}
                      />
                    ))}
                  </React.Fragment>
                );
              })}

              {/* Ders kartları */}
              {courses.map(course => (
                <div
                  key={course.id}
                  className="schedule-course"
                  style={{
                    ...getGridArea(course),
                    ...(layout[course.id]?.lanes > 1 ? {
                      width: `calc(${100 / layout[course.id].lanes}% - 2px)`,
                      marginLeft: `${(100 / layout[course.id].lanes) * layout[course.id].lane}%`
                    } : {})
                  }}
                >
                  <CourseCard course={course} onClick={() => onCourseClick(course)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <button
        className="glass-button-primary glass-button-icon flex-center shadow-lg"
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom) + 16px)',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          zIndex: 50,
          boxShadow: '0 6px 24px rgba(124, 58, 237, 0.4)'
        }}
        onClick={onAddCourse}
        aria-label="Ders Ekle"
      >
        <PlusIcon size={24} />
      </button>
    </div>
  );
}
