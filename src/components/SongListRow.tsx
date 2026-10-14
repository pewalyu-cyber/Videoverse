import React, { useState } from 'react';
import { Play, Pause, MoreVertical, Plus, ListPlus, Trash2, Check } from 'lucide-react';
import { Song } from '../types/music';
import { usePlayer } from '../context/PlayerContext';

interface SongListRowProps {
  song: Song;
  index: number;
  onOpenAddToPlaylist?: (song: Song) => void;
  onRemoveFromPlaylist?: (songId: string) => void;
  playlistContext?: Song[];
}

export const SongListRow: React.FC<SongListRowProps> = ({
  song,
  index,
  onOpenAddToPlaylist,
  onRemoveFromPlaylist,
  playlistContext
}) => {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlayPause,
    isLiked,
    toggleLike,
    playNextInQueue,
    addToQueue,
    setSelectedArtist,
    setCurrentView
  } = usePlayer();

  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const liked = isLiked(song.id);

  const formatDuration = (secs?: number) => {
    if (!secs) return '3:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer select-none ${
        isCurrent ? 'bg-[#242424]/80' : 'hover:bg-[#1a1a1a]'
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
        {/* Track Thumbnail (Green square accent matching Screen 3) */}
        <div className="relative w-11 h-11 rounded-md overflow-hidden shrink-0 bg-[#1ed760] shadow-sm">
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
            }}
          />
          {/* Play/Pause Hover or Active Indicator */}
          <div
            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
              isPlayingCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isPlayingCurrent ? (
              <Pause className="w-4 h-4 text-[#1ed760] fill-[#1ed760]" />
            ) : (
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Title and Singer Name */}
        <div className="overflow-hidden min-w-0">
          <p
            className={`text-sm font-bold truncate ${
              isCurrent ? 'text-[#1ed760]' : 'text-white group-hover:text-white'
            }`}
          >
            {song.title}
          </p>
          <p
            onClick={(e) => {
              e.stopPropagation();
              setSelectedArtist(song.artist);
              setCurrentView('artist');
            }}
            className="text-xs text-[#b3b3b3] hover:text-white truncate cursor-pointer hover:underline"
          >
            {song.artist}
          </p>
        </div>
      </div>

      {/* Right meta and options */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline text-xs font-mono text-[#b3b3b3]">
          {formatDuration(song.duration)}
        </span>

        {/* Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song.id);
          }}
          className={`p-1.5 transition-colors ${
            liked ? 'text-[#1ed760]' : 'text-[#b3b3b3] opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
          title={liked ? 'Saved' : 'Save'}
        >
          {liked ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Context Menu (3-dots vertical icon matching Screen 3) */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-7 z-50 w-48 bg-[#282828] border border-white/10 rounded-xl shadow-2xl py-1 text-xs text-white">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playNextInQueue(song);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] flex items-center gap-2"
                >
                  <ListPlus className="w-4 h-4 text-[#1ed760]" />
                  <span>Play Next</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(song);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add to Queue</span>
                </button>
                {onOpenAddToPlaylist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddToPlaylist(song);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#1ed760]" />
                    <span>Add to Playlist</span>
                  </button>
                )}
                {onRemoveFromPlaylist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromPlaylist(song.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-950 text-rose-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove from Playlist</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
