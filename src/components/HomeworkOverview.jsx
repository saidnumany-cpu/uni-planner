import { useMemo, useState } from 'react';
import HomeworkItem from './HomeworkItem';
import HomeworkModal from './HomeworkModal';
import EmptyState from './EmptyState';
import { byDueDate } from './HomeworkList';
import { getDueDateStatus } from '../utils/helpers';
import useMediaQuery from '../hooks/useMediaQuery';
import { ClipboardIcon, PlusIcon, CheckCircleIcon } from '../icons/SVGIcons';

/** Bekleyen ödevleri teslim tarihine göre gruplar */
const groupActive = (list) => {
  const groups = [
    { id: 'overdue', title: 'Gecikmiş', items: [] },
    { id: 'soon', title: 'Bugün ve yarın', items: [] },
    { id: 'week', title: 'Bu hafta', items: [] },
    { id: 'later', title: 'Daha sonra', items: [] },
    { id: 'nodate', title: 'Tarihsiz', items: [] }
  ];
  const by = Object.fromEntries(groups.map(g => [g.id, g]));
  list.forEach(hw => {
    const s = getDueDateStatus(hw.dueDate);
    if (!s) by.nodate.items.push(hw);
    else if (s.isOverdue) by.overdue.items.push(hw);
    else if (s.diffDays <= 1) by.soon.items.push(hw);
    else if (s.diffDays <= 7) by.week.items.push(hw);
    else by.later.items.push(hw);
  });
  return groups.filter(g => g.items.length);
};

/** Tüm derslerin ödevleri */
export default function HomeworkOverview({ courses, coursesLoading, homework, loading, actions, onAddCourse }) {
  const wide = useMediaQuery('(min-width: 768px)');
  const [view, setView] = useState('active');
  const [courseFilter, setCourseFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, hw: null });

  const courseById = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
  const filtered = homework
    .filter(hw => courseById[hw.courseId])
    .filter(hw => courseFilter === 'all' || hw.courseId === courseFilter);
  const active = filtered.filter(h => !h.isCompleted).sort(byDueDate);
  const done = filtered.filter(h => h.isCompleted).sort(byDueDate).reverse();
  const groups = view === 'active' ? groupActive(active) : [{ id: 'done', title: '', items: done }];

  const open = (hw = null) => setModal({ open: true, hw });
  const close = () => setModal({ open: false, hw: null });

  const header = (
    <header className="page-header">
      <div>
        <h1>Ödevler</h1>
        <p>{active.length ? `${active.length} bekleyen ödevin var` : 'Tüm ödevlerin tamam'}</p>
      </div>
      {wide && courses.length > 0 && (
        <button type="button" className="btn btn-primary" onClick={() => open()}>
          <PlusIcon size={18} /> Ödev ekle
        </button>
      )}
    </header>
  );

  if (coursesLoading || loading) {
    return (
      <div className="page-enter">
        {header}
        <div className="skeleton" style={{ height: 240 }} aria-label="Yükleniyor" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="page-enter">
        <header className="page-header"><h1>Ödevler</h1></header>
        <div className="card">
          <EmptyState
            icon={<ClipboardIcon size={26} />}
            title="Önce bir ders ekle"
            description="Ödevler derslere bağlıdır. İlk dersini ekledikten sonra ödevlerini buradan takip edebilirsin."
            action={<button type="button" className="btn btn-primary" onClick={onAddCourse}><PlusIcon size={18} /> Ders ekle</button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {header}

      <div className="stack" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="segmented" role="tablist" aria-label="Ödev durumu" style={{ maxWidth: 420 }}>
          <button type="button" role="tab" aria-selected={view === 'active'} onClick={() => setView('active')}>
            Bekleyen <span className="count">{filtered.filter(h => !h.isCompleted).length}</span>
          </button>
          <button type="button" role="tab" aria-selected={view === 'done'} onClick={() => setView('done')}>
            Tamamlanan <span className="count">{filtered.filter(h => h.isCompleted).length}</span>
          </button>
        </div>

        {courses.length > 1 && (
          <div className="scroll-row" role="group" aria-label="Derse göre filtrele">
            <button type="button" className="chip" aria-pressed={courseFilter === 'all'} onClick={() => setCourseFilter('all')}>
              Tüm dersler
            </button>
            {courses.map(c => (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={courseFilter === c.id}
                onClick={() => setCourseFilter(courseFilter === c.id ? 'all' : c.id)}
              >
                <span className="color-dot" style={{ background: c.color }} aria-hidden="true" />
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {groups.length === 0 || groups.every(g => g.items.length === 0) ? (
        <div className="card">
          {view === 'active' ? (
            <EmptyState
              compact
              icon={<CheckCircleIcon size={24} />}
              title="Bekleyen ödev yok"
              description="Yeni bir ödev aldığında ekle; teslim tarihi yaklaştıkça burada öne çıkar."
              action={<button type="button" className="btn btn-primary" onClick={() => open()}><PlusIcon size={18} /> Ödev ekle</button>}
            />
          ) : (
            <EmptyState compact icon={<ClipboardIcon size={24} />} title="Henüz tamamlanan ödev yok" />
          )}
        </div>
      ) : (
        groups.map(g => (
          <section key={g.id} className="hw-group" aria-label={g.title || 'Tamamlanan ödevler'}>
            {g.title && (
              <h2 className="section-title" style={g.id === 'overdue' ? { color: 'var(--danger)' } : undefined}>
                {g.title} · {g.items.length}
              </h2>
            )}
            <div className="hw-list">
              {g.items.map(hw => (
                <HomeworkItem
                  key={hw.id}
                  hw={hw}
                  course={courseFilter === 'all' ? courseById[hw.courseId] : null}
                  onToggle={actions.toggle}
                  onEdit={open}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {!wide && (
        <button type="button" className="fab" onClick={() => open()} aria-label="Ödev ekle">
          <PlusIcon size={22} /> Ödev
        </button>
      )}

      <HomeworkModal
        isOpen={modal.open}
        homework={modal.hw}
        courses={courses}
        courseId={courseFilter !== 'all' ? courseFilter : undefined}
        onClose={close}
        onSave={(data, courseId) => {
          if (modal.hw) actions.update(modal.hw, data);
          else actions.add(courseId, data);
          close();
        }}
        onDelete={(hw) => { actions.remove(hw); close(); }}
      />
    </div>
  );
}
