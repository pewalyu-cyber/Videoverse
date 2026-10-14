import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song, Playlist, RepeatMode, UserStats, ThemeMode, PlayHistoryItem } from '../types/music';
import { DEFAULT_SONGS, DEFAULT_PLAYLISTS } from '../data/defaultCatalog';
import {
  subscribeToSongs,
  getLocalPlaylists,
  saveLocalPlaylists,
  getLocalLikedSongs,
  saveLocalLikedSongs,
  addSongToDatabase,
  updateSongInDatabase,
  deleteSongFromDatabase
} from '../services/firebase';
import { youtubeService } from '../services/youtube';
import { useAuth } from './AuthContext';
import { offlineStorage } from '../services/offlineStorage';
import { bluetoothService, BluetoothDeviceState } from '../services/bluetoothService';
import { equalizerService, EqualizerConfig } from '../services/equalizerService';

interface PlayerContextType {
  songs: Song[];
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playSong: (song: Song, contextQueue?: Song[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  // Sleep timer
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  // Likes & Playlists
  likedSongIds: string[];
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string, coverColor?: string) => Playlist;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  // Admin song actions
  addNewSong: (song: Omit<Song, 'id'>) => Promise<Song>;
  editSong: (id: string, updates: Partial<Song>) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  // User Stats
  stats: UserStats;
  // View & UI Navigation
  currentView: string;
  setCurrentView: (v: string) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  selectedArtist: string | null;
  setSelectedArtist: (artist: string | null) => void;
  isLyricsOpen: boolean;
  setIsLyricsOpen: (val: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (val: boolean) => void;
  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: (val: boolean) => void;
  isVideoExpanded: boolean;
  setIsVideoExpanded: (val: boolean) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeGenre: string;
  setActiveGenre: (g: string) => void;
  playerError: string | null;
  setPlayerError: (msg: string | null) => void;
  // Cloud sync & data saving
  syncNow: () => Promise<void>;
  isDataSaving: boolean;
  lastSyncedAt: number | null;
  // Offline & Downloads
  downloadedSongIds: string[];
  isSongDownloaded: (songId: string) => boolean;
  downloadSong: (song: Song) => Promise<void>;
  removeDownloadedSong: (songId: string) => Promise<void>;
  downloadPlaylist: (songs: Song[]) => Promise<void>;
  isDownloadingPlaylist: boolean;
  downloadProgressText: string | null;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  // Bluetooth & Devices
  bluetoothDevice: BluetoothDeviceState;
  scanBluetoothDevice: () => Promise<BluetoothDeviceState>;
  disconnectBluetoothDevice: () => void;
  connectPresetBluetooth: (name: string, type: BluetoothDeviceState['type']) => void;
  // Equalizer
  equalizerConfig: EqualizerConfig;
  setEqualizerEnabled: (enabled: boolean) => void;
  setEqualizerPreset: (preset: string) => void;
  setEqualizerBandGain: (index: number, gain: number) => void;
  resetEqualizer: () => void;
}

const STATS_STORAGE_KEY = 'videoverse_user_stats';
const THEME_STORAGE_KEY = 'videoverse_theme_mode';

const initialStats: UserStats = {
  totalPlaybackStarts: 0,
  playHistory: [],
  songPlayCounts: {},
  genrePlayCounts: {},
  artistPlayCounts: {}
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn, saveDataToServer, isSyncing, lastSyncedAt } = useAuth();
  const userPrevUidRef = useRef<string | null>(null);

  const [songs, setSongs] = useState<Song[]>(DEFAULT_SONGS);
  const [currentSong, setCurrentSong] = useState<Song | null>(DEFAULT_SONGS[0] || null);
  const [queue, setQueue] = useState<Song[]>(DEFAULT_SONGS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DEFAULT_SONGS[0]?.duration || 180);
  const [volume, setVolumeState] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Sleep timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const sleepTimerRef = useRef<any>(null);

  // Playlists and Likes
  const [likedSongIds, setLikedSongIds] = useState<string[]>(() => getLocalLikedSongs());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getLocalPlaylists(DEFAULT_PLAYLISTS));

  // Stats
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialStats;
  });

  // UI state
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    return saved || 'dark';
  });

  // Offline & Downloads state
  const [downloadedSongIds, setDownloadedSongIds] = useState<string[]>(() => offlineStorage.getDownloadedSongIds());
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => offlineStorage.isOfflineMode());
  const [isDownloadingPlaylist, setIsDownloadingPlaylist] = useState<boolean>(false);
  const [downloadProgressText, setDownloadProgressText] = useState<string | null>(null);

  // Bluetooth & Devices state
  const [bluetoothDevice, setBluetoothDeviceState] = useState<BluetoothDeviceState>(() => bluetoothService.getActiveDevice());

  useEffect(() => {
    const unsubBt = bluetoothService.subscribe((dev) => setBluetoothDeviceState(dev));
    return unsubBt;
  }, []);

  // Equalizer state
  const [equalizerConfig, setEqualizerConfigState] = useState<EqualizerConfig>(() => equalizerService.getConfig());

  useEffect(() => {
    const unsubEq = equalizerService.subscribe((cfg) => setEqualizerConfigState(cfg));
    return unsubEq;
  }, []);

  // Offline methods
  const isSongDownloaded = (songId: string) => downloadedSongIds.includes(songId);

  const downloadSong = async (song: Song) => {
    await offlineStorage.downloadSong(song);
    setDownloadedSongIds(offlineStorage.getDownloadedSongIds());
  };

  const removeDownloadedSong = async (songId: string) => {
    await offlineStorage.removeSong(songId);
    setDownloadedSongIds(offlineStorage.getDownloadedSongIds());
  };

  const downloadPlaylist = async (playlistSongs: Song[]) => {
    if (playlistSongs.length === 0) return;
    setIsDownloadingPlaylist(true);
    for (let i = 0; i < playlistSongs.length; i++) {
      const s = playlistSongs[i];
      setDownloadProgressText(`Downloading ${i + 1} of ${playlistSongs.length}: "${s.title}"...`);
      await offlineStorage.downloadSong(s);
      await new Promise((r) => setTimeout(r, 150));
    }
    setDownloadedSongIds(offlineStorage.getDownloadedSongIds());
    setDownloadProgressText(null);
    setIsDownloadingPlaylist(false);
  };

  const toggleOfflineMode = () => {
    const next = !isOfflineMode;
    setIsOfflineMode(next);
    offlineStorage.setOfflineMode(next);
  };

  // Bluetooth methods
  const scanBluetoothDevice = async () => {
    return await bluetoothService.scanAndConnectBluetooth();
  };

  const disconnectBluetoothDevice = () => {
    bluetoothService.disconnect();
  };

  const connectPresetBluetooth = (name: string, type: BluetoothDeviceState['type']) => {
    bluetoothService.connectPreset(name, type);
  };

  // Equalizer methods
  const setEqualizerEnabled = (enabled: boolean) => {
    equalizerService.setEnabled(enabled);
  };

  const setEqualizerPreset = (preset: string) => {
    equalizerService.setPreset(preset);
  };

  const setEqualizerBandGain = (index: number, gain: number) => {
    equalizerService.setBandGain(index, gain);
  };

  const resetEqualizer = () => {
    equalizerService.resetToFlat();
  };

  // Refs for callbacks inside YouTube listener
  const currentSongRef = useRef(currentSong);
  currentSongRef.current = currentSong;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const isShuffleRef = useRef(isShuffle);
  isShuffleRef.current = isShuffle;

  // Sync theme to root class
  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
    document.documentElement.classList.remove('theme-dark', 'theme-amoled', 'theme-light');
    document.documentElement.classList.add(`theme-${t}`);
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  // Save stats when changed
  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  // Save likes
  useEffect(() => {
    saveLocalLikedSongs(likedSongIds);
  }, [likedSongIds]);

  // Save playlists locally
  useEffect(() => {
    saveLocalPlaylists(playlists);
  }, [playlists]);

  // When user logs in, load their saved music data from the server
  useEffect(() => {
    if (user && user.uid !== userPrevUidRef.current) {
      userPrevUidRef.current = user.uid;
      const token = localStorage.getItem('videoverse_auth_token');
      if (token && user.uid.startsWith('usr_')) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(res => {
            if (res.success && res.data) {
              if (Array.isArray(res.data.likedSongIds)) {
                setLikedSongIds(res.data.likedSongIds);
              }
              if (Array.isArray(res.data.playlists) && res.data.playlists.length > 0) {
                setPlaylists(res.data.playlists);
              }
              if (res.data.stats && typeof res.data.stats === 'object' && Object.keys(res.data.stats).length > 0) {
                setStats(res.data.stats);
              }
            }
          })
          .catch(err => console.warn('Could not load user data from cloud:', err));
      }
    } else if (!user) {
      userPrevUidRef.current = null;
    }
  }, [user]);

  // Debounced auto-save to server whenever liked songs, playlists, or stats change
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setTimeout(() => {
      saveDataToServer({
        likedSongIds,
        playlists,
        stats,
        playHistory: stats.playHistory
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [likedSongIds, playlists, stats, isLoggedIn, saveDataToServer]);

  const syncNow = async () => {
    if (!isLoggedIn) return;
    await saveDataToServer({
      likedSongIds,
      playlists,
      stats,
      playHistory: stats.playHistory
    });
  };

  // Subscribe to songs catalogue
  useEffect(() => {
    const unsubscribe = subscribeToSongs(
      DEFAULT_SONGS,
      (loadedSongs) => {
        if (loadedSongs && loadedSongs.length > 0) {
          setSongs(loadedSongs);
          // If no current song, set first
          if (!currentSongRef.current) {
            setCurrentSong(loadedSongs[0]);
            setQueue(loadedSongs);
          }
        }
      },
      (err) => {
        console.warn('Song catalogue subscription error:', err);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Track playback start in user statistics
  const recordPlaybackStart = (song: Song) => {
    setStats((prev) => {
      const historyItem: PlayHistoryItem = {
        id: `hist-${Date.now()}`,
        songId: song.id,
        title: song.title,
        artist: song.artist,
        thumbnailUrl: song.thumbnailUrl,
        timestamp: Date.now()
      };

      const newHistory = [historyItem, ...prev.playHistory.slice(0, 49)];
      const newSongCounts = {
        ...prev.songPlayCounts,
        [song.id]: (prev.songPlayCounts[song.id] || 0) + 1
      };
      const newGenreCounts = {
        ...prev.genrePlayCounts,
        [song.category]: (prev.genrePlayCounts[song.category] || 0) + 1
      };
      const newArtistCounts = {
        ...prev.artistPlayCounts,
        [song.artist]: (prev.artistPlayCounts[song.artist] || 0) + 1
      };

      return {
        totalPlaybackStarts: prev.totalPlaybackStarts + 1,
        playHistory: newHistory,
        songPlayCounts: newSongCounts,
        genrePlayCounts: newGenreCounts,
        artistPlayCounts: newArtistCounts
      };
    });
  };

  // Play a song
  const playSong = (song: Song, contextQueue?: Song[]) => {
    setPlayerError(null);
    setCurrentSong(song);
    if (contextQueue && contextQueue.length > 0) {
      setQueue(contextQueue);
    } else if (!queue.some(s => s.id === song.id)) {
      setQueue(prev => [song, ...prev]);
    }

    youtubeService.loadVideo(song.youtubeId, true);
    setIsPlaying(true);
    recordPlaybackStart(song);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      youtubeService.pause();
      setIsPlaying(false);
    } else {
      if (!currentSong && songs.length > 0) {
        playSong(songs[0]);
      } else {
        youtubeService.play();
        setIsPlaying(true);
      }
    }
  };

  const playNext = () => {
    const curSong = currentSongRef.current;
    const currentQueue = queueRef.current;
    if (!curSong || currentQueue.length === 0) return;

    if (repeatModeRef.current === 'one') {
      youtubeService.seekTo(0);
      youtubeService.play();
      setIsPlaying(true);
      return;
    }

    const currentIndex = currentQueue.findIndex(s => s.id === curSong.id);
    let nextIndex = currentIndex + 1;

    if (isShuffleRef.current && currentQueue.length > 1) {
      // Pick random different song
      let rand = Math.floor(Math.random() * currentQueue.length);
      if (rand === currentIndex) {
        rand = (rand + 1) % currentQueue.length;
      }
      nextIndex = rand;
    }

    if (nextIndex >= currentQueue.length) {
      if (repeatModeRef.current === 'all') {
        nextIndex = 0;
      } else {
        // End of queue
        setIsPlaying(false);
        youtubeService.pause();
        return;
      }
    }

    const nextSong = currentQueue[nextIndex];
    if (nextSong) {
      playSong(nextSong, currentQueue);
    }
  };

  const playPrev = () => {
    // If played more than 3 seconds, restart current track
    if (currentTime > 3) {
      youtubeService.seekTo(0);
      return;
    }

    const curSong = currentSongRef.current;
    const currentQueue = queueRef.current;
    if (!curSong || currentQueue.length === 0) return;

    const currentIndex = currentQueue.findIndex(s => s.id === curSong.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = currentQueue.length - 1;
    }
    const prevSong = currentQueue[prevIndex];
    if (prevSong) {
      playSong(prevSong, currentQueue);
    }
  };

  const seekTo = (seconds: number) => {
    youtubeService.seekTo(seconds);
    setCurrentTime(seconds);
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
      youtubeService.unMute();
    }
    youtubeService.setVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      youtubeService.unMute();
    } else {
      setIsMuted(true);
      youtubeService.mute();
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const playNextInQueue = (song: Song) => {
    if (!currentSong) {
      playSong(song);
      return;
    }
    const curIdx = queue.findIndex(s => s.id === currentSong.id);
    const updated = [...queue];
    updated.splice(curIdx + 1, 0, song);
    setQueue(updated);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
    } else {
      setQueue([]);
    }
  };

  // Sleep Timer countdown implementation
  const startSleepTimer = (minutes: number) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes * 60);

    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
          // Trigger sleep stop
          youtubeService.pause();
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerMinutes(null);
    setSleepTimerRemaining(null);
  };

  // Likes
  const toggleLike = (songId: string) => {
    setLikedSongIds(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const isLiked = (songId: string) => likedSongIds.includes(songId);

  // Playlists CRUD
  const createPlaylist = (name: string, description?: string, coverColor?: string): Playlist => {
    const colors = [
      'from-purple-600 to-indigo-900',
      'from-emerald-600 to-teal-900',
      'from-rose-600 to-red-950',
      'from-cyan-600 to-blue-900',
      'from-amber-600 to-orange-950',
      'from-fuchsia-600 to-pink-900'
    ];
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || 'My Playlist',
      description: description || 'User curated collection',
      songIds: [],
      coverColor: coverColor || colors[Math.floor(Math.random() * colors.length)],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    setPlaylists(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
    );
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(null);
      setCurrentView('library');
    }
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId && !p.songIds.includes(songId)) {
          return {
            ...p,
            songIds: [...p.songIds, songId],
            updatedAt: Date.now()
          };
        }
        return p;
      })
    );
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            songIds: p.songIds.filter(id => id !== songId),
            updatedAt: Date.now()
          };
        }
        return p;
      })
    );
  };

  // Admin catalogue operations
  const addNewSong = async (newSongData: Omit<Song, 'id'>): Promise<Song> => {
    const created = await addSongToDatabase(newSongData);
    setSongs(prev => [created, ...prev]);
    return created;
  };

  const editSong = async (id: string, updates: Partial<Song>) => {
    await updateSongInDatabase(id, updates);
    setSongs(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    if (currentSong?.id === id) {
      setCurrentSong(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const removeSong = async (id: string) => {
    await deleteSongFromDatabase(id);
    setSongs(prev => prev.filter(s => s.id !== id));
    setQueue(prev => prev.filter(s => s.id !== id));
    if (currentSong?.id === id) {
      playNext();
    }
  };

  // Initialize YouTube Iframe container and register state callbacks
  useEffect(() => {
    youtubeService.initPlayer('videoverse-yt-iframe', {
      onReady: () => {
        // Player is ready
        youtubeService.setVolume(volume);
      },
      onStateChange: (state: number) => {
        // State 0 = ENDED -> Automatic next-song playback!
        if (state === 0) {
          playNext();
        } else if (state === 1) {
          setIsPlaying(true);
          setPlayerError(null);
        } else if (state === 2) {
          setIsPlaying(false);
        }
      },
      onError: (errorCode: number) => {
        let errorMsg = 'An error occurred during video playback.';
        if (errorCode === 100) errorMsg = 'Video removed or marked as private.';
        if (errorCode === 101 || errorCode === 150) {
          errorMsg = 'Video playback is restricted by YouTube owner for embedded players.';
        }
        setPlayerError(errorMsg);
        setIsPlaying(false);
      },
      onTimeUpdate: (cur: number, dur: number) => {
        setCurrentTime(cur);
        if (dur > 0) setDuration(dur);
      }
    });

    return () => {
      // Do not destroy entirely on unmount if hot reloaded
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        songs,
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffle,
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        sleepTimerMinutes,
        sleepTimerRemaining,
        startSleepTimer,
        cancelSleepTimer,
        likedSongIds,
        toggleLike,
        isLiked,
        playlists,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        addNewSong,
        editSong,
        removeSong,
        stats,
        currentView,
        setCurrentView,
        selectedPlaylistId,
        setSelectedPlaylistId,
        selectedArtist,
        setSelectedArtist,
        isLyricsOpen,
        setIsLyricsOpen,
        isQueueOpen,
        setIsQueueOpen,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        isVideoExpanded,
        setIsVideoExpanded,
        theme,
        setTheme,
        searchQuery,
        setSearchQuery,
        activeGenre,
        setActiveGenre,
        playerError,
        setPlayerError,
        syncNow,
        isDataSaving: isSyncing,
        lastSyncedAt,
        downloadedSongIds,
        isSongDownloaded,
        downloadSong,
        removeDownloadedSong,
        downloadPlaylist,
        isDownloadingPlaylist,
        downloadProgressText,
        isOfflineMode,
        toggleOfflineMode,
        bluetoothDevice,
        scanBluetoothDevice,
        disconnectBluetoothDevice,
        connectPresetBluetooth,
        equalizerConfig,
        setEqualizerEnabled,
        setEqualizerPreset,
        setEqualizerBandGain,
        resetEqualizer
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
