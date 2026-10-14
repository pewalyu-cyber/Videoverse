/**
 * VideoVerse 2.0 - Client Authentication & Account Data Sync Service
 * Connects to server endpoints for user accounts and cloud persistence
 */

const TOKEN_KEY = 'videoverse_auth_token';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: 'listener' | 'admin';
  createdAt?: number;
}

export interface UserSavedMusicData {
  likedSongIds: string[];
  playlists: any[];
  stats?: any;
  playHistory?: any[];
  customSongs?: any[];
  lastSyncedAt?: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserAccount;
  data?: UserSavedMusicData;
  error?: string;
  message?: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const authService = {
  // Sign Up new account
  async signUp(
    email: string,
    pass: string,
    displayName?: string,
    initialData?: UserSavedMusicData
  ): Promise<{ user: UserAccount; data: UserSavedMusicData }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: pass,
        displayName,
        initialData
      })
    });

    const json: AuthResponse = await res.json();
    if (!res.ok || !json.success || !json.user || !json.token) {
      throw new Error(json.error || 'Failed to create account.');
    }

    setAuthToken(json.token);
    return {
      user: json.user,
      data: json.data || {
        likedSongIds: [],
        playlists: [],
        lastSyncedAt: Date.now()
      }
    };
  },

  // Log In to existing account
  async logIn(
    email: string,
    pass: string
  ): Promise<{ user: UserAccount; data: UserSavedMusicData }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const json: AuthResponse = await res.json();
    if (!res.ok || !json.success || !json.user || !json.token) {
      throw new Error(json.error || 'Failed to log in.');
    }

    setAuthToken(json.token);
    return {
      user: json.user,
      data: json.data || {
        likedSongIds: [],
        playlists: [],
        lastSyncedAt: Date.now()
      }
    };
  },

  // Restore session from token
  async getCurrentSession(): Promise<{ user: UserAccount; data: UserSavedMusicData } | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        removeAuthToken();
        return null;
      }

      const json: AuthResponse = await res.json();
      if (json.success && json.user) {
        return {
          user: json.user,
          data: json.data || {
            likedSongIds: [],
            playlists: [],
            lastSyncedAt: Date.now()
          }
        };
      }
    } catch (e) {
      console.warn('Error verifying session:', e);
    }
    return null;
  },

  // Save / Sync user data to server
  async syncUserData(data: UserSavedMusicData): Promise<{ lastSyncedAt: number }> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const res = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to sync data');
    }

    return { lastSyncedAt: json.lastSyncedAt || Date.now() };
  },

  // Sign out
  async logOut(): Promise<void> {
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        // ignore network error on logout
      }
    }
    removeAuthToken();
  }
};
