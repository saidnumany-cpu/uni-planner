import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, query, onSnapshot, orderBy, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';

/**
 * Ödev işlemleri için custom hook
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export const useHomework = (userId, courseId) => {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !courseId) {
      setHomework([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${userId}/courses/${courseId}/homework`),
      orderBy('dueDate', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const hwData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHomework(hwData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching homework:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, courseId]);

  const addHomework = async (data) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    await addDoc(collection(db, `users/${userId}/courses/${courseId}/homework`), {
      ...data,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const updateHomework = async (homeworkId, data) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const hwRef = doc(db, `users/${userId}/courses/${courseId}/homework/${homeworkId}`);
    await updateDoc(hwRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const deleteHomework = async (homeworkId) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const hwRef = doc(db, `users/${userId}/courses/${courseId}/homework/${homeworkId}`);
    await deleteDoc(hwRef);
  };

  const toggleComplete = async (homeworkId, currentState) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const hwRef = doc(db, `users/${userId}/courses/${courseId}/homework/${homeworkId}`);
    await updateDoc(hwRef, {
      isCompleted: !currentState,
      updatedAt: serverTimestamp()
    });
  };

  return { 
    homework, loading, error, 
    addHomework, updateHomework, deleteHomework, toggleComplete 
  };
};

export default useHomework;
