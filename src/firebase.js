import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCszJpffFS8JnqDu5StfRoY-zIrySzyL5s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ders-takibi-e06bc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ders-takibi-e06bc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ders-takibi-e06bc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "459264217174",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:459264217174:web:b998db83ebb5282e066bf7",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  db = getFirestore(app);
}

const auth = getAuth(app);

export { app, db, auth };

