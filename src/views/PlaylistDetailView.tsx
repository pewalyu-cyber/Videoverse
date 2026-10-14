import React, { useState } from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Trash2,
  Edit2,
  Heart,
  Plus,
  ArrowLeft,
  ArrowDownCircle,
  MoreVertical,
  Music,
  Check,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { SongListRow } from '../components/SongListRow';
import { Song } from '../types/music';

interface PlaylistDetailViewProps {
  onOpenAddToPlaylist: (song: Song) => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  onOpenAddToPlaylist
}) => {
  const {
    songs,
    playlists,
    selectedPlaylistId,
    likedSongIds,
    setCurrentView,
    playSong,
    updatePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    addSongToPlaylist,
    toggleShuffle,
    isShuffle,
    currentSong,
    isPlaying,
    togglePlayPause
  } = usePlayer();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const isLikedView = selectedPlaylistId === 'liked-songs';

  const playlist = isLikedView
    ? {
        id: 'liked-songs',
        name: 'Liked Songs',
        description: 'Your collection of saved favorite tracks',
        songIds: likedSongIds,
        coverColor: 'from-[#1ed760] to-[#121212]',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    : playlists.find((p) => p.id === selectedPlaylistId);

  if (!playlist) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-[#b3b3b3]">Playlist not found.</p>
        <button
          onClick={() => setCurrentView('library')}
          className="px-4 py-2 bg-[#242424] text-white rounded-full text-xs font-semibold"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const playlistSongs = playlist.songIds
    .map((id) => songs.find((s) => s.id === id))
    .filter((s): s is Song => !!s);

  const isPlaylistActive =
    playlistSongs.some((s) => s.id === currentSong?.id) && isPlaying;

  const totalDurationSecs = playlistSongs.reduce((acc, s) => acc + (s.duration || 180), 0);
  const totalMins = Math.floor(totalDurationSecs / 60);

  const handleStartEdit = () => {
    setEditName(playlist.name);
    setEditDesc(playlist.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updatePlaylist(playlist.id, {
      name: editName.trim(),
      description: editDesc.trim()
    });
    setIsEditing(false);
  };

  const handlePlayAll = () => {
    if (isPlaylistActive) {
      togglePlayPause();
    } else if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  const handleShufflePlay = () => {
    if (playlistSongs.length > 0) {
      if (!isShuffle) toggleShuffle();
      const randIdx = Math.floor(Math.random() * playlistSongs.length);
      playSong(playlistSongs[randIdx], playlistSongs);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('library')}
          className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Screen 3 Layout: Prominent Square Artwork on Top */}
      <div className="flex flex-col items-center md:flex-row md:items-end gap-6 text-center md:text-left pt-2 pb-4">
        {/* Square Artwork */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-tr from-[#1ed760] via-[#1db954] to-[#121212] flex items-center justify-center text-white shrink-0 shadow-2xl relative overflow-hidden group">
          {playlistSongs[0] ? (
            <img
              src={playlistSongs[0].thumbnailUrl}
              alt={playlist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center">
              <Music className="w-10 h-10 text-[#1ed760]" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>

        {/* Playlist Metadata */}
        <div className="space-y-2 flex-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1ed760]">
            {isLikedView ? 'System Collection' : 'Public Playlist'}
          </span>

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-3 pt-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#181818] border border-[#282828] rounded-xl px-3 py-1.5 text-xl font-black text-white focus:outline-none focus:border-[#1ed760]"
              />
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description..."
                className="w-full bg-[#181818] border border-[#282828] rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-[#1ed760]"
              />
              <div className="flex gap-2 justify-center md:justify-start">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1ed760] text-black rounded-full text-xs font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-[#242424] text-white rounded-full text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {playlist.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-[#1ed760] text-black text-[10px] font-black flex items-center justify-center">
                  V
                </span>
                <span>VideoVerse Studio</span>
              </div>
              <p className="text-xs text-[#b3b3b3] max-w-xl">
                {playlist.description || 'Recommendations and top trending tracks'} &bull;{' '}
                <span className="font-mono">{playlistSongs.length} songs, approx. {totalMins} min</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Action Row Matching Screen 3 */}
      {/* (Download, Add/Like, 3-dots, Shuffle toggle, and Big Green Round Play Button) */}
      <div className="flex items-center justify-between py-2 border-b border-[#282828]">
        <div className="flex items-center gap-4 text-[#b3b3b3]">
          {/* Download icon */}
          <button
            onClick={() => setDownloaded(!downloaded)}
            className={`transition-colors ${downloaded ? 'text-[#1ed760]' : 'hover:text-white'}`}
            title="Download for offline"
          >
            <ArrowDownCircle className={`w-6 h-6 ${downloaded ? 'fill-[#1ed760] text-black' : ''}`} />
          </button>

          {/* Plus / Heart icon */}
          <button
            className="hover:text-white transition-colors"
            title="Add to Library"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* More options menu */}
          {!isLikedView && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartEdit}
                className="hover:text-white transition-colors p-1"
                title="Rename Playlist"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
                    deletePlaylist(playlist.id);
                  }
                }}
                className="hover:text-rose-400 transition-colors p-1"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right side: Shuffle and Big Green Play Button */}
        <div className="flex items-center gap-5">
          <button
            onClick={handleShufflePlay}
            className={`transition-colors ${
              isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Shuffle Play"
          >
            <Shuffle className="w-6 h-6" />
          </button>

          {/* Big Green Round Play Button matching Screen 3 */}
          <button
            onClick={handlePlayAll}
            disabled={playlistSongs.length === 0}
            className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#1db954] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-xl shadow-[#1ed760]/30 transition-all disabled:opacity-40"
            title={isPlaylistActive ? 'Pause' : 'Play Playlist'}
          >
            {isPlaylistActive ? (
              <Pause className="w-6 h-6 fill-black text-black" />
            ) : (
              <Play className="w-6 h-6 fill-black text-black ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Song list with green/artwork thumbnail, Song Name, Singer, and 3-dots */}
      <div className="space-y-1">
        {playlistSongs.length === 0 ? (
          <div className="py-16 text-center text-[#b3b3b3]">
            <p className="text-sm font-bold text-white">This playlist is empty</p>
            <p className="text-xs text-[#b3b3b3] mt-1">Add tracks from search or discovery.</p>
          </div>
        ) : (
          playlistSongs.map((song, idx) => (
            <SongListRow
              key={`${song.id}-${idx}`}
              song={song}
              index={idx}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
              onRemoveFromPlaylist={
                !isLikedView ? (songId) => removeSongFromPlaylist(playlist.id, songId) : undefined
              }
              playlistContext={playlistSongs}
            />
          ))
        )}
      </div>
    </div>
  );
};
