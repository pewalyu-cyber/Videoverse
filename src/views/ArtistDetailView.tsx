import React from 'react';
import { Play, Pause, ArrowLeft, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { SongListRow } from '../components/SongListRow';
import { Song } from '../types/music';

interface ArtistDetailViewProps {
  onOpenAddToPlaylist: (song: Song) => void;
}

export const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({ onOpenAddToPlaylist }) => {
  const { selectedArtist, songs, setCurrentView, playSong, currentSong, isPlaying, togglePlayPause } = usePlayer();

  if (!selectedArtist) {
    return (
      <div className="py-16 text-center">
        <p className="text-[#b3b3b3]">No artist selected.</p>
        <button
          onClick={() => setCurrentView('home')}
          className="mt-4 px-4 py-2 bg-[#242424] text-white rounded-full text-xs font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const artistSongs = songs.filter((s) => s.artist === selectedArtist);
  const isArtistPlaying = artistSongs.some(s => s.id === currentSong?.id) && isPlaying;

  const handlePlayAll = () => {
    if (isArtistPlaying) {
      togglePlayPause();
    } else if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <button
        onClick={() => setCurrentView('home')}
        className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] hover:text-white transition-colors p-1"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Artist Hero Banner with Verified Artist badge */}
      <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-[#181818] to-[#121212] border border-white/5 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative overflow-hidden">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#1ed760] p-1 shadow-2xl relative z-10 shrink-0">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl sm:text-5xl font-black text-[#1ed760]">
            {selectedArtist.charAt(0)}
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left relative z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1ed760]/20 text-[#1ed760] text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Artist</span>
          </div>
          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight">
            {selectedArtist}
          </h1>
          <p className="text-xs sm:text-sm text-[#b3b3b3]">
            {artistSongs.length} track{artistSongs.length === 1 ? '' : 's'} in VideoVerse catalogue
          </p>

          <div className="pt-3">
            <button
              onClick={handlePlayAll}
              disabled={artistSongs.length === 0}
              className="px-8 py-3 bg-[#1ed760] hover:bg-[#1db954] hover:scale-105 active:scale-95 text-black font-black text-xs rounded-full shadow-lg shadow-[#1ed760]/30 flex items-center gap-2 transition-all mx-auto sm:mx-0"
            >
              {isArtistPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black text-black" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                  <span>Play Artist</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Artist Catalogue */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white tracking-tight">Popular Songs by {selectedArtist}</h2>
        <div className="divide-y divide-[#242424] bg-[#181818]/50 rounded-2xl p-2 border border-white/5">
          {artistSongs.map((song, idx) => (
            <SongListRow
              key={song.id}
              song={song}
              index={idx}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
              playlistContext={artistSongs}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
