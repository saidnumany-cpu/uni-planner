import { useMemo } from 'react';
import WeeklySchedule, { AgendaList } from './WeeklySchedule';
import { flattenSessions, todayIndex } from '../utils/course';
import { getDueDateStatus } from '../utils/helpers';
import { useSettings } from '../contexts/SettingsContext';
import useMediaQuery from '../hooks/useMediaQuery';
import useNow from '../hooks/useNow';
import { DAYS } from '../utils/constants';
import { ChevronRightIcon, PlusIcon, CalendarIcon, CheckCircleIcon } from '../icons/SVGIcons';

export function WeekBadge({ onOpenSettings }) {
  const { currentWeek, weeks, semesterStart } = useSettings();
  if (!semesterStart) {
    return (
      <button type="button" className="chip" onClick={onOpenSettings}>
        <CalendarIcon size={16} /> Dönem başlangıcını ayarla
      </button>
    );
  }
  if (currentWeek === 0) return <span className="badge">Dönem henüz başlamadı</span>;
  if (currentWeek > weeks) return <span className="badge">Dönem tamamlandı</span>;
  return <span className="badge badge-primary">{currentWeek}. hafta / {weeks}</span>;
}

/** Yaklaşan ödevler kartı */
function UpcomingHomework({ homework, courses, onOpenHomework, onOpenCourse }) {
  const courseById = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
  const items = homework
    .filter(hw => !hw.isCompleted)
    .map(hw => ({ hw, status: getDueDateStatus(hw.dueDate) }))
    .sort((a, b) => {
      if (!a.status && !b.status) return 0;
      if (!a.status) return 1;
      if (!b.status) return -1;
      return a.status.diffDays - b.status.diffDays;
    });
  const top = items.slice(0, 4);

  return (
    <section className="card card-tight" aria-labelledby="upcoming-hw">
      <div className="card-header" style={{ marginBottom: 'var(--s-2)' }}>
        <h2 id="upcoming-hw" style={{ fontSize: '1.0625rem' }}>Yaklaşan ödevler</h2>
        {items.length > 0 && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={onOpenHomework}>
            Tümü ({items.length}) <ChevronRightIcon size={16} />
          </button>
        )}
      </div>
      {top.length === 0 ? (
        <p className="meta" style={{ padding: 'var(--s-2) 0' }}><CheckCircleIcon size={16} /> Bekleyen ödevin yok.</p>
      ) : (
        <div className="mini-list">
          {top.map(({ hw, status }) => {
            const course = courseById[hw.courseId];
            return (
              <button
                key={hw.id}
                type="button"
                className="mini-item mini-item-btn"
                onClick={() => course && onOpenCourse(course, 'homework')}
              >
                <span className="color-dot" style={{ background: course?.color || 'var(--primary)' }} aria-hidden="true" />
                <span className="grow">
                  <span className="truncate" style={{ display: 'block', fontWeight: 600 }}>{hw.title}</span>
                  <span className="subtle text-xs truncate" style={{ display: 'block' }}>{course?.name}</span>
                </span>
                {status && (
                  <span className={`badge ${status.isOverdue ? 'badge-danger' : status.isUrgent ? 'badge-warning' : ''}`}>
                    {status.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

/** Bugünün dersleri kartı (geniş ekran) */
function TodayCard({ courses, onCourseClick }) {
  const now = useNow();
  const tIdx = todayIndex(now);
  const sessions = useMemo(
    () => flattenSessions(courses).filter(s => s.dayIndex === tIdx).sort((a, b) => a.start - b.start),
    [courses, tIdx]
  );

  // Bugün ders yoksa sıradaki dersli günü bul
  const nextDay = useMemo(() => {
    if (sessions.length) return null;
    const all = flattenSessions(courses);
    for (let i = 1; i <= 7; i++) {
      const d = (tIdx + i) % 7;
      if (all.some(s => s.dayIndex === d)) return DAYS[d];
    }
    return null;
  }, [courses, sessions.length, tIdx]);

  return (
    <section className="card card-tight" aria-labelledby="today-title">
      <div className="card-header" style={{ marginBottom: 'var(--s-3)' }}>
        <h2 id="today-title" style={{ fontSize: '1.0625rem' }}>Bugün</h2>
        <span className="subtle text-sm">{sessions.length ? `${sessions.length} ders` : ''}</span>
      </div>
      {sessions.length ? (
        <AgendaList sessions={sessions} onCourseClick={onCourseClick} now={now} isToday />
      ) : (
        <p className="muted text-sm" style={{ padding: 'var(--s-2) 0' }}>
          Bugün dersin yok.{nextDay ? ` Sıradaki ders günün: ${nextDay}.` : ''}
        </p>
      )}
    </section>
  );
}

/** Program sekmesi */
export default function SchedulePage({ courses, coursesLoading, homework, onCourseClick, onOpenCourse, onAddCourse, onOpenHomework, onOpenSettings }) {
  const wide = useMediaQuery('(min-width: 768px)');
  const now = useNow();
  const dateLabel = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  const hasCourses = courses.length > 0;

  return (
    <div className="page-enter">
      <header className="page-header">
        <div>
          <h1>Program</h1>
          <div className="row" style={{ marginTop: 'var(--s-2)', flexWrap: 'wrap' }}>
            <span className="muted" style={{ textTransform: 'capitalize' }}>{dateLabel}</span>
            <WeekBadge onOpenSettings={onOpenSettings} />
          </div>
        </div>
        {wide && (
          <button type="button" className="btn btn-primary" onClick={onAddCourse}>
            <PlusIcon size={18} /> Ders ekle
          </button>
        )}
      </header>

      {wide && hasCourses && (
        <div className="overview-grid">
          <TodayCard courses={courses} onCourseClick={onCourseClick} />
          <UpcomingHomework homework={homework} courses={courses} onOpenHomework={onOpenHomework} onOpenCourse={onOpenCourse} />
        </div>
      )}

      <WeeklySchedule courses={courses} loading={coursesLoading} onCourseClick={onCourseClick} onAddCourse={onAddCourse} />

      {!wide && hasCourses && (
        <div style={{ marginTop: 'var(--s-6)' }}>
          <UpcomingHomework homework={homework} courses={courses} onOpenHomework={onOpenHomework} onOpenCourse={onOpenCourse} />
        </div>
      )}

      {!wide && (
        <button type="button" className="fab" onClick={onAddCourse} aria-label="Ders ekle">
          <PlusIcon size={22} /> Ders
        </button>
      )}
    </div>
  );
}
