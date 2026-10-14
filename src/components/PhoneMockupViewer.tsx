import React, { useState } from 'react';
import {
  ChevronDown,
  Volume2,
  Plus,
  Check,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Share2,
  ListMusic,
  Tv,
  ArrowLeft,
  ArrowDownCircle,
  MoreVertical,
  Home,
  Search,
  Library,
  Sparkles,
  PlusCircle,
  X
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface PhoneMockupViewerProps {
  onClose: () => void;
}

export const PhoneMockupViewer: React.FC<PhoneMockupViewerProps> = ({ onClose }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrev,
    seekTo,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    isLiked,
    toggleLike,
    songs,
    playSong,
    setSelectedArtist,
    setCurrentView
  } = usePlayer();

  const [activeScreen, setActiveScreen] = useState<1 | 2 | 3>(1);

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleExplore = () => {
    setSelectedArtist(currentSong.artist);
    setCurrentView('artist');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-45 bg-[#0a2310] flex flex-col overflow-y-auto">
      {/* Top Banner with Close */}
      <div className="h-14 px-6 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-black">
            <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-sm text-white">
              VideoVerse Mobile Showcase
            </span>
          </div>
        </div>

        {/* Screen selector on small screens */}
        <div className="flex items-center gap-2">
          <div className="flex md:hidden bg-black/40 rounded-full p-1 border border-white/10 text-xs font-bold text-white">
            <button
              onClick={() => setActiveScreen(1)}
              className={`px-3 py-1 rounded-full ${activeScreen === 1 ? 'bg-[#1ed760] text-black' : ''}`}
            >
              1. Player
            </button>
            <button
              onClick={() => setActiveScreen(2)}
              className={`px-3 py-1 rounded-full ${activeScreen === 2 ? 'bg-[#1ed760] text-black' : ''}`}
            >
              2. Canvas
            </button>
            <button
              onClick={() => setActiveScreen(3)}
              className={`px-3 py-1 rounded-full ${activeScreen === 3 ? 'bg-[#1ed760] text-black' : ''}`}
            >
              3. Playlist
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Exit Showcase View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3-Phone Showcase Grid matching image */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-x-auto gap-8">
        
        {/* ========================================================= */}
        {/* PHONE 1: FULL SCREEN NOW PLAYING WITH BIG ARTWORK         */}
        {/* ========================================================= */}
        <div className={`${activeScreen === 1 ? 'block' : 'hidden md:block'} w-[360px] h-[720px] rounded-[48px] bg-[#121212] border-[10px] border-[#202020] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 flex flex-col justify-between shrink-0 select-none relative overflow-hidden`}>
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />

          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pt-2">
            <ChevronDown className="w-5 h-5 text-white/70" />
            <span className="text-xs font-bold text-white truncate max-w-[180px]">
              {currentSong.title}
            </span>
            <MoreVertical className="w-5 h-5 text-white/70" />
          </div>

          {/* Big Green/Artwork Card */}
          <div className="my-auto py-2">
            <div className="w-full aspect-square rounded-3xl bg-[#1ed760] p-4 flex flex-col items-center justify-center text-black font-black text-3xl shadow-2xl relative overflow-hidden">
              <img
                src={currentSong.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-[#1ed760]/30 mix-blend-multiply pointer-events-none rounded-2xl" />
            </div>
          </div>

          {/* Song info & + button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded bg-[#1ed760] shrink-0 overflow-hidden">
                  <img src={currentSong.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
                  <p className="text-xs text-[#b3b3b3] truncate">{currentSong.artist}</p>
                </div>
              </div>
              <button
                onClick={() => toggleLike(currentSong.id)}
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  liked ? 'bg-[#1ed760] border-[#1ed760] text-black' : 'border-white/40 text-white'
                }`}
              >
                {liked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {/* Scrubber */}
            <div>
              <div className="relative group w-full h-2 flex items-center cursor-pointer">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className="absolute w-2.5 h-2.5 bg-white rounded-full -translate-x-1/2"
                  style={{ left: `${progressPercent}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime || 0}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#b3b3b3] pt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between pt-1">
              <button onClick={toggleShuffle} className={isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3]'}>
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={playPrev} className="text-white">
                <SkipBack className="w-6 h-6 fill-white" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-black" />
                ) : (
                  <Play className="w-6 h-6 fill-black ml-1" />
                )}
              </button>
              <button onClick={playNext} className="text-white">
                <SkipForward className="w-6 h-6 fill-white" />
              </button>
              <button onClick={cycleRepeat} className={repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-[#b3b3b3]'}>
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Sub Controls: Cast, Share, Queue */}
            <div className="flex items-center justify-between text-[#b3b3b3] pt-1">
              <Tv className="w-4 h-4" />
              <Share2 className="w-4 h-4" />
              <ListMusic className="w-4 h-4" />
            </div>

            {/* Explore Button */}
            <button
              onClick={handleExplore}
              className="w-full py-3 bg-[#1ed760] text-black font-extrabold text-xs rounded-full shadow-md"
            >
              Explore {currentSong.artist}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PHONE 2: CLEAN LOGO / CANVAS NOW PLAYING VARIANT          */}
        {/* ========================================================= */}
        <div className={`${activeScreen === 2 ? 'block' : 'hidden md:block'} w-[360px] h-[720px] rounded-[48px] bg-[#121212] border-[10px] border-[#202020] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 flex flex-col justify-between shrink-0 select-none relative overflow-hidden`}>
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />

          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pt-2">
            <ChevronDown className="w-5 h-5 text-white/70" />
            <span className="text-xs font-bold text-white truncate max-w-[180px]">
              {currentSong.title}
            </span>
            <Volume2 className="w-5 h-5 text-white/70" />
          </div>

          {/* Center Brand Emblem Canvas (Screen 2) */}
          <div className="my-auto flex flex-col items-center justify-center gap-3">
            <div className="w-24 h-24 rounded-full bg-[#1ed760] flex items-center justify-center shadow-2xl">
              <svg className="w-14 h-14 fill-black" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-[#1ed760] tracking-tight">VideoVerse</span>
          </div>

          {/* Track info & Scrubber */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded bg-[#1ed760] shrink-0 overflow-hidden">
                  <img src={currentSong.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
                  <p className="text-xs text-[#b3b3b3] truncate">{currentSong.artist}</p>
                </div>
              </div>
              <button
                onClick={() => toggleLike(currentSong.id)}
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  liked ? 'bg-[#1ed760] border-[#1ed760] text-black' : 'border-white/40 text-white'
                }`}
              >
                {liked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {/* Scrubber */}
            <div>
              <div className="relative group w-full h-2 flex items-center cursor-pointer">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className="absolute w-2.5 h-2.5 bg-white rounded-full -translate-x-1/2"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#b3b3b3] pt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1">
              <button onClick={toggleShuffle} className={isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3]'}>
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={playPrev} className="text-white">
                <SkipBack className="w-6 h-6 fill-white" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
              </button>
              <button onClick={playNext} className="text-white">
                <SkipForward className="w-6 h-6 fill-white" />
              </button>
              <button onClick={cycleRepeat} className={repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-[#b3b3b3]'}>
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Explore Button */}
            <button
              onClick={handleExplore}
              className="w-full py-3 bg-[#1ed760] text-black font-extrabold text-xs rounded-full shadow-md"
            >
              Explore {currentSong.artist}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PHONE 3: PLAYLIST VIEW WITH TRACKLIST & 5-TAB BOTTOM NAV  */}
        {/* ========================================================= */}
        <div className={`${activeScreen === 3 ? 'block' : 'hidden md:block'} w-[360px] h-[720px] rounded-[48px] bg-[#121212] border-[10px] border-[#202020] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between shrink-0 select-none relative overflow-hidden`}>
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />

          {/* Top Bar with Back Arrow */}
          <div className="px-5 pt-7 pb-2 flex items-center justify-between text-white shrink-0">
            <ArrowLeft className="w-5 h-5 text-white/80" />
            <span className="text-xs font-bold text-white">Daily Mix</span>
            <MoreVertical className="w-5 h-5 text-white/80" />
          </div>

          {/* Scrollable Playlist Content */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4 custom-scrollbar">
            {/* Big Green Square Artwork Header */}
            <div className="w-40 h-40 mx-auto rounded-2xl bg-[#1ed760] p-4 flex items-center justify-center shadow-xl">
              <svg className="w-20 h-20 fill-black" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Song Name</h2>
              <div className="flex items-center gap-1.5 text-xs text-white font-semibold mt-1">
                <span className="w-3.5 h-3.5 rounded-full bg-[#1ed760] inline-block" />
                <span>VideoVerse</span>
              </div>
              <p className="text-[11px] text-[#b3b3b3] mt-1">
                About recommendations and the impact of promotion • 4h 29min
              </p>
            </div>

            {/* Action Row: Download, Plus, More, Shuffle, Big Green Play */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3 text-[#b3b3b3]">
                <ArrowDownCircle className="w-5 h-5" />
                <Plus className="w-5 h-5" />
                <MoreVertical className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-3">
                <Shuffle className="w-5 h-5 text-[#1ed760]" />
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Track rows */}
            <div className="space-y-2 pb-24">
              {songs.slice(0, 6).map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded bg-[#1ed760] shrink-0 overflow-hidden">
                      <img src={song.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{song.title}</p>
                      <p className="text-[10px] text-[#b3b3b3] truncate">{song.artist}</p>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-[#b3b3b3]" />
                </div>
              ))}
            </div>
          </div>

          {/* Floating mini player at bottom of phone 3 */}
          <div className="absolute bottom-14 left-3 right-3 bg-[#181818] border border-white/10 rounded-xl p-2 flex items-center justify-between shadow-xl z-10">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded bg-[#1ed760] shrink-0 overflow-hidden">
                <img src={currentSong.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">{currentSong.title}</p>
                <p className="text-[9px] text-[#b3b3b3] truncate">{currentSong.artist}</p>
              </div>
            </div>
            <button onClick={togglePlayPause} className="text-white">
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
          </div>

          {/* 5-Tab Bottom Navigation matching Screen 3 */}
          <div className="h-14 bg-black/95 border-t border-white/10 flex items-center justify-around px-2 text-[#b3b3b3] z-20 shrink-0">
            <div className="flex flex-col items-center gap-0.5 text-white">
              <Home className="w-4 h-4" />
              <span className="text-[9px]">Home</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Search className="w-4 h-4" />
              <span className="text-[9px]">Search</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Library className="w-4 h-4" />
              <span className="text-[9px]">Your Library</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Sparkles className="w-4 h-4 text-[#1ed760]" />
              <span className="text-[9px]">Premium</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <PlusCircle className="w-4 h-4" />
              <span className="text-[9px]">Create</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
