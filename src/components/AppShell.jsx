import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
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

      <nav
        className="bottom-nav"
        aria-label="Ana menü"
        style={{ '--n': NAV_ITEMS.length, '--i': Math.max(0, NAV_ITEMS.findIndex(item => item.id === activeTab)) }}
      >
        <span className="bottom-nav-lens" aria-hidden="true" />
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
              {item.label}
              {badges[item.id] ? <span className="sr-only">, {badges[item.id]} acil</span> : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
