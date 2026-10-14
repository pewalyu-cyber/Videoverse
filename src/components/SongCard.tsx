import React, { useState } from 'react';
import { Play, Pause, Plus, Check, MoreVertical, ListPlus } from 'lucide-react';
import { Song } from '../types/music';
import { usePlayer } from '../context/PlayerContext';

interface SongCardProps {
  song: Song;
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onOpenAddToPlaylist }) => {
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

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArtist(song.artist);
    setCurrentView('artist');
  };

  return (
    <div
      onClick={() => playSong(song)}
      className="group relative bg-[#181818] hover:bg-[#282828] rounded-xl p-3.5 transition-all duration-300 flex flex-col cursor-pointer select-none shadow-md hover:shadow-2xl"
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#242424]">
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
          }}
          loading="lazy"
        />

        {/* Hover / Active Play Button Overlay (Iconic Green Circle with Black Play icon) */}
        <div
          className={`absolute bottom-2 right-2 transition-all duration-300 transform ${
            isPlayingCurrent
              ? 'opacity-100 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#1db954] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-2xl transition-all"
            title={isPlayingCurrent ? 'Pause' : 'Play'}
          >
            {isPlayingCurrent ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>
        </div>

        {/* Category Pill */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white">
            {song.category}
          </span>
        </div>

        {/* Like / Plus Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md hover:scale-110 transition-all ${
            liked ? 'text-[#1ed760]' : 'text-white/80 opacity-0 group-hover:opacity-100'
          }`}
          title={liked ? 'Saved in Liked Songs' : 'Save to Library'}
        >
          {liked ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Meta Information */}
      <div className="flex items-start justify-between gap-2">
        <div className="overflow-hidden flex-1">
          <h3
            className={`font-bold text-sm truncate ${
              isCurrent ? 'text-[#1ed760]' : 'text-white'
            }`}
          >
            {song.title}
          </h3>
          <p
            onClick={handleArtistClick}
            className="text-xs text-[#b3b3b3] hover:text-white truncate mt-0.5 cursor-pointer hover:underline"
          >
            {song.artist}
          </p>
        </div>

        {/* Context Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded text-[#b3b3b3] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
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
              <div className="absolute right-0 top-7 z-50 w-44 bg-[#282828] border border-white/10 rounded-xl shadow-2xl py-1 text-xs text-white">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playNextInQueue(song);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] flex items-center gap-2"
                >
                  <ListPlus className="w-3.5 h-3.5 text-[#1ed760]" />
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
                  <Plus className="w-3.5 h-3.5 text-white" />
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
                    <Plus className="w-3.5 h-3.5 text-[#1ed760]" />
                    <span>Add to Playlist</span>
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
