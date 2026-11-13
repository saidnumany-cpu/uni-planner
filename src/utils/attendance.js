/** Yoklama durumları. Ders yapılmayan haftalar devamsızlığa sayılmaz. */
export const ATTENDANCE_STATUSES = {
  attended: { label: 'Katıldım', short: 'Katıldım', counts: true },
  missed: { label: 'Gelmedim', short: 'Gelmedim', counts: true },
  cancelled: { label: 'Ders iptal edildi', short: 'İptal', counts: false },
  noTeacher: { label: 'Hoca gelmedi', short: 'Hoca yok', counts: false }
};

/** Kaydın durumu (eski kayıtlarda yalnızca attended alanı vardır) */
export const attendanceStatus = (record) => {
  if (!record) return 'none';
  if (record.status && ATTENDANCE_STATUSES[record.status]) return record.status;
  if (record.attended === true) return 'attended';
  if (record.attended === false) return 'missed';
  return 'none';
};
