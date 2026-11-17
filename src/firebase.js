import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// Tarayıcılar artık başka siteye (firebaseapp.com) ait depolamayı engelliyor; bu yüzden
// Google'dan dönüşte oturum kayboluyor ve giriş ekranına geri düşülüyordu.
// Canlı sitede giriş, vercel.json'daki /__/auth vekili üzerinden kendi alan adımızdan yapılır.
const isLocalHost = typeof window === 'undefined' ||
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const authDomain = Capacitor.isNativePlatform() || isLocalHost
  ? (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ders-takibi-e06bc.firebaseapp.com")
  : window.location.host;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCszJpffFS8JnqDu5StfRoY-zIrySzyL5s",
  authDomain,
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

// iOS uygulamasında (Capacitor) getAuth() WebView içinde takılabiliyor;
// popup/redirect çözücüsü olmadan, IndexedDB kalıcılığıyla başlatıyoruz.
// Google girişi orada native SDK ile yapılır (AuthContext).
const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);

export { app, db, auth };

