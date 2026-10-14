import React from 'react';
import { X, Trash2, Play, Music, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const QueueDrawer: React.FC = () => {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    currentSong,
    playSong,
    removeFromQueue,
    clearQueue
  } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <aside
      aria-label="Playback Queue"
      className="fixed top-16 right-0 bottom-20 w-full sm:w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800/80 z-25 flex flex-col shadow-2xl transition-all"
    >
      {/* Header */}
      <div className="h-14 px-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-violet-400" />
          <h2 className="font-bold text-sm text-white">Play Queue</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {queue.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              title="Clear Queue"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Now Playing Section */}
      {currentSong && (
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-2">
            Now Playing
          </p>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-violet-950/30 border border-violet-500/30">
            <img
              src={currentSong.thumbnailUrl}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
              <p className="text-xs text-slate-400 truncate">{currentSong.artist}</p>
            </div>
            <span className="flex items-end gap-0.5 h-4 px-2">
              <span className="w-0.5 bg-violet-400 animate-pulse h-full" />
              <span className="w-0.5 bg-cyan-400 animate-pulse h-2/3" />
              <span className="w-0.5 bg-violet-400 animate-pulse h-4/5" />
            </span>
          </div>
        </div>
      )}

      {/* Up Next List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Next In Queue
        </p>

        {queue.length <= 1 ? (
          <div className="text-center py-10 text-slate-500">
            <Music className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">No upcoming tracks in queue.</p>
            <p className="text-[11px] text-slate-600 mt-1">Add tracks from catalogue or playlists.</p>
          </div>
        ) : (
          queue.map((song, idx) => {
            if (currentSong && song.id === currentSong.id && idx === 0) return null;
            return (
              <div
                key={`${song.id}-${idx}`}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 transition-all"
              >
                <span className="text-xs font-mono text-slate-500 w-4 text-center">{idx + 1}</span>
                <img
                  src={song.thumbnailUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => playSong(song)}
                    title="Play Now"
                    className="p-1.5 text-violet-400 hover:text-white rounded hover:bg-slate-800"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    title="Remove from queue"
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
