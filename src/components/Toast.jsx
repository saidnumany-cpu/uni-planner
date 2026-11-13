import { useEffect, useState } from 'react';
import { TOAST_EVENT } from '../utils/toast';

/** Ekranın altında kısa süreli bildirimler gösterir */
export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Set();
    const onToast = (e) => {
      const toast = e.detail;
      setToasts(prev => [...prev.slice(-2), toast]);
      const t = setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== toast.id));
        timers.delete(t);
      }, 4000);
      timers.add(t);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast glass toast-${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}
