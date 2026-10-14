import React, { useState } from 'react';
import {
  ChevronDown,
  MoreVertical,
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
  Bluetooth,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface NowPlayingFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSleepTimer: () => void;
}

export const NowPlayingFullModal: React.FC<NowPlayingFullModalProps> = ({
  isOpen,
  onClose,
  onOpenSleepTimer
}) => {
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
    setIsLyricsOpen,
    isLyricsOpen,
    setIsQueueOpen,
    setSelectedArtist,
    setCurrentView,
    sleepTimerRemaining,
    bluetoothDevice,
    scanBluetoothDevice
  } = usePlayer();

  const [copiedShare, setCopiedShare] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState<number>(0);

  if (!isOpen || !currentSong) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY;
    if (delta > 0) {
      setPullDistance(delta);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 70) {
      onClose();
    }
    setPullDistance(0);
    setTouchStartY(null);
  };

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

  const handleExploreArtist = () => {
    setSelectedArtist(currentSong.artist);
    setCurrentView('artist');
    onClose();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#121212] md:bg-black/85 md:backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Phone container matching Screen 1 & Screen 2 */}
      <div
        className="w-full h-full md:h-[844px] md:max-w-[390px] md:rounded-[44px] bg-[#121212] md:border-[10px] md:border-[#222222] shadow-2xl flex flex-col justify-between p-6 relative overflow-hidden select-none"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
        }}
      >
        {/* Pull Down Indicator Pill Bar (Screen 1 & 2) */}
        <div
          onClick={onClose}
          title="Pull down to main page"
          className="w-12 h-1.5 bg-white/30 hover:bg-[#1ed760] rounded-full mx-auto mb-1 cursor-pointer transition-colors"
        />

        {/* Dynamic Island / Notch on desktop frame */}
        <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-20 pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pt-1 pb-4 text-white z-10">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-white/80 hover:text-white rounded-full transition-colors flex items-center gap-1 group"
            title="Pull down to main page (video plays in small square box)"
          >
            <ChevronDown className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <div className="text-center overflow-hidden px-4 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b3b3b3] block truncate">
              Playing from Playlist
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {currentSong.album || currentSong.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSleepTimer}
              className={`p-2 rounded-full transition-colors ${
                sleepTimerRemaining !== null ? 'text-[#1ed760]' : 'text-white/80 hover:text-white'
              }`}
              title="Sleep Timer"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Artwork matching the image's vibrant green card / album cover */}
        <div className="relative my-auto flex items-center justify-center py-2">
          <div className="w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-[#1ed760] via-[#1db954] to-[#121212] relative group border border-white/5">
            <img
              src={currentSong.thumbnailUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentSong.youtubeId}/hqdefault.jpg`;
              }}
            />

            {/* Brand Watermark Overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md">
              <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md">
                {currentSong.category}
              </span>
              {isPlaying && (
                <span className="flex items-end gap-1 h-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full">
                  <span className="w-1 bg-[#1ed760] animate-pulse h-full rounded" />
                  <span className="w-1 bg-[#1ed760] animate-pulse h-2/3 rounded" />
                  <span className="w-1 bg-[#1ed760] animate-pulse h-4/5 rounded" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Track Title, Artist, and (+) Like button */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Mini square badge */}
              <div className="w-10 h-10 rounded-lg bg-[#1ed760] shrink-0 overflow-hidden shadow-md">
                <img
                  src={currentSong.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-black text-white truncate leading-tight">
                  {currentSong.title}
                </h2>
                <p
                  onClick={handleExploreArtist}
                  className="text-xs text-[#b3b3b3] hover:text-white truncate cursor-pointer hover:underline"
                >
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Plus / Checkmark button matching image */}
            <button
              onClick={() => toggleLike(currentSong.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                liked
                  ? 'bg-[#1ed760] border-[#1ed760] text-black'
                  : 'border-white/30 text-white hover:border-white'
              }`}
              title={liked ? 'Saved to Liked Songs' : 'Add to Liked Songs'}
            >
              {liked ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="space-y-1">
            <div className="relative group w-full h-3 flex items-center cursor-pointer">
              <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white group-hover:bg-[#1ed760] transition-colors rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {/* Circle thumb */}
              <div
                className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none -translate-x-1/2"
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

            <div className="flex items-center justify-between text-[11px] font-mono text-[#b3b3b3]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls Row: Shuffle, Prev, Big White Play, Next, Repeat */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors relative ${
                isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
              {isShuffle && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full" />}
            </button>

            <button
              onClick={playPrev}
              className="p-2 text-white hover:scale-105 active:scale-95 transition-all"
              title="Previous"
            >
              <SkipBack className="w-7 h-7 fill-white" />
            </button>

            {/* Circular White Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-black text-black" />
              ) : (
                <Play className="w-7 h-7 fill-black text-black ml-1" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-white hover:scale-105 active:scale-95 transition-all"
              title="Next"
            >
              <SkipForward className="w-7 h-7 fill-white" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`p-2 rounded-full transition-colors relative ${
                repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              {repeatMode !== 'off' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full" />
              )}
            </button>
          </div>

          {/* Auxiliary Row: Cast/Devices, Share, Lyrics, Queue */}
          <div className="flex items-center justify-between text-[#b3b3b3] pt-1">
            <button
              onClick={() => scanBluetoothDevice()}
              className={`p-2 transition-colors ${
                bluetoothDevice.isConnected ? 'text-[#1ed760]' : 'hover:text-white'
              }`}
              title={
                bluetoothDevice.isConnected
                  ? `Connected: ${bluetoothDevice.name}`
                  : 'Connect Bluetooth Device'
              }
            >
              <Bluetooth className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setIsLyricsOpen(!isLyricsOpen);
                onClose();
              }}
              className={`p-2 transition-colors ${
                isLyricsOpen ? 'text-[#1ed760]' : 'hover:text-white'
              }`}
              title="Lyrics"
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 hover:text-white transition-colors relative"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
              {copiedShare && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1ed760] text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setIsQueueOpen(true);
                onClose();
              }}
              className="p-2 hover:text-white transition-colors"
              title="Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>

          {/* Connected Bluetooth Device Name Display */}
          <div className="pt-2 text-center">
            {bluetoothDevice.isConnected && bluetoothDevice.name ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183a24] border border-[#1ed760]/40 text-[#1ed760] text-xs font-bold animate-pulse">
                <Bluetooth className="w-3.5 h-3.5" />
                <span>Listening on {bluetoothDevice.name}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1e1e] border border-white/5 text-[#a7a7a7] text-xs">
                <Bluetooth className="w-3.5 h-3.5" />
                <span>Listening on This Device</span>
              </div>
            )}
          </div>

          {/* Big Green Pill: "Explore [Singer Name]" matching the bottom of Screen 1 & 2 */}
          <div className="pt-2 pb-1">
            <button
              onClick={handleExploreArtist}
              className="w-full py-3.5 bg-[#1ed760] hover:bg-[#1db954] active:scale-[0.98] text-black font-extrabold text-sm rounded-full shadow-lg shadow-[#1ed760]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore {currentSong.artist}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
