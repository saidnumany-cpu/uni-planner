export const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

/**
 * 15 dakikalık aralıklarla saat dilimleri (08:00 - 22:00)
 * Her slot = 15 dakika
 */
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  slots.push('22:00');
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();

/**
 * Bir saat stringinin tam saat olup olmadığını kontrol eder
 * @param {string} time - 'HH:MM' formatında saat
 */
export const isFullHour = (time) => time.endsWith(':00');

/**
 * Verilen startTime'dan 1 saat sonrasını döner
 * @param {string} startTime - Başlangıç saati
 * @returns {string} Bitiş saati
 */
export const getDefaultEndTime = (startTime) => {
  const idx = TIME_SLOTS.indexOf(startTime);
  // 1 saat = 4 slot (15 dk × 4)
  const endIdx = Math.min(idx + 4, TIME_SLOTS.length - 1);
  return TIME_SLOTS[endIdx];
};

export const COURSE_COLORS = [
  '#7c3aed', // purple
  '#2563eb', // blue
  '#0891b2', // cyan
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#db2777', // pink
  '#4f46e5', // indigo
  '#0d9488', // teal
  '#ea580c'  // orange
];

export const SEMESTER_WEEKS = 14;

export const WEEK_LABELS = Array.from({ length: SEMESTER_WEEKS }, (_, i) => `${i + 1}. Hafta`);
