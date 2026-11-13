/**
 * Basit global bildirim (toast) sistemi.
 * Herhangi bir yerden notify('mesaj', 'error') çağrılabilir; <Toast /> bileşeni dinler.
 */
const EVENT = 'uniplanner:toast';

export const notify = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, type, id: Date.now() + Math.random() } }));
};

export const notifyError = (err, fallback = 'İşlem başarısız oldu') => {
  console.error(err);
  const code = err?.code || '';
  let message = fallback;
  if (code === 'permission-denied') message = 'Yetki hatası: Bu işlem için izniniz yok. Lütfen tekrar giriş yapın.';
  else if (code === 'unavailable') message = 'Sunucuya ulaşılamıyor. Değişiklikler bağlantı gelince kaydedilecek.';
  notify(message, 'error');
};

/**
 * Firestore yazma işlemini arka planda çalıştırır.
 * Firestore yerel önbelleğe anında yazar; sunucu onayı (özellikle çevrimdışıyken)
 * çok uzun sürebileceği için arayüzü bekletmeyiz, sadece hata olursa bildiririz.
 */
export const runInBackground = (promise, fallback) => {
  Promise.resolve(promise).catch(err => notifyError(err, fallback));
};

export const TOAST_EVENT = EVENT;
