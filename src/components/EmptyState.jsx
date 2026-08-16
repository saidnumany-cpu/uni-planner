import React from 'react';

/**
 * Boş durum (Empty State) göstergesi
 * @param {Object} props
 * @param {string} props.icon - Emoji ikonu
 * @param {string} props.title - Başlık
 * @param {string} props.description - Açıklama metni
 * @param {React.ReactNode} [props.action] - Aksiyon butonu (opsiyonel)
 */
const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="empty-state animate-fade-in glass glass-card" style={{ maxWidth: '400px', margin: '0 auto', marginTop: 'var(--space-2xl)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>
        {icon}
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
