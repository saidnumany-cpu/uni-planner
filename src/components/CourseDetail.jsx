import React, { useState } from 'react';
import WeeklyNotes from './WeeklyNotes';
import HomeworkList from './HomeworkList';
import AttendanceTracker from './AttendanceTracker';
import { BookOpenIcon, ClipboardIcon, CheckCircleIcon, ChevronLeftIcon } from '../icons/SVGIcons';

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
        <button 
          className="glass-button flex items-center gap-xs" 
          onClick={onBack}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <ChevronLeftIcon size={20} />
          <span>Geri</span>
        </button>
      </div>

      {/* Ders Bilgileri */}
      <div 
        className="glass-card mb-6"
        style={{ borderTop: `4px solid ${course.color || 'var(--accent-purple)'}` }}
      >
        <div className="flex-between">
          <h2>{course.name}</h2>
          <button 
            className="glass-button glass-button-icon" 
            onClick={() => onEditCourse(course)} 
            aria-label="Dersi düzenle"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
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
      <div className="tabs glass" role="tablist" aria-label="Course Sections">
        <button 
          role="tab"
          aria-selected={activeTab === 'notes'}
          aria-controls="panel-notes"
          id="tab-notes"
          className={`tab flex-center gap-xs ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
          style={{ minHeight: '44px' }}
        >
          <BookOpenIcon size={18} /> Notlar
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'homework'}
          aria-controls="panel-homework"
          id="tab-homework"
          className={`tab flex-center gap-xs ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => setActiveTab('homework')}
          style={{ minHeight: '44px' }}
        >
          <ClipboardIcon size={18} /> Ödevler
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'attendance'}
          aria-controls="panel-attendance"
          id="tab-attendance"
          className={`tab flex-center gap-xs ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
          style={{ minHeight: '44px' }}
        >
          <CheckCircleIcon size={18} /> Yoklama
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content animate-slide-up">
        {activeTab === 'notes' && (
          <div id="panel-notes" role="tabpanel" aria-labelledby="tab-notes" tabIndex={0}>
            <WeeklyNotes userId={userId} courseId={course.id} />
          </div>
        )}
        {activeTab === 'homework' && (
          <div id="panel-homework" role="tabpanel" aria-labelledby="tab-homework" tabIndex={0}>
            <HomeworkList userId={userId} courseId={course.id} />
          </div>
        )}
        {activeTab === 'attendance' && (
          <div id="panel-attendance" role="tabpanel" aria-labelledby="tab-attendance" tabIndex={0}>
            <AttendanceTracker userId={userId} courseId={course.id} />
          </div>
        )}
      </div>
    </div>
  );
}
