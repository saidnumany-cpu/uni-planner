import { useState, useCallback, useEffect, useRef } from 'react'
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
  
  const [activeTab, setActiveTab] = useState(() => parseHash(window.location.hash).tab)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  // Use a ref to track the selected course ID for the deep-link effect
  // This avoids selectedCourse object as a dependency (which causes infinite loops)
  const selectedCourseIdRef = useRef(null)
  selectedCourseIdRef.current = selectedCourse?.id ?? null

  /* Deep linking: sync hash → state */
  useEffect(() => {
    function onHashChange() {
      const { tab, courseId } = parseHash(window.location.hash)
      setActiveTab(tab)
      if (courseId && courses.length > 0) {
        const course = courses.find(c => c.id === courseId)
        if (course) setSelectedCourse(course)
      } else if (!courseId) {
        setSelectedCourse(null)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [courses])

  /* Restore deep-linked course once courses load — only runs when courses list changes */
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseIdRef.current) {
      const { courseId } = parseHash(window.location.hash)
      if (courseId) {
        const course = courses.find(c => c.id === courseId)
        if (course) setSelectedCourse(course)
      }
    }
  }, [courses])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setSelectedCourse(null)
    window.location.hash = tab
  }, [])

  const handleCourseClick = useCallback((course) => {
    setSelectedCourse(course)
    window.location.hash = `course/${course.id}`
  }, [])

  const handleBackToSchedule = useCallback(() => {
    setSelectedCourse(null)
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

  const handleSaveCourse = useCallback(async (courseData) => {
    if (editingCourse) {
      await updateCourse(editingCourse.id, courseData)
      // Update selected course if we're editing the currently viewed one
      if (selectedCourse && selectedCourse.id === editingCourse.id) {
        setSelectedCourse({ ...selectedCourse, ...courseData })
      }
    } else {
      await addCourse(courseData)
    }
    setCourseModalOpen(false)
    setEditingCourse(null)
  }, [editingCourse, addCourse, updateCourse, selectedCourse])

  const handleDeleteCourse = useCallback(async (courseId) => {
    await deleteCourse(courseId)
    setCourseModalOpen(false)
    setEditingCourse(null)
    if (selectedCourse && selectedCourse.id === courseId) {
      setSelectedCourse(null)
      window.location.hash = 'schedule'
    }
  }, [deleteCourse, selectedCourse])

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
      </>
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
        <CourseModal
          isOpen={courseModalOpen}
          onClose={() => { setCourseModalOpen(false); setEditingCourse(null) }}
          onSave={handleSaveCourse}
          onDelete={handleDeleteCourse}
          course={editingCourse}
        />
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
            userId={user.uid}
          />
        )}
        {activeTab === 'stats' && (
          <StatsOverview
            courses={courses}
            userId={user.uid}
          />
        )}
      </main>
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => { setCourseModalOpen(false); setEditingCourse(null) }}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
        course={editingCourse}
      />
    </>
  )
}

export default App
