import { useState } from 'react'
import { useHomework } from '../hooks/useHomework'
import HomeworkModal from './HomeworkModal'
import EmptyState from './EmptyState'

/**
 * Tüm dersler için ödev genel görünümü
 * Tüm aktif ödevleri tek bir listede gösterir
 */
const HomeworkOverview = ({ courses, userId }) => {
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
      ) : (
        <div className="flex-col gap-md">
          {courses.map(course => (
            <CourseHomeworkSection
              key={course.id}
              course={course}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Tek bir ders için ödev bölümü */
const CourseHomeworkSection = ({ course, userId }) => {
  const { homework, loading, addHomework, toggleComplete, deleteHomework } = useHomework(userId, course.id)
  const [modalOpen, setModalOpen] = useState(false)

  const activeHomework = homework.filter(hw => !hw.isCompleted)
  const completedHomework = homework.filter(hw => hw.isCompleted)

  if (loading) return null

  const getDueDateLabel = (dueDate) => {
    if (!dueDate) return null
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate)
    const now = new Date()
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    
    const dateStr = due.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    
    if (diffDays < 0) return { text: `${dateStr} (Geçti)`, className: 'badge badge-danger' }
    if (diffDays <= 3) return { text: `${dateStr} (${diffDays} gün)`, className: 'badge badge-warning' }
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
                    onClick={() => toggleComplete(hw.id, hw.isCompleted)}
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
                  onClick={() => deleteHomework(hw.id)}
                  title="Sil"
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
                      onClick={() => toggleComplete(hw.id, hw.isCompleted)}
                      title="Geri Al"
                    />
                    <span style={{ fontWeight: 400, textDecoration: 'line-through', opacity: 0.5 }}>
                      {hw.title}
                    </span>
                  </div>
                  <button
                    className="glass-button glass-button-icon text-tertiary"
                    onClick={() => deleteHomework(hw.id)}
                    title="Sil"
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
          await addHomework(data)
          setModalOpen(false)
        }}
        homework={null}
      />
    </div>
  )
}

export default HomeworkOverview
