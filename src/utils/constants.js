/** Haftanın günleri (Pazartesi = 0) */
export const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const DAY_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const WEEKDAY_COUNT = 5; // Hafta sonu sütunları yalnızca o günlerde ders varsa gösterilir

/**
 * 15 dakikalık aralıklarla saat dilimleri (07:00 - 23:00)
 */
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  slots.push('23:00');
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();

/** 'HH:MM' → dakika (geçersizse null) */
export const toMinutes = (time) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(time || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/** dakika → 'HH:MM' */
export const fromMinutes = (mins) => {
  const clamped = Math.max(0, Math.min(mins, 23 * 60 + 59));
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
};

/** Başlangıç saatinden varsayılan bitiş (1 saat sonrası, en geç 23:00) */
export const getDefaultEndTime = (startTime) => {
  const start = toMinutes(startTime) ?? 9 * 60;
  return fromMinutes(Math.min(start + 60, 23 * 60));
};

export const COURSE_COLORS = [
  { value: '#2563eb', label: 'Mavi' },
  { value: '#7c3aed', label: 'Mor' },
  { value: '#0891b2', label: 'Camgöbeği' },
  { value: '#059669', label: 'Yeşil' },
  { value: '#d97706', label: 'Amber' },
  { value: '#dc2626', label: 'Kırmızı' },
  { value: '#db2777', label: 'Pembe' },
  { value: '#4f46e5', label: 'İndigo' },
  { value: '#0d9488', label: 'Deniz yeşili' },
  { value: '#ea580c', label: 'Turuncu' }
];

export const DEFAULT_SEMESTER_WEEKS = 14;
/** Türk üniversitelerinde yaygın: teorik derslerde %30 devamsızlık hakkı (14 haftada 4) */
export const DEFAULT_ABSENCE_LIMIT = 4;
