import React from 'react';
import {
  Home,
  Search,
  Library,
  Sparkles,
  ShieldCheck,
  Heart,
  Plus,
  Music,
  DownloadCloud
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onOpenCreatePlaylist: () => void;
  onOpenInstallModal?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenCreatePlaylist,
  onOpenInstallModal,
  onOpenAuthModal
}) => {
  const {
    currentView,
    setCurrentView,
    playlists,
    selectedPlaylistId,
    setSelectedPlaylistId,
    likedSongIds
  } = usePlayer();
  const { user, demoAdminEnabled } = useAuth();

  const isAdmin = user?.role === 'admin' || demoAdminEnabled;

  return (
    <aside className="w-64 bg-black flex flex-col h-full select-none text-[#b3b3b3] p-2 space-y-2">
      {/* Top Navigation Box */}
      <div className="bg-[#121212] rounded-xl p-4 space-y-4">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setSelectedPlaylistId(null);
            setCurrentView('home');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#1ed760] flex items-center justify-center text-black shadow-lg shadow-[#1ed760]/30 group-hover:scale-105 transition-transform">
            {/* VideoVerse Original Sound wave icon */}
            <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-white group-hover:text-[#1ed760] transition-colors">
              VideoVerse
            </span>
          </div>
        </div>

        {/* Primary Links */}
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedPlaylistId(null);
              setCurrentView('home');
            }}
            className={`w-full flex items-center gap-4 px-2 py-2.5 rounded-lg font-bold text-sm transition-colors ${
              currentView === 'home'
                ? 'text-white'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-white stroke-[2.5]' : ''}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              setSelectedPlaylistId(null);
              setCurrentView('search');
            }}
            className={`w-full flex items-center gap-4 px-2 py-2.5 rounded-lg font-bold text-sm transition-colors ${
              currentView === 'search'
                ? 'text-white'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Search className={`w-5 h-5 ${currentView === 'search' ? 'text-white stroke-[2.5]' : ''}`} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Library & Playlists Box */}
      <div className="flex-1 bg-[#121212] rounded-xl p-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3">
          <button
            onClick={() => {
              setSelectedPlaylistId(null);
              setCurrentView('library');
            }}
            className={`flex items-center gap-3 font-bold text-sm transition-colors ${
              currentView === 'library' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </button>

          <button
            onClick={onOpenCreatePlaylist}
            title="Create playlist"
            className="p-1 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#242424] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action: Insights & Admin */}
        <div className="flex gap-2 py-2">
          <button
            onClick={() => {
              setSelectedPlaylistId(null);
              setCurrentView('stats');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              currentView === 'stats'
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Insights
          </button>

          <button
            onClick={() => {
              setSelectedPlaylistId(null);
              setCurrentView('admin');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-[#1ed760] text-black font-bold'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-1 custom-scrollbar pr-1">
          {/* Liked Songs Entry */}
          <button
            onClick={() => {
              setSelectedPlaylistId('liked-songs');
              setCurrentView('playlist');
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
              currentView === 'playlist' && selectedPlaylistId === 'liked-songs'
                ? 'bg-[#282828] text-white'
                : 'hover:bg-[#1a1a1a] text-[#b3b3b3] hover:text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#1ed760] to-[#121212] flex items-center justify-center text-black shrink-0 shadow">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">Liked Songs</p>
              <p className="text-xs text-[#b3b3b3]">Playlist &bull; {likedSongIds.length} songs</p>
            </div>
          </button>

          {/* User Playlists */}
          {playlists.map((pl) => {
            const isSelected = currentView === 'playlist' && selectedPlaylistId === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => {
                  setSelectedPlaylistId(pl.id);
                  setCurrentView('playlist');
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                  isSelected
                    ? 'bg-[#282828] text-white'
                    : 'hover:bg-[#1a1a1a] text-[#b3b3b3] hover:text-white'
                }`}
              >
                <div className="w-10 h-10 rounded-md bg-[#242424] flex items-center justify-center text-[#1ed760] shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-bold truncate text-white">{pl.name}</p>
                  <p className="text-xs text-[#b3b3b3] truncate">Playlist &bull; {pl.songIds.length} tracks</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Account Data Saving Prompt / Status Card */}
        {!user && onOpenAuthModal && (
          <div className="mt-2 p-3 rounded-xl bg-[#181818] border border-[#282828] space-y-2">
            <p className="text-xs font-bold text-white">Save your music data</p>
            <p className="text-[11px] text-[#b3b3b3] leading-snug">
              Sign up or log in to sync playlists, liked songs, and play history to your account.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-all cursor-pointer"
              >
                Sign up free
              </button>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="text-xs font-bold text-white hover:underline px-1 py-1 cursor-pointer"
              >
                Log in
              </button>
            </div>
          </div>
        )}

        {user && onOpenAuthModal && (
          <button
            onClick={() => onOpenAuthModal('login')}
            className="mt-2 p-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#282828] flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.displayName || 'My Account'}</p>
                <p className="text-[10px] text-[#b3b3b3]">Music data saved & synced</p>
              </div>
            </div>
            <span className="text-[10px] text-[#1ed760] font-bold shrink-0">Profile</span>
          </button>
        )}

        {/* PWA Install Button */}
        {onOpenInstallModal && (
          <div className="pt-2 border-t border-[#282828]">
            <button
              onClick={onOpenInstallModal}
              className="w-full py-2 px-3 bg-[#242424] hover:bg-[#2a2a2a] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <DownloadCloud className="w-4 h-4 text-[#1ed760]" />
              <span>Install App</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
