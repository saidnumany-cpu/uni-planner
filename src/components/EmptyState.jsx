import React from 'react';

/**
 * Boş durum (Empty State) göstergesi
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - SVG ikonu
 * @param {string} [props.emoji] - Emoji ikonu (geriye dönük uyumluluk için)
 * @param {string} props.title - Başlık
 * @param {string} props.description - Açıklama metni
 * @param {React.ReactNode} [props.action] - Aksiyon butonu (opsiyonel)
 */
const EmptyState = ({ icon, emoji, title, description, action }) => {
  // If icon is provided, render it (with size 48). 
  // If emoji is used, render as span with aria-hidden.
  // We'll also handle the case where old code passed emoji string to icon prop.
  
  const isEmojiString = (val) => typeof val === 'string';
  const displayEmoji = emoji || (isEmojiString(icon) ? icon : null);
  const displayIcon = !isEmojiString(icon) ? icon : null;

  return (
    <div className="empty-state animate-fade-in glass glass-card" style={{ maxWidth: '400px', margin: '0 auto', marginTop: 'var(--space-2xl)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
        {displayIcon && React.isValidElement(displayIcon) ? (
          // Clone the icon to enforce size if it's an SVG component, or just render it
          React.cloneElement(displayIcon, { size: 48 })
        ) : displayEmoji ? (
          <span aria-hidden="true">{displayEmoji}</span>
        ) : null}
      </div>
      <h3 style={{ marginBottom: 'var(--space-xs)' }}>
        {title}
      </h3>
      <p className="text-secondary text-sm" style={{ marginBottom: action ? 'var(--space-lg)' : 0 }}>
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
