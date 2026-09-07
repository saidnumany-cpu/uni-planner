import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { 
  collection, doc, setDoc, onSnapshot, serverTimestamp, query 
} from 'firebase/firestore';
import { SEMESTER_WEEKS } from '../utils/constants';

/**
 * Tüm derslerin yoklama işlemlerini tek bir hook ile yönetir
 * @param {string} userId - Kullanıcı ID'si
 * @param {Array} courses - Kullanıcının dersleri
 * @param {number} totalWeeks - Toplam hafta sayısı
 */
export const useAllAttendance = (userId, courses, totalWeeks = SEMESTER_WEEKS) => {
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

  const toggleAttendance = async (courseId, weekNumber, attended, note = '') => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const attRef = doc(db, `users/${userId}/courses/${courseId}/attendance`, String(weekNumber));
    
    await setDoc(attRef, {
      week: Number(weekNumber),
      attended,
      note,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const attendanceByCourse = useMemo(() => {
    const result = {};
    for (const course of courses) {
      const courseId = course.id;
      const records = attendanceDataByCourse[courseId] || [];
      
      const attendedWeeks = records.filter(record => record.attended === true).length;
      const missedWeeks = records.filter(record => record.attended === false).length;
      const recordedWeeks = attendedWeeks + missedWeeks;
      const percentage = recordedWeeks > 0 ? Math.round((attendedWeeks / recordedWeeks) * 100) : 0;
      
      result[courseId] = {
        records,
        stats: {
          total: totalWeeks,
          attended: attendedWeeks,
          missed: missedWeeks,
          percentage
        }
      };
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceDataByCourse, courseIds, totalWeeks]);

  return { attendanceByCourse, loading, error, toggleAttendance };
};

export default useAllAttendance;
