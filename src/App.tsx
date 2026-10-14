/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomPlayer } from './components/BottomPlayer';
import { YouTubeVideoDock } from './components/YouTubeVideoDock';
import { LyricsDrawer } from './components/LyricsDrawer';
import { QueueDrawer } from './components/QueueDrawer';
import { SleepTimerModal } from './components/SleepTimerModal';
import { PlaylistModal } from './components/PlaylistModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { MobileNav } from './components/MobileNav';
import { NowPlayingFullModal } from './components/NowPlayingFullModal';
import { PhoneMockupViewer } from './components/PhoneMockupViewer';

// Views
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { StatsView } from './components/StatsView';
import { AdminDashboard } from './components/AdminDashboard';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { ArtistDetailView } from './views/ArtistDetailView';
import { Song } from './types/music';

const MainAppContent: React.FC = () => {
  const { currentView } = usePlayer();

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlistModalMode, setPlaylistModalMode] = useState<'create' | 'add-song'>('create');
  const [playlistTargetSong, setPlaylistTargetSong] = useState<Song | null>(null);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isPhoneMockupMode, setIsPhoneMockupMode] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenCreatePlaylist = () => {
    setPlaylistModalMode('create');
    setPlaylistTargetSong(null);
    setIsPlaylistModalOpen(true);
  };

  const handleOpenAddToPlaylist = (song: Song) => {
    setPlaylistModalMode('add-song');
    setPlaylistTargetSong(song);
    setIsPlaylistModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-[#1ed760] selection:text-black">
      {/* Desktop Navigation Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar
          onOpenCreatePlaylist={handleOpenCreatePlaylist}
          onOpenInstallModal={() => setIsInstallOpen(true)}
          onOpenAuthModal={handleOpenAuth}
        />
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#121212] md:my-2 md:mr-2 md:rounded-xl border border-transparent md:border-[#242424]">
        {/* Top Header */}
        <Header
          onOpenAuthModal={handleOpenAuth}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
          onOpenSleepTimerModal={() => setIsSleepTimerOpen(true)}
          onOpenNowPlayingModal={() => setIsNowPlayingOpen(true)}
          isPhoneMockupMode={isPhoneMockupMode}
          onTogglePhoneMockupMode={() => setIsPhoneMockupMode(!isPhoneMockupMode)}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar pb-36 md:pb-28">
          {currentView === 'home' && (
            <HomeView
              onOpenAddToPlaylist={handleOpenAddToPlaylist}
              onOpenCreatePlaylist={handleOpenCreatePlaylist}
            />
          )}

          {currentView === 'search' && (
            <SearchView onOpenAddToPlaylist={handleOpenAddToPlaylist} />
          )}

          {currentView === 'library' && (
            <LibraryView
              onOpenCreatePlaylist={handleOpenCreatePlaylist}
              onOpenAddToPlaylist={handleOpenAddToPlaylist}
            />
          )}

          {currentView === 'stats' && <StatsView />}

          {currentView === 'admin' && <AdminDashboard />}

          {currentView === 'playlist' && (
            <PlaylistDetailView onOpenAddToPlaylist={handleOpenAddToPlaylist} />
          )}

          {currentView === 'artist' && (
            <ArtistDetailView onOpenAddToPlaylist={handleOpenAddToPlaylist} />
          )}
        </main>

        {/* Mobile Compact Navigation Bar (Screen 3 style) */}
        <MobileNav />

        {/* Persistent Bottom Playback Bar */}
        <BottomPlayer
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          onOpenNowPlayingModal={() => setIsNowPlayingOpen(true)}
        />
      </div>

      {/* Full-Screen Now Playing Mobile Screen (Screen 1 & Screen 2) */}
      <NowPlayingFullModal
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
      />

      {/* Phone Mockup Frame Showcase (Matching user reference image) */}
      {isPhoneMockupMode && (
        <PhoneMockupViewer onClose={() => setIsPhoneMockupMode(false)} />
      )}

      {/* Persistent Visible YouTube Player Dock */}
      <YouTubeVideoDock />

      {/* Real-time Synced Lyrics Drawer */}
      <LyricsDrawer />

      {/* Playback Queue Drawer */}
      <QueueDrawer />

      {/* Modals & Dialogs */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
      />

      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        mode={playlistModalMode}
        targetSong={playlistTargetSong}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        initialMode={authModalMode}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      <PWAInstallBanner
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MainAppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}
