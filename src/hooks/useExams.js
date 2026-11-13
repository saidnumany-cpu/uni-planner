import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

/**
 * Sınavlar: users/{uid}/exams  { courseId, kind, title, date, startTime, location, topics }
 */
export const useExams = (userId) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setExams([]); setLoading(false); return; }
    setLoading(true);
    return onSnapshot(
      query(collection(db, `users/${userId}/exams`)),
      (snap) => {
        setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Sınavlar okunamadı:', err);
        setLoading(false);
      }
    );
  }, [userId]);

  const addExam = (data) =>
    addDoc(collection(db, `users/${userId}/exams`), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

  const updateExam = (id, data) =>
    updateDoc(doc(db, `users/${userId}/exams/${id}`), { ...data, updatedAt: serverTimestamp() });

  const deleteExam = (id) => deleteDoc(doc(db, `users/${userId}/exams/${id}`));

  return { exams, loading, addExam, updateExam, deleteExam };
};

export default useExams;
