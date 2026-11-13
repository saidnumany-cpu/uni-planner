import { useEffect, useState } from 'react';
import { TOAST_EVENT } from '../utils/toast';
import { AlertCircleIcon, CheckCircleIcon } from '../icons/SVGIcons';

/** Ekranın altında kısa süreli bildirimler */
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
      }, toast.type === 'error' ? 5000 : 3000);
      timers.add(t);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'error' ? <AlertCircleIcon size={18} /> : <CheckCircleIcon size={18} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
