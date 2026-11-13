import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithCredential
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '../firebase';

// iOS uygulamasında Google, WebView içinde girişe izin vermiyor.
// Native Google girişi yapıp kimlik bilgisini Firebase JS SDK'sına aktarıyoruz.
const isNative = Capacitor.isNativePlatform();

const nativeGoogleSignIn = async () => {
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result.credential?.idToken;
  if (!idToken) throw new Error('Google girişinden kimlik bilgisi alınamadı.');
  const credential = GoogleAuthProvider.credential(idToken, result.credential?.accessToken);
  return await signInWithCredential(auth, credential);
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Redirect ile giriş yapıldıysa sonucu kontrol et; hata varsa giriş ekranında göster
    if (!isNative) {
      getRedirectResult(auth).catch((error) => {
        console.warn('Redirect sign-in result check:', error);
        setAuthError(error);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getGoogleProvider = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return provider;
  };

  const signInWithGoogle = async () => {
    if (isNative) return await nativeGoogleSignIn();
    const provider = getGoogleProvider();
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google Popup:', error);
      // If popup is blocked by browser, attempt redirect
      // Popup engellendiyse veya bu ortam (örn. iOS ana ekran uygulaması) popup desteklemiyorsa
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.info('Popup blocked/cancelled, attempting signInWithRedirect...');
        return await signInWithRedirect(auth, provider);
      }
      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
    if (isNative) return await nativeGoogleSignIn();
    const provider = getGoogleProvider();
    try {
      return await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google Redirect:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (isNative) await FirebaseAuthentication.signOut().catch(() => {});
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    authError,
    clearAuthError: () => setAuthError(null),
    signInWithGoogle,
    signInWithGoogleRedirect,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

