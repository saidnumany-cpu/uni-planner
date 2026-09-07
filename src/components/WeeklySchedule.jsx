import React, { useState, useEffect } from 'react';
import { DAYS, TIME_SLOTS } from '../utils/constants';
import CourseCard from './CourseCard';
import { PlusIcon } from '../icons/SVGIcons';

/**
 * Ana haftalık program görünümü
 * @param {Array} courses - Ders listesi
 * @param {Function} onCourseClick - Derse tıklandığında çağrılacak fonksiyon
 * @param {Function} onAddCourse - Yeni ders ekleme fonksiyonu
 */
export default function WeeklySchedule({ courses = [], loading = false, onCourseClick, onAddCourse }) {
  // O anki gün (Pazartesi=1, Cuma=5)
  const currentDayIndex = new Date().getDay() - 1;
  const initialSelectedDay = currentDayIndex >= 0 && currentDayIndex <= 4 ? currentDayIndex : 0;
  
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e) => {
      if (e.matches) {
        setViewMode('day');
      } else {
        setViewMode('week');
      }
    };
    
    // Initial check
    handleMediaChange(mediaQuery);
    
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const getGridArea = (course) => {
    const dayIndex = DAYS.indexOf(course.day);
    const startIndex = TIME_SLOTS.indexOf(course.startTime);
    const endIndex = TIME_SLOTS.indexOf(course.endTime);

    const col = dayIndex !== -1 ? dayIndex + 2 : 2;
    const rowStart = startIndex !== -1 ? startIndex + 2 : 2;
    const rowEnd = endIndex !== -1 && endIndex > startIndex ? endIndex + 2 : rowStart + 1;

    return {
      gridColumn: col,
      gridRow: `${rowStart} / ${rowEnd}`
    };
  };

  const selectedDayName = DAYS[selectedDay];
  const dayCourses = courses.filter(c => c.day === selectedDayName).sort((a, b) => {
    return TIME_SLOTS.indexOf(a.startTime) - TIME_SLOTS.indexOf(b.startTime);
  });

  return (
    <div className="schedule-container relative">
      {loading ? (
        <div className="flex-center" style={{ padding: 'var(--space-2xl) 0' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          {viewMode === 'day' && (
            <div className="day-selector flex gap-sm overflow-x-auto pb-4 mb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
              </div>
              <h3>Henüz ders eklenmedi</h3>
              <p className="text-secondary">Sağ alttaki + butonuna tıklayarak ders ekleyin</p>
            </div>
          ) : viewMode === 'day' ? (
            <div className="day-view-list flex-col gap-md">
              {dayCourses.length > 0 ? (
                dayCourses.map(course => (
                  <div key={course.id} style={{ height: 'auto', minHeight: '100px' }}>
                    <CourseCard course={course} onClick={() => onCourseClick(course)} />
                  </div>
                ))
              ) : (
                <div className="text-center text-secondary py-8">Bu gün için ders bulunmuyor.</div>
              )}
            </div>
          ) : (
            <div className="schedule-grid">
              {/* Boş sol üst köşe */}
              <div className="schedule-day-header"></div>
              
              {/* Gün başlıkları */}
              {DAYS.map((day, index) => (
                <div 
                  key={day} 
                  className={`schedule-day-header glass-surface flex-center ${new Date().getDay() === index + 1 ? 'text-white border-white/40' : ''}`}
                >
                  {day}
                </div>
              ))}

              {/* Saat etiketleri ve arka plan ızgarası */}
              {TIME_SLOTS.map((time, timeIndex) => (
                <React.Fragment key={time}>
                  <div 
                    className="schedule-time-label" 
                    style={{ gridColumn: 1, gridRow: timeIndex + 2 }}
                  >
                    {time}
                  </div>
                  {/* Izgara hücreleri */}
                  {DAYS.map((day, dayIndex) => (
                    <div 
                      key={`${day}-${time}`} 
                      className="schedule-cell"
                      style={{ gridColumn: dayIndex + 2, gridRow: timeIndex + 2 }}
                    />
                  ))}
                </React.Fragment>
              ))}

              {/* Ders kartları */}
              {courses.map((course) => (
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

      {/* FAB - Floating Action Button */}
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

