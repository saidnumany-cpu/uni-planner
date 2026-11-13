import EmptyState from './EmptyState';
import { absenceSummary } from './AttendanceTracker';
import { getAbsenceLimit, formatSessions } from '../utils/course';
import { useSettings } from '../contexts/SettingsContext';
import { ChartIcon, ChevronRightIcon, PlusIcon } from '../icons/SVGIcons';

const rateTone = (pct, recorded) => !recorded ? '' : pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'danger';

/** Tek ders özeti */
function CourseStatCard({ course, attendance, homework, weeks, onOpen }) {
  const stats = attendance?.stats || { attended: 0, missed: 0, percentage: 0 };
  const recorded = stats.attended + stats.missed;
  const limit = getAbsenceLimit(course);
  const summary = absenceSummary(stats.missed, limit);
  const doneHw = homework.filter(h => h.isCompleted).length;

  return (
    <button
      type="button"
      className="card"
      onClick={() => onOpen(course)}
      style={{ textAlign: 'left', width: '100%', color: 'inherit', borderLeft: `4px solid ${course.color || 'var(--primary)'}` }}
      aria-label={`${course.name} dersini aç`}
    >
      <div className="row-between" style={{ marginBottom: 'var(--s-4)' }}>
        <div className="grow">
          <h3 className="truncate">{course.name}</h3>
          <p className="subtle text-sm truncate">{formatSessions(course)}</p>
        </div>
        <ChevronRightIcon size={20} className="subtle" />
      </div>

      <div className="stack-sm">
        <div className="row-between text-sm">
          <span className="muted">Devam ({recorded}/{weeks} hafta girildi)</span>
          <strong className={`tabular ${rateTone(stats.percentage, recorded) ? `stat-value ${rateTone(stats.percentage, recorded)}` : ''}`} style={{ fontSize: '0.9375rem' }}>
            {recorded ? `%${stats.percentage}` : '—'}
          </strong>
        </div>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${(stats.attended / weeks) * 100}%`, background: 'var(--success-solid)' }} />
          <span style={{ width: `${(stats.missed / weeks) * 100}%`, background: 'var(--danger-solid)' }} />
        </div>
        <dl className="kv" style={{ marginTop: 'var(--s-2)' }}>
          <dt>Devamsızlık</dt>
          <dd>
            <span className={`badge ${summary.tone ? `badge-${summary.tone}` : ''}`}>
              {stats.missed}{limit > 0 ? ` / ${limit}` : ''}
            </span>
          </dd>
          <dt>Ödevler</dt>
          <dd>{homework.length ? `${doneHw}/${homework.length} tamamlandı` : '—'}</dd>
        </dl>
      </div>
    </button>
  );
}

/** Özet sayfası */
export default function StatsOverview({ courses, coursesLoading, homework, attendanceByCourse, loading, onOpenCourse, onAddCourse }) {
  const { weeks } = useSettings();

  if (coursesLoading) {
    return <div className="page-enter"><header className="page-header"><h1>Özet</h1></header><div className="skeleton" style={{ height: 320 }} /></div>;
  }

  if (courses.length === 0) {
    return (
      <div className="page-enter">
        <header className="page-header"><h1>Özet</h1></header>
        <div className="card">
          <EmptyState
            icon={<ChartIcon size={26} />}
            title="Henüz gösterilecek veri yok"
            description="Ders ekleyip yoklama ve ödevleri girdikçe dönem özetin burada oluşur."
            action={<button type="button" className="btn btn-primary" onClick={onAddCourse}><PlusIcon size={18} /> Ders ekle</button>}
          />
        </div>
      </div>
    );
  }

  const totals = Object.values(attendanceByCourse).reduce(
    (acc, { stats }) => ({ attended: acc.attended + stats.attended, missed: acc.missed + stats.missed }),
    { attended: 0, missed: 0 }
  );
  const recorded = totals.attended + totals.missed;
  const overall = recorded ? Math.round((totals.attended / recorded) * 100) : null;
  const pending = homework.filter(h => !h.isCompleted).length;
  const done = homework.filter(h => h.isCompleted).length;
  const atRisk = courses.filter(c => {
    const missed = attendanceByCourse[c.id]?.stats.missed || 0;
    const limit = getAbsenceLimit(c);
    return limit > 0 && limit - missed <= 1;
  });

  return (
    <div className="page-enter">
      <header className="page-header">
        <div>
          <h1>Özet</h1>
          <p>Dönem genelinde devam ve ödev durumun</p>
        </div>
      </header>

      <div className="stat-grid" style={{ marginBottom: 'var(--s-6)' }}>
        <div className="stat">
          <span className="stat-label">Ders</span>
          <span className="stat-value">{courses.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Genel devam</span>
          <span className={`stat-value ${loading ? '' : rateTone(overall, recorded)}`}>{loading || overall === null ? '—' : `%${overall}`}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Bekleyen ödev</span>
          <span className={`stat-value ${pending ? 'warning' : ''}`}>{loading ? '—' : pending}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Tamamlanan ödev</span>
          <span className="stat-value success">{loading ? '—' : done}</span>
        </div>
      </div>

      {!loading && atRisk.length > 0 && (
        <div className="alert alert-warning" role="status" style={{ marginBottom: 'var(--s-6)' }}>
          <ChartIcon size={18} />
          <span>
            <strong>Devamsızlık sınırına yakın {atRisk.length === 1 ? 'ders' : 'dersler'}</strong>
            {atRisk.map(c => c.name).join(', ')}
          </span>
        </div>
      )}

      <h2 className="section-title">Dersler</h2>
      {loading ? (
        <div className="skeleton" style={{ height: 200 }} aria-label="Yükleniyor" />
      ) : (
        <div className="course-stats">
          {courses.map(course => (
            <CourseStatCard
              key={course.id}
              course={course}
              attendance={attendanceByCourse[course.id]}
              homework={homework.filter(h => h.courseId === course.id)}
              weeks={weeks}
              onOpen={onOpenCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
}
