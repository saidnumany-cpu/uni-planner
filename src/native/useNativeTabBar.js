import { useEffect, useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { useSettings } from '../contexts/SettingsContext';
import useMediaQuery from '../hooks/useMediaQuery';

const NativeTabBar = registerPlugin('NativeTabBar');

/** iOS uygulamasında native (gerçek Liquid Glass) sekme çubuğu kullanılabilir mi? */
export const hasNativeTabBar = Capacitor.getPlatform() === 'ios' && Capacitor.isPluginAvailable('NativeTabBar');

/** Açık modal varsa (Modal.jsx html[data-modal-open] koyar) native çubuk gizlenir; aksi hâlde modalın üstünde kalırdı */
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
 * Alt menüyü iOS'ta native sekme çubuğuna devreder.
 * @returns {boolean} native çubuk etkin mi (etkinse web alt menüsü çizilmez)
 */
export default function useNativeTabBar({ items, activeTab, badges, onTabChange }) {
  const { resolvedTheme } = useSettings();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const modalOpen = useModalOpen();
  const enabled = hasNativeTabBar;

  const onTabChangeRef = useRef(onTabChange);
  onTabChangeRef.current = onTabChange;

  // Dokunma olaylarını dinle
  useEffect(() => {
    if (!enabled) return;
    const handle = NativeTabBar.addListener('select', ({ id }) => onTabChangeRef.current?.(id));
    return () => { handle.then(h => h.remove()); };
  }, [enabled]);

  const itemsKey = items.map(i => `${i.id}|${i.label}|${i.sf}`).join(',');
  const badgesKey = JSON.stringify(badges);

  // Durumu native tarafa gönder
  useEffect(() => {
    if (!enabled) return;
    NativeTabBar.render({
      items: items.map(i => ({ id: i.id, label: i.label, icon: i.sf })),
      selected: activeTab,
      badges,
      theme: resolvedTheme,
      visible: !isDesktop && !modalOpen
    }).catch(err => console.error('Native sekme çubuğu:', err));
    // items/badges anahtarlarla izleniyor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, itemsKey, activeTab, badgesKey, resolvedTheme, isDesktop, modalOpen]);

  // Kabuk kaldırılınca (ör. çıkış yapınca) çubuğu gizle
  useEffect(() => {
    if (!enabled) return;
    return () => { NativeTabBar.render({ visible: false }).catch(() => {}); };
  }, [enabled]);

  return enabled;
}
