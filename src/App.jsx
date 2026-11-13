import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useCourses } from './hooks/useCourses'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import Navigation from './components/Navigation'
import WeeklySchedule from './components/WeeklySchedule'
import CourseDetail from './components/CourseDetail'
import CourseModal from './components/CourseModal'
import HomeworkOverview from './components/HomeworkOverview'
import StatsOverview from './components/StatsOverview'
import Toast from './components/Toast'
import { runInBackground } from './utils/toast'

/* Shared background orbs — rendered once, not duplicated */
function BackgroundOrbs() {
  return (
    <>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
    </>
  )
}

/* Parse hash route: #schedule | #homework | #stats | #course/{id} */
function parseHash(hash) {
  const h = hash.replace('#', '')
  if (h.startsWith('course/')) {
    return { tab: 'schedule', courseId: h.split('/')[1] || null }
  }
  if (['schedule', 'homework', 'stats'].includes(h)) {
    return { tab: h, courseId: null }
  }
  return { tab: 'schedule', courseId: null }
}

function App() {
  const { user, loading: authLoading } = useAuth()
  const { courses, loading: coursesLoading, addCourse, updateCourse, deleteCourse } = useCourses(user?.uid)

  const initialRoute = parseHash(window.location.hash)
  const [activeTab, setActiveTab] = useState(initialRoute.tab)
  // Sadece seçili dersin ID'sini tutuyoruz; ders verisi her zaman canlı `courses`
  // listesinden okunur. Böylece düzenleme/silme sonrası eski (bayat) veri gösterilmez.
  const [selectedCourseId, setSelectedCourseId] = useState(initialRoute.courseId)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const selectedCourse = selectedCourseId
    ? courses.find(c => c.id === selectedCourseId) || null
    : null

  /* Deep linking: hash → state (tarayıcı geri/ileri tuşları dahil) */
  useEffect(() => {
    function onHashChange() {
      const { tab, courseId } = parseHash(window.location.hash)
      setActiveTab(tab)
      setSelectedCourseId(courseId)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  /* Seçili ders artık yoksa (silindiyse / geçersiz link) programa dön */
  useEffect(() => {
    if (selectedCourseId && !coursesLoading && !courses.some(c => c.id === selectedCourseId)) {
      setSelectedCourseId(null)
      if (window.location.hash.startsWith('#course/')) {
        window.history.replaceState(null, '', '#schedule')
      }
    }
  }, [selectedCourseId, courses, coursesLoading])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setSelectedCourseId(null)
    window.location.hash = tab
  }, [])

  const handleCourseClick = useCallback((course) => {
    setSelectedCourseId(course.id)
    window.location.hash = `course/${course.id}`
  }, [])

  const handleBackToSchedule = useCallback(() => {
    setSelectedCourseId(null)
    window.location.hash = activeTab
  }, [activeTab])

  const handleAddCourse = useCallback(() => {
    setEditingCourse(null)
    setCourseModalOpen(true)
  }, [])

  const handleEditCourse = useCallback((course) => {
    setEditingCourse(course)
    setCourseModalOpen(true)
  }, [])

  const closeCourseModal = useCallback(() => {
    setCourseModalOpen(false)
    setEditingCourse(null)
  }, [])

  const handleSaveCourse = useCallback((courseData) => {
    // Firestore değişikliği yerelde anında uygular; sunucu onayını beklemeden
    // modalı kapatıyoruz (çevrimdışıyken onay hiç gelmeyebilir).
    if (editingCourse) {
      runInBackground(updateCourse(editingCourse.id, courseData), 'Ders güncellenemedi')
    } else {
      runInBackground(addCourse(courseData), 'Ders eklenemedi')
    }
    closeCourseModal()
  }, [editingCourse, addCourse, updateCourse, closeCourseModal])

  const handleDeleteCourse = useCallback((courseId) => {
    runInBackground(deleteCourse(courseId), 'Ders silinemedi')
    closeCourseModal()
    if (selectedCourseId === courseId) {
      setSelectedCourseId(null)
      window.location.hash = 'schedule'
    }
  }, [deleteCourse, selectedCourseId, closeCourseModal])

  const courseModal = (
    <CourseModal
      isOpen={courseModalOpen}
      onClose={closeCourseModal}
      onSave={handleSaveCourse}
      onDelete={handleDeleteCourse}
      course={editingCourse}
    />
  )

  // Auth loading state
  if (authLoading) {
    return (
      <div className="app-loading">
        <BackgroundOrbs />
        <div className="loading-spinner" aria-label="Yükleniyor" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <>
        <BackgroundOrbs />
        <LoginScreen />
        <Toast />
      </>
    )
  }

  // Deep-link ile açılan ders henüz yüklenmediyse bekle
  if (selectedCourseId && !selectedCourse && coursesLoading) {
    return (
      <div className="app-loading">
        <BackgroundOrbs />
        <div className="loading-spinner" aria-label="Yükleniyor" />
      </div>
    )
  }

  // Course detail view — Navigation stays visible
  if (selectedCourse) {
    return (
      <>
        <BackgroundOrbs />
        <Header />
        <main className="container animate-fade-in">
          <CourseDetail
            course={selectedCourse}
            userId={user.uid}
            onBack={handleBackToSchedule}
            onEditCourse={() => handleEditCourse(selectedCourse)}
          />
        </main>
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
        {courseModal}
        <Toast />
      </>
    )
  }

  // Main app view
  return (
    <>
      <BackgroundOrbs />
      <Header />
      <main className="container">
        {activeTab === 'schedule' && (
          <WeeklySchedule
            courses={courses}
            loading={coursesLoading}
            onCourseClick={handleCourseClick}
            onAddCourse={handleAddCourse}
          />
        )}
        {activeTab === 'homework' && (
          <HomeworkOverview
            courses={courses}
            coursesLoading={coursesLoading}
            userId={user.uid}
          />
        )}
        {activeTab === 'stats' && (
          <StatsOverview
            courses={courses}
            coursesLoading={coursesLoading}
            userId={user.uid}
          />
        )}
      </main>
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      {courseModal}
      <Toast />
    </>
  )
}

export default App
