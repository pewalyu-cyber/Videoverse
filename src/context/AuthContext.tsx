import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  subscribeToAuth,
  loginWithEmail as firebaseLoginWithEmail,
  registerWithEmail as firebaseRegisterWithEmail,
  logoutUser as firebaseLogoutUser,
  getUserRole,
  isFirebaseActive,
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  FirebaseConfigParams,
  initFirebase
} from '../services/firebase';
import { authService, UserAccount, UserSavedMusicData } from '../services/authService';
import { UserProfile } from '../types/music';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  demoAdminEnabled: boolean;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  setDemoAdminEnabled: (val: boolean) => void;
  login: (email: string, pass: string) => Promise<UserSavedMusicData | undefined>;
  signup: (
    email: string,
    pass: string,
    displayName?: string,
    initialData?: UserSavedMusicData
  ) => Promise<UserSavedMusicData | undefined>;
  logout: () => Promise<void>;
  saveDataToServer: (data: UserSavedMusicData) => Promise<number | null>;
  updateFirebaseConfig: (config: FirebaseConfigParams) => void;
  savedConfig: FirebaseConfigParams;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isConfigured, setIsConfigured] = useState(isFirebaseActive());
  const [demoAdminEnabled, setDemoAdminEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('videoverse_demo_admin') === 'true';
  });
  const [savedConfig, setSavedConfig] = useState<FirebaseConfigParams>(getSavedFirebaseConfig());

  // Function to toggle demo admin evaluator
  const setDemoAdminEnabled = (val: boolean) => {
    setDemoAdminEnabledState(val);
    localStorage.setItem('videoverse_demo_admin', val ? 'true' : 'false');
    if (user) {
      setUser({
        ...user,
        role: val ? 'admin' : 'listener'
      });
    } else if (val) {
      setUser({
        uid: 'demo-admin-id',
        email: 'admin@videoverse.local',
        displayName: 'VideoVerse Admin (Demo)',
        role: 'admin'
      });
    }
  };

  // Restore session from server on startup
  useEffect(() => {
    let isMounted = true;

    async function checkExistingAuth() {
      try {
        const session = await authService.getCurrentSession();
        if (session && isMounted) {
          setUser({
            uid: session.user.uid,
            email: session.user.email,
            displayName: session.user.displayName,
            role: demoAdminEnabled ? 'admin' : session.user.role
          });
          if (session.data?.lastSyncedAt) {
            setLastSyncedAt(session.data.lastSyncedAt);
          }
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Session restoration notice:', err);
      }

      // Check Firebase auth if available
      const unsub = subscribeToAuth(async (fUser) => {
        if (!isMounted) return;
        setFirebaseUser(fUser);
        if (fUser) {
          const role = await getUserRole(fUser.uid);
          setUser({
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName || fUser.email?.split('@')[0] || 'Listener',
            role: demoAdminEnabled ? 'admin' : role
          });
        } else {
          if (demoAdminEnabled) {
            setUser({
              uid: 'demo-admin-id',
              email: 'admin@videoverse.local',
              displayName: 'VideoVerse Admin (Demo)',
              role: 'admin'
            });
          } else {
            // Keep user if already set by server session
            setUser(prev => (prev?.uid.startsWith('usr_') ? prev : null));
          }
        }
        setIsLoading(false);
        setIsConfigured(isFirebaseActive());
      });

      return () => unsub();
    }

    checkExistingAuth();

    return () => {
      isMounted = false;
    };
  }, [demoAdminEnabled]);

  // Log In
  const login = async (email: string, pass: string): Promise<UserSavedMusicData | undefined> => {
    setIsLoading(true);
    try {
      // 1. Try server-side authentication
      try {
        const res = await authService.logIn(email, pass);
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          role: demoAdminEnabled ? 'admin' : res.user.role
        });
        if (res.data?.lastSyncedAt) {
          setLastSyncedAt(res.data.lastSyncedAt);
        }
        return res.data;
      } catch (serverErr: any) {
        // If server returned invalid credentials, rethrow
        if (serverErr.message && !serverErr.message.includes('fetch')) {
          throw serverErr;
        }
        // If server wasn't reachable, try Firebase
        if (isFirebaseActive()) {
          const fUser = await firebaseLoginWithEmail(email, pass);
          const role = await getUserRole(fUser.uid);
          setUser({
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName || fUser.email?.split('@')[0] || 'Listener',
            role: demoAdminEnabled ? 'admin' : role
          });
          return undefined;
        }
        throw serverErr;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const signup = async (
    email: string,
    pass: string,
    displayName?: string,
    initialData?: UserSavedMusicData
  ): Promise<UserSavedMusicData | undefined> => {
    setIsLoading(true);
    try {
      try {
        const res = await authService.signUp(email, pass, displayName, initialData);
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          role: demoAdminEnabled ? 'admin' : res.user.role
        });
        if (res.data?.lastSyncedAt) {
          setLastSyncedAt(res.data.lastSyncedAt);
        }
        return res.data;
      } catch (serverErr: any) {
        if (serverErr.message && !serverErr.message.includes('fetch')) {
          throw serverErr;
        }
        if (isFirebaseActive()) {
          const fUser = await firebaseRegisterWithEmail(email, pass);
          setUser({
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName || displayName || fUser.email?.split('@')[0] || 'Listener',
            role: 'listener'
          });
          return undefined;
        }
        throw serverErr;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logOut();
      if (isFirebaseActive()) {
        await firebaseLogoutUser();
      }
      if (!demoAdminEnabled) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save/Sync user music data (playlists, likes, history, stats) to server
  const saveDataToServer = useCallback(async (data: UserSavedMusicData): Promise<number | null> => {
    if (!user || user.uid === 'demo-admin-id') return null;
    setIsSyncing(true);
    try {
      const res = await authService.syncUserData(data);
      setLastSyncedAt(res.lastSyncedAt);
      return res.lastSyncedAt;
    } catch (e) {
      console.warn('Auto-save to server warning:', e);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const updateFirebaseConfig = (config: FirebaseConfigParams) => {
    saveFirebaseConfig(config);
    setSavedConfig(config);
    const result = initFirebase();
    setIsConfigured(!!result.isConfigured);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoggedIn: !!user && user.uid !== 'demo-admin-id',
        isLoading,
        isFirebaseConfigured: isConfigured,
        demoAdminEnabled,
        lastSyncedAt,
        isSyncing,
        setDemoAdminEnabled,
        login,
        signup,
        logout,
        saveDataToServer,
        updateFirebaseConfig,
        savedConfig
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
