import React from 'react';
import {
  Search,
  Clock,
  User as UserIcon,
  Settings,
  Flame,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenAuthModal: (mode?: 'login' | 'signup') => void;
  onOpenSettingsModal: () => void;
  onOpenSleepTimerModal: () => void;
  onOpenNowPlayingModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuthModal,
  onOpenSettingsModal,
  onOpenSleepTimerModal,
  onOpenNowPlayingModal
}) => {
  const {
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    sleepTimerRemaining,
    cancelSleepTimer
  } = usePlayer();

  const { user, isFirebaseConfigured, demoAdminEnabled } = useAuth();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && currentView !== 'search') {
      setCurrentView('search');
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#121212]/95 backdrop-blur-md flex items-center justify-between gap-4 z-20 shrink-0 border-b border-[#242424]">
      {/* Left: Navigation Chevrons + Search Input */}
      <div className="flex items-center gap-3 max-w-md w-full">
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors"
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="What do you want to play?"
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] border border-transparent focus:border-white rounded-full pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-[#b3b3b3] outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Now Playing Screen Quick Trigger */}
        <button
          onClick={onOpenNowPlayingModal}
          className="hidden md:flex px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-white text-xs font-bold items-center gap-1.5 transition-colors"
          title="Open Now Playing Canvas"
        >
          <span>Now Playing Canvas</span>
        </button>

        {/* Active Sleep Timer Pill */}
        {sleepTimerRemaining !== null && sleepTimerRemaining > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#183a24] border border-[#1ed760]/50 text-[#1ed760] text-xs font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(sleepTimerRemaining)}</span>
            <button
              onClick={cancelSleepTimer}
              title="Cancel sleep timer"
              className="p-0.5 hover:bg-[#1ed760]/20 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenSleepTimerModal}
            title="Set Sleep Timer"
            className="p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#242424] transition-colors hidden sm:block"
          >
            <Clock className="w-4 h-4" />
          </button>
        )}

        {/* Firebase Status Badge */}
        <button
          onClick={onOpenSettingsModal}
          title={isFirebaseConfigured ? 'Firebase Connected' : 'Firebase in Local/Sandbox mode'}
          className="p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#242424] transition-colors"
        >
          <Flame className={`w-4 h-4 ${isFirebaseConfigured ? 'text-[#1ed760] fill-[#1ed760]' : ''}`} />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettingsModal}
          title="Settings & Config"
          className="p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#242424] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Auth Section: Prominent Sign up & Log in buttons when logged out; Profile pill when logged in */}
        {user ? (
          <button
            onClick={() => onOpenAuthModal('login')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#242424] hover:bg-[#2e2e2e] active:scale-95 text-white transition-all border border-white/10"
            title={`${user.displayName || 'User'} - Music Data Saved & Synced`}
          >
            <div className="w-6 h-6 rounded-full bg-[#1ed760] text-black font-black text-xs flex items-center justify-center shrink-0">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-bold truncate max-w-[90px] hidden sm:inline">
              {user.displayName || 'Profile'}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse shrink-0" title="Data saved to cloud account" />
          </button>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="text-[#b3b3b3] hover:text-white font-bold text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 transition-colors cursor-pointer hidden xs:inline-block"
            >
              Sign up
            </button>
            <button
              onClick={() => onOpenAuthModal('login')}
              className="bg-white hover:bg-white/90 active:scale-95 text-black font-black text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5 sm:hidden" />
              <span>Log in</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
