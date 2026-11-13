
/**
 * Formatlar zamanı, örn: '09:00' -> '09:00'
 * @param {string} time - Zaman stringi
 * @returns {string} Formatlanmış zaman
 */
export const formatTime = (time) => time;

/**
 * Dönem başlangıç tarihine göre mevcut haftayı hesaplar
 * @param {Date|string|number} semesterStart - Dönem başlangıç tarihi
 * @returns {number} Mevcut hafta numarası (1-14 arası)
 */
export const getCurrentWeek = (semesterStart, totalWeeks) => {
  const start = parseLocalDate(semesterStart);
  if (!start || Number.isNaN(start.getTime())) return null;
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0; // dönem henüz başlamadı
  const week = Math.floor(diffDays / 7) + 1;
  return totalWeeks && week > totalWeeks ? totalWeeks + 1 : week; // totalWeeks+1 = dönem bitti
};

/** Yerel tarihi 'YYYY-MM-DD' formatına çevirir */
export const toDateInputValue = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * Rastgele ID üretir
 * @returns {string} Rastgele ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Dersleri başlangıç saatine göre sıralar
 * @param {Object} a - İlk ders
 * @param {Object} b - İkinci ders
 * @returns {number} Sıralama değeri
 */
export const sortByTime = (a, b) => {
  if (!a.startTime || !b.startTime) return 0;
  return a.startTime.localeCompare(b.startTime);
};

/**
 * Firestore timestamp veya Date objesini formatlar
 * @param {Object|Date} timestamp - Tarih veya timestamp objesi
 * @returns {string} 'DD.MM.YYYY' formatında tarih
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * 'YYYY-MM-DD' formatındaki bir tarih stringini YEREL saat diliminde
 * bir Date objesine çevirir. `new Date('YYYY-MM-DD')` UTC gece yarısı
 * olarak yorumlanır ve negatif UTC farkına sahip saat dilimlerinde
 * tarihi bir gün geriye kaydırabilir; bu fonksiyon o kaymayı önler.
 * @param {string|Object|Date} value - Tarih stringi, Firestore Timestamp veya Date
 * @returns {Date|null}
 */
export const parseLocalDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return new Date(value);

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

/**
 * Bir son teslim tarihinin bugüne göre durumunu hesaplar (süresi geçti /
 * yaklaşıyor / normal). Ödev listelerindeki rozet mantığı için ortak kaynak.
 * @param {string|Object|Date} dueDateValue
 * @returns {{ due: Date, diffDays: number, isOverdue: boolean, isUrgent: boolean } | null}
 */
export const getDueDateStatus = (dueDateValue) => {
  const due = parseLocalDate(dueDateValue);
  if (!due) return null;

  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  return {
    due,
    diffDays,
    isOverdue: diffDays < 0,
    isUrgent: diffDays >= 0 && diffDays <= 3,
    label: diffDays < 0
      ? `${Math.abs(diffDays)} gün gecikti`
      : diffDays === 0 ? 'Bugün'
      : diffDays === 1 ? 'Yarın'
      : diffDays <= 6 ? `${diffDays} gün kaldı`
      : due.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  };
};
