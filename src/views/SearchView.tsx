import React from 'react';
import { Search, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { SongCard } from '../components/SongCard';
import { SongListRow } from '../components/SongListRow';
import { GENRES } from '../data/defaultCatalog';
import { Song } from '../types/music';

interface SearchViewProps {
  onOpenAddToPlaylist: (song: Song) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onOpenAddToPlaylist }) => {
  const {
    songs,
    searchQuery,
    setSearchQuery,
    activeGenre,
    setActiveGenre
  } = usePlayer();

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Filter songs
  const filtered = songs.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      (s.album && s.album.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q);

    const matchGenre = activeGenre === 'All' || s.category === activeGenre;
    return matchQuery && matchGenre;
  });

  const suggestions = ['The Weeknd', 'Daft Punk', 'Synthwave', 'Lofi', 'Pop', 'Midnight'];

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Search Bar */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Search</h1>
        <p className="text-xs sm:text-sm text-[#b3b3b3] mt-1">
          Explore songs, artists, albums, and categories
        </p>
      </div>

      {/* Large Input with Quick Clear */}
      <div className="relative">
        <Search className="w-5 h-5 text-[#b3b3b3] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="What do you want to play?"
          className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] border border-transparent focus:border-white rounded-full pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder-[#b3b3b3] outline-none shadow-xl transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#b3b3b3] hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Search Pills */}
      {!searchQuery && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#b3b3b3]">Try searching:</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => setSearchQuery(sug)}
              className="px-3.5 py-1.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-xs font-semibold text-white transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Genre Filters & View Mode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar w-full sm:w-auto">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeGenre === genre
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#242424] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-full shrink-0 self-end">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              viewMode === 'grid' ? 'bg-[#1ed760] text-black' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              viewMode === 'list' ? 'bg-[#1ed760] text-black' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Search Results Display */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-[#b3b3b3]">
          <div className="w-16 h-16 rounded-full bg-[#181818] flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#4d4d4d]" />
          </div>
          <h2 className="text-lg font-bold text-white">No results found for &quot;{searchQuery}&quot;</h2>
          <p className="text-xs text-[#b3b3b3] max-w-sm mt-1">
            Please make sure your words are spelled correctly or use less or different keywords.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[#242424] bg-[#181818]/50 rounded-2xl p-2 border border-white/5">
          {filtered.map((song, idx) => (
            <SongListRow
              key={song.id}
              song={song}
              index={idx}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
              playlistContext={filtered}
            />
          ))}
        </div>
      )}
    </div>
  );
};
