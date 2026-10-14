import React from 'react';
import { Play, Sparkles, Flame, Radio, Plus, Compass } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { SongCard } from '../components/SongCard';
import { SongListRow } from '../components/SongListRow';
import { GENRES } from '../data/defaultCatalog';
import { Song } from '../types/music';

interface HomeViewProps {
  onOpenAddToPlaylist: (song: Song) => void;
  onOpenCreatePlaylist: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenAddToPlaylist,
  onOpenCreatePlaylist
}) => {
  const {
    songs,
    playlists,
    playSong,
    currentSong,
    isPlaying,
    togglePlayPause,
    setSelectedPlaylistId,
    setCurrentView,
    activeGenre,
    setActiveGenre,
    setSelectedArtist
  } = usePlayer();

  const featuredSong = songs.find((s) => s.featured) || songs[0];
  const popularSongs = [...songs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6);

  const filteredSongs =
    activeGenre === 'All' ? songs : songs.filter((s) => s.category === activeGenre);

  // Unique artists for Top Artists section
  const artists = Array.from(new Set(songs.map((s) => s.artist))).slice(0, 8);

  const isFeaturedPlaying = currentSong?.id === featuredSong?.id && isPlaying;

  return (
    <div className="space-y-10 pb-16">
      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeGenre === genre
                ? 'bg-white text-black shadow-md'
                : 'bg-[#242424] hover:bg-[#2a2a2a] text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Spotlight Hero Banner with Green Glow */}
      {featuredSong && (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 group bg-gradient-to-r from-[#181818] to-[#121212]">
          <div className="absolute inset-0 z-0">
            <img
              src={featuredSong.thumbnailUrl}
              alt={featuredSong.title}
              className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700 blur-sm opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/90 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/30 text-[#1ed760] text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Release</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
                {featuredSong.title}
              </h1>
              <p className="text-base sm:text-lg text-[#b3b3b3] font-semibold">
                {featuredSong.artist} &bull;{' '}
                <span className="text-[#1ed760]">{featuredSong.category}</span>
                {featuredSong.album && (
                  <span className="text-[#b3b3b3] font-normal"> &bull; {featuredSong.album}</span>
                )}
              </p>
              <p className="text-xs sm:text-sm text-[#b3b3b3] max-w-md line-clamp-2">
                Stream with synchronized timestamped lyrics and official YouTube music video playback.
              </p>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => {
                    if (currentSong?.id === featuredSong.id) {
                      togglePlayPause();
                    } else {
                      playSong(featuredSong, songs);
                    }
                  }}
                  className="px-7 py-3 bg-[#1ed760] hover:bg-[#1db954] hover:scale-105 active:scale-95 text-black font-extrabold text-sm rounded-full shadow-lg shadow-[#1ed760]/30 flex items-center gap-2 transition-all"
                >
                  <Play className={`w-4 h-4 fill-black ${isFeaturedPlaying ? 'animate-pulse' : ''}`} />
                  <span>{isFeaturedPlaying ? 'Pause' : 'Play Now'}</span>
                </button>

                <button
                  onClick={() => onOpenAddToPlaylist(featuredSong)}
                  className="px-4 py-3 bg-[#242424] hover:bg-[#2a2a2a] text-white rounded-full text-xs font-bold border border-white/10 backdrop-blur-md transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Playlist</span>
                </button>
              </div>
            </div>

            {/* Right thumbnail preview card with green border */}
            <div className="hidden lg:block shrink-0">
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#1ed760]/30 group-hover:border-[#1ed760] transition-colors">
                <img
                  src={featuredSong.thumbnailUrl}
                  alt={featuredSong.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Songs (Ranked List) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#1ed760]" />
            <h2 className="text-xl font-black text-white tracking-tight">Today&apos;s Top Hits</h2>
          </div>
          <span className="text-xs text-[#b3b3b3]">Top rotation this week</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {popularSongs.map((song, idx) => (
            <SongListRow
              key={song.id}
              song={song}
              index={idx}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
              playlistContext={songs}
            />
          ))}
        </div>
      </div>

      {/* Featured Catalogue Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#1ed760]" />
            <h2 className="text-xl font-black text-white tracking-tight">
              {activeGenre === 'All' ? 'Discover Tracks' : `${activeGenre} Tracks`}
            </h2>
          </div>
          <span className="text-xs text-[#b3b3b3]">{filteredSongs.length} songs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
            />
          ))}
        </div>
      </div>

      {/* Curated Mixes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#1ed760]" />
            <h2 className="text-xl font-black text-white tracking-tight">Featured Playlists</h2>
          </div>
          <button
            onClick={onOpenCreatePlaylist}
            className="text-xs font-bold text-[#1ed760] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Playlist</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.slice(0, 3).map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylistId(pl.id);
                setCurrentView('playlist');
              }}
              className="p-5 rounded-2xl bg-[#181818] hover:bg-[#282828] border border-white/5 cursor-pointer group transition-all duration-300 shadow-md flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#1ed760] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
              />

              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-[#1ed760] border border-[#1ed760]/30">
                  VideoVerse Mix
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-[#1ed760] transition-colors mt-2">
                  {pl.name}
                </h3>
                <p className="text-xs text-[#b3b3b3] line-clamp-2 mt-1">
                  {pl.description || 'Curated music collection.'}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs font-mono text-[#b3b3b3]">
                  {pl.songIds.length} tracks
                </span>
                <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Artists Row with Circular Avatars */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight mb-4">Popular Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {artists.map((artist) => (
            <div
              key={artist}
              onClick={() => {
                setSelectedArtist(artist);
                setCurrentView('artist');
              }}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-[#181818] cursor-pointer group transition-all"
            >
              <div className="w-20 h-20 rounded-full bg-[#242424] flex items-center justify-center text-xl font-black text-[#1ed760] shadow-lg group-hover:scale-105 group-hover:shadow-[#1ed760]/20 transition-all mb-2 border border-white/5">
                {artist.charAt(0)}
              </div>
              <p className="text-xs font-bold text-white text-center truncate w-full">
                {artist}
              </p>
              <span className="text-[10px] text-[#b3b3b3]">Artist</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
