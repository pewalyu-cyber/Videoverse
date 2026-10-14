import React, { useState } from 'react';
import {
  Heart,
  Plus,
  Play,
  Clock,
  Music,
  FolderPlus,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { SongListRow } from '../components/SongListRow';
import { Song } from '../types/music';

interface LibraryViewProps {
  onOpenCreatePlaylist: () => void;
  onOpenAddToPlaylist: (song: Song) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onOpenCreatePlaylist,
  onOpenAddToPlaylist
}) => {
  const {
    songs,
    playlists,
    likedSongIds,
    setSelectedPlaylistId,
    setCurrentView,
    playSong,
    stats,
    syncNow,
    isDataSaving
  } = usePlayer();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'playlists' | 'liked' | 'history'>('playlists');

  const likedSongs = songs.filter((s) => likedSongIds.includes(s.id));
  const recentHistorySongs = stats.playHistory
    .map((h) => songs.find((s) => s.id === h.songId))
    .filter((s): s is Song => !!s)
    .slice(0, 20);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Library</h1>
          <p className="text-xs sm:text-sm text-[#b3b3b3] mt-1">
            Playlists, liked tracks, and listening history
          </p>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="px-5 py-2.5 bg-[#1ed760] hover:bg-[#1db954] hover:scale-105 active:scale-95 text-black text-xs font-black rounded-full shadow-lg shadow-[#1ed760]/20 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Cloud Data Saving Banner */}
      <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-[#1ed760] shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white flex items-center gap-2">
              <span>{user ? `Saved to Account: ${user.displayName || user.email}` : 'Local Browser Mode'}</span>
              {user && <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />}
            </p>
            <p className="text-[11px] text-[#b3b3b3]">
              {user
                ? `All ${playlists.length} playlists and ${likedSongIds.length} liked tracks are securely saved and synced to your account.`
                : 'Log in or sign up anytime to save all your playlists and liked songs to your personal account.'}
            </p>
          </div>
        </div>

        {user && (
          <button
            onClick={syncNow}
            disabled={isDataSaving}
            className="px-3.5 py-1.5 bg-[#242424] hover:bg-[#2e2e2e] active:scale-95 text-white rounded-lg font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDataSaving ? 'animate-spin text-[#1ed760]' : ''}`} />
            <span>{isDataSaving ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#242424] pb-3">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'playlists'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-[#b3b3b3] hover:text-white'
          }`}
        >
          Playlists ({playlists.length})
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'liked'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Liked Songs ({likedSongIds.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>

      {/* Tab 1: Playlists */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Liked Songs Special Card */}
          <div
            onClick={() => {
              setSelectedPlaylistId('liked-songs');
              setCurrentView('playlist');
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#1ed760] via-[#1db954] to-[#121212] text-black cursor-pointer group hover:scale-[1.02] transition-all shadow-xl flex flex-col justify-between h-48 relative overflow-hidden"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center mb-3 text-white">
                <Heart className="w-5 h-5 fill-[#1ed760] text-[#1ed760]" />
              </div>
              <h3 className="text-xl font-black text-black">Liked Songs</h3>
              <p className="text-xs text-black/80 font-bold mt-1">{likedSongIds.length} favorite tracks</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-black/70 font-bold">Auto-synced</span>
              <div className="w-11 h-11 rounded-full bg-black text-[#1ed760] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-[#1ed760] ml-0.5" />
              </div>
            </div>
          </div>

          {/* User Playlists */}
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylistId(pl.id);
                setCurrentView('playlist');
              }}
              className="p-5 rounded-2xl bg-[#181818] hover:bg-[#282828] border border-white/5 cursor-pointer group hover:scale-[1.02] transition-all shadow-md flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#242424] flex items-center justify-center text-[#1ed760] mb-3 shadow">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#1ed760] transition-colors truncate">
                  {pl.name}
                </h3>
                <p className="text-xs text-[#b3b3b3] line-clamp-2 mt-1">
                  {pl.description || 'Custom playlist'}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs font-mono text-[#b3b3b3]">{pl.songIds.length} tracks</span>
                <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </div>
              </div>
            </div>
          ))}

          {/* Create New Playlist Card */}
          <div
            onClick={onOpenCreatePlaylist}
            className="p-5 rounded-2xl border-2 border-dashed border-[#282828] hover:border-[#1ed760] bg-[#141414] hover:bg-[#181818] cursor-pointer group flex flex-col items-center justify-center text-center h-48 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#242424] group-hover:bg-[#1ed760] text-[#b3b3b3] group-hover:text-black flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">Create Playlist</p>
            <p className="text-xs text-[#b3b3b3] mt-1">Mix your tracks</p>
          </div>
        </div>
      )}

      {/* Tab 2: Liked Songs List */}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          {likedSongs.length === 0 ? (
            <div className="text-center py-16 text-[#b3b3b3]">
              <Heart className="w-12 h-12 mx-auto mb-3 text-[#282828]" />
              <p className="text-sm font-bold text-white">No liked songs yet</p>
              <p className="text-xs text-[#b3b3b3] mt-1">
                Tap the plus/heart icon on any song to save it to your library.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#b3b3b3]">
                  {likedSongs.length} liked tracks
                </span>
                <button
                  onClick={() => playSong(likedSongs[0], likedSongs)}
                  className="px-5 py-2.5 bg-[#1ed760] hover:bg-[#1db954] text-black rounded-full text-xs font-black flex items-center gap-2 shadow-lg shadow-[#1ed760]/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Play All</span>
                </button>
              </div>

              <div className="divide-y divide-[#242424] bg-[#181818]/50 rounded-2xl p-2 border border-white/5">
                {likedSongs.map((song, idx) => (
                  <SongListRow
                    key={song.id}
                    song={song}
                    index={idx}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                    playlistContext={likedSongs}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {recentHistorySongs.length === 0 ? (
            <div className="text-center py-16 text-[#b3b3b3]">
              <Clock className="w-12 h-12 mx-auto mb-3 text-[#282828]" />
              <p className="text-sm font-bold text-white">No playback history</p>
            </div>
          ) : (
            <div className="divide-y divide-[#242424] bg-[#181818]/50 rounded-2xl p-2 border border-white/5">
              {recentHistorySongs.map((song, idx) => (
                <SongListRow
                  key={`${song.id}-${idx}`}
                  song={song}
                  index={idx}
                  onOpenAddToPlaylist={onOpenAddToPlaylist}
                  playlistContext={recentHistorySongs}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
