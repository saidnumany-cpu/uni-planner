import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
import useNativeTabBar from '../native/useNativeTabBar';
import { CalendarIcon, ClipboardIcon, ChartIcon, SettingsIcon, GraduationCapIcon, ExamIcon } from '../icons/SVGIcons';

export const NAV_ITEMS = [
  { id: 'schedule', label: 'Program', icon: CalendarIcon },
  { id: 'exams', label: 'Sınavlar', icon: ExamIcon },
  { id: 'homework', label: 'Ödevler', icon: ClipboardIcon },
  { id: 'stats', label: 'Özet', icon: ChartIcon }
];

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true"><GraduationCapIcon size={18} /></span>
      UniPlanner
    </div>
  );
}

/**
 * Uygulama iskeleti: masaüstünde sol kenar çubuğu, telefonda üst bar + alt menü
 */
export default function AppShell({ activeTab, onTabChange, onOpenSettings, badges = {}, children }) {
  const { user } = useAuth();
  // iPhone uygulamasında alt menüyü iOS'un kendi Liquid Glass sekme çubuğu çizer
  const nativeTabBar = useNativeTabBar({ activeTab, badges, onTabChange });
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex(item => item.id === activeTab));

  // Sekme değişince mercek esneyip toparlansın (Liquid Glass hissi)
  const lensRef = useRef(null);
  const prevIndex = useRef(activeIndex);
  useEffect(() => {
    if (prevIndex.current === activeIndex) return;
    prevIndex.current = activeIndex;
    const lens = lensRef.current;
    if (!lens) return;
    lens.classList.remove('is-moving');
    void lens.offsetWidth; // animasyonu yeniden başlat
    lens.classList.add('is-moving');
  }, [activeIndex]);

  return (
    <div className="app">
      <aside className="sidebar" aria-label="Ana menü">
        <Brand />
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="sidebar-link"
                aria-current={activeTab === item.id ? 'page' : undefined}
                onClick={() => onTabChange(item.id)}
              >
                <Icon size={20} />
                <span className="grow">{item.label}</span>
                {badges[item.id] ? <span className="badge badge-primary">{badges[item.id]}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="sidebar-link" onClick={onOpenSettings}>
            <SettingsIcon size={20} /> Ayarlar
          </button>
          {user && (
            <div className="row" style={{ padding: 'var(--s-2) var(--s-3)', gap: 'var(--s-3)' }}>
              <Avatar user={user} size={32} />
              <div className="grow">
                <div className="truncate text-sm" style={{ fontWeight: 600 }}>{user.displayName || 'Kullanıcı'}</div>
                <div className="truncate text-xs subtle">{user.email}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header className="topbar">
          <Brand />
          <button type="button" className="avatar-btn" onClick={onOpenSettings} aria-label="Ayarlar ve hesap">
            {user ? <Avatar user={user} size={32} /> : <SettingsIcon />}
          </button>
        </header>

        <main className="main" id="main">{children}</main>
      </div>

      {!nativeTabBar && <nav
        className="bottom-nav"
        aria-label="Ana menü"
        style={{ '--n': NAV_ITEMS.length, '--i': activeIndex }}
      >
        <span className="bottom-nav-lens" aria-hidden="true" ref={lensRef} onAnimationEnd={(e) => e.currentTarget.classList.remove('is-moving')}>
          <span className="bottom-nav-lens-track">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <span key={item.id}>
                  <span className="nav-icon-wrap">
                    <Icon size={22} />
                    {badges[item.id] ? <span className="nav-badge">{badges[item.id]}</span> : null}
                  </span>
                  {item.label}
                </span>
              );
            })}
          </span>
        </span>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className="bottom-nav-item"
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-icon-wrap">
                <Icon size={22} />
                {badges[item.id] ? <span className="nav-badge" aria-hidden="true">{badges[item.id]}</span> : null}
              </span>
              <span>{item.label}</span>
              {badges[item.id] ? <span className="sr-only">, {badges[item.id]} acil</span> : null}
            </button>
          );
        })}
      </nav>}
    </div>
  );
}
