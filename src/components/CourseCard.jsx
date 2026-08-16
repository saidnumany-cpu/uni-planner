import React from 'react';

/**
 * Tekil ders kartı componenti
 * @param {Object} props
 * @param {Object} props.course - Ders verisi
 * @param {Function} props.onClick - Tıklama işleyicisi
 */
const CourseCard = ({ course, onClick }) => {
  if (!course) return null;
  
  const { name, startTime, endTime, location, color } = course;

  return (
    <div 
      className="glass course-card course-card-color"
      style={{ 
        '--course-color': color || 'var(--accent-purple)',
        padding: 'var(--space-sm)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={onClick}
    >
      <h3 className="text-sm" style={{ 
        margin: 0, 
        marginBottom: '4px', 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis' 
      }}>
        {name}
      </h3>
      
      <div className="text-xs text-secondary" style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <span>⏰</span> {startTime} - {endTime}
        </div>
        {location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📍</span> {location}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
