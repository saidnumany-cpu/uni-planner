import { useAttendance } from '../hooks/useAttendance'
import { useHomework } from '../hooks/useHomework'
import EmptyState from './EmptyState'
import { SEMESTER_WEEKS } from '../utils/constants'

/**
 * Genel istatistik ve özet sayfası
 * Tüm derslerin yoklama ve ödev durumlarını gösterir
 */
const StatsOverview = ({ courses, userId }) => {
  if (courses.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 style={{ marginBottom: 'var(--space-lg)' }}>📊 Özet</h1>
        <EmptyState
          icon="📊"
          title="Henüz veri yok"
          description="Ders ekleyerek istatistikleri görüntüleyin"
        />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>📊 Özet</h1>

      {/* Genel İstatistikler */}
      <div className="glass glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ margin: '0 0 var(--space-md)' }}>Genel Bilgiler</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Toplam Ders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{SEMESTER_WEEKS}</div>
            <div className="stat-label">Hafta</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {courses.length * SEMESTER_WEEKS}
            </div>
            <div className="stat-label">Toplam Oturum</div>
          </div>
        </div>
      </div>

      {/* Ders Bazlı İstatistikler */}
      <div className="flex-col gap-md">
        {courses.map(course => (
          <CourseStatCard
            key={course.id}
            course={course}
            userId={userId}
          />
        ))}
      </div>
    </div>
  )
}

/** Tek bir ders için istatistik kartı */
const CourseStatCard = ({ course, userId }) => {
  const { attendance, stats } = useAttendance(userId, course.id, SEMESTER_WEEKS)
  const { homework } = useHomework(userId, course.id)

  const completedHw = homework.filter(hw => hw.isCompleted).length
  const totalHw = homework.length

  return (
    <div className="glass glass-card">
      <div className="flex gap-sm" style={{ alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <div
          style={{
            width: '8px',
            height: '32px',
            borderRadius: '4px',
            backgroundColor: course.color
          }}
        />
        <div>
          <h3 style={{ margin: 0 }}>{course.name}</h3>
          <span className="text-xs text-secondary">
            {course.day} · {course.startTime} - {course.endTime}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        {/* Yoklama */}
        <div className="stat-card">
          <div className="stat-number" style={{
            color: stats.percentage >= 70 ? 'var(--accent-emerald)' :
                   stats.percentage >= 50 ? 'var(--accent-amber)' :
                   stats.attended + stats.missed > 0 ? 'var(--accent-red)' : 'var(--text-primary)'
          }}>
            {stats.attended + stats.missed > 0 ? `%${Math.round(stats.percentage)}` : '—'}
          </div>
          <div className="stat-label">Devam Oranı</div>
        </div>

        {/* Devamsızlık */}
        <div className="stat-card">
          <div className="stat-number" style={{
            color: stats.missed > 3 ? 'var(--accent-red)' :
                   stats.missed > 0 ? 'var(--accent-amber)' : 'var(--text-primary)'
          }}>
            {stats.missed}
          </div>
          <div className="stat-label">Devamsızlık</div>
        </div>

        {/* Ödev */}
        <div className="stat-card">
          <div className="stat-number">
            {totalHw > 0 ? `${completedHw}/${totalHw}` : '—'}
          </div>
          <div className="stat-label">Ödev</div>
        </div>
      </div>

      {/* İlerleme çubuğu (yoklama) */}
      {stats.attended + stats.missed > 0 && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <div className="flex-between text-xs text-secondary" style={{ marginBottom: 'var(--space-xs)' }}>
            <span>Yoklama İlerlemesi</span>
            <span>{stats.attended + stats.missed} / {SEMESTER_WEEKS} hafta</span>
          </div>
          <div style={{
            height: '6px',
            borderRadius: '3px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              borderRadius: '3px',
              width: `${((stats.attended + stats.missed) / SEMESTER_WEEKS) * 100}%`,
              background: `linear-gradient(90deg, var(--accent-emerald) ${stats.percentage}%, var(--accent-red) ${stats.percentage}%)`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsOverview
