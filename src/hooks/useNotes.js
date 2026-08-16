import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, doc, setDoc, onSnapshot, serverTimestamp, query 
} from 'firebase/firestore';

/**
 * Haftalık not işlemleri için custom hook
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export const useNotes = (userId, courseId) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !courseId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${userId}/courses/${courseId}/weeklyNotes`));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const notesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotes(notesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notes:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, courseId]);

  const getNote = (weekNumber) => {
    return notes.find(note => String(note.week) === String(weekNumber)) || null;
  };

  const saveNote = async (weekNumber, content) => {
    if (!userId || !courseId) throw new Error('Kullanıcı girişi ve ders seçimi gerekli');
    
    const noteRef = doc(db, `users/${userId}/courses/${courseId}/weeklyNotes`, String(weekNumber));
    
    await setDoc(noteRef, {
      week: Number(weekNumber),
      content,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  return { notes, loading, error, getNote, saveNote };
};

export default useNotes;
