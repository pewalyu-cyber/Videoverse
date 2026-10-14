/**
 * VideoVerse 2.0 - Firebase Client Configuration
 * Safe for client-side inclusion: contains public identifiers only.
 * Database security is strictly enforced via Firestore Security Rules.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default configuration with fallback to environment variables or localStorage
export const getFirebaseConfig = () => {
  const localSaved = localStorage.getItem('videoverse_firebase_config');
  if (localSaved) {
    try {
      return JSON.parse(localSaved);
    } catch (e) {
      console.warn('Failed to parse saved firebase config', e);
    }
  }

  return {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || ''
  };
};

const config = getFirebaseConfig();

// Initialize or reuse Firebase instance
export const app = getApps().length > 0 
  ? getApp() 
  : (config.apiKey && config.projectId ? initializeApp(config) : null);

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const isFirebaseConfigured = () => {
  return !!(config.apiKey && config.projectId);
};
