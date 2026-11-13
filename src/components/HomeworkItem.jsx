import { getDueDateStatus } from '../utils/helpers';
import { CheckIcon, CalendarIcon } from '../icons/SVGIcons';

/** Tek bir ödev satırı: yuvarlak onay kutusu + başlık (tıklayınca düzenleme) */
export default function HomeworkItem({ hw, course, onToggle, onEdit }) {
  const status = hw.isCompleted ? null : getDueDateStatus(hw.dueDate);
  const done = !!hw.isCompleted;

  return (
    <div className={`hw-item${done ? ' done' : ''}`}>
      <button
        type="button"
        className="check"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `${hw.title}: tamamlanmadı olarak işaretle` : `${hw.title}: tamamlandı olarak işaretle`}
        onClick={() => onToggle(hw)}
      >
        <span><CheckIcon size={14} strokeWidth={3} /></span>
      </button>

      <button type="button" className="hw-main" onClick={() => onEdit(hw)} aria-label={`${hw.title} ödevini düzenle`}>
        <span className="hw-title">{hw.title}</span>
        {hw.description && !done && <span className="hw-desc">{hw.description}</span>}
        {(course || status || (done && hw.dueDate)) && (
          <span className="hw-meta">
            {course && (
              <span className="row" style={{ gap: 6 }}>
                <span className="color-dot" style={{ background: course.color || 'var(--primary)' }} aria-hidden="true" />
                {course.name}
              </span>
            )}
            {status && (
              <span className={`badge ${status.isOverdue ? 'badge-danger' : status.isUrgent ? 'badge-warning' : ''}`}>
                <CalendarIcon size={12} />
                {status.label}
              </span>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
