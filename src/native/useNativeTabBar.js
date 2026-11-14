import { useEffect, useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { useSettings } from '../contexts/SettingsContext';
import useMediaQuery from '../hooks/useMediaQuery';

const NativeTabBar = registerPlugin('NativeTabBar');

/** iPhone uygulamasında iOS'un kendi (Liquid Glass) sekme çubuğu var mı? */
export const hasNativeTabBar = Capacitor.getPlatform() === 'ios' && Capacitor.isPluginAvailable('NativeTabBar');

/** Açık modal varsa (Modal.jsx html[data-modal-open] koyar) sekme çubuğu gizlenir; yoksa modalın üstünde kalırdı */
function useModalOpen() {
  const [open, setOpen] = useState(() => document.documentElement.hasAttribute('data-modal-open'));
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setOpen(el.hasAttribute('data-modal-open')));
    obs.observe(el, { attributes: true, attributeFilter: ['data-modal-open'] });
    return () => obs.disconnect();
  }, []);
  return open;
}

/**
 * Alt menüyü iOS'ta sistemin sekme çubuğuna devreder (ios/App/App/NativeTabBar.swift).
 * @returns {boolean} sistem çubuğu etkin mi (etkinse web alt menüsü çizilmez)
 */
export default function useNativeTabBar({ activeTab, badges, onTabChange }) {
  const { resolvedTheme } = useSettings();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const modalOpen = useModalOpen();
  const enabled = hasNativeTabBar;

  const onTabChangeRef = useRef(onTabChange);
  onTabChangeRef.current = onTabChange;

  // Sekmeye dokunulunca React tarafında aynı sayfaya geç
  useEffect(() => {
    if (!enabled) return;
    const handle = NativeTabBar.addListener('select', ({ id }) => onTabChangeRef.current?.(id));
    return () => { handle.then(h => h.remove()); };
  }, [enabled]);

  // Alt boşluk artık sistem çubuğuna göre (güvenli alan çubuğu içerir)
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('native-tabbar');
    return () => document.documentElement.classList.remove('native-tabbar');
  }, [enabled]);

  const badgesKey = JSON.stringify(badges);

  useEffect(() => {
    if (!enabled) return;
    NativeTabBar.render({
      selected: activeTab,
      badges,
      theme: resolvedTheme,
      visible: !isDesktop && !modalOpen
    }).catch(err => console.error('Sekme çubuğu:', err));
    // badges anahtarla izleniyor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, activeTab, badgesKey, resolvedTheme, isDesktop, modalOpen]);

  // Kabuk kaldırılınca (ör. çıkış yapınca) çubuğu gizle
  useEffect(() => {
    if (!enabled) return;
    return () => { NativeTabBar.render({ visible: false }).catch(() => {}); };
  }, [enabled]);

  return enabled;
}
