import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// ============================================================
// Persistence for User Accounts and Saved Music Data
// ============================================================
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users-store.json');

interface UserSavedData {
  likedSongIds: string[];
  playlists: any[];
  stats: any;
  playHistory: any[];
  customSongs: any[];
  lastSyncedAt: number;
}

interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  role: 'listener' | 'admin';
  createdAt: number;
  data: UserSavedData;
}

interface SessionRecord {
  uid: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory sessions mapped to token
const sessions: Map<string, SessionRecord> = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers(): Record<string, StoredUser> {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.error('Failed to read users database:', err);
  }
  return {};
}

function saveUsers(users: Record<string, StoredUser>) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write users database:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken(uid: string): string {
  const token = `vv-user-${Date.now()}-${crypto.randomBytes(24).toString('hex')}`;
  // 30 days expiry
  sessions.set(token, {
    uid,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });
  return token;
}

function getUserByToken(req: express.Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  const users = loadUsers();
  return users[session.uid] || null;
}

// ============================================================
// Server-side Dual Admin Passwords
// ============================================================
const ADMIN_PASSWORD_1 = process.env.ADMIN_PASSWORD_1 || 'VideoVerseMaster2026';
const ADMIN_PASSWORD_2 = process.env.ADMIN_PASSWORD_2 || 'SecuredAccess#7788';

// API Route: Verify 2 Passwords to unlock Admin Room
app.post('/api/admin/verify', (req, res) => {
  const { password1, password2 } = req.body;

  if (!password1 || !password2) {
    return res.status(400).json({
      success: false,
      error: 'Both passwords are required to unlock the Admin Room.'
    });
  }

  const isPass1Valid = String(password1).trim() === ADMIN_PASSWORD_1;
  const isPass2Valid = String(password2).trim() === ADMIN_PASSWORD_2;

  if (isPass1Valid && isPass2Valid) {
    const token = `vv-admin-auth-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
    return res.json({
      success: true,
      message: 'Both passwords verified successfully. Access to Admin Room granted.',
      token
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Both passwords must match the server configuration.'
    });
  }
});

// API Route: Check server auth configuration status
app.get('/api/admin/info', (_req, res) => {
  res.json({
    dualPasswordRequired: true,
    hint: 'Two-factor server passwords required: Primary Admin Key & Master Security Code.'
  });
});

// ============================================================
// User Authentication & Data Saving API
// ============================================================

// 1. Sign Up
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, displayName, initialData } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const users = loadUsers();

    // Check if email already registered
    const existing = Object.values(users).find(u => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    const uid = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const salt = generateSalt();
    const passwordHash = hashPassword(cleanPassword, salt);
    const cleanDisplayName = String(displayName || cleanEmail.split('@')[0] || 'Listener').trim();

    const newUser: StoredUser = {
      uid,
      email: cleanEmail,
      displayName: cleanDisplayName,
      passwordHash,
      salt,
      role: 'listener',
      createdAt: Date.now(),
      data: {
        likedSongIds: Array.isArray(initialData?.likedSongIds) ? initialData.likedSongIds : [],
        playlists: Array.isArray(initialData?.playlists) ? initialData.playlists : [],
        stats: initialData?.stats || {
          totalPlaybackStarts: 0,
          playHistory: [],
          songPlayCounts: {},
          genrePlayCounts: {},
          artistPlayCounts: {}
        },
        playHistory: Array.isArray(initialData?.playHistory) ? initialData.playHistory : [],
        customSongs: Array.isArray(initialData?.customSongs) ? initialData.customSongs : [],
        lastSyncedAt: Date.now()
      }
    };

    users[uid] = newUser;
    saveUsers(users);

    const token = generateToken(uid);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Your music library data is now saved to your account.',
      token,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      data: newUser.data
    });
  } catch (err: any) {
    console.error('Sign up error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error during sign up. Please try again.'
    });
  }
});

// 2. Log In
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const users = loadUsers();
    const user = Object.values(users).find(u => u.email === cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please check your credentials.'
      });
    }

    const computedHash = hashPassword(cleanPassword, user.salt);
    if (computedHash !== user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please check your credentials.'
      });
    }

    const token = generateToken(user.uid);

    return res.json({
      success: true,
      message: 'Logged in successfully! Your saved music data has been loaded.',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt
      },
      data: user.data
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error during login. Please try again.'
    });
  }
});

// 3. Current User Profile & Saved Data
app.get('/api/auth/me', (req, res) => {
  const user = getUserByToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated or session expired.'
    });
  }

  return res.json({
    success: true,
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt
    },
    data: user.data
  });
});

// 4. Sync / Save Music Data to Account
app.post('/api/auth/sync', (req, res) => {
  const user = getUserByToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Please log in to save your data.'
    });
  }

  try {
    const { likedSongIds, playlists, stats, playHistory, customSongs } = req.body;
    const users = loadUsers();

    if (!users[user.uid]) {
      return res.status(404).json({
        success: false,
        error: 'User account not found.'
      });
    }

    // Merge & update saved data
    const currentData = users[user.uid].data || {
      likedSongIds: [],
      playlists: [],
      stats: {},
      playHistory: [],
      customSongs: [],
      lastSyncedAt: Date.now()
    };

    if (Array.isArray(likedSongIds)) {
      currentData.likedSongIds = likedSongIds;
    }
    if (Array.isArray(playlists)) {
      currentData.playlists = playlists;
    }
    if (stats && typeof stats === 'object') {
      currentData.stats = stats;
    }
    if (Array.isArray(playHistory)) {
      currentData.playHistory = playHistory;
    }
    if (Array.isArray(customSongs)) {
      currentData.customSongs = customSongs;
    }
    currentData.lastSyncedAt = Date.now();

    users[user.uid].data = currentData;
    saveUsers(users);

    return res.json({
      success: true,
      message: 'All your playlists, likes, and music data have been saved to your account.',
      lastSyncedAt: currentData.lastSyncedAt,
      savedCounts: {
        likes: currentData.likedSongIds.length,
        playlists: currentData.playlists.length,
        playHistory: currentData.playHistory?.length || 0
      }
    });
  } catch (err: any) {
    console.error('Data sync error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to save data to server.'
    });
  }
});

// 5. Log Out
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    sessions.delete(token);
  }
  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VideoVerse 2.0 server running on http://0.0.0.0:${PORT}`);
  });
}

start();
