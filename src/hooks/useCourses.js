import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, query, onSnapshot, addDoc, 
  updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';

/**
 * Ders işlemleri için custom hook
 * @param {string} userId - Kullanıcı ID'si
 */
export const useCourses = (userId) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${userId}/courses`));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching courses:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addCourse = async (courseData) => {
    if (!userId) throw new Error('Kullanıcı girişi gerekli');
    const docRef = await addDoc(collection(db, `users/${userId}/courses`), {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  };

  const updateCourse = async (courseId, data) => {
    if (!userId) throw new Error('Kullanıcı girişi gerekli');
    const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
    await updateDoc(courseRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const deleteCourse = async (courseId) => {
    if (!userId) throw new Error('Kullanıcı girişi gerekli');
    const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
    await deleteDoc(courseRef);
  };

  return { courses, loading, error, addCourse, updateCourse, deleteCourse };
};

export default useCourses;
