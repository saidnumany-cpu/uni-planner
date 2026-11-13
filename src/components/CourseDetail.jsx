import { useState } from 'react';
import WeeklyNotes from './WeeklyNotes';
import HomeworkList from './HomeworkList';
import AttendanceTracker from './AttendanceTracker';
import { getSessions, getAbsenceLimit } from '../utils/course';
import { useSettings } from '../contexts/SettingsContext';
import { teachingWeeks, normalizePeriods } from '../utils/academic';
import { ChevronLeftIcon, EditIcon, ClockIcon, MapPinIcon, UserIcon, BookOpenIcon, ClipboardIcon, CheckCircleIcon, InboxIcon, RotateCcwIcon } from '../icons/SVGIcons';

const TABS = [
  { id: 'notes', label: 'Notlar', icon: BookOpenIcon },
  { id: 'homework', label: 'Ödevler', icon: ClipboardIcon },
  { id: 'attendance', label: 'Yoklama', icon: CheckCircleIcon }
];

/** Ders detay sayfası: bilgiler + Notlar / Ödevler / Yoklama sekmeleri */
export default function CourseDetail({ course, userId, homework, attendance, onSetAttendance, homeworkActions, onBack, backLabel = 'Program', onEdit, onUnarchive, initialTab = 'notes' }) {
  const [tab, setTab] = useState(initialTab);
  const settings = useSettings();
  // Arşivlenmiş ders kendi dönem bilgileriyle açılır
  const archived = !!course.archived;
  const weeks = archived ? (Number(course.termWeeks) || settings.weeks) : settings.weeks;
  const currentWeek = archived ? null : settings.currentWeek;
  const weekList = archived
    ? (course.termStart ? teachingWeeks(course.termStart, weeks, normalizePeriods(course.termPeriods)) : [])
    : settings.weekList;
  const sessions = getSessions(course);
  const pending = homework.filter(h => !h.isCompleted).length;
  const stats = attendance?.stats || { attended: 0, missed: 0, percentage: 0 };
  const missedOver = stats.missed >= getAbsenceLimit(course) && getAbsenceLimit(course) > 0;

  const counts = {
    homework: pending || null,
    attendance: missedOver ? '!' : null
  };

  const onTabKey = (e, index) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    if (next !== null) {
      e.preventDefault();
      setTab(TABS[next].id);
      document.getElementById(`ctab-${TABS[next].id}`)?.focus();
    }
  };

  return (
    <div className="stack page-enter" style={{ gap: 'var(--s-5)' }}>
      <div>
        <button type="button" className="back-link" onClick={onBack}>
          <ChevronLeftIcon size={20} /> {backLabel}
        </button>
      </div>

      {archived && (
        <div className="alert alert-info" role="status">
          <InboxIcon size={18} />
          <span className="grow">
            <strong>Arşivlenmiş ders · {course.term || 'Geçmiş dönem'}</strong>
            Notlar, ödevler ve yoklama kayıtları korunuyor. Programda ve sınavlarda görünmez.
          </span>
          {onUnarchive && (
            <button type="button" className="btn btn-sm" onClick={() => onUnarchive(course)}>
              <RotateCcwIcon size={16} /> Arşivden çıkar
            </button>
          )}
        </div>
      )}

      <section className="card course-hero" style={{ '--c': course.color || 'var(--primary)' }}>
        <div className="row-between" style={{ alignItems: 'flex-start' }}>
          <div className="grow">
            <h1>{course.name}</h1>
            {course.instructor && (
              <p className="meta" style={{ marginTop: 'var(--s-2)' }}><UserIcon size={16} />{course.instructor}</p>
            )}
          </div>
          <button type="button" className="btn btn-sm" onClick={() => onEdit(course)}>
            <EditIcon size={16} /> Düzenle
          </button>
        </div>
        <div className="session-list">
          {sessions.map((s, i) => (
            <span key={i} className="chip" style={{ cursor: 'default' }}>
              <ClockIcon size={14} />
              <span className="tabular">{s.day} {s.startTime}–{s.endTime}</span>
              {(s.location || course.location) && (
                <>
                  <span aria-hidden="true">·</span>
                  <MapPinIcon size={14} />
                  {s.location || course.location}
                </>
              )}
            </span>
          ))}
        </div>
      </section>

      <div className="segmented" role="tablist" aria-label="Ders bölümleri">
        {TABS.map((t, i) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              id={`ctab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`cpanel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <Icon size={18} />
              {t.label}
              {counts[t.id] && <span className="count">{counts[t.id]}</span>}
            </button>
          );
        })}
      </div>

      <div id={`cpanel-${tab}`} role="tabpanel" aria-labelledby={`ctab-${tab}`}>
        {tab === 'notes' && (
          <WeeklyNotes key={course.id} userId={userId} courseId={course.id} weeks={weeks} currentWeek={currentWeek} />
        )}
        {tab === 'homework' && (
          <HomeworkList course={course} homework={homework} actions={homeworkActions} />
        )}
        {tab === 'attendance' && (
          <AttendanceTracker
            course={course}
            records={attendance?.records || []}
            stats={stats}
            weeks={weeks}
            currentWeek={currentWeek}
            weekList={weekList}
            onSet={(week, status, note) => onSetAttendance(course.id, week, status, note)}
          />
        )}
      </div>
    </div>
  );
}
