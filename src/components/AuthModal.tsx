import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cloud,
  RefreshCw,
  Heart,
  Music,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  initialMode = 'login'
}) => {
  const {
    user,
    login,
    signup,
    logout,
    isLoading,
    isFirebaseConfigured,
    demoAdminEnabled,
    setDemoAdminEnabled,
    lastSyncedAt,
    isSyncing
  } = useAuth();

  const {
    likedSongIds,
    playlists,
    stats,
    syncNow
  } = usePlayer();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [migrateLocalData, setMigrateLocalData] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match. Please verify your password.');
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters long.');
        return;
      }
    }

    try {
      if (mode === 'login') {
        await login(email, password);
        setAuthSuccess('Welcome back! Your saved playlists & liked songs are loaded.');
        setTimeout(() => onClose(), 800);
      } else {
        const initialData = migrateLocalData
          ? {
              likedSongIds,
              playlists,
              stats,
              playHistory: stats.playHistory
            }
          : undefined;

        await signup(email, password, displayName || undefined, initialData);
        setAuthSuccess('Account created! Your music library data has been securely saved.');
        setTimeout(() => onClose(), 900);
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setAuthError(msg);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthSuccess('Signed out.');
    setTimeout(() => onClose(), 600);
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      await syncNow();
      setSyncFeedback('All playlists and liked songs are saved and synced to your account!');
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch (err: any) {
      setSyncFeedback('Sync failed. Please check your internet connection.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  const formatLastSynced = (timestamp: number | null) => {
    if (!timestamp) return 'Synced just now';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${diff} seconds ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#282828] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          // ==========================================
          // Logged-in User Profile & Saved Data Center
          // ==========================================
          <div className="space-y-5">
            {/* User Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#1ed760] to-[#121212] p-0.5 shadow-lg shadow-[#1ed760]/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#181818] flex items-center justify-center text-[#1ed760] font-black text-xl">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {user.displayName || 'Music Listener'}
                </h2>
                <p className="text-xs text-[#b3b3b3] truncate">{user.email || 'Account active'}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/30">
                {user.role}
              </span>
            </div>

            {/* Account Saved Data Overview */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#282828]">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Cloud className="w-4 h-4 text-[#1ed760]" />
                  <span>Account Cloud Storage</span>
                </div>
                <span className="text-[11px] text-[#1ed760] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />
                  Active & Saving
                </span>
              </div>

              {/* Saved items stats */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="p-2 rounded-lg bg-[#181818] border border-[#242424]">
                  <div className="flex items-center justify-center gap-1 text-[#1ed760] mb-0.5">
                    <Heart className="w-3.5 h-3.5 fill-[#1ed760]" />
                    <span className="text-sm font-bold">{likedSongIds.length}</span>
                  </div>
                  <span className="text-[10px] text-[#b3b3b3]">Liked Songs</span>
                </div>

                <div className="p-2 rounded-lg bg-[#181818] border border-[#242424]">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-0.5">
                    <Music className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold">{playlists.length}</span>
                  </div>
                  <span className="text-[10px] text-[#b3b3b3]">Playlists</span>
                </div>

                <div className="p-2 rounded-lg bg-[#181818] border border-[#242424]">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                    <span className="text-sm font-bold">{stats.totalPlaybackStarts}</span>
                  </div>
                  <span className="text-[10px] text-[#b3b3b3]">Total Plays</span>
                </div>
              </div>

              {/* Last synced status + Manual Sync Button */}
              <div className="flex items-center justify-between pt-1 text-xs text-[#b3b3b3]">
                <span>Last saved: {formatLastSynced(lastSyncedAt)}</span>
                <button
                  onClick={handleManualSync}
                  disabled={isManualSyncing || isSyncing}
                  className="px-3 py-1 bg-[#282828] hover:bg-[#333333] active:scale-95 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isManualSyncing || isSyncing ? 'animate-spin text-[#1ed760]' : ''}`} />
                  <span>{isManualSyncing || isSyncing ? 'Saving...' : 'Save Data Now'}</span>
                </button>
              </div>

              {syncFeedback && (
                <div className="p-2 rounded-lg bg-[#183a24] border border-[#1ed760]/40 text-xs text-[#1ed760] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}
            </div>

            {/* Sandbox Admin Mode Toggle */}
            <div className="p-3 rounded-xl bg-[#242424]/60 border border-[#2a2a2a] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
                <div>
                  <span className="text-white font-semibold block">Demo Admin Role</span>
                  <span className="text-[10px] text-[#b3b3b3]">Manage catalogue directly</span>
                </div>
              </div>
              <button
                onClick={() => setDemoAdminEnabled(!demoAdminEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  demoAdminEnabled
                    ? 'bg-[#1ed760] text-black shadow'
                    : 'bg-[#181818] text-[#b3b3b3] hover:text-white'
                }`}
              >
                {demoAdminEnabled ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-xs text-[#b3b3b3] hover:text-white hover:underline transition-colors"
              >
                Firebase & System Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          // ==========================================
          // Log In / Sign Up Form
          // ==========================================
          <div>
            {/* Top Tabs */}
            <div className="flex items-center gap-2 mb-5 p-1 bg-[#121212] rounded-xl border border-[#242424]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-[#242424] text-white shadow'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-[#1ed760] text-black shadow'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                Sign Up Free
              </button>
            </div>

            {/* Header info */}
            <div className="mb-4">
              <h2 className="text-xl font-black text-white">
                {mode === 'login' ? 'Welcome Back to VideoVerse' : 'Create Your Free Account'}
              </h2>
              <p className="text-xs text-[#b3b3b3] mt-1">
                {mode === 'login'
                  ? 'Log in to sync your playlists, favorites, and music listening data.'
                  : 'Save all your custom playlists, liked songs, and play history.'}
              </p>
            </div>

            {/* Error & Success Messages */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#183a24] border border-[#1ed760]/50 text-xs text-[#1ed760] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Display Name for Sign Up */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    What should we call you? (Name)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Hunter"
                      className="w-full bg-[#121212] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-[#333333] focus:border-[#1ed760] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#727272] outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-white mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#121212] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-[#333333] focus:border-[#1ed760] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#727272] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-white mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#121212] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-[#333333] focus:border-[#1ed760] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#727272] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-[#121212] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-[#333333] focus:border-[#1ed760] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#727272] outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Data Saving Migration Option */}
              {mode === 'signup' && (likedSongIds.length > 0 || playlists.length > 0) && (
                <div className="p-3 rounded-xl bg-[#121212] border border-[#282828] flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="migrate-data"
                    checked={migrateLocalData}
                    onChange={(e) => setMigrateLocalData(e.target.checked)}
                    className="mt-0.5 accent-[#1ed760] w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="migrate-data" className="text-xs text-[#b3b3b3] cursor-pointer leading-tight">
                    <strong className="text-white block font-semibold">Save Current Music Data</strong>
                    Automatically attach your {likedSongIds.length} liked songs & {playlists.length} playlists to your new account.
                  </label>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-[#1ed760] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-black text-sm font-black rounded-full shadow-lg shadow-[#1ed760]/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Processing...</span>
                  </span>
                ) : mode === 'login' ? (
                  'Log In'
                ) : (
                  'Create Account & Save Data'
                )}
              </button>
            </form>

            {/* Bottom Switching Link */}
            <div className="mt-5 pt-4 border-t border-[#282828] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className="text-white hover:text-[#1ed760] font-bold underline transition-colors"
              >
                {mode === 'login' ? "Don't have an account? Sign up free" : 'Already have an account? Log in'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDemoAdminEnabled(true);
                  onClose();
                }}
                className="text-[#1ed760] hover:underline text-[11px] font-bold"
              >
                Demo Admin ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
