import React from 'react';
import { DAYS, TIME_SLOTS } from '../utils/constants';
import CourseCard from './CourseCard';

/**
 * Ana haftalık program görünümü
 * @param {Array} courses - Ders listesi
 * @param {Function} onCourseClick - Derse tıklandığında çağrılacak fonksiyon
 * @param {Function} onAddCourse - Yeni ders ekleme fonksiyonu
 */
export default function WeeklySchedule({ courses = [], onCourseClick, onAddCourse }) {
  // O anki gün (Pazartesi=1, Cuma=5)
  const currentDay = new Date().getDay();

  const getGridArea = (course) => {
    const dayIndex = DAYS.indexOf(course.day);
    const startIndex = TIME_SLOTS.indexOf(course.startTime);
    const endIndex = TIME_SLOTS.indexOf(course.endTime);

    if (dayIndex === -1 || startIndex === -1 || endIndex === -1) return {};

    const col = dayIndex + 2;
    const rowStart = startIndex + 2;
    const rowEnd = endIndex > startIndex ? endIndex + 2 : startIndex + 3;

    return {
      gridColumn: col,
      gridRow: `${rowStart} / ${rowEnd}`
    };
  };

  return (
    <div className="schedule-container relative">
      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="text-4xl mb-4">📚</div>
          <h3>Henüz ders eklenmedi</h3>
          <p className="text-secondary">Sağ alttaki + butonuna tıklayarak ders ekleyin</p>
        </div>
      ) : (
        <div className="schedule-grid">
          {/* Boş sol üst köşe */}
          <div className="schedule-day-header"></div>
          
          {/* Gün başlıkları */}
          {DAYS.map((day, index) => (
            <div 
              key={day} 
              className={`schedule-day-header glass-surface flex-center ${currentDay === index + 1 ? 'text-white border-white/40' : ''}`}
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
            <button
              key={course.id}
              type="button"
              className="schedule-course"
              style={{ ...getGridArea(course), textAlign: 'left', border: 'none', padding: 0, background: 'transparent' }}
              onClick={() => onCourseClick(course)}
              aria-label={`${course.name} dersini görüntüle`}
            >
              <CourseCard course={course} />
            </button>
          ))}
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <button 
        className="glass-button-primary glass-button-icon flex-center shadow-lg"
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          fontSize: '24px',
          zIndex: 50,
          boxShadow: '0 6px 24px rgba(124, 58, 237, 0.4)'
        }}
        onClick={onAddCourse}
      >
        +
      </button>
    </div>
  );
}
