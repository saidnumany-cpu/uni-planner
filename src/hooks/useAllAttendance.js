import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { 
  collection, doc, setDoc, onSnapshot, serverTimestamp, query 
} from 'firebase/firestore';
import { DEFAULT_SEMESTER_WEEKS } from '../utils/constants';
import { attendanceStatus } from '../utils/attendance';

/**
 * Tüm derslerin yoklama işlemlerini tek bir hook ile yönetir
 * @param {string} userId - Kullanıcı ID'si
 * @param {Array} courses - Kullanıcının dersleri
 * @param {number|Function} totalWeeks - Toplam hafta sayısı (ya da course => hafta sayısı)
 */
export const useAllAttendance = (userId, courses, totalWeeks = DEFAULT_SEMESTER_WEEKS) => {
  const [attendanceDataByCourse, setAttendanceDataByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable string dependency: prevents infinite re-render when courses array
  // gets a new reference on every Firestore snapshot update.
  const courseIds = courses.map(c => c.id).join(',');

  useEffect(() => {
    if (!userId || !courses || courses.length === 0) {
      setAttendanceDataByCourse({});
      setLoading(false);
      return;
    }

    setLoading(true);
    // Silinen derslerin eski verileri kalmasın
    setAttendanceDataByCourse({});
    const unsubscribes = [];
    // Track per-course load state with an object to avoid stale closure on a counter
    const loadedMap = {};
    courses.forEach(c => { loadedMap[c.id] = false; });

    courses.forEach(course => {
      const q = query(collection(db, `users/${userId}/courses/${course.id}/attendance`));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const attData = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }));
          
          setAttendanceDataByCourse(prev => ({
            ...prev,
            [course.id]: attData
          }));

          loadedMap[course.id] = true;
          if (Object.values(loadedMap).every(Boolean)) {
            setLoading(false);
          }
        },
        (err) => {
          console.error(`Error fetching attendance for course ${course.id}:`, err);
          setError(err.message);
          loadedMap[course.id] = true;
          if (Object.values(loadedMap).every(Boolean)) {
            setLoading(false);
          }
        }
      );
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, courseIds]); // courseIds is a stable string -- avoids infinite re-render

  /**
   * @param {'attended'|'missed'|'cancelled'|'noTeacher'|null} status
   */
  const setAttendance = async (courseId, weekNumber, status, note = '') => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const attRef = doc(db, `users/${userId}/courses/${courseId}/attendance`, String(weekNumber));
    
    await setDoc(attRef, {
      week: Number(weekNumber),
      status: status || null,
      // Eski kayıtlarla uyum: attended alanı yalnızca katıldım/gelmedim için dolu
      attended: status === 'attended' ? true : status === 'missed' ? false : null,
      note,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const attendanceByCourse = useMemo(() => {
    const result = {};
    for (const course of courses) {
      const courseId = course.id;
      const weeks = typeof totalWeeks === 'function' ? totalWeeks(course) : totalWeeks;
      // Dönem hafta sayısı azaltıldıysa aralık dışındaki eski kayıtları sayma
      const records = (attendanceDataByCourse[courseId] || []).filter(r => Number(r.week) >= 1 && Number(r.week) <= weeks);
      const count = (st) => records.filter(r => attendanceStatus(r) === st).length;
      
      const attendedWeeks = count('attended');
      const missedWeeks = count('missed');
      const cancelledWeeks = count('cancelled') + count('noTeacher');
      const recordedWeeks = attendedWeeks + missedWeeks;
      // Ders yapılmayan haftalar orana ve devamsızlığa katılmaz
      const percentage = recordedWeeks > 0 ? Math.round((attendedWeeks / recordedWeeks) * 100) : 0;
      
      result[courseId] = {
        records,
        stats: {
          total: weeks,
          attended: attendedWeeks,
          missed: missedWeeks,
          cancelled: cancelledWeeks,
          percentage
        }
      };
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceDataByCourse, courses, totalWeeks]);

  return { attendanceByCourse, loading, error, setAttendance };
};

export default useAllAttendance;
