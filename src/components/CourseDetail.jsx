import React, { useState } from 'react';
import WeeklyNotes from './WeeklyNotes';
import HomeworkList from './HomeworkList';
import AttendanceTracker from './AttendanceTracker';

/**
 * Tek bir ders için detay görünümü
 * @param {Object} course - Ders objesi
 * @param {string} userId - Kullanıcı ID'si
 * @param {Function} onBack - Geri dönme fonksiyonu
 * @param {Function} onEditCourse - Dersi düzenleme fonksiyonu
 */
export default function CourseDetail({ course, userId, onBack, onEditCourse }) {
  const [activeTab, setActiveTab] = useState('notes');

  if (!course) return null;

  return (
    <div className="course-detail animate-fade-in pb-20">
      {/* Header */}
      <div className="flex-between mb-4">
        <button className="glass-button" onClick={onBack}>
          ← Geri
        </button>
      </div>

      {/* Ders Bilgileri */}
      <div 
        className="glass-card mb-6"
        style={{ borderTop: `4px solid ${course.color || 'var(--accent-purple)'}` }}
      >
        <div className="flex-between">
          <h2>{course.name}</h2>
          <button className="glass-button glass-button-icon" onClick={() => onEditCourse(course)}>
            ✏️
          </button>
        </div>
        
        <p className="text-secondary mb-3">{course.instructor}</p>
        
        <div className="flex gap-md text-sm text-tertiary">
          <div className="flex items-center gap-xs">
            🕒 {course.day} {course.startTime}-{course.endTime}
          </div>
          <div className="flex items-center gap-xs">
            📍 {course.location || 'Belirtilmedi'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs glass">
        <button 
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notlar
        </button>
        <button 
          className={`tab ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => setActiveTab('homework')}
        >
          📋 Ödevler
        </button>
        <button 
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          ✅ Yoklama
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content animate-slide-up">
        {activeTab === 'notes' && (
          <WeeklyNotes userId={userId} courseId={course.id} />
        )}
        {activeTab === 'homework' && (
          <HomeworkList userId={userId} courseId={course.id} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTracker userId={userId} courseId={course.id} />
        )}
      </div>
    </div>
  );
}
