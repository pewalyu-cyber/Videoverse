import React from 'react';
import { Home, Search, Library, Sparkles, PlusCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, setSelectedPlaylistId } = usePlayer();
  const { user, demoAdminEnabled } = useAuth();

  const isAdmin = user?.role === 'admin' || demoAdminEnabled;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121212]/98 backdrop-blur-xl border-t border-[#282828] z-30 flex items-center justify-around px-2"
    >
      {/* 1. Home */}
      <button
        onClick={() => {
          setSelectedPlaylistId(null);
          setCurrentView('home');
        }}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
          currentView === 'home' ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      {/* 2. Search */}
      <button
        onClick={() => {
          setSelectedPlaylistId(null);
          setCurrentView('search');
        }}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
          currentView === 'search' ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
        }`}
      >
        <Search className={`w-5 h-5 ${currentView === 'search' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight">Search</span>
      </button>

      {/* 3. Your Library */}
      <button
        onClick={() => {
          setSelectedPlaylistId(null);
          setCurrentView('library');
        }}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
          currentView === 'library' || currentView === 'playlist'
            ? 'text-white font-bold'
            : 'text-[#b3b3b3] hover:text-white'
        }`}
      >
        <Library className={`w-5 h-5 ${currentView === 'library' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight">Your Library</span>
      </button>

      {/* 4. Insights / Stats (Labeled as Insights or Premium matching the image) */}
      <button
        onClick={() => {
          setSelectedPlaylistId(null);
          setCurrentView('stats');
        }}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
          currentView === 'stats' ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${currentView === 'stats' ? 'stroke-[2.5] text-[#1ed760]' : ''}`} />
        <span className="text-[10px] tracking-tight">Insights</span>
      </button>

      {/* 5. Create / Admin */}
      <button
        onClick={() => {
          setSelectedPlaylistId(null);
          setCurrentView('admin');
        }}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 relative transition-colors ${
          currentView === 'admin' ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
        }`}
      >
        <PlusCircle className={`w-5 h-5 ${currentView === 'admin' ? 'stroke-[2.5] text-[#1ed760]' : ''}`} />
        <span className="text-[10px] tracking-tight">{isAdmin ? 'Admin' : 'Create'}</span>
        {isAdmin && <span className="absolute top-1 right-4 w-1.5 h-1.5 rounded-full bg-[#1ed760]" />}
      </button>
    </nav>
  );
};
