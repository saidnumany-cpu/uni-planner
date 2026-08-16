import { useState, useCallback } from 'react'
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

function App() {
  const { user, loading: authLoading } = useAuth()
  const { courses, loading: coursesLoading, addCourse, updateCourse, deleteCourse } = useCourses(user?.uid)
  
  const [activeTab, setActiveTab] = useState('schedule')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const handleCourseClick = useCallback((course) => {
    setSelectedCourse(course)
  }, [])

  const handleBackToSchedule = useCallback(() => {
    setSelectedCourse(null)
  }, [])

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
    }
  }, [deleteCourse, selectedCourse])

  // Auth loading state
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="loading-spinner" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <LoginScreen />
  }

  // Course detail view
  if (selectedCourse) {
    return (
      <>
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <Header />
        <main className="container animate-fade-in">
          <CourseDetail
            course={selectedCourse}
            userId={user.uid}
            onBack={handleBackToSchedule}
            onEditCourse={() => handleEditCourse(selectedCourse)}
          />
        </main>
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
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
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
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
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
