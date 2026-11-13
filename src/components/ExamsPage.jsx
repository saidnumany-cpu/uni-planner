import { useMemo, useState } from 'react';
import ExamModal from './ExamModal';
import EmptyState from './EmptyState';
import { useSettings } from '../contexts/SettingsContext';
import useMediaQuery from '../hooks/useMediaQuery';
import useNow from '../hooks/useNow';
import { examKind, examTitle, byExamDate, isExamPast, examCountdown } from '../utils/exams';
import { periodKind, periodLabel, periodStatus, periodsOn, formatRange } from '../utils/academic';
import { parseLocalDate } from '../utils/helpers';
import { PlusIcon, ExamIcon, CalendarIcon, ClockIcon, MapPinIcon, ChevronRightIcon } from '../icons/SVGIcons';

/** Akademik takvimdeki sınav dönemleri (geçmemiş olanlar) */
export function PeriodStrip({ periods, now, onOpenSettings, compact = false }) {
  const visible = periods
    .map(p => ({ p, st: periodStatus(p, now) }))
    .filter(({ st }) => st.state !== 'past')
    .slice(0, compact ? 2 : 4);

  if (!periods.length) {
    return (
      <div className="alert alert-info" role="status">
        <CalendarIcon size={18} />
        <span>
          <strong>Sınav dönemleri tanımlı değil</strong>
          Akademik takvimi ekle, vize ve final haftaları programda ve burada görünsün.{' '}
          {onOpenSettings && <button type="button" className="link-btn" onClick={onOpenSettings}>Takvimi ayarla</button>}
        </span>
      </div>
    );
  }
  if (!visible.length) return null;

  return (
    <div className="period-strip">
      {visible.map(({ p, st }) => {
        const kind = periodKind(p);
        return (
          <div key={p.id || p.start} className={`period-card${st.state === 'now' ? ' is-now' : ''}`} data-tone={kind.tone}>
            <span className={`badge ${kind.tone ? `badge-${kind.tone}` : ''}`}>{kind.short}</span>
            <strong className="truncate">{periodLabel(p)}</strong>
            <span className="subtle text-sm tabular">{formatRange(p.start, p.end)}</span>
            <span className="text-sm" style={{ fontWeight: 600 }}>
              {st.state === 'now'
                ? (st.days === 0 ? 'Bugün bitiyor' : `Şu an · ${st.days} gün kaldı`)
                : st.days === 1 ? 'Yarın başlıyor' : `${st.days} gün sonra`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Tek sınav satırı */
export function ExamRow({ exam, course, onClick, showCountdown = true }) {
  const kind = examKind(exam.kind);
  const d = parseLocalDate(exam.date);
  const countdown = showCountdown ? examCountdown(exam) : null;
  return (
    <button type="button" className="exam-item" onClick={() => onClick(exam)} style={{ '--c': course?.color || 'var(--primary)' }}>
      <span className="exam-date" aria-hidden="true">
        <strong>{d ? d.getDate() : '?'}</strong>
        <small>{d ? d.toLocaleDateString('tr-TR', { month: 'short' }) : ''}</small>
        <small>{d ? d.toLocaleDateString('tr-TR', { weekday: 'short' }) : ''}</small>
      </span>
      <span className="exam-body">
        <span className="row" style={{ gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          <span className={`badge ${kind.tone ? `badge-${kind.tone}` : ''}`}>{kind.label}</span>
          <span className="exam-title">{course?.name || 'Ders'}</span>
        </span>
        {exam.title && exam.title !== kind.label && <span className="text-sm">{exam.title}</span>}
        {(exam.startTime || exam.location) && (
          <span className="meta">
            {exam.startTime && <><ClockIcon size={14} />{exam.startTime}</>}
            {exam.startTime && exam.location && ' · '}
            {exam.location && <><MapPinIcon size={14} />{exam.location}</>}
          </span>
        )}
        {exam.topics && <span className="hw-desc">{exam.topics}</span>}
      </span>
      {countdown && <span className={`badge ${countdown.tone ? `badge-${countdown.tone}` : ''}`}>{countdown.label}</span>}
    </button>
  );
}

/** Yaklaşan sınavlar kartı (Program sayfası) */
export function UpcomingExams({ exams, courses, onOpenExams }) {
  const courseById = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
  const now = useNow();
  const items = exams.filter(e => courseById[e.courseId] && e.date && !isExamPast(e, now)).sort(byExamDate);
  if (!items.length) return null;
  return (
    <section className="card card-tight" aria-labelledby="upcoming-exams">
      <div className="card-header" style={{ marginBottom: 'var(--s-2)' }}>
        <h2 id="upcoming-exams" style={{ fontSize: '1.0625rem' }}>Yaklaşan sınavlar</h2>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onOpenExams}>
          Tümü ({items.length}) <ChevronRightIcon size={16} />
        </button>
      </div>
      <div className="mini-list">
        {items.slice(0, 3).map(e => {
          const c = courseById[e.courseId];
          const cd = examCountdown(e);
          return (
            <button key={e.id} type="button" className="mini-item mini-item-btn" onClick={onOpenExams}>
              <span className="color-dot" style={{ background: c?.color || 'var(--primary)' }} aria-hidden="true" />
              <span className="grow">
                <span className="truncate" style={{ display: 'block', fontWeight: 600 }}>{c?.name} · {examTitle(e)}</span>
                <span className="subtle text-xs truncate" style={{ display: 'block' }}>
                  {parseLocalDate(e.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
                  {e.startTime ? ` · ${e.startTime}` : ''}{e.location ? ` · ${e.location}` : ''}
                </span>
              </span>
              {cd && <span className={`badge ${cd.tone ? `badge-${cd.tone}` : ''}`}>{cd.label}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Sınavları takvim dönemine (vize haftası vb.) ya da aya göre gruplar */
const groupExams = (list, periods) => {
  const groups = [];
  const byKey = {};
  list.forEach(exam => {
    const d = parseLocalDate(exam.date);
    let key, title;
    const period = d ? periodsOn(periods, d).find(p => periodKind(p).noClasses) : null;
    if (period) {
      key = `p-${period.id || period.start}`;
      title = `${periodLabel(period)} · ${formatRange(period.start, period.end)}`;
    } else if (d) {
      key = `m-${d.getFullYear()}-${d.getMonth()}`;
      title = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    } else {
      key = 'nodate';
      title = 'Tarihsiz';
    }
    if (!byKey[key]) { byKey[key] = { key, title, items: [] }; groups.push(byKey[key]); }
    byKey[key].items.push(exam);
  });
  return groups;
};

/** Sınavlar sekmesi */
export default function ExamsPage({ courses, coursesLoading, exams, loading, actions, onAddCourse, onOpenSettings }) {
  const wide = useMediaQuery('(min-width: 768px)');
  const now = useNow();
  const { periods } = useSettings();
  const [view, setView] = useState('upcoming');
  const [courseFilter, setCourseFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, exam: null });

  const courseById = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
  const filtered = exams
    .filter(e => courseById[e.courseId])
    .filter(e => courseFilter === 'all' || e.courseId === courseFilter);
  const upcoming = filtered.filter(e => !isExamPast(e, now)).sort(byExamDate);
  const past = filtered.filter(e => isExamPast(e, now)).sort(byExamDate).reverse();
  const list = view === 'upcoming' ? upcoming : past;
  const groups = groupExams(list, periods);

  const open = (exam = null) => setModal({ open: true, exam });
  const close = () => setModal({ open: false, exam: null });

  const header = (
    <header className="page-header">
      <div className="page-title-row">
        <h1>Sınavlar</h1>
        {courses.length > 0 && (
          <button type="button" className={`btn btn-primary${wide ? '' : ' btn-sm'}`} onClick={() => open()}>
            <PlusIcon size={18} /> Sınav ekle
          </button>
        )}
      </div>
      <p>{upcoming.length ? `${upcoming.length} yaklaşan sınavın var` : 'Yaklaşan sınav yok'}</p>
    </header>
  );

  if (coursesLoading || loading) {
    return <div className="page-enter">{header}<div className="skeleton" style={{ height: 240 }} aria-label="Yükleniyor" /></div>;
  }

  if (courses.length === 0) {
    return (
      <div className="page-enter">
        <header className="page-header"><h1>Sınavlar</h1></header>
        <div className="card">
          <EmptyState
            icon={<ExamIcon size={26} />}
            title="Önce bir ders ekle"
            description="Sınavlar derslere bağlıdır. Ders ekledikten sonra vize, final ve jüri tarihlerini buradan takip edebilirsin."
            action={<button type="button" className="btn btn-primary" onClick={onAddCourse}><PlusIcon size={18} /> Ders ekle</button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {header}

      <section style={{ marginBottom: 'var(--s-6)' }} aria-label="Sınav dönemleri">
        <PeriodStrip periods={periods} now={now} onOpenSettings={onOpenSettings} />
      </section>

      <div className="stack" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="segmented" role="tablist" aria-label="Sınav durumu" style={{ maxWidth: 420 }}>
          <button type="button" role="tab" aria-selected={view === 'upcoming'} onClick={() => setView('upcoming')}>
            Yaklaşan <span className="count">{upcoming.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={view === 'past'} onClick={() => setView('past')}>
            Geçmiş <span className="count">{past.length}</span>
          </button>
        </div>

        {courses.length > 1 && (
          <div className="scroll-row" role="group" aria-label="Derse göre filtrele">
            <button type="button" className="chip" aria-pressed={courseFilter === 'all'} onClick={() => setCourseFilter('all')}>Tüm dersler</button>
            {courses.map(c => (
              <button key={c.id} type="button" className="chip" aria-pressed={courseFilter === c.id} onClick={() => setCourseFilter(courseFilter === c.id ? 'all' : c.id)}>
                <span className="color-dot" style={{ background: c.color }} aria-hidden="true" />
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="card">
          {view === 'upcoming' ? (
            <EmptyState
              compact
              icon={<ExamIcon size={24} />}
              title="Yaklaşan sınav yok"
              description="Vize, final, quiz ya da jüri tarihlerini ekle; geri sayım burada ve programda görünsün."
              action={<button type="button" className="btn btn-primary" onClick={() => open()}><PlusIcon size={18} /> Sınav ekle</button>}
            />
          ) : (
            <EmptyState compact icon={<ExamIcon size={24} />} title="Geçmiş sınav yok" />
          )}
        </div>
      ) : (
        groups.map(g => (
          <section key={g.key} className="hw-group" aria-label={g.title}>
            <h2 className="section-title">{g.title} · {g.items.length}</h2>
            <div className="hw-list">
              {g.items.map(exam => (
                <ExamRow key={exam.id} exam={exam} course={courseById[exam.courseId]} onClick={open} showCountdown={view === 'upcoming'} />
              ))}
            </div>
          </section>
        ))
      )}

      <ExamModal
        isOpen={modal.open}
        exam={modal.exam}
        courses={courses}
        defaultCourseId={courseFilter !== 'all' ? courseFilter : undefined}
        onClose={close}
        onSave={(data) => {
          if (modal.exam) actions.update(modal.exam, data);
          else actions.add(data);
          close();
        }}
        onDelete={(exam) => { actions.remove(exam); close(); }}
      />
    </div>
  );
}
