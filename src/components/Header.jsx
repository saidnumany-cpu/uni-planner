import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Üst navigasyon barı
 */
const Header = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Çıkış yapılamadı:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 'var(--z-nav)',
      padding: 'var(--space-sm) var(--space-md)',
      paddingTop: 'calc(var(--space-sm) + env(safe-area-inset-top))',
      borderRadius: '0 0 var(--glass-radius-lg) var(--glass-radius-lg)',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      <div className="flex-between">
        <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
          UniPlanner
        </h2>
        
        <div className="flex" style={{ gap: 'var(--space-sm)', alignItems: 'center' }}>
          <div className="flex" style={{ gap: 'var(--space-sm)', alignItems: 'center' }}>
            {/* Desktop only display name */}
            <span className="text-sm" style={{ display: 'none' }} /* Would use media query or inline check for mobile */>
              {user.displayName}
            </span>
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profil" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div 
                className="flex-center glass-surface" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', fontWeight: '600' }}
              >
                {getInitials(user.displayName || user.email)}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSignOut} 
            className="glass-button glass-button-icon"
            title="Çıkış Yap"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
