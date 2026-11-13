import { useState } from 'react';
import HomeworkItem from './HomeworkItem';
import HomeworkModal from './HomeworkModal';
import EmptyState from './EmptyState';
import { parseLocalDate } from '../utils/helpers';
import { ClipboardIcon, PlusIcon } from '../icons/SVGIcons';

export const byDueDate = (a, b) => {
  const da = parseLocalDate(a.dueDate);
  const db = parseLocalDate(b.dueDate);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return da - db;
};

/** Bir dersin ödevleri (ders detayı sekmesi) */
export default function HomeworkList({ course, homework, actions }) {
  const [modal, setModal] = useState({ open: false, hw: null });
  const active = homework.filter(h => !h.isCompleted).sort(byDueDate);
  const done = homework.filter(h => h.isCompleted).sort(byDueDate);

  const open = (hw = null) => setModal({ open: true, hw });
  const close = () => setModal({ open: false, hw: null });

  return (
    <div className="stack">
      <div className="row-between">
        <p className="muted text-sm">{active.length ? `${active.length} bekleyen ödev` : 'Bekleyen ödev yok'}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => open()}>
          <PlusIcon size={16} /> Ödev ekle
        </button>
      </div>

      {homework.length === 0 ? (
        <div className="card">
          <EmptyState
            compact
            icon={<ClipboardIcon size={24} />}
            title="Bu derse ait ödev yok"
            description="Ödev ekleyip teslim tarihini girersen yaklaşınca seni uyarırız."
          />
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="hw-list">
              {active.map(hw => (
                <HomeworkItem key={hw.id} hw={hw} onToggle={actions.toggle} onEdit={open} />
              ))}
            </div>
          )}
          {done.length > 0 && (
            <section>
              <h3 className="section-title">Tamamlananlar ({done.length})</h3>
              <div className="hw-list">
                {done.map(hw => (
                  <HomeworkItem key={hw.id} hw={hw} onToggle={actions.toggle} onEdit={open} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <HomeworkModal
        isOpen={modal.open}
        homework={modal.hw}
        courseId={course.id}
        onClose={close}
        onSave={(data) => {
          if (modal.hw) actions.update(modal.hw, data);
          else actions.add(course.id, data);
          close();
        }}
        onDelete={(hw) => { actions.remove(hw); close(); }}
      />
    </div>
  );
}
