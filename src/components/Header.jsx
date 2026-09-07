import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOutIcon, UserIcon } from '../icons/SVGIcons';

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
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return parts[0][0].toUpperCase();
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
            {user.displayName && (
              <span className="text-sm header-username">
                {user.displayName}
              </span>
            )}
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profil" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div 
                className="flex-center glass-surface" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', fontWeight: '600', color: 'var(--text-secondary)' }}
              >
                {user.displayName || user.email ? getInitials(user.displayName || user.email) : <UserIcon size={20} />}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSignOut} 
            className="glass-button glass-button-icon"
            title="Çıkış Yap"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <LogOutIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
