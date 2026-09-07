import React from 'react';
import { ClockIcon, MapPinIcon } from '../icons/SVGIcons';

/**
 * Tekil ders kartı componenti
 * @param {Object} props
 * @param {Object} props.course - Ders verisi
 * @param {Function} props.onClick - Tıklama işleyicisi
 */
const CourseCard = ({ course, onClick }) => {
  if (!course) return null;
  
  const { name, startTime, endTime, location, color } = course;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <div 
      className="glass course-card course-card-color"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ 
        '--course-color': color || 'var(--accent-purple)',
        padding: 'var(--space-sm)',
        height: '100%',
        minHeight: '44px',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={onClick}
    >
      <h3 className="text-sm" style={{ 
        margin: 0, 
        marginBottom: '4px', 
        fontSize: 'max(0.8125rem, 1em)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {name}
      </h3>
      
      <div className="text-xs text-secondary" style={{ marginTop: 'auto', fontSize: 'max(0.75rem, 13px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <ClockIcon size={14} /> {startTime} - {endTime}
        </div>
        {location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPinIcon size={14} /> {location}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
