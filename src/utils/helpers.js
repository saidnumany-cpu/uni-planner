import { DAYS, TIME_SLOTS } from './constants';

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
export const getCurrentWeek = (semesterStart) => {
  const start = new Date(semesterStart);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(diffDays / 7));
};

/**
 * Zamanın indeksini döner
 * @param {string} time - '08:00' gibi bir saat stringi
 * @returns {number} TIME_SLOTS içindeki indeksi
 */
export const getTimeSlotIndex = (time) => {
  return TIME_SLOTS.indexOf(time);
};

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
 * Günün indeksini döner
 * @param {string} day - Gün adı
 * @returns {number} DAYS içindeki indeksi
 */
export const getDayIndex = (day) => {
  return DAYS.indexOf(day);
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
    isUrgent: diffDays >= 0 && diffDays <= 3
  };
};
