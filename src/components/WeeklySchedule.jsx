import React, { useState, useEffect } from 'react';
import { DAYS, TIME_SLOTS, isFullHour } from '../utils/constants';
import CourseCard from './CourseCard';
import { PlusIcon } from '../icons/SVGIcons';

// Her slot 15 dakika. Piksel başına 1px = 15 dk baz alındı.
// Daha okunaklı bir grid için: 1 slot = 16px → 1 saat = 64px
const SLOT_HEIGHT = 16; // px per 15-min slot

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
    const startIndex = TIME_SLOTS.indexOf(course.startTime);
    const endIndex = TIME_SLOTS.indexOf(course.endTime);

    const col = dayIndex !== -1 ? dayIndex + 2 : 2;
    const rowStart = startIndex !== -1 ? startIndex + 2 : 2;
    // endTime bulunamazsa varsayılan 4 slot (1 saat)
    const rowEnd = endIndex !== -1 && endIndex > startIndex ? endIndex + 2 : rowStart + 4;

    return {
      gridColumn: col,
      gridRow: `${rowStart} / ${rowEnd}`
    };
  };

  const selectedDayName = DAYS[selectedDay];
  const dayCourses = courses
    .filter(c => c.day === selectedDayName)
    .sort((a, b) => TIME_SLOTS.indexOf(a.startTime) - TIME_SLOTS.indexOf(b.startTime));

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
                  className={`glass-button flex-shrink-0 ${selectedDay === idx ? 'bg-white/10 shadow-inner text-white border-white/30' : 'text-secondary'}`}
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
                  className={`schedule-day-header glass-surface flex-center ${new Date().getDay() === index + 1 ? 'text-white border-white/40' : ''}`}
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
                  style={{ ...getGridArea(course) }}
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
