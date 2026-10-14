export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnailUrl: string;
  category: string;
  album?: string;
  duration?: number; // duration in seconds
  lyrics?: LyricLine[] | string;
  featured?: boolean;
  plays?: number;
  addedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  coverColor?: string;
  coverImage?: string;
  createdAt: number;
  updatedAt: number;
  isPublic?: boolean;
  ownerId?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayHistoryItem {
  id: string;
  songId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  timestamp: number;
}

export interface UserStats {
  totalPlaybackStarts: number;
  playHistory: PlayHistoryItem[];
  songPlayCounts: Record<string, number>;
  genrePlayCounts: Record<string, number>;
  artistPlayCounts: Record<string, number>;
}

export type ThemeMode = 'dark' | 'amoled' | 'light';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'listener';
  photoURL?: string | null;
}
