import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result if user used redirect sign-in
    getRedirectResult(auth).catch((error) => {
      console.warn('Redirect sign-in result check:', error);
    });

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
    const provider = getGoogleProvider();
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google Popup:', error);
      // If popup is blocked by browser, attempt redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        console.info('Popup blocked/cancelled, attempting signInWithRedirect...');
        return await signInWithRedirect(auth, provider);
      }
      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
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
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
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

