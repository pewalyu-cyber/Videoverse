import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';
import { Song, Playlist, UserProfile } from '../types/music';

// Storage keys
const FIREBASE_CONFIG_KEY = 'videoverse_firebase_config';
const LOCAL_SONGS_KEY = 'videoverse_local_songs';
const LOCAL_PLAYLISTS_KEY = 'videoverse_local_playlists';
const LOCAL_LIKES_KEY = 'videoverse_local_likes';
const LOCAL_STATS_KEY = 'videoverse_local_stats';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const getSavedFirebaseConfig = (): FirebaseConfigParams => {
  const localSaved = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (localSaved) {
    try {
      return JSON.parse(localSaved);
    } catch {
      // ignore
    }
  }

  return {
    apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
    authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || ''
  };
};

export const saveFirebaseConfig = (config: FirebaseConfigParams) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export const initFirebase = () => {
  const config = getSavedFirebaseConfig();
  if (config.apiKey && config.projectId) {
    try {
      if (getApps().length > 0) {
        appInstance = getApp();
      } else {
        appInstance = initializeApp(config);
      }
      authInstance = getAuth(appInstance);
      dbInstance = getFirestore(appInstance);
      return { app: appInstance, auth: authInstance, db: dbInstance, isConfigured: true };
    } catch (err) {
      console.warn('Firebase initialization error:', err);
    }
  }
  return { app: null, auth: null, db: null, isConfigured: false };
};

// Initialize initially
initFirebase();

export const isFirebaseActive = (): boolean => {
  const config = getSavedFirebaseConfig();
  return !!(config.apiKey && config.projectId && dbInstance);
};

// ==========================================
// Authentication Operations
// ==========================================

export const registerWithEmail = async (email: string, pass: string): Promise<User> => {
  if (!authInstance) {
    throw new Error('Firebase Authentication is not configured yet. Please configure Firebase settings or use Guest mode.');
  }
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
  
  // Create user profile in Firestore
  if (dbInstance) {
    try {
      await setDoc(doc(dbInstance, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: 'listener',
        createdAt: Date.now()
      });
    } catch (e) {
      console.warn('Could not write user record to Firestore:', e);
    }
  }
  return userCredential.user;
};

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  if (!authInstance) {
    throw new Error('Firebase Authentication is not configured yet. Please configure Firebase settings or use Guest mode.');
  }
  const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
  return userCredential.user;
};

export const logoutUser = async (): Promise<void> => {
  if (authInstance) {
    await signOut(authInstance);
  }
};

export const getUserRole = async (uid: string): Promise<'admin' | 'listener'> => {
  if (!dbInstance) return 'listener';
  try {
    const userDoc = await getDoc(doc(dbInstance, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role === 'admin') return 'admin';
    }
  } catch (err) {
    console.warn('Error reading user role from Firestore:', err);
  }
  return 'listener';
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (authInstance) {
    return onAuthStateChanged(authInstance, callback);
  }
  callback(null);
  return () => {};
};

// ==========================================
// Song Catalogue Firestore / Local Operations
// ==========================================

export const getLocalSongs = (fallback: Song[]): Song[] => {
  const saved = localStorage.getItem(LOCAL_SONGS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
  }
  localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(fallback));
  return fallback;
};

export const saveLocalSongs = (songs: Song[]) => {
  localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(songs));
};

export const subscribeToSongs = (
  fallbackSongs: Song[],
  onUpdate: (songs: Song[], fromCloud: boolean) => void,
  onError?: (error: Error) => void
) => {
  if (dbInstance && isFirebaseActive()) {
    try {
      const songsCol = collection(dbInstance, 'songs');
      const q = query(songsCol, orderBy('title', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const songs: Song[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              songs.push({
                id: docSnap.id,
                title: data.title || 'Untitled',
                artist: data.artist || 'Unknown Artist',
                youtubeId: data.youtubeId || '',
                thumbnailUrl: data.thumbnailUrl || `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`,
                category: data.category || 'Music',
                album: data.album,
                duration: data.duration || 180,
                lyrics: data.lyrics,
                featured: data.featured || false,
                plays: data.plays || 0,
                addedAt: data.addedAt || Date.now()
              });
            });
            saveLocalSongs(songs);
            onUpdate(songs, true);
          } else {
            // First time running with empty Firestore: seed with local/fallback songs
            console.info('Firestore songs collection empty. Using default catalogue.');
            const local = getLocalSongs(fallbackSongs);
            onUpdate(local, false);
          }
        },
        (error) => {
          console.warn('Firestore subscription error, falling back to local storage:', error);
          if (onError) onError(error);
          onUpdate(getLocalSongs(fallbackSongs), false);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.warn('Firestore init error:', err);
      if (onError) onError(err);
      onUpdate(getLocalSongs(fallbackSongs), false);
      return () => {};
    }
  }

  // Fallback to local storage
  onUpdate(getLocalSongs(fallbackSongs), false);
  return () => {};
};

export const addSongToDatabase = async (song: Omit<Song, 'id'>, defaultId?: string): Promise<Song> => {
  const newId = defaultId || `song-${Date.now()}`;
  const newSong: Song = {
    ...song,
    id: newId,
    plays: song.plays || 0,
    addedAt: Date.now()
  };

  if (dbInstance && isFirebaseActive()) {
    try {
      await setDoc(doc(dbInstance, 'songs', newId), {
        title: newSong.title,
        artist: newSong.artist,
        youtubeId: newSong.youtubeId,
        thumbnailUrl: newSong.thumbnailUrl,
        category: newSong.category,
        album: newSong.album || '',
        duration: newSong.duration || 180,
        lyrics: newSong.lyrics || '',
        featured: newSong.featured || false,
        plays: 0,
        addedAt: Date.now()
      });
      return newSong;
    } catch (err: any) {
      console.warn('Failed to write to Firestore songs, writing locally:', err);
    }
  }

  // Fallback write to local storage
  const current = getLocalSongs([]);
  const updated = [newSong, ...current];
  saveLocalSongs(updated);
  return newSong;
};

export const updateSongInDatabase = async (id: string, updates: Partial<Song>): Promise<void> => {
  if (dbInstance && isFirebaseActive()) {
    try {
      await updateDoc(doc(dbInstance, 'songs', id), updates as any);
      return;
    } catch (err) {
      console.warn('Failed to update in Firestore, updating locally:', err);
    }
  }

  const current = getLocalSongs([]);
  const updated = current.map(s => s.id === id ? { ...s, ...updates } : s);
  saveLocalSongs(updated);
};

export const deleteSongFromDatabase = async (id: string): Promise<void> => {
  if (dbInstance && isFirebaseActive()) {
    try {
      await deleteDoc(doc(dbInstance, 'songs', id));
      return;
    } catch (err) {
      console.warn('Failed to delete in Firestore, deleting locally:', err);
    }
  }

  const current = getLocalSongs([]);
  const updated = current.filter(s => s.id !== id);
  saveLocalSongs(updated);
};

// ==========================================
// Playlists & Favorites (Local & Firestore)
// ==========================================

export const getLocalPlaylists = (fallback: Playlist[]): Playlist[] => {
  const saved = localStorage.getItem(LOCAL_PLAYLISTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(fallback));
  return fallback;
};

export const saveLocalPlaylists = (playlists: Playlist[]) => {
  localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(playlists));
};

export const getLocalLikedSongs = (): string[] => {
  const saved = localStorage.getItem(LOCAL_LIKES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return ['song-1', 'song-2', 'song-3'];
};

export const saveLocalLikedSongs = (likes: string[]) => {
  localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(likes));
};
