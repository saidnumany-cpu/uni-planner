import EmptyState from './EmptyState';
import { formatSessions } from '../utils/course';
import { formatRange } from '../utils/academic';
import { ChevronLeftIcon, ChevronRightIcon, InboxIcon } from '../icons/SVGIcons';

/** Arşivlenmiş dersleri dönem adına göre gruplar (en yeni dönem üstte) */
const groupByTerm = (courses) => {
  const map = new Map();
  courses.forEach(c => {
    const key = c.term || 'Adsız dönem';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(c);
  });
  const ts = (c) => c.archivedAt?.toMillis?.() ?? 0;
  return [...map.entries()]
    .map(([term, items]) => ({ term, items: items.sort((a, b) => a.name.localeCompare(b.name, 'tr')), at: Math.max(...items.map(ts)) }))
    .sort((a, b) => b.at - a.at);
};

/** Geçmiş dönemler */
export default function ArchivePage({ courses, onOpenCourse, onBack }) {
  const terms = groupByTerm(courses);

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 'var(--s-3)' }}>
        <button type="button" className="back-link" onClick={onBack}>
          <ChevronLeftIcon size={20} /> Özet
        </button>
      </div>
      <header className="page-header">
        <div>
          <h1>Geçmiş dönemler</h1>
          <p>Arşivlenen derslerin notları, ödevleri ve yoklaması burada saklanır</p>
        </div>
      </header>

      {terms.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<InboxIcon size={26} />}
            title="Arşiv boş"
            description="Dönem bitince Ayarlar → Dönemi arşivle ile derslerini buraya taşıyabilirsin."
          />
        </div>
      ) : (
        terms.map(t => {
          const first = t.items[0];
          return (
            <section key={t.term} className="hw-group" aria-label={t.term}>
              <h2 className="section-title">
                {t.term} · {t.items.length} ders
                {first?.termStart ? <span className="subtle" style={{ fontWeight: 500 }}> · {formatRange(first.termStart, first.termStart, true)} başlangıç</span> : null}
              </h2>
              <div className="hw-list">
                {t.items.map(c => (
                  <button key={c.id} type="button" className="exam-item" style={{ '--c': c.color || 'var(--primary)' }} onClick={() => onOpenCourse(c)}>
                    <span className="color-dot" style={{ background: c.color || 'var(--primary)', marginTop: 6 }} aria-hidden="true" />
                    <span className="exam-body">
                      <span className="exam-title">{c.name}</span>
                      <span className="subtle text-sm truncate">{[c.instructor, formatSessions(c)].filter(Boolean).join(' · ')}</span>
                    </span>
                    <ChevronRightIcon size={18} className="subtle" />
                  </button>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
