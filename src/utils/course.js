import { DAYS, DAY_SHORT, COURSE_COLORS, toMinutes, DEFAULT_ABSENCE_LIMIT } from './constants';

/**
 * Bir dersin haftalık oturumlarını döner.
 * Yeni kayıtlarda `sessions` dizisi vardır; eski kayıtlarda tek gün/saat alanları kullanılır.
 * @returns {Array<{day:string,startTime:string,endTime:string,location:string}>}
 */
export const getSessions = (course) => {
  if (!course) return [];
  if (Array.isArray(course.sessions) && course.sessions.length > 0) {
    return course.sessions.filter(s => s && s.day);
  }
  if (course.day) {
    return [{
      day: course.day,
      startTime: course.startTime || '09:00',
      endTime: course.endTime || '10:00',
      location: course.location || ''
    }];
  }
  return [];
};

export const getAbsenceLimit = (course) => {
  const n = Number(course?.absenceLimit);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_ABSENCE_LIMIT;
};

/** Tüm derslerin oturumlarını düz bir listeye çevirir */
export const flattenSessions = (courses) =>
  courses.flatMap(course =>
    getSessions(course).map((session, index) => ({
      key: `${course.id}-${index}`,
      course,
      ...session,
      location: session.location || course.location || '',
      dayIndex: DAYS.indexOf(session.day),
      start: toMinutes(session.startTime) ?? 0,
      end: (() => {
        const s = toMinutes(session.startTime) ?? 0;
        const e = toMinutes(session.endTime);
        return e && e > s ? e : s + 60;
      })()
    }))
  );

/** JS Date.getDay() (Pazar=0) → DAYS indeksi (Pazartesi=0) */
export const todayIndex = (date = new Date()) => (date.getDay() + 6) % 7;

/** Bir dersin oturumlarını kısa metin olarak özetler: "Pzt 09:00–10:30 · Çar 13:00–15:00" */
export const formatSessions = (course, short = true) =>
  getSessions(course)
    .map(s => `${short ? (DAY_SHORT[DAYS.indexOf(s.day)] || s.day) : s.day} ${s.startTime}–${s.endTime}`)
    .join(' · ');

/** Yeni ders için henüz kullanılmayan ilk rengi seçer */
export const pickNextColor = (courses) => {
  const used = new Set(courses.map(c => c.color));
  return (COURSE_COLORS.find(c => !used.has(c.value)) || COURSE_COLORS[courses.length % COURSE_COLORS.length]).value;
};
