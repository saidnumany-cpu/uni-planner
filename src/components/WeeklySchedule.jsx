import { useMemo, useState } from 'react';
import { DAYS, DAY_SHORT, WEEKDAY_COUNT } from '../utils/constants';
import { flattenSessions, todayIndex } from '../utils/course';
import useMediaQuery from '../hooks/useMediaQuery';
import useNow from '../hooks/useNow';
import EmptyState from './EmptyState';
import { CalendarIcon, MapPinIcon, PlusIcon } from '../icons/SVGIcons';

const HOUR_H = 64; // px / saat

/** Bu haftanın Pazartesi'sinden itibaren gün tarihleri */
const weekDates = (now) => {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - todayIndex(now));
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

/** Aynı gün çakışan oturumları yan yana şeritlere yerleştirir */
const layoutLanes = (sessions) => {
  const sorted = [...sessions].sort((a, b) => a.start - b.start || a.end - b.end);
  const result = {};
  let group = [];
  let groupEnd = -1;
  const flush = () => {
    const lanes = Math.max(1, ...group.map(g => g.lane + 1));
    group.forEach(g => { result[g.key] = { lane: g.lane, lanes }; });
    group = [];
  };
  sorted.forEach(item => {
    if (group.length && item.start >= groupEnd) flush();
    const laneEnds = [];
    group.forEach(g => { laneEnds[g.lane] = Math.max(laneEnds[g.lane] ?? 0, g.end); });
    let lane = laneEnds.findIndex(e => e <= item.start);
    if (lane === -1) lane = laneEnds.length;
    group.push({ ...item, lane });
    groupEnd = Math.max(groupEnd, item.end);
  });
  if (group.length) flush();
  return result;
};

/* ------------------------------------------------------------------ */
/* Haftalık ızgara (tablet / masaüstü)                                */
/* ------------------------------------------------------------------ */
function WeekGrid({ sessions, onCourseClick, now }) {
  const tIdx = todayIndex(now);
  const dates = weekDates(now);
  const hasWeekend = sessions.some(s => s.dayIndex >= WEEKDAY_COUNT);
  const dayCount = hasWeekend ? 7 : WEEKDAY_COUNT;

  const minStart = Math.min(...sessions.map(s => s.start), 9 * 60);
  const maxEnd = Math.max(...sessions.map(s => s.end), 17 * 60);
  const startHour = Math.max(0, Math.min(8, Math.floor(minStart / 60)));
  const endHour = Math.min(24, Math.max(18, Math.ceil(maxEnd / 60)));
  const height = (endHour - startHour) * HOUR_H;
  const top = (mins) => ((mins - startHour * 60) / 60) * HOUR_H;

  const lanes = useMemo(() => {
    const out = {};
    for (let d = 0; d < 7; d++) Object.assign(out, layoutLanes(sessions.filter(s => s.dayIndex === d)));
    return out;
  }, [sessions]);

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const showNow = tIdx < dayCount && nowMins >= startHour * 60 && nowMins <= endHour * 60;

  return (
    <div className="week-wrap">
      <div className="week-scroll">
        <div
          className="week"
          style={{ gridTemplateColumns: `56px repeat(${dayCount}, minmax(112px, 1fr))`, '--hour-h': `${HOUR_H}px` }}
        >
          <div className="week-head-cell" aria-hidden="true" />
          {DAYS.slice(0, dayCount).map((day, i) => (
            <div key={day} className={`week-head-cell${i === tIdx ? ' is-today' : ''}`}>
              <strong>{DAY_SHORT[i]}</strong>
              {dates[i].getDate()} {dates[i].toLocaleDateString('tr-TR', { month: 'short' })}
            </div>
          ))}

          <div className="week-times" style={{ height }} aria-hidden="true">
            {Array.from({ length: endHour - startHour }, (_, i) => i + startHour).map(h => (
              <span key={h} className="week-time" style={{ top: (h - startHour) * HOUR_H + (h === startHour ? 10 : 0) }}>
                {String(h).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {DAYS.slice(0, dayCount).map((day, d) => (
            <div key={day} className={`week-day${d === tIdx ? ' is-today' : ''}`} style={{ height }}>
              {sessions.filter(s => s.dayIndex === d).map(s => {
                const lane = lanes[s.key] || { lane: 0, lanes: 1 };
                const h = Math.max(top(s.end) - top(s.start) - 2, 28);
                return (
                  <button
                    key={s.key}
                    type="button"
                    className="session"
                    style={{
                      '--c': s.course.color || 'var(--primary)',
                      top: top(s.start) + 1,
                      height: h,
                      left: `calc(${(100 / lane.lanes) * lane.lane}% + 3px)`,
                      width: `calc(${100 / lane.lanes}% - 6px)`,
                      right: 'auto'
                    }}
                    onClick={() => onCourseClick(s.course)}
                    aria-label={`${s.course.name}, ${day} ${s.startTime}–${s.endTime}${s.location ? `, ${s.location}` : ''}`}
                  >
                    <span className="session-title">{s.course.name}</span>
                    {h >= 44 && <span className="session-meta">{s.startTime}–{s.endTime}</span>}
                    {h >= 64 && s.location && <span className="session-meta">{s.location}</span>}
                  </button>
                );
              })}
              {showNow && d === tIdx && <div className="now-line" style={{ top: top(nowMins) }} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Günlük ajanda (telefon)                                            */
/* ------------------------------------------------------------------ */
export function AgendaList({ sessions, onCourseClick, now, isToday }) {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return (
    <div className="agenda">
      {sessions.map(s => {
        const isNow = isToday && nowMins >= s.start && nowMins < s.end;
        const isPast = isToday && nowMins >= s.end;
        return (
          <button
            key={s.key}
            type="button"
            className={`agenda-item${isNow ? ' is-now' : ''}${isPast ? ' is-past' : ''}`}
            onClick={() => onCourseClick(s.course)}
          >
            <span className="agenda-time">
              {s.startTime}
              <small>{s.endTime}</small>
            </span>
            <span className="agenda-bar" style={{ background: s.course.color || 'var(--primary)' }} aria-hidden="true" />
            <span className="agenda-body">
              <span className="row" style={{ gap: 'var(--s-2)' }}>
                <span className="agenda-title">{s.course.name}</span>
                {isNow && <span className="badge badge-primary">Şu an</span>}
              </span>
              {(s.location || s.course.instructor) && (
                <span className="meta truncate">
                  {s.location && <><MapPinIcon size={14} />{s.location}</>}
                  {s.location && s.course.instructor && ' · '}
                  {s.course.instructor}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DayAgenda({ sessions, onCourseClick, now }) {
  const tIdx = todayIndex(now);
  const dates = weekDates(now);
  const hasWeekend = sessions.some(s => s.dayIndex >= WEEKDAY_COUNT);
  const dayCount = hasWeekend || tIdx >= WEEKDAY_COUNT ? 7 : WEEKDAY_COUNT;
  // Hafta sonu ve o gün ders yoksa Pazartesi'den başla
  const [selected, setSelected] = useState(() => (tIdx < dayCount ? tIdx : 0));
  const daySessions = sessions.filter(s => s.dayIndex === selected).sort((a, b) => a.start - b.start);

  return (
    <div>
      <div className="day-tabs" role="tablist" aria-label="Gün seç">
        {DAYS.slice(0, dayCount).map((day, i) => {
          const count = sessions.filter(s => s.dayIndex === i).length;
          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={selected === i}
              aria-label={`${day}${count ? `, ${count} ders` : ', ders yok'}`}
              className={`day-tab${i === tIdx ? ' is-today' : ''}`}
              onClick={() => setSelected(i)}
            >
              {DAY_SHORT[i]}
              <strong>{dates[i].getDate()}</strong>
              {count > 0 && <span className="dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={DAYS[selected]}>
        {daySessions.length ? (
          <AgendaList sessions={daySessions} onCourseClick={onCourseClick} now={now} isToday={selected === tIdx} />
        ) : (
          <div className="card">
            <EmptyState compact icon={<CalendarIcon size={24} />} title={`${DAYS[selected]} günü ders yok`} description="Boş bir gün — ödevlere ya da notlara göz atabilirsin." />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Program görünümü: telefonda günlük ajanda, geniş ekranda haftalık ızgara
 */
export default function WeeklySchedule({ courses, loading, onCourseClick, onAddCourse }) {
  const wide = useMediaQuery('(min-width: 768px)');
  const now = useNow();
  const sessions = useMemo(() => flattenSessions(courses).filter(s => s.dayIndex !== -1), [courses]);

  if (loading) {
    return <div className="skeleton" style={{ height: wide ? 480 : 300 }} aria-label="Yükleniyor" />;
  }

  if (courses.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<CalendarIcon size={26} />}
          title="Programın henüz boş"
          description="Derslerini gün ve saatleriyle ekle; haftalık programın, notların ve yoklaman burada toplansın."
          action={<button type="button" className="btn btn-primary" onClick={onAddCourse}><PlusIcon size={18} /> İlk dersini ekle</button>}
        />
      </div>
    );
  }

  return wide
    ? <WeekGrid sessions={sessions} onCourseClick={onCourseClick} now={now} />
    : <DayAgenda sessions={sessions} onCourseClick={onCourseClick} now={now} />;
}

