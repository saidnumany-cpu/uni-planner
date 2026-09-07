import React, { useRef } from 'react';
import { CalendarIcon, ClipboardIcon, ChartIcon } from '../icons/SVGIcons';

/**
 * Alt navigasyon barı
 * @param {Object} props
 * @param {string} props.activeTab - Aktif sekme id'si
 * @param {Function} props.onTabChange - Sekme değiştiğinde çağrılır
 */
const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'schedule', label: 'Program', icon: <CalendarIcon size={24} /> },
    { id: 'homework', label: 'Ödevler', icon: <ClipboardIcon size={24} /> },
    { id: 'stats', label: 'Özet', icon: <ChartIcon size={24} /> }
  ];

  const tabRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    let newIndex;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (newIndex !== undefined) {
      e.preventDefault();
      tabRefs.current[newIndex]?.focus();
      onTabChange(tabs[newIndex].id);
    }
  };

  return (
    <nav className="nav-bottom" role="tablist" aria-label="Main Navigation">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[index] = el)}
          id={`tab-${tab.id}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange(tab.id);
          }}
          onKeyDown={(e) => handleKeyDown(e, index)}
          style={{ flex: 1, minHeight: '44px', minWidth: '44px', border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
