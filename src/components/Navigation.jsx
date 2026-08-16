import React from 'react';

/**
 * Alt navigasyon barı
 * @param {Object} props
 * @param {string} props.activeTab - Aktif sekme id'si
 * @param {Function} props.onTabChange - Sekme değiştiğinde çağrılır
 */
const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'schedule', label: 'Program', icon: '📅' },
    { id: 'assignments', label: 'Ödevler', icon: '📝' },
    { id: 'summary', label: 'Özet', icon: '📊' }
  ];

  return (
    <nav className="nav-bottom">
      {tabs.map(tab => (
        <a 
          key={tab.id}
          href={`#${tab.id}`}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange(tab.id);
          }}
          style={{ flex: 1 }}
        >
          <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default Navigation;
