import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Sliders,
  Bluetooth,
  User,
  Volume2,
  HardDrive,
  PlayCircle,
  Headphones,
  Radio,
  Check,
  RotateCcw,
  LogOut,
  Sparkles,
  Cloud,
  Battery,
  Speaker,
  RefreshCw,
  Trash2,
  ArrowDownCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import {
  FREQUENCY_LABELS,
  EQUALIZER_PRESETS,
  equalizerService
} from '../services/equalizerService';
import { PRESET_BLUETOOTH_DEVICES, BluetoothDeviceState } from '../services/bluetoothService';
import { offlineStorage } from '../services/offlineStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstall?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenInstall,
  onOpenAuth
}) => {
  const {
    bluetoothDevice,
    scanBluetoothDevice,
    disconnectBluetoothDevice,
    connectPresetBluetooth,
    equalizerConfig,
    setEqualizerEnabled,
    setEqualizerPreset,
    setEqualizerBandGain,
    resetEqualizer,
    downloadedSongIds,
    isOfflineMode,
    toggleOfflineMode,
    theme,
    setTheme
  } = usePlayer();

  const { user, logout, isFirebaseConfigured } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [btScanError, setBtScanError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ count: number; formattedSize: string }>({
    count: downloadedSongIds.length,
    formattedSize: '0.0 MB'
  });

  // Spotify-style audio settings state
  const [streamingQuality, setStreamingQuality] = useState(() => {
    return localStorage.getItem('videoverse_stream_quality') || 'Very High (320 kbit/s)';
  });
  const [downloadQuality, setDownloadQuality] = useState(() => {
    return localStorage.getItem('videoverse_download_quality') || 'High';
  });
  const [autoAdjustQuality, setAutoAdjustQuality] = useState(() => {
    return localStorage.getItem('videoverse_auto_adjust_quality') !== 'false';
  });
  const [normalizeVolume, setNormalizeVolume] = useState(() => {
    return localStorage.getItem('videoverse_normalize_volume') !== 'false';
  });
  const [volumeLevel, setVolumeLevel] = useState<'quiet' | 'normal' | 'loud'>(() => {
    return (localStorage.getItem('videoverse_volume_level') as any) || 'normal';
  });
  const [crossfadeSeconds, setCrossfadeSeconds] = useState(() => {
    return parseInt(localStorage.getItem('videoverse_crossfade_sec') || '0', 10);
  });
  const [gaplessPlayback, setGaplessPlayback] = useState(() => {
    return localStorage.getItem('videoverse_gapless') !== 'false';
  });
  const [automix, setAutomix] = useState(() => {
    return localStorage.getItem('videoverse_automix') !== 'false';
  });
  const [monoAudio, setMonoAudio] = useState(() => {
    return localStorage.getItem('videoverse_mono_audio') === 'true';
  });
  const [autoplaySimilar, setAutoplaySimilar] = useState(() => {
    return localStorage.getItem('videoverse_autoplay_similar') !== 'false';
  });

  // Update storage stats
  useEffect(() => {
    if (isOpen) {
      offlineStorage.getStorageUsage().then((info) => {
        setStorageInfo({
          count: info.count,
          formattedSize: info.formattedSize
        });
      });
    }
  }, [isOpen, downloadedSongIds]);

  if (!isOpen) return null;

  const handlePairRealBluetooth = async () => {
    setIsScanningBt(true);
    setBtScanError(null);
    try {
      await scanBluetoothDevice();
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setBtScanError('Bluetooth connection failed or not supported in this browser window.');
      }
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleClearAllDownloads = async () => {
    if (window.confirm('Delete all downloaded tracks from offline storage?')) {
      await offlineStorage.clearAllDownloads();
      window.location.reload();
    }
  };

  const handleStreamingQualityChange = (val: string) => {
    setStreamingQuality(val);
    localStorage.setItem('videoverse_stream_quality', val);
  };

  const handleCrossfadeChange = (val: number) => {
    setCrossfadeSeconds(val);
    localStorage.setItem('videoverse_crossfade_sec', val.toString());
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'account', label: 'Account' },
    { id: 'bluetooth', label: 'Bluetooth & Devices' },
    { id: 'equalizer', label: 'Equalizer' },
    { id: 'audio_quality', label: 'Audio Quality' },
    { id: 'playback', label: 'Playback' },
    { id: 'storage', label: 'Storage & Offline' }
  ];

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // SVG frequency response curve calculation
  const curvePath = equalizerService.generateSvgCurvePath(380, 110);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-[#121212] border border-[#282828] rounded-2xl w-full max-w-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans">
        {/* Top Header matching Spotify Desktop & Web Settings */}
        <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between shrink-0 bg-[#121212]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Settings</h1>
            {isOfflineMode && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                Offline Mode Active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#181818] hover:bg-[#282828] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Navigation (Spotify style) */}
        <div className="px-6 py-3 border-b border-[#1e1e1e] bg-[#141414] shrink-0 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#a7a7a7] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in settings (Bluetooth, Equalizer, Quality, Account)..."
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white text-xs rounded-full pl-10 pr-9 py-2 border border-transparent focus:border-white/20 focus:outline-none transition-colors placeholder-[#727272]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a7a7a7] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#1f1f1f] text-[#b3b3b3] hover:text-white hover:bg-[#282828]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Settings Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
          {/* ========================================================
              1. ACCOUNT SECTION (Spotify style)
             ======================================================== */}
          {(activeCategory === 'all' || activeCategory === 'account') &&
            matchesSearch('Account Profile User Sign in Log in Sync') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1ed760]" />
                    <span>Account</span>
                  </h2>
                  <span className="text-xs text-[#a7a7a7]">
                    {user ? 'Cloud Database Synced' : 'Guest Mode'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#181818] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1ed760] to-[#121212] flex items-center justify-center text-black font-black text-lg border border-[#1ed760]/40 shrink-0">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">
                          {user?.displayName || 'Guest Listener'}
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-[#1ed760]/10 text-[#1ed760] text-[10px] font-bold border border-[#1ed760]/30">
                          {user ? 'VideoVerse Premium' : 'Free Account'}
                        </span>
                      </div>
                      <p className="text-xs text-[#a7a7a7]">{user?.email || 'No account logged in'}</p>
                      <p className="text-[11px] text-[#1ed760] flex items-center gap-1 mt-0.5">
                        <Cloud className="w-3 h-3" />
                        <span>
                          {user
                            ? 'All playlists, likes & history saved to your account'
                            : 'Log in to save playlists and likes across all devices'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user ? (
                      <button
                        onClick={logout}
                        className="px-4 py-2 rounded-full border border-[#404040] hover:border-white text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log out</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenAuth?.('signup');
                          }}
                          className="px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                        >
                          Sign up free
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenAuth?.('login');
                          }}
                          className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                        >
                          Log in
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}

          {/* ========================================================
              2. CONNECTED DEVICES & BLUETOOTH (Spotify Connect style)
             ======================================================== */}
          {(activeCategory === 'all' || activeCategory === 'bluetooth') &&
            matchesSearch('Bluetooth Connected Devices Speaker AirPods Headphones Audio Output') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Bluetooth className="w-4 h-4 text-[#1ed760]" />
                    <span>Connected Devices & Bluetooth</span>
                  </h2>
                  <span className="text-xs text-[#1ed760] font-semibold">
                    {bluetoothDevice.isConnected ? '1 Device Active' : 'No Bluetooth Device'}
                  </span>
                </div>

                {/* Main Connected Bluetooth Device Showcase Card */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-[#181818] to-[#1e1e1e] border border-[#282828] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          bluetoothDevice.isConnected
                            ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40'
                            : 'bg-[#242424] text-[#727272] border border-[#333]'
                        }`}
                      >
                        {bluetoothDevice.type === 'earbuds' ? (
                          <Headphones className="w-6 h-6" />
                        ) : bluetoothDevice.type === 'speaker' ? (
                          <Speaker className="w-6 h-6" />
                        ) : bluetoothDevice.type === 'car' ? (
                          <Radio className="w-6 h-6" />
                        ) : (
                          <Bluetooth className="w-6 h-6" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              bluetoothDevice.isConnected
                                ? 'bg-[#1ed760] animate-pulse'
                                : 'bg-[#727272]'
                            }`}
                          />
                          <p className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7]">
                            {bluetoothDevice.isConnected
                              ? 'Connected via Bluetooth (A2DP)'
                              : 'Audio Output: Computer / Web Speaker'}
                          </p>
                        </div>

                        {/* NAME OF BLUETOOTH DEVICE SHOWN BOLDLY */}
                        <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                          {bluetoothDevice.isConnected && bluetoothDevice.name
                            ? bluetoothDevice.name
                            : 'No Bluetooth Device Connected'}
                        </h3>

                        {bluetoothDevice.isConnected && (
                          <div className="flex items-center gap-3 text-xs text-[#a7a7a7] mt-1">
                            <span className="capitalize">{bluetoothDevice.type}</span>
                            {bluetoothDevice.batteryLevel !== null && (
                              <span className="flex items-center gap-1 text-[#1ed760]">
                                <Battery className="w-3.5 h-3.5" />
                                <span>{bluetoothDevice.batteryLevel}% battery</span>
                              </span>
                            )}
                            <span className="text-[11px] text-[#727272]">Low latency high-res audio</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connect / Disconnect Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {bluetoothDevice.isConnected ? (
                        <button
                          onClick={disconnectBluetoothDevice}
                          className="px-4 py-2 rounded-full border border-[#404040] hover:border-white text-white text-xs font-bold hover:bg-[#282828] transition-all"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={handlePairRealBluetooth}
                          disabled={isScanningBt}
                          className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-[#1ed760]/20"
                        >
                          <Bluetooth className="w-4 h-4" />
                          <span>{isScanningBt ? 'Scanning...' : 'Pair Bluetooth Device'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {btScanError && (
                    <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      {btScanError}
                    </p>
                  )}

                  {/* Preset / Quick Switch Audio Output Picker (Spotify Connect style) */}
                  <div className="pt-3 border-t border-[#282828] space-y-2">
                    <p className="text-xs font-bold text-[#b3b3b3]">
                      Quick Switch Audio Output / Bluetooth Preset:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_BLUETOOTH_DEVICES.map((p) => {
                        const isCurrent =
                          bluetoothDevice.isConnected && bluetoothDevice.name === p.name;
                        return (
                          <button
                            key={p.name}
                            onClick={() => connectPresetBluetooth(p.name, p.type)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                              isCurrent
                                ? 'bg-[#1ed760]/10 border-[#1ed760] text-white font-bold'
                                : 'bg-[#1f1f1f] border-transparent hover:border-[#383838] text-[#b3b3b3] hover:text-white'
                            }`}
                          >
                            <div className="overflow-hidden mr-2">
                              <p className="truncate">{p.name}</p>
                              <span className="text-[10px] text-[#727272] capitalize">{p.type}</span>
                            </div>
                            {isCurrent ? (
                              <Check className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                            ) : (
                              <Bluetooth className="w-3 h-3 text-[#555] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

          {/* ========================================================
              3. EQUALIZER SECTION (Spotify style)
             ======================================================== */}
          {(activeCategory === 'all' || activeCategory === 'equalizer') &&
            matchesSearch('Equalizer EQ Bass Treble Frequencies Sound Audio') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#1ed760]" />
                      <span>Equalizer</span>
                    </h2>
                    <p className="text-xs text-[#a7a7a7]">
                      Adjust audio frequencies to customize your acoustic sound profile
                    </p>
                  </div>

                  {/* Master Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={equalizerConfig.enabled}
                      onChange={(e) => setEqualizerEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                  </label>
                </div>

                <div
                  className={`p-5 rounded-xl bg-[#181818] border border-[#242424] space-y-5 transition-opacity ${
                    equalizerConfig.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'
                  }`}
                >
                  {/* Preset Selector Dropdown & Reset */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#b3b3b3]">Sound Preset:</span>
                      <select
                        value={equalizerConfig.preset}
                        onChange={(e) => setEqualizerPreset(e.target.value)}
                        className="bg-[#242424] hover:bg-[#2a2a2a] text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
                      >
                        {Object.keys(EQUALIZER_PRESETS).map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                        {equalizerConfig.preset === 'Custom' && (
                          <option value="Custom">Custom</option>
                        )}
                      </select>
                    </div>

                    <button
                      onClick={resetEqualizer}
                      className="text-xs text-[#a7a7a7] hover:text-white flex items-center gap-1 transition-colors"
                      title="Reset all bands to 0 dB"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Flat</span>
                    </button>
                  </div>

                  {/* Visual SVG Frequency Response Curve (Like Spotify mobile/desktop) */}
                  <div className="bg-[#121212] p-4 rounded-xl border border-[#282828] space-y-2">
                    <div className="flex justify-between text-[10px] text-[#727272] font-mono px-2">
                      <span>+12 dB</span>
                      <span>0 dB (Flat)</span>
                      <span>-12 dB</span>
                    </div>

                    <div className="relative w-full h-28 flex items-center justify-center overflow-hidden">
                      {/* Zero dB midline */}
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />

                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 380 110"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="eqGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#1ed760" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#1ed760" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Shaded area under curve */}
                        <path
                          d={`${curvePath} L 356 110 L 24 110 Z`}
                          fill="url(#eqGradient)"
                        />
                        {/* Curve stroke */}
                        <path
                          d={curvePath}
                          fill="none"
                          stroke="#1ed760"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* 6 Band Sliders with dB Readout */}
                    <div className="grid grid-cols-6 gap-2 pt-2">
                      {FREQUENCY_LABELS.map((label, idx) => {
                        const gain = equalizerConfig.bands[idx] || 0;
                        return (
                          <div key={label} className="flex flex-col items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-white">
                              {gain > 0 ? `+${gain}` : gain}dB
                            </span>
                            <div className="h-28 flex items-center justify-center">
                              <input
                                type="range"
                                min="-12"
                                max="12"
                                step="0.5"
                                value={gain}
                                onChange={(e) =>
                                  setEqualizerBandGain(idx, parseFloat(e.target.value))
                                }
                                className="w-24 h-1.5 -rotate-90 appearance-none bg-[#333] rounded-full accent-[#1ed760] cursor-pointer"
                              />
                            </div>
                            <span className="text-[10px] text-[#a7a7a7] font-semibold mt-1">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#727272]">
                    Tip: Double-click any slider or select presets like "Bass Booster" to boost low-end frequencies.
                  </p>
                </div>
              </section>
            )}

          {/* ========================================================
              4. AUDIO QUALITY (Spotify style)
             ======================================================== */}
          {(activeCategory === 'all' || activeCategory === 'audio_quality') &&
            matchesSearch('Audio Quality Streaming Normalize Volume High Res') && (
              <section className="space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#1ed760]" />
                  <span>Audio Quality</span>
                </h2>

                <div className="p-4 rounded-xl bg-[#181818] border border-[#242424] divide-y divide-[#242424] text-xs">
                  {/* Streaming quality */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Streaming quality</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Higher quality uses more bandwidth
                      </p>
                    </div>
                    <select
                      value={streamingQuality}
                      onChange={(e) => handleStreamingQualityChange(e.target.value)}
                      className="bg-[#242424] text-white px-3 py-1.5 rounded-lg border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
                    >
                      <option value="Automatic (Recommended)">Automatic (Recommended)</option>
                      <option value="Low (24 kbit/s)">Low (24 kbit/s)</option>
                      <option value="Normal (96 kbit/s)">Normal (96 kbit/s)</option>
                      <option value="High (160 kbit/s)">High (160 kbit/s)</option>
                      <option value="Very High (320 kbit/s)">Very High (320 kbit/s)</option>
                    </select>
                  </div>

                  {/* Auto adjust quality */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Auto adjust quality</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Adjusts stream when your internet connection slows down
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoAdjustQuality}
                        onChange={(e) => {
                          setAutoAdjustQuality(e.target.checked);
                          localStorage.setItem('videoverse_auto_adjust_quality', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                    </label>
                  </div>

                  {/* Normalize volume */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Normalize volume</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Set the same volume level for all songs
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={normalizeVolume}
                        onChange={(e) => {
                          setNormalizeVolume(e.target.checked);
                          localStorage.setItem('videoverse_normalize_volume', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                    </label>
                  </div>

                  {/* Volume Level */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Volume level</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Adjust the volume for your listening environment
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-lg border border-[#383838]">
                      {(['quiet', 'normal', 'loud'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => {
                            setVolumeLevel(lvl);
                            localStorage.setItem('videoverse_volume_level', lvl);
                          }}
                          className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                            volumeLevel === lvl
                              ? 'bg-[#1ed760] text-black font-bold'
                              : 'text-[#b3b3b3] hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

          {/* ========================================================
              5. PLAYBACK SECTION (Spotify style)
             ======================================================== */}
          {(activeCategory === 'all' || activeCategory === 'playback') &&
            matchesSearch('Playback Crossfade Gapless Automix Mono Autoplay') && (
              <section className="space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#1ed760]" />
                  <span>Playback</span>
                </h2>

                <div className="p-4 rounded-xl bg-[#181818] border border-[#242424] divide-y divide-[#242424] text-xs">
                  {/* Crossfade songs */}
                  <div className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Crossfade songs</p>
                        <p className="text-[#a7a7a7] text-[11px]">
                          Allows smooth transition between songs
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#1ed760]">
                        {crossfadeSeconds === 0 ? 'Off' : `${crossfadeSeconds}s`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={crossfadeSeconds}
                      onChange={(e) => handleCrossfadeChange(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 appearance-none bg-[#333] rounded-full accent-[#1ed760] cursor-pointer"
                    />
                  </div>

                  {/* Gapless playback */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Gapless playback</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Eliminates silent pauses between continuous tracks
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gaplessPlayback}
                        onChange={(e) => {
                          setGaplessPlayback(e.target.checked);
                          localStorage.setItem('videoverse_gapless', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                    </label>
                  </div>

                  {/* Automix */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Automix</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Allows seamless blends between songs on select playlists
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automix}
                        onChange={(e) => {
                          setAutomix(e.target.checked);
                          localStorage.setItem('videoverse_automix', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                    </label>
                  </div>

                  {/* Mono audio */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Mono audio</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Plays the same audio out of both speakers/earbuds
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={monoAudio}
                        onChange={(e) => {
                          setMonoAudio(e.target.checked);
                          localStorage.setItem('videoverse_mono_audio', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                    </label>
                  </div>

                  {/* Autoplay similar content */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Autoplay similar songs</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Keep listening to similar music when your queue finishes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoplaySimilar}
                        onChange={(e) => {
                          setAutoplaySimilar(e.target.checked);
                          localStorage.setItem('videoverse_autoplay_similar', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                    </label>
                  </div>
                </div>
              </section>
            )}

          {/* ========================================================
              6. STORAGE & OFFLINE DOWNLOADS (Spotify style)
             ======================================================== */}
          {(activeCategory === 'all' || activeCategory === 'storage') &&
            matchesSearch('Storage Downloads Offline Cache Clear Device') && (
              <section className="space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#1ed760]" />
                  <span>Storage & Offline Downloads</span>
                </h2>

                <div className="p-4 rounded-xl bg-[#181818] border border-[#242424] divide-y divide-[#242424] text-xs">
                  {/* Offline Mode Switch */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">Offline Mode</p>
                        {isOfflineMode && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[#a7a7a7] text-[11px]">
                        When enabled, only downloaded tracks can be played
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOfflineMode}
                        onChange={toggleOfflineMode}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]" />
                    </label>
                  </div>

                  {/* Storage breakdown */}
                  <div className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">Downloaded Music Storage</p>
                      <span className="font-mono text-xs text-[#1ed760] font-bold">
                        {storageInfo.count} songs &bull; {storageInfo.formattedSize}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#282828] rounded-full overflow-hidden flex">
                      <div
                        className="bg-[#1ed760] h-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, storageInfo.count * 8))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#727272]">
                      Songs are cached locally in your browser storage for high-speed offline listening.
                    </p>
                  </div>

                  {/* Download quality */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Download quality</p>
                      <p className="text-[#a7a7a7] text-[11px]">Quality for offline downloaded tracks</p>
                    </div>
                    <select
                      value={downloadQuality}
                      onChange={(e) => {
                        setDownloadQuality(e.target.value);
                        localStorage.setItem('videoverse_download_quality', e.target.value);
                      }}
                      className="bg-[#242424] text-white px-3 py-1.5 rounded-lg border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High (Recommended)</option>
                      <option value="Very High">Very High (Highest Bitrate)</option>
                    </select>
                  </div>

                  {/* Clear Downloads Button */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Remove all downloads</p>
                      <p className="text-[#a7a7a7] text-[11px]">
                        Free up device storage by deleting all offline songs
                      </p>
                    </div>
                    <button
                      onClick={handleClearAllDownloads}
                      className="px-4 py-2 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear downloads</span>
                    </button>
                  </div>
                </div>
              </section>
            )}
        </div>

        {/* Spotify Bottom Bar */}
        <div className="px-6 py-3 border-t border-[#242424] bg-[#121212] flex items-center justify-between text-xs text-[#727272] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1ed760]" />
            <span>VideoVerse Spotify Engine v2.4</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-white text-black font-bold hover:scale-105 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
