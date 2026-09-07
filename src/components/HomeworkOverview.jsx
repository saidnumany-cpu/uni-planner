import { useState } from 'react'
import { useAllHomework } from '../hooks/useAllHomework'
import HomeworkModal from './HomeworkModal'
import EmptyState from './EmptyState'
import { getDueDateStatus } from '../utils/helpers'

/**
 * Tüm dersler için ödev genel görünümü
 * Tüm aktif ödevleri tek bir listede gösterir
 */
const HomeworkOverview = ({ courses, userId }) => {
  const { homeworkByCourse, loading, addHomework, toggleComplete, deleteHomework } = useAllHomework(userId, courses)

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1>📝 Ödevler</h1>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Henüz ders eklenmedi"
          description="Önce ders eklemeniz gerekiyor"
        />
      ) : loading ? (
        <div className="text-center" style={{ padding: 'var(--space-xl)' }}>
          <p className="text-secondary">Ödevler yükleniyor...</p>
        </div>
      ) : (
        <div className="flex-col gap-md">
          {courses.map(course => (
            <CourseHomeworkSection
              key={course.id}
              course={course}
              homework={homeworkByCourse[course.id] || []}
              onAdd={(data) => addHomework(course.id, data)}
              onToggle={(hwId, state) => toggleComplete(course.id, hwId, state)}
              onDelete={(hwId) => deleteHomework(course.id, hwId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Tek bir ders için ödev bölümü */
const CourseHomeworkSection = ({ course, homework, onAdd, onToggle, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const activeHomework = homework.filter(hw => !hw.isCompleted)
  const completedHomework = homework.filter(hw => hw.isCompleted)

  const getDueDateLabel = (dueDate) => {
    const status = getDueDateStatus(dueDate)
    if (!status) return null

    const dateStr = status.due.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

    if (status.isOverdue) return { text: `${dateStr} (Geçti)`, className: 'badge badge-danger' }
    if (status.isUrgent) return { text: `${dateStr} (${status.diffDays} gün)`, className: 'badge badge-warning' }
    return { text: dateStr, className: 'badge' }
  }

  return (
    <div className="glass glass-card">
      <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
          <div
            className="color-dot"
            style={{ backgroundColor: course.color, width: '12px', height: '12px', minWidth: '12px' }}
          />
          <h3 style={{ margin: 0 }}>{course.name}</h3>
          <span className="text-xs text-tertiary">
            {activeHomework.length} aktif
          </span>
        </div>
        <button
          className="glass-button glass-button-icon"
          onClick={() => setModalOpen(true)}
          title="Ödev Ekle"
        >
          +
        </button>
      </div>

      {homework.length === 0 ? (
        <p className="text-sm text-tertiary" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
          Bu ders için henüz ödev yok
        </p>
      ) : (
        <div className="flex-col gap-sm">
          {activeHomework.map(hw => {
            const dueBadge = getDueDateLabel(hw.dueDate)
            return (
              <div key={hw.id} className="homework-item">
                <div className="flex gap-sm" style={{ alignItems: 'flex-start', flex: 1 }}>
                  <button
                    className="attendance-toggle"
                    onClick={() => onToggle(hw.id, hw.isCompleted)}
                    title="Tamamla"
                  />
                  <div style={{ flex: 1 }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500 }}>{hw.title}</span>
                      {dueBadge && <span className={dueBadge.className}>{dueBadge.text}</span>}
                    </div>
                    {hw.description && (
                      <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-xs)' }}>
                        {hw.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  className="glass-button glass-button-icon text-tertiary"
                  onClick={() => {
                    if (window.confirm('Bu ödevi silmek istediğinizden emin misiniz?')) {
                      onDelete(hw.id)
                    }
                  }}
                  title="Sil"
                  aria-label={`${hw.title} ödevini sil`}
                  style={{ fontSize: '0.85rem' }}
                >
                  🗑
                </button>
              </div>
            )
          })}

          {completedHomework.length > 0 && (
            <>
              <div className="text-xs text-tertiary" style={{ padding: 'var(--space-xs) 0', marginTop: 'var(--space-sm)' }}>
                Tamamlanan ({completedHomework.length})
              </div>
              {completedHomework.map(hw => (
                <div key={hw.id} className="homework-item completed">
                  <div className="flex gap-sm" style={{ alignItems: 'center', flex: 1 }}>
                    <button
                      className="attendance-toggle checked"
                      onClick={() => onToggle(hw.id, hw.isCompleted)}
                      title="Geri Al"
                    />
                    <span style={{ fontWeight: 400, textDecoration: 'line-through', opacity: 0.5 }}>
                      {hw.title}
                    </span>
                  </div>
                  <button
                    className="glass-button glass-button-icon text-tertiary"
                    onClick={() => {
                      if (window.confirm('Bu ödevi silmek istediğinizden emin misiniz?')) {
                        onDelete(hw.id)
                      }
                    }}
                    title="Sil"
                    aria-label={`${hw.title} ödevini sil`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <HomeworkModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (data) => {
          await onAdd(data)
          setModalOpen(false)
        }}
        homework={null}
      />
    </div>
  )
}

export default HomeworkOverview
