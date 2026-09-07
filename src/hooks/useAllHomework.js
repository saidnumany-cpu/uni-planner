import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { 
  collection, query, onSnapshot, orderBy, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { parseLocalDate } from '../utils/helpers';

/**
 * Tüm derslerin ödev işlemlerini tek bir hook ile yönetir
 * @param {string} userId - Kullanıcı ID'si
 * @param {Array} courses - Kullanıcının dersleri
 */
export const useAllHomework = (userId, courses) => {
  const [homeworkByCourse, setHomeworkByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable string dependency: prevents infinite re-render when courses array
  // gets a new reference on every Firestore snapshot update.
  const courseIds = courses.map(c => c.id).join(',');

  useEffect(() => {
    if (!userId || !courses || courses.length === 0) {
      setHomeworkByCourse({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribes = [];
    // Track per-course load state with an object to avoid stale closure on a counter
    const loadedMap = {};
    courses.forEach(c => { loadedMap[c.id] = false; });

    courses.forEach(course => {
      const q = query(
        collection(db, `users/${userId}/courses/${course.id}/homework`),
        orderBy('dueDate', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const hwData = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }));
          
          setHomeworkByCourse(prev => ({
            ...prev,
            [course.id]: hwData
          }));

          loadedMap[course.id] = true;
          if (Object.values(loadedMap).every(Boolean)) {
            setLoading(false);
          }
        },
        (err) => {
          console.error(`Error fetching homework for course ${course.id}:`, err);
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

  const allHomework = useMemo(() => {
    const combined = Object.values(homeworkByCourse).flat();
    return combined.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const dateA = parseLocalDate(a.dueDate);
      const dateB = parseLocalDate(b.dueDate);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });
  }, [homeworkByCourse]);

  const addHomework = async (courseId, data) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    await addDoc(collection(db, `users/${userId}/courses/${courseId}/homework`), {
      ...data,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const updateHomework = async (courseId, homeworkId, data) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const hwRef = doc(db, `users/${userId}/courses/${courseId}/homework/${homeworkId}`);
    await updateDoc(hwRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const deleteHomework = async (courseId, homeworkId) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const hwRef = doc(db, `users/${userId}/courses/${courseId}/homework/${homeworkId}`);
    await deleteDoc(hwRef);
  };

  const toggleComplete = async (courseId, homeworkId, currentState) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const hwRef = doc(db, `users/${userId}/courses/${courseId}/homework/${homeworkId}`);
    await updateDoc(hwRef, {
      isCompleted: !currentState,
      updatedAt: serverTimestamp()
    });
  };

  return { 
    homeworkByCourse, allHomework, loading, error, 
    addHomework, updateHomework, deleteHomework, toggleComplete 
  };
};

export default useAllHomework;
