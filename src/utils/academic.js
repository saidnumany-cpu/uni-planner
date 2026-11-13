import { parseLocalDate, toDateInputValue } from './helpers';

/** Akademik takvim dönem türleri */
export const PERIOD_KINDS = {
  midterm: { label: 'Vize haftası', short: 'Vize', tone: 'warning', noClasses: true },
  final: { label: 'Final sınavları', short: 'Final', tone: 'danger', noClasses: true },
  makeup: { label: 'Bütünleme', short: 'Büt', tone: 'primary', noClasses: true },
  holiday: { label: 'Tatil', short: 'Tatil', tone: 'success', noClasses: true },
  other: { label: 'Diğer', short: 'Etkinlik', tone: '', noClasses: false }
};

export const periodKind = (p) => PERIOD_KINDS[p?.kind] || PERIOD_KINDS.other;
export const periodLabel = (p) => p?.label || periodKind(p).label;

/**
 * İstanbul Medeniyet Üniversitesi 2026-2027 lisans akademik takvimi
 * (Diş Hekimliği, Hukuk, Tıp ve YDYO hariç).
 */
export const IMU_2026_27 = {
  name: 'İMÜ 2026–2027 lisans',
  terms: [
    { id: 'guz', name: '2026–2027 Güz', start: '2026-09-14', end: '2027-01-15', weeks: 14 },
    { id: 'bahar', name: '2026–2027 Bahar', start: '2027-01-25', end: '2027-06-01', weeks: 14 }
  ],
  periods: [
    { id: 'imu-guz-vize', kind: 'midterm', label: 'Güz vize haftası', start: '2026-11-02', end: '2026-11-08' },
    { id: 'imu-guz-final', kind: 'final', label: 'Güz final sınavları', start: '2026-12-26', end: '2027-01-05' },
    { id: 'imu-guz-but', kind: 'makeup', label: 'Güz bütünleme sınavları', start: '2027-01-09', end: '2027-01-15' },
    { id: 'imu-bahar-vize', kind: 'midterm', label: 'Bahar vize haftası', start: '2027-03-15', end: '2027-03-21' },
    { id: 'imu-bahar-final', kind: 'final', label: 'Bahar final sınavları', start: '2027-05-08', end: '2027-05-21' },
    { id: 'imu-bahar-but', kind: 'makeup', label: 'Bahar bütünleme sınavları', start: '2027-05-25', end: '2027-05-31' }
  ]
};

const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Takvimi başlangıç tarihine göre sıralı, geçerli kayıtlara indirger */
export const normalizePeriods = (periods) =>
  (Array.isArray(periods) ? periods : [])
    .filter(p => p && p.start)
    .map(p => ({ ...p, end: p.end && p.end >= p.start ? p.end : p.start }))
    .sort((a, b) => a.start.localeCompare(b.start));

/** Verilen tarih (Date) hangi dönemlerin içinde? */
export const periodsOn = (periods, date) => {
  const key = toDateInputValue(date);
  return periods.filter(p => p.start <= key && key <= p.end);
};

/** Bir tarih aralığıyla çakışan dönemler */
export const periodsBetween = (periods, from, to) => {
  const a = toDateInputValue(from);
  const b = toDateInputValue(to);
  return periods.filter(p => p.start <= b && p.end >= a);
};

/** Pazartesi–Cuma tamamen derssiz bir dönemin içinde mi? */
const isBreakWeek = (monday, periods) => {
  const fri = addDays(monday, 4);
  const a = toDateInputValue(monday);
  const b = toDateInputValue(fri);
  return periods.some(p => periodKind(p).noClasses && p.start <= a && p.end >= b);
};

/**
 * Dönemin ders haftalarını hesaplar. Vize haftası gibi derssiz haftalar atlanır.
 * @returns {Array<{week:number, start:Date, end:Date}>}
 */
export const teachingWeeks = (semesterStart, totalWeeks, periods = []) => {
  const start = parseLocalDate(semesterStart);
  if (!start || Number.isNaN(start.getTime()) || !totalWeeks) return [];
  // Haftalar dönem başlangıcının olduğu haftanın Pazartesi'sinden sayılır
  let monday = startOfDay(start);
  monday = addDays(monday, -((monday.getDay() + 6) % 7));
  const out = [];
  let guard = 0;
  while (out.length < totalWeeks && guard < totalWeeks + 20) {
    if (!isBreakWeek(monday, periods)) {
      out.push({ week: out.length + 1, start: new Date(monday), end: addDays(monday, 6) });
    }
    monday = addDays(monday, 7);
    guard++;
  }
  return out;
};

/**
 * Bugün dönemin kaçıncı ders haftası?
 * 0 = dönem başlamadı, totalWeeks+1 = dönem bitti.
 * Derssiz bir haftadaysak (ör. vize) son ders haftası döner.
 */
export const currentTeachingWeek = (semesterStart, totalWeeks, periods = [], now = new Date()) => {
  const list = teachingWeeks(semesterStart, totalWeeks, periods);
  if (!list.length) return null;
  const today = startOfDay(now);
  if (today < list[0].start) return 0;
  const last = list[list.length - 1];
  if (today > last.end) return totalWeeks + 1;
  let current = 1;
  for (const w of list) {
    if (w.start <= today) current = w.week;
  }
  return current;
};

/** "2–8 Kas" / "26 Ara – 5 Oca 2027" gibi kısa aralık metni */
export const formatRange = (startValue, endValue, withYear = false) => {
  const s = parseLocalDate(startValue);
  const e = parseLocalDate(endValue || startValue);
  if (!s) return '';
  const fmt = (d, opts) => d.toLocaleDateString('tr-TR', opts);
  const yearOpt = withYear ? { year: 'numeric' } : {};
  if (!e || toDateInputValue(s) === toDateInputValue(e)) return fmt(s, { day: 'numeric', month: 'short', ...yearOpt });
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${fmt(e, { day: 'numeric', month: 'short', ...yearOpt })}`;
  }
  return `${fmt(s, { day: 'numeric', month: 'short' })} – ${fmt(e, { day: 'numeric', month: 'short', ...yearOpt })}`;
};

/** Dönemin bugüne göre durumu: { state: 'now'|'soon'|'later'|'past', days } */
export const periodStatus = (p, now = new Date()) => {
  const today = startOfDay(now);
  const s = parseLocalDate(p.start);
  const e = parseLocalDate(p.end || p.start);
  if (today > e) return { state: 'past', days: Math.round((today - e) / DAY) };
  if (today >= s) return { state: 'now', days: Math.round((e - today) / DAY) };
  const days = Math.round((s - today) / DAY);
  return { state: days <= 14 ? 'soon' : 'later', days };
};

/** Hazır takvimden bugüne uyan yarıyılı seçer */
export const pickPresetTerm = (preset, now = new Date()) => {
  const key = toDateInputValue(now);
  return preset.terms.find(t => key <= t.end) || preset.terms[preset.terms.length - 1];
};

/** Dönem başlangıcından arşiv için varsayılan ad üretir: "2026–2027 Güz" */
export const suggestTermName = (semesterStart) => {
  const d = parseLocalDate(semesterStart) || new Date();
  const m = d.getMonth(); // 0=Ocak
  if (m >= 7) return `${d.getFullYear()}–${d.getFullYear() + 1} Güz`;
  if (m <= 5) return `${d.getFullYear() - 1}–${d.getFullYear()} Bahar`;
  return `${d.getFullYear()} Yaz`;
};
