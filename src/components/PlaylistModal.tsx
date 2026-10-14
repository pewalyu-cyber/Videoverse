import React, { useState } from 'react';
import { X, FolderPlus, Check, Plus, Music } from 'lucide-react';
import { Song, Playlist } from '../types/music';
import { usePlayer } from '../context/PlayerContext';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'add-song';
  targetSong?: Song | null;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetSong
}) => {
  const { playlists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist } = usePlayer();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('from-violet-600 to-indigo-900');

  if (!isOpen) return null;

  const colorOptions = [
    { label: 'Violet Indigo', value: 'from-violet-600 to-indigo-900', bg: 'bg-gradient-to-r from-violet-600 to-indigo-900' },
    { label: 'Emerald Teal', value: 'from-emerald-600 to-teal-900', bg: 'bg-gradient-to-r from-emerald-600 to-teal-900' },
    { label: 'Rose Wine', value: 'from-rose-600 to-red-950', bg: 'bg-gradient-to-r from-rose-600 to-red-950' },
    { label: 'Cyan Blue', value: 'from-cyan-600 to-blue-900', bg: 'bg-gradient-to-r from-cyan-600 to-blue-900' },
    { label: 'Amber Orange', value: 'from-amber-600 to-orange-950', bg: 'bg-gradient-to-r from-amber-600 to-orange-950' }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newPl = createPlaylist(name.trim(), description.trim(), selectedColor);
    if (targetSong) {
      addSongToPlaylist(newPl.id, targetSong.id);
    }
    setName('');
    setDescription('');
    onClose();
  };

  const handleToggleSongInPlaylist = (pl: Playlist) => {
    if (!targetSong) return;
    const exists = pl.songIds.includes(targetSong.id);
    if (exists) {
      removeSongFromPlaylist(pl.id, targetSong.id);
    } else {
      addSongToPlaylist(pl.id, targetSong.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'create' ? 'Create New Playlist' : 'Add to Playlist'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'create'
                ? 'Organize your favorite music into custom mixes'
                : `Select playlists for "${targetSong?.title}"`}
            </p>
          </div>
        </div>

        {mode === 'add-song' && (
          <div className="mb-6 space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {playlists.map((pl) => {
              const hasSong = targetSong && pl.songIds.includes(targetSong.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggleSongInPlaylist(pl)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    hasSong
                      ? 'bg-violet-950/40 border-violet-500/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                        pl.coverColor || 'from-violet-600 to-indigo-900'
                      } flex items-center justify-center text-white shrink-0`}
                    >
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate">{pl.name}</p>
                      <p className="text-[11px] text-slate-400">{pl.songIds.length} tracks</p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                      hasSong
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create playlist form */}
        <form onSubmit={handleCreate} className="space-y-4">
          {mode === 'add-song' && (
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-800">
              Or Create New
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Playlist Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Late Night Cyber Drive"
              required={mode === 'create'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vibes and notes..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Cover Gradient Theme</label>
            <div className="flex gap-2">
              {colorOptions.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center transition-all ${
                    selectedColor === c.value ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {selectedColor === c.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mode === 'create' && !name.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:brightness-110 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{mode === 'create' ? 'Create Playlist' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
