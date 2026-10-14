import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Plus,
  Check,
  Bluetooth,
  Headphones,
  Speaker,
  FileText,
  ListMusic,
  Maximize2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface BottomPlayerProps {
  onOpenSleepTimer: () => void;
  onOpenNowPlayingModal: () => void;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  onOpenSleepTimer,
  onOpenNowPlayingModal
}) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    togglePlayPause,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    isLiked,
    toggleLike,
    isLyricsOpen,
    setIsLyricsOpen,
    isQueueOpen,
    setIsQueueOpen,
    queue,
    playerError,
    setPlayerError,
    bluetoothDevice,
    scanBluetoothDevice
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const liked = isLiked(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE FLOATING MINI-PLAYER (Matching Screen 3 of image) */}
      {/* ========================================================= */}
      <div
        onClick={onOpenNowPlayingModal}
        className="md:hidden fixed bottom-[60px] left-2 right-2 z-25 bg-[#181818] border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xl cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
          {/* Green square artwork badge */}
          <div className="w-10 h-10 rounded-lg bg-[#1ed760] overflow-hidden shrink-0 shadow">
            <img
              src={currentSong.thumbnailUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentSong.youtubeId}/hqdefault.jpg`;
              }}
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#b3b3b3] truncate">{currentSong.artist}</p>
            {bluetoothDevice.isConnected && bluetoothDevice.name && (
              <p className="text-[10px] text-[#1ed760] font-semibold truncate flex items-center gap-1">
                <Bluetooth className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                <span className="truncate">{bluetoothDevice.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right controls: Devices icon & Play/Pause button */}
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => scanBluetoothDevice()}
            className={`p-1 transition-colors ${
              bluetoothDevice.isConnected ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={
              bluetoothDevice.isConnected
                ? `Connected: ${bluetoothDevice.name}`
                : 'Connect Bluetooth Device'
            }
          >
            <Bluetooth className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayPause}
            className="text-white hover:scale-105 active:scale-95 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white" />
            )}
          </button>
        </div>

        {/* Mini progress line at bottom of mobile card */}
        <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP PERSISTENT PLAYER BAR */}
      {/* ========================================================= */}
      <footer className="hidden md:block fixed bottom-0 left-0 right-0 z-30 bg-[#121212] border-t border-[#282828] text-white select-none shadow-2xl">
        {/* Error Notification Banner */}
        {playerError && (
          <div className="bg-[#2a1a1a] border-b border-rose-500/30 px-6 py-2 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{playerError}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={playNext}
                className="px-2.5 py-1 bg-[#1ed760] text-black font-bold rounded flex items-center gap-1 hover:brightness-110"
              >
                <span>Skip Track</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPlayerError(null)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="h-20 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Track Info & Fullscreen trigger */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[280px]">
            <div
              onClick={onOpenNowPlayingModal}
              className="relative group shrink-0 cursor-pointer"
              title="Expand Now Playing view"
            >
              <img
                src={currentSong.thumbnailUrl}
                alt={currentSong.title}
                className="w-14 h-14 rounded-md object-cover shadow-md bg-[#242424]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentSong.youtubeId}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="overflow-hidden min-w-0 flex-1">
              <div
                onClick={onOpenNowPlayingModal}
                className="font-bold text-sm text-white truncate hover:underline cursor-pointer"
              >
                {currentSong.title}
              </div>
              <div className="text-xs text-[#b3b3b3] truncate hover:text-white cursor-pointer hover:underline">
                {currentSong.artist}
              </div>
              {bluetoothDevice.isConnected && bluetoothDevice.name && (
                <div className="flex items-center gap-1 text-[10px] text-[#1ed760] font-semibold truncate mt-0.5">
                  <Bluetooth className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                  <span className="truncate">{bluetoothDevice.name}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => toggleLike(currentSong.id)}
              className={`p-1.5 rounded-full transition-colors shrink-0 ${
                liked ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={liked ? 'Saved in Liked Songs' : 'Save to Your Library'}
            >
              {liked ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-xl">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleShuffle}
                className={`transition-colors relative ${
                  isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
                {isShuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full" />}
              </button>

              <button
                onClick={playPrev}
                className="text-[#b3b3b3] hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-md transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black text-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                className="text-[#b3b3b3] hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={cycleRepeat}
                className={`transition-colors relative ${
                  repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                {repeatMode !== 'off' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full" />}
              </button>
            </div>

            {/* Scrubber bar */}
            <div className="w-full flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-mono text-[#b3b3b3] w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="relative group flex-1 h-3 flex items-center cursor-pointer">
                <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white group-hover:bg-[#1ed760] transition-colors rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime || 0}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[11px] font-mono text-[#b3b3b3] w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Auxiliary Actions */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[170px]">
            <button
              onClick={onOpenNowPlayingModal}
              className="p-1.5 text-[#b3b3b3] hover:text-white hover:scale-105 transition-all"
              title="Open Now Playing Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => scanBluetoothDevice()}
              className={`p-1.5 transition-colors relative ${
                bluetoothDevice.isConnected
                  ? 'text-[#1ed760] hover:scale-105'
                  : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={
                bluetoothDevice.isConnected
                  ? `Connected Device: ${bluetoothDevice.name} (${bluetoothDevice.type})`
                  : 'Connect Bluetooth Device'
              }
            >
              <Bluetooth className="w-4 h-4" />
              {bluetoothDevice.isConnected && (
                <span className="absolute 0 -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setIsLyricsOpen(!isLyricsOpen)}
              className={`p-1.5 transition-colors ${
                isLyricsOpen ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Lyrics"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-1.5 transition-colors relative ${
                isQueueOpen ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#1ed760]" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={toggleMute}
                className="text-[#b3b3b3] hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-20 h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
