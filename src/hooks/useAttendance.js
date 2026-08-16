import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { 
  collection, doc, setDoc, onSnapshot, serverTimestamp, query 
} from 'firebase/firestore';
import { SEMESTER_WEEKS } from '../utils/constants';

/**
 * Yoklama işlemleri için custom hook
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 * @param {number} totalWeeks - Toplam hafta sayısı
 */
export const useAttendance = (userId, courseId, totalWeeks = SEMESTER_WEEKS) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !courseId) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${userId}/courses/${courseId}/attendance`));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const attData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAttendance(attData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching attendance:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, courseId]);

  const toggleAttendance = async (weekNumber, attended, note = '') => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const attRef = doc(db, `users/${userId}/courses/${courseId}/attendance`, String(weekNumber));
    
    await setDoc(attRef, {
      week: Number(weekNumber),
      attended,
      note,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const stats = useMemo(() => {
    const attendedWeeks = attendance.filter(record => record.attended === true).length;
    const missedWeeks = attendance.filter(record => record.attended === false).length;
    const recordedWeeks = attendedWeeks + missedWeeks;
    const percentage = recordedWeeks > 0 ? Math.round((attendedWeeks / recordedWeeks) * 100) : 0;
    
    return {
      total: totalWeeks,
      attended: attendedWeeks,
      missed: missedWeeks,
      percentage
    };
  }, [attendance, totalWeeks]);

  return { attendance, loading, error, toggleAttendance, stats };
};

export default useAttendance;
