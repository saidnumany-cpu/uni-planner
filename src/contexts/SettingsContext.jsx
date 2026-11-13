import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_SEMESTER_WEEKS } from '../utils/constants';
import { getCurrentWeek } from '../utils/helpers';

const SettingsContext = createContext(null);
const THEME_KEY = 'uniplanner-theme';

const readTheme = () => {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
};

/** html[data-theme] özniteliğini ve tarayıcı tema rengini günceller */
const applyTheme = (theme) => {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#0b0f17' : '#f6f7fb');
  return resolved;
};

export function SettingsProvider({ userId, children }) {
  const [settings, setSettings] = useState({});
  const [theme, setThemeState] = useState(readTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => applyTheme(readTheme()));

  // Tema: seçim değişince ya da sistem teması değişince uygula
  useEffect(() => {
    setResolvedTheme(applyTheme(theme));
    if (theme !== 'system') return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onChange = () => setResolvedTheme(applyTheme('system'));
    mq?.addEventListener('change', onChange);
    return () => mq?.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((value) => {
    try { localStorage.setItem(THEME_KEY, value); } catch { /* gizli mod */ }
    setThemeState(value);
  }, []);

  // Dönem ayarları Firestore'da: users/{uid}/meta/settings
  useEffect(() => {
    if (!userId) { setSettings({}); return; }
    return onSnapshot(
      doc(db, `users/${userId}/meta/settings`),
      (snap) => setSettings(snap.exists() ? snap.data() : {}),
      (err) => console.error('Ayarlar okunamadı:', err)
    );
  }, [userId]);

  const updateSettings = useCallback((data) => {
    if (!userId) return Promise.reject(new Error('Kullanıcı girişi gerekli'));
    return setDoc(doc(db, `users/${userId}/meta/settings`), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  }, [userId]);

  const value = useMemo(() => {
    const weeks = Number(settings.weeks) > 0 ? Number(settings.weeks) : DEFAULT_SEMESTER_WEEKS;
    const semesterStart = settings.semesterStart || '';
    return {
      weeks,
      semesterStart,
      currentWeek: semesterStart ? getCurrentWeek(semesterStart, weeks) : null,
      updateSettings,
      theme,
      resolvedTheme,
      setTheme
    };
  }, [settings, updateSettings, theme, resolvedTheme, setTheme]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
