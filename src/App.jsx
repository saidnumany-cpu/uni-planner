import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from './contexts/AuthContext'
import { SettingsProvider, useSettings } from './contexts/SettingsContext'
import { useCourses } from './hooks/useCourses'
import { useAllHomework } from './hooks/useAllHomework'
import { useAllAttendance } from './hooks/useAllAttendance'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'
import SchedulePage from './components/SchedulePage'
import CourseDetail from './components/CourseDetail'
import CourseModal from './components/CourseModal'
import HomeworkOverview from './components/HomeworkOverview'
import StatsOverview from './components/StatsOverview'
import SettingsModal from './components/SettingsModal'
import Toast from './components/Toast'
import { runInBackground, notify } from './utils/toast'
import { getDueDateStatus } from './utils/helpers'
import { pickNextColor } from './utils/course'
import { AlertCircleIcon } from './icons/SVGIcons'

const TABS = ['schedule', 'homework', 'stats']
const COURSE_TABS = ['notes', 'homework', 'attendance']

/* Hash yönlendirme: #schedule | #homework | #stats | #course/{id}[/{sekme}] */
function parseHash(hash) {
  const h = hash.replace(/^#/, '')
  if (h.startsWith('course/')) {
    const [, courseId, sub] = h.split('/')
    return { tab: 'schedule', courseId: courseId || null, courseTab: COURSE_TABS.includes(sub) ? sub : 'notes' }
  }
  return { tab: TABS.includes(h) ? h : 'schedule', courseId: null, courseTab: 'notes' }
}

function FullscreenSpinner() {
  return (
    <div className="center-fill" style={{ minHeight: '100dvh' }}>
      <div className="spinner" role="status" aria-label="Yükleniyor" />
    </div>
  )
}

/** Veritabanı erişim hatası (genellikle Firestore güvenlik kuralları) */
function PermissionBanner({ error }) {
  const denied = /permission|insufficient/i.test(error)
  return (
    <div className="alert alert-danger" role="alert" style={{ marginBottom: 'var(--s-5)' }}>
      <AlertCircleIcon size={18} />
      <span>
        <strong>{denied ? 'Veritabanı erişimi reddedildi' : 'Veriler yüklenemedi'}</strong>
        {denied
          ? 'Firebase Firestore güvenlik kuralları okuma/yazmaya izin vermiyor. Firebase Console → Firestore Database → Rules bölümüne projedeki firestore.rules içeriğini yapıştırıp yayınla (Publish).'
          : error}
      </span>
    </div>
  )
}

/** Giriş yapılmış kullanıcının uygulaması */
function PlannerApp({ user }) {
  const { weeks } = useSettings()
  const { courses, loading: coursesLoading, error: coursesError, addCourse, updateCourse, deleteCourse } = useCourses(user.uid)
  const hw = useAllHomework(user.uid, courses)
  const att = useAllAttendance(user.uid, courses, weeks)

  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const [courseModal, setCourseModal] = useState({ open: false, course: null })
  const [settingsOpen, setSettingsOpen] = useState(false)

  const selectedCourse = route.courseId ? courses.find(c => c.id === route.courseId) || null : null

  // Tarayıcı geri/ileri tuşları ve elle değiştirilen adres
  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Sayfa değişince başa kaydır
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route.tab, route.courseId])

  // Açık ders silindiyse / bağlantı geçersizse programa dön
  useEffect(() => {
    if (route.courseId && !coursesLoading && !selectedCourse) {
      window.history.replaceState(null, '', '#schedule')
      setRoute(parseHash('#schedule'))
    }
  }, [route.courseId, coursesLoading, selectedCourse])

  const navigate = useCallback((hash) => {
    if (window.location.hash === `#${hash}`) setRoute(parseHash(hash))
    else window.location.hash = hash
  }, [])

  // Ders detayından "geri" basınca gelinen sekmeye dön
  const [origin, setOrigin] = useState('schedule')
  const openCourse = useCallback((course, sub) => {
    if (!route.courseId) setOrigin(route.tab)
    navigate(sub && sub !== 'notes' ? `course/${course.id}/${sub}` : `course/${course.id}`)
  }, [navigate, route.courseId, route.tab])

  /* ---- Ders işlemleri ---- */
  const openNewCourse = useCallback(() => setCourseModal({ open: true, course: null }), [])
  const openEditCourse = useCallback((course) => setCourseModal({ open: true, course }), [])
  const closeCourseModal = useCallback(() => setCourseModal({ open: false, course: null }), [])

  const saveCourse = (data) => {
    // Firestore değişikliği yerelde anında uygular; sunucu onayını beklemeden kapat
    if (courseModal.course) {
      runInBackground(updateCourse(courseModal.course.id, data), 'Ders güncellenemedi')
    } else {
      // Başarı mesajı gösterilmiyor: ders anında listede belirir; sunucu reddederse hata bildirimi çıkar
      runInBackground(addCourse(data), 'Ders eklenemedi')
    }
    closeCourseModal()
  }

  const removeCourse = (courseId) => {
    const name = courses.find(c => c.id === courseId)?.name
    runInBackground(deleteCourse(courseId), 'Ders silinemedi')
    closeCourseModal()
    notify(`${name || 'Ders'} silindi`, 'success')
    if (route.courseId === courseId) navigate('schedule')
  }

  /* ---- Ödev işlemleri ---- */
  const homeworkActions = useMemo(() => ({
    add: (courseId, data) => runInBackground(hw.addHomework(courseId, data), 'Ödev eklenemedi'),
    update: (item, data) => runInBackground(hw.updateHomework(item.courseId, item.id, data), 'Ödev güncellenemedi'),
    toggle: (item) => runInBackground(hw.toggleComplete(item.courseId, item.id, item.isCompleted), 'Ödev güncellenemedi'),
    remove: (item) => {
      runInBackground(hw.deleteHomework(item.courseId, item.id), 'Ödev silinemedi')
      notify('Ödev silindi', 'success')
    }
  }), [hw])

  const setAttendance = useCallback((courseId, week, attended, note) => {
    runInBackground(att.toggleAttendance(courseId, week, attended, note), 'Yoklama kaydedilemedi')
  }, [att])

  // Menüde gösterilecek acil ödev sayısı (gecikmiş + 1 gün içinde)
  const urgentCount = hw.allHomework.filter(h => {
    if (h.isCompleted || !courses.some(c => c.id === h.courseId)) return false
    const s = getDueDateStatus(h.dueDate)
    return s && s.diffDays <= 1
  }).length

  let page
  if (route.courseId && !selectedCourse) {
    page = <div className="center-fill"><div className="spinner" role="status" aria-label="Yükleniyor" /></div>
  } else if (selectedCourse) {
    page = (
      <CourseDetail
        key={`${selectedCourse.id}-${route.courseTab}`}
        course={selectedCourse}
        userId={user.uid}
        homework={hw.homeworkByCourse[selectedCourse.id] || []}
        attendance={att.attendanceByCourse[selectedCourse.id]}
        onSetAttendance={setAttendance}
        homeworkActions={homeworkActions}
        onBack={() => navigate(origin)}
        backLabel={{ schedule: 'Program', homework: 'Ödevler', stats: 'Özet' }[origin]}
        onEdit={openEditCourse}
        initialTab={route.courseTab}
      />
    )
  } else if (route.tab === 'homework') {
    page = (
      <HomeworkOverview
        courses={courses}
        coursesLoading={coursesLoading}
        homework={hw.allHomework}
        loading={hw.loading}
        actions={homeworkActions}
        onAddCourse={openNewCourse}
      />
    )
  } else if (route.tab === 'stats') {
    page = (
      <StatsOverview
        courses={courses}
        coursesLoading={coursesLoading}
        homework={hw.allHomework}
        attendanceByCourse={att.attendanceByCourse}
        loading={hw.loading || att.loading}
        onOpenCourse={(c) => openCourse(c, 'attendance')}
        onAddCourse={openNewCourse}
      />
    )
  } else {
    page = (
      <SchedulePage
        courses={courses}
        coursesLoading={coursesLoading}
        homework={hw.allHomework}
        onCourseClick={(c) => openCourse(c)}
        onOpenCourse={openCourse}
        onAddCourse={openNewCourse}
        onOpenHomework={() => navigate('homework')}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    )
  }

  return (
    <>
      <AppShell
        activeTab={route.courseId ? origin : route.tab}
        onTabChange={(tab) => navigate(tab)}
        onOpenSettings={() => setSettingsOpen(true)}
        badges={{ homework: urgentCount || null }}
      >
        {coursesError && <PermissionBanner error={coursesError} />}
        {page}
      </AppShell>

      <CourseModal
        isOpen={courseModal.open}
        course={courseModal.course}
        onClose={closeCourseModal}
        onSave={saveCourse}
        onDelete={removeCourse}
        defaultColor={pickNextColor(courses)}
      />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}

function App() {
  const { user, loading } = useAuth()

  return (
    <SettingsProvider userId={user?.uid}>
      {loading ? <FullscreenSpinner /> : user ? <PlannerApp key={user.uid} user={user} /> : <LoginScreen />}
      <Toast />
    </SettingsProvider>
  )
}

export default App
