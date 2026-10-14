import React from 'react';
import {
  BarChart3,
  Play,
  Flame,
  User,
  Music,
  Clock,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const StatsView: React.FC = () => {
  const { stats, songs, playSong } = usePlayer();

  // Sort songs by play count
  const songPlayArray = Object.entries(stats.songPlayCounts)
    .map(([songId, count]) => {
      const song = songs.find((s) => s.id === songId);
      return { song, count };
    })
    .filter((item): item is { song: NonNullable<typeof item.song>; count: number } => !!item.song)
    .sort((a, b) => b.count - a.count);

  // Sort artists by play count
  const artistPlayArray = Object.entries(stats.artistPlayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Sort genres
  const genrePlayArray = Object.entries(stats.genrePlayCounts)
    .sort((a, b) => b[1] - a[1]);

  const maxGenreCount = Math.max(...genrePlayArray.map(g => g[1]), 1);

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#1ed760] text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VideoVerse Insights</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Listening Insights</h1>
        <p className="text-sm text-[#b3b3b3] mt-1">
          Your personal streaming patterns, playback counts, and favorite genres
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Playback Starts</span>
            <Play className="w-4 h-4 text-[#1ed760]" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats.totalPlaybackStarts}
          </div>
          <p className="text-[11px] text-[#b3b3b3] mt-1">Total track launches</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Unique Tracks</span>
            <Music className="w-4 h-4 text-[#1ed760]" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {Object.keys(stats.songPlayCounts).length}
          </div>
          <p className="text-[11px] text-[#b3b3b3] mt-1">Distinct tracks streamed</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Artist</span>
            <User className="w-4 h-4 text-[#1ed760]" />
          </div>
          <div className="text-xl font-black text-white truncate">
            {artistPlayArray[0] ? artistPlayArray[0][0] : 'None yet'}
          </div>
          <p className="text-[11px] text-[#b3b3b3] mt-1">
            {artistPlayArray[0] ? `${artistPlayArray[0][1]} sessions` : 'Stream tracks'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Genre</span>
            <Flame className="w-4 h-4 text-[#1ed760]" />
          </div>
          <div className="text-xl font-black text-white truncate">
            {genrePlayArray[0] ? genrePlayArray[0][0] : 'Explore'}
          </div>
          <p className="text-[11px] text-[#b3b3b3] mt-1">
            {genrePlayArray[0] ? `${genrePlayArray[0][1]} plays` : 'Discover music'}
          </p>
        </div>
      </div>

      {/* Main Grid: Top Songs & Genre Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Played Songs */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-white/5">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#1ed760]" />
            <span>Top Songs</span>
          </h2>

          {songPlayArray.length === 0 ? (
            <p className="text-xs text-[#b3b3b3] py-6 text-center">
              No playback recorded yet. Stream songs to see your rankings!
            </p>
          ) : (
            <div className="space-y-3">
              {songPlayArray.slice(0, 5).map(({ song, count }, idx) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#242424] cursor-pointer group transition-colors"
                >
                  <span className="w-5 text-center font-mono text-xs font-black text-[#1ed760]">
                    #{idx + 1}
                  </span>
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-11 h-11 rounded-lg object-cover"
                  />
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold text-white group-hover:text-[#1ed760] truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-[#b3b3b3] truncate">{song.artist}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-[#121212] border border-white/10 text-[#1ed760] text-xs font-mono font-bold">
                      {count} plays
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Genre Breakdown Visual Meter */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-white/5 flex flex-col">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1ed760]" />
            <span>Top Genres</span>
          </h2>

          {genrePlayArray.length === 0 ? (
            <p className="text-xs text-[#b3b3b3] py-6 text-center">
              No genre stats available yet.
            </p>
          ) : (
            <div className="space-y-4 flex-1">
              {genrePlayArray.slice(0, 6).map(([genre, count]) => {
                const percentage = Math.round((count / maxGenreCount) * 100);
                return (
                  <div key={genre} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white">{genre}</span>
                      <span className="text-[#b3b3b3] font-mono">{count} tracks</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#242424] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1ed760] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Listening History Timeline */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-white/5">
        <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1ed760]" />
          <span>Recent History</span>
        </h2>

        {stats.playHistory.length === 0 ? (
          <p className="text-xs text-[#b3b3b3] py-6 text-center">No recent history.</p>
        ) : (
          <div className="divide-y divide-[#242424] max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {stats.playHistory.slice(0, 20).map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-[#242424] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-9 h-9 rounded-md object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-[#b3b3b3] truncate">{item.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#b3b3b3] font-mono shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
