import { useEffect, useState } from 'react';

/** Her dakika güncellenen "şu an" değeri (şimdiki ders, zaman çizgisi vb. için) */
export default function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    const onVisible = () => { if (document.visibilityState === 'visible') setNow(new Date()); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [intervalMs]);
  return now;
}
