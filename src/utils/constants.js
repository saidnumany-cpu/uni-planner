export const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

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
