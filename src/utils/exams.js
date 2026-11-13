import { getDueDateStatus, parseLocalDate } from './helpers';
import { toMinutes } from './constants';

export const EXAM_KINDS = [
  { id: 'vize', label: 'Vize', tone: 'warning' },
  { id: 'final', label: 'Final', tone: 'danger' },
  { id: 'butunleme', label: 'Bütünleme', tone: 'primary' },
  { id: 'quiz', label: 'Quiz', tone: '' },
  { id: 'proje', label: 'Proje / Jüri', tone: 'success' },
  { id: 'diger', label: 'Diğer', tone: '' }
];

export const examKind = (id) => EXAM_KINDS.find(k => k.id === id) || EXAM_KINDS[EXAM_KINDS.length - 1];

/** Sınavın görünen adı: "Vize" ya da özel başlık */
export const examTitle = (exam) => exam?.title?.trim() || examKind(exam?.kind).label;

/** Tarih + saat sırası (tarihsizler en sonda) */
export const byExamDate = (a, b) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date.localeCompare(b.date) || (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0);
};

/** Sınav geçti mi? (Bugünkü sınav saat geçene kadar yaklaşan sayılır) */
export const isExamPast = (exam, now = new Date()) => {
  const s = getDueDateStatus(exam.date);
  if (!s) return false;
  if (s.diffDays < 0) return true;
  if (s.diffDays > 0) return false;
  const mins = toMinutes(exam.startTime);
  return mins !== null && now.getHours() * 60 + now.getMinutes() > mins + 180;
};

/** "13 Kas Cuma" gibi tarih metni */
export const formatExamDate = (exam) => {
  const d = parseLocalDate(exam.date);
  if (!d) return 'Tarih belirtilmedi';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
};

/** Geri sayım rozeti */
export const examCountdown = (exam) => {
  const s = getDueDateStatus(exam.date);
  if (!s || s.isOverdue) return null;
  const tone = s.diffDays <= 2 ? 'danger' : s.diffDays <= 7 ? 'warning' : '';
  return { tone, label: s.diffDays === 0 ? 'Bugün' : s.diffDays === 1 ? 'Yarın' : `${s.diffDays} gün kaldı` };
};
