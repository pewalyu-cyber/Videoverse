import React, { useEffect, useRef } from 'react';
import { X, FileText, Music2, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { LyricLine } from '../types/music';

export const LyricsDrawer: React.FC = () => {
  const { currentSong, currentTime, seekTo, isLyricsOpen, setIsLyricsOpen } = usePlayer();
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active lyric line
  useEffect(() => {
    if (activeLineRef.current && isLyricsOpen) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, isLyricsOpen]);

  if (!isLyricsOpen || !currentSong) return null;

  const isTimestamped = Array.isArray(currentSong.lyrics) && currentSong.lyrics.length > 0;
  const isPlainText = typeof currentSong.lyrics === 'string' && currentSong.lyrics.trim().length > 0;

  // Find active line index
  let activeIndex = -1;
  if (isTimestamped) {
    const lines = currentSong.lyrics as LyricLine[];
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  return (
    <aside
      aria-label="Synchronized Lyrics"
      className="fixed top-16 right-0 bottom-20 w-full sm:w-96 bg-[#121212]/98 backdrop-blur-2xl border-l border-[#282828] z-25 flex flex-col shadow-2xl transition-all"
    >
      {/* Header */}
      <div className="h-14 px-6 border-b border-[#282828] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1ed760]" />
          <h2 className="font-bold text-sm text-white">Lyrics</h2>
          {isTimestamped && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Synced
            </span>
          )}
        </div>
        <button
          onClick={() => setIsLyricsOpen(false)}
          className="p-1.5 rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Song details preview */}
      <div className="p-3 mx-4 my-3 rounded-xl bg-[#181818] border border-white/5 flex items-center gap-3">
        <img
          src={currentSong.thumbnailUrl}
          alt={currentSong.title}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div className="overflow-hidden">
          <p className="font-bold text-xs text-white truncate">{currentSong.title}</p>
          <p className="text-[11px] text-[#b3b3b3] truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Lyrics Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar text-center">
        {isTimestamped ? (
          (currentSong.lyrics as LyricLine[]).map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seekTo(line.time)}
                className={`py-2 px-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'text-black text-lg font-black bg-[#1ed760] shadow-lg scale-105'
                    : 'text-[#b3b3b3] hover:text-white text-sm font-semibold hover:bg-[#181818]'
                }`}
              >
                {line.text}
              </div>
            );
          })
        ) : isPlainText ? (
          <div className="text-white text-sm leading-relaxed whitespace-pre-line text-left bg-[#181818] p-4 rounded-xl border border-white/5 font-medium">
            {currentSong.lyrics as string}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#b3b3b3] py-12">
            <div className="w-12 h-12 rounded-full bg-[#181818] flex items-center justify-center mb-3">
              <Music2 className="w-6 h-6 text-[#4d4d4d]" />
            </div>
            <p className="text-sm font-bold text-white">Lyrics unavailable</p>
            <p className="text-xs text-[#b3b3b3] max-w-xs mt-1">
              Synchronized lyrics haven&apos;t been added for this track yet.
            </p>
          </div>
        )}
      </div>

      <div className="p-3 bg-black border-t border-[#282828] text-center text-[11px] text-[#b3b3b3]">
        {isTimestamped ? 'Click any line to jump playback' : 'VideoVerse Real-Time Lyrics'}
      </div>
    </aside>
  );
};
