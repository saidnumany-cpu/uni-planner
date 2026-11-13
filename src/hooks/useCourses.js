import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, onSnapshot, addDoc,
  updateDoc, doc, serverTimestamp, getDocs, writeBatch
} from 'firebase/firestore';

// Bir derse ait alt koleksiyonlar — ders silinirken bunlar da silinmeli,
// çünkü Firestore bir dokümanı silince alt koleksiyonlarını otomatik silmez.
const COURSE_SUBCOLLECTIONS = ['homework', 'attendance', 'weeklyNotes'];

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

    setLoading(true);
    setError(null);
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
    const coursePath = `users/${userId}/courses/${courseId}`;

    // Alt koleksiyonlardaki tüm dokümanları topla
    const snapshots = await Promise.all(
      COURSE_SUBCOLLECTIONS.map(name => getDocs(collection(db, `${coursePath}/${name}`)))
    );
    const refs = snapshots.flatMap(snap => snap.docs.map(d => d.ref));
    refs.push(doc(db, coursePath));

    // writeBatch en fazla 500 işlem alır — parçalara böl
    for (let i = 0; i < refs.length; i += 450) {
      const batch = writeBatch(db);
      refs.slice(i, i + 450).forEach(ref => batch.delete(ref));
      await batch.commit();
    }
  };

  return { courses, loading, error, addCourse, updateCourse, deleteCourse };
};

export default useCourses;
