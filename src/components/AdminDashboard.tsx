import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCode,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Server
} from 'lucide-react';
import { Song } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { GENRES } from '../data/defaultCatalog';

export const AdminDashboard: React.FC = () => {
  const { songs, addNewSong, editSong, removeSong, playSong } = usePlayer();
  const { user } = useAuth();

  // Server-side 2-Password Authentication state
  const [isServerVerified, setIsServerVerified] = useState<boolean>(() => {
    return !!sessionStorage.getItem('vv_admin_server_token');
  });
  const [inputPass1, setInputPass1] = useState('');
  const [inputPass2, setInputPass2] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [showRulesGuide, setShowRulesGuide] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    youtubeId: '',
    thumbnailUrl: '',
    category: 'Synthwave',
    album: '',
    duration: 180,
    lyrics: ''
  });

  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Server 2-Password verification handler
  const handleVerifyServerPasswords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPass1 || !inputPass2) {
      setVerifyError('Both Password 1 and Password 2 are required.');
      return;
    }

    setVerifyLoading(true);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password1: inputPass1,
          password2: inputPass2
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('vv_admin_server_token', data.token || 'verified');
        setVerifySuccess('Both passwords verified by server! Entering Admin Room...');
        setTimeout(() => {
          setIsServerVerified(true);
        }, 600);
      } else {
        setVerifyError(data.error || 'Server rejected credentials. Both passwords must be correct.');
      }
    } catch (err: any) {
      setVerifyError('Connection error: ' + (err.message || 'Failed to reach /api/admin/verify'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleLockAdminRoom = () => {
    sessionStorage.removeItem('vv_admin_server_token');
    setIsServerVerified(false);
    setInputPass1('');
    setInputPass2('');
  };

  const filteredSongs = songs.filter((s) => {
    const matchQuery =
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.youtubeId.toLowerCase().includes(searchFilter.toLowerCase());
    const matchGenre = selectedGenre === 'All' || s.category === selectedGenre;
    return matchQuery && matchGenre;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      youtubeId: '',
      thumbnailUrl: '',
      category: 'Synthwave',
      album: '',
      duration: 180,
      lyrics: ''
    });
    setFormStatus(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (song: Song) => {
    let lyricsStr = '';
    if (typeof song.lyrics === 'string') {
      lyricsStr = song.lyrics;
    } else if (Array.isArray(song.lyrics)) {
      lyricsStr = song.lyrics.map(l => `[${l.time}] ${l.text}`).join('\n');
    }

    setFormData({
      title: song.title,
      artist: song.artist,
      youtubeId: song.youtubeId,
      thumbnailUrl: song.thumbnailUrl,
      category: song.category,
      album: song.album || '',
      duration: song.duration || 180,
      lyrics: lyricsStr
    });
    setEditingSong(song);
    setFormStatus(null);
  };

  const handleYoutubeIdChange = (id: string) => {
    const cleanId = id.trim();
    let parsedId = cleanId;
    if (cleanId.includes('v=')) {
      const match = cleanId.match(/v=([a-zA-Z0-9_-]+)/);
      if (match) parsedId = match[1];
    } else if (cleanId.includes('youtu.be/')) {
      const match = cleanId.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) parsedId = match[1];
    }

    setFormData(prev => ({
      ...prev,
      youtubeId: parsedId,
      thumbnailUrl: prev.thumbnailUrl || `https://img.youtube.com/vi/${parsedId}/hqdefault.jpg`
    }));
  };

  const parseLyrics = (text: string) => {
    if (!text.trim()) return undefined;
    const lines = text.split('\n');
    const timestamped: { time: number; text: string }[] = [];
    const timestampRegex = /^\[(\d+)(?::(\d+))?\]\s*(.*)$/;

    let hasTimestamp = false;
    for (const line of lines) {
      const match = line.match(timestampRegex);
      if (match) {
        hasTimestamp = true;
        const minutes = parseInt(match[1], 10);
        const seconds = match[2] ? parseInt(match[2], 10) : 0;
        const totalSecs = match[2] ? minutes * 60 + seconds : minutes;
        timestamped.push({ time: totalSecs, text: match[3] });
      }
    }

    if (hasTimestamp) return timestamped;
    return text.trim();
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.artist.trim() || !formData.youtubeId.trim()) {
      setFormStatus({ type: 'error', message: 'Title, artist, and YouTube ID are required fields.' });
      return;
    }

    setIsSubmitting(true);
    setFormStatus(null);

    try {
      const parsedLyrics = parseLyrics(formData.lyrics);
      const thumbnail = formData.thumbnailUrl.trim() || `https://img.youtube.com/vi/${formData.youtubeId}/hqdefault.jpg`;

      if (editingSong) {
        await editSong(editingSong.id, {
          title: formData.title.trim(),
          artist: formData.artist.trim(),
          youtubeId: formData.youtubeId.trim(),
          thumbnailUrl: thumbnail,
          category: formData.category,
          album: formData.album.trim() || undefined,
          duration: Number(formData.duration) || 180,
          lyrics: parsedLyrics
        });
        setFormStatus({ type: 'success', message: 'Song updated successfully in catalogue!' });
        setTimeout(() => setEditingSong(null), 1200);
      } else {
        await addNewSong({
          title: formData.title.trim(),
          artist: formData.artist.trim(),
          youtubeId: formData.youtubeId.trim(),
          thumbnailUrl: thumbnail,
          category: formData.category,
          album: formData.album.trim() || undefined,
          duration: Number(formData.duration) || 180,
          lyrics: parsedLyrics,
          plays: 0
        });
        setFormStatus({ type: 'success', message: 'Song published to catalogue successfully!' });
        setTimeout(() => setIsAddOpen(false), 1200);
      }
    } catch (err: any) {
      setFormStatus({ type: 'error', message: err.message || 'Failed to save song.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSong) return;
    setIsSubmitting(true);
    try {
      await removeSong(deletingSong.id);
      setDeletingSong(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 1. DUAL PASSWORD SERVER SECURITY GATE (If user hasn't verified both passwords)
  // =========================================================================
  if (!isServerVerified) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
        <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="w-16 h-16 rounded-2xl bg-[#1ed760]/10 border border-[#1ed760]/30 flex items-center justify-center text-[#1ed760] mx-auto mb-4 shadow-lg shadow-[#1ed760]/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Room Gate</h1>
            <p className="text-xs text-[#b3b3b3] leading-relaxed">
              Server-side security verification. You must enter <strong>both passwords</strong> correctly to enter the Admin Room.
            </p>
          </div>

          {verifyError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{verifyError}</span>
            </div>
          )}

          {verifySuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/60 border border-[#1ed760]/40 text-xs text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0" />
              <span>{verifySuccess}</span>
            </div>
          )}

          <form onSubmit={handleVerifyServerPasswords} className="space-y-4">
            {/* Password 1 Field */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Password 1: Primary Admin Key</span>
              </label>
              <div className="relative">
                <input
                  type={showPass1 ? 'text' : 'password'}
                  required
                  value={inputPass1}
                  onChange={(e) => setInputPass1(e.target.value)}
                  placeholder="Enter Password 1"
                  className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-4 py-3 text-sm text-white outline-none font-mono transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass1(!showPass1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white"
                >
                  {showPass1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password 2 Field */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Password 2: Master Security Code</span>
              </label>
              <div className="relative">
                <input
                  type={showPass2 ? 'text' : 'password'}
                  required
                  value={inputPass2}
                  onChange={(e) => setInputPass2(e.target.value)}
                  placeholder="Enter Password 2"
                  className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-4 py-3 text-sm text-white outline-none font-mono transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass2(!showPass2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white"
                >
                  {showPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Server Endpoint Badge */}
            <div className="p-3 bg-[#121212] rounded-xl border border-white/5 flex items-center justify-between text-[11px] text-[#b3b3b3]">
              <span className="flex items-center gap-1.5 font-mono">
                <Server className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>POST /api/admin/verify</span>
              </span>
              <span className="text-[#1ed760] font-bold">Server Verified</span>
            </div>

            <button
              type="submit"
              disabled={verifyLoading}
              className="w-full py-3.5 bg-[#1ed760] hover:bg-[#1db954] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-black text-sm font-black rounded-full shadow-lg shadow-[#1ed760]/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4 fill-black" />
              <span>{verifyLoading ? 'Verifying on Server...' : 'Enter Admin Room'}</span>
            </button>
          </form>

          {/* Passwords hint drawer for testing */}
          <div className="mt-6 pt-4 border-t border-[#282828] text-center">
            <details className="text-left text-xs text-[#b3b3b3] cursor-pointer">
              <summary className="text-center font-bold text-[#1ed760] hover:underline cursor-pointer select-none">
                Show Configured Server Passwords
              </summary>
              <div className="mt-3 p-3 bg-[#121212] rounded-xl border border-white/5 font-mono text-[11px] space-y-1 text-slate-300">
                <p><strong>Password 1:</strong> <span className="text-[#1ed760]">VideoVerseMaster2026</span></p>
                <p><strong>Password 2:</strong> <span className="text-[#1ed760]">SecuredAccess#7788</span></p>
                <p className="text-[10px] text-[#777] pt-1">
                  (Configured on server via process.env.ADMIN_PASSWORD_1 & ADMIN_PASSWORD_2 in server.ts)
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. UNLOCKED ADMIN ROOM (Only accessible after both passwords pass server check)
  // =========================================================================
  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1ed760] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Room (Unlocked)</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Catalogue Administration</h1>
          <p className="text-sm text-[#b3b3b3] mt-1">
            Publish, edit, and curate songs in the shared VideoVerse catalogue
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRulesGuide(!showRulesGuide)}
            className="px-3.5 py-2 rounded-full bg-[#181818] hover:bg-[#282828] text-white border border-[#282828] text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <FileCode className="w-4 h-4 text-[#1ed760]" />
            <span>{showRulesGuide ? 'Hide Rules Guide' : 'Security Rules'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#1ed760] hover:bg-[#1db954] hover:scale-105 active:scale-95 text-black text-xs font-black rounded-full shadow-lg shadow-[#1ed760]/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Song</span>
          </button>

          <button
            onClick={handleLockAdminRoom}
            className="px-3.5 py-2 rounded-full bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Lock Admin Room"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Verified Status Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-[#1ed760]/30 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#1ed760]" />
          <span>
            <strong>Dual-Password Server Verification Verified:</strong> Both passwords authenticated. Full write permissions active.
          </span>
        </div>
        <button
          onClick={handleLockAdminRoom}
          className="px-2.5 py-1 bg-emerald-900/40 hover:bg-emerald-800/40 border border-[#1ed760]/40 rounded-full text-emerald-200 text-[11px]"
        >
          Exit Admin Room
        </button>
      </div>

      {/* Firestore Security Rules Guide Drawer */}
      {showRulesGuide && (
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#1ed760]/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
              <span>Production Firestore Security Rules</span>
            </h2>
            <button
              onClick={() => setShowRulesGuide(false)}
              className="text-xs text-[#b3b3b3] hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-[#b3b3b3] leading-relaxed">
            Write operations to <code className="text-[#1ed760] font-mono">/songs/{'{songId}'}</code> are protected by server-side rules.
          </p>
          <div className="bg-black p-3 rounded-xl border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto">
            {`// /firestore.rules
match /songs/{songId} {
  allow read: if true; // Public discovery catalogue
  allow create, update: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}`}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search catalogue by title, artist, or YouTube ID..."
            className="w-full bg-[#181818] border border-[#282828] focus:border-[#1ed760] rounded-full pl-10 pr-4 py-2 text-xs text-white outline-none"
          />
        </div>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-[#181818] border border-[#282828] rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#1ed760] shrink-0 w-full sm:w-auto font-bold"
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Catalogue Table */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#b3b3b3]">
            <thead className="bg-[#121212] text-[11px] uppercase tracking-wider text-[#b3b3b3] border-b border-[#282828]">
              <tr>
                <th className="py-3 px-4">Song & Artist</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">YouTube ID</th>
                <th className="py-3 px-4">Lyrics</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#b3b3b3]">
                    No songs match your search query.
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-[#202020] transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="overflow-hidden max-w-[200px]">
                        <p className="font-bold text-white truncate">{song.title}</p>
                        <p className="text-[11px] text-[#b3b3b3] truncate">{song.artist}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#242424] text-white font-bold text-[10px]">
                        {song.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <a
                        href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#1ed760] flex items-center gap-1 text-[#b3b3b3]"
                      >
                        <span>{song.youtubeId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {Array.isArray(song.lyrics) ? (
                        <span className="text-[#1ed760] font-bold">Synced ({song.lyrics.length})</span>
                      ) : song.lyrics ? (
                        <span className="text-[#b3b3b3]">Plain text</span>
                      ) : (
                        <span className="text-[#555]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {Math.floor((song.duration || 180) / 60)}:
                      {((song.duration || 180) % 60 < 10 ? '0' : '')}
                      {(song.duration || 180) % 60}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => playSong(song)}
                          title="Preview Track"
                          className="p-1.5 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#282828]"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(song)}
                          title="Edit Song"
                          className="p-1.5 rounded-lg text-[#b3b3b3] hover:text-[#1ed760] hover:bg-[#282828]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingSong(song)}
                          title="Delete Song"
                          className="p-1.5 rounded-lg text-[#b3b3b3] hover:text-rose-400 hover:bg-[#282828]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Song Modal */}
      {(isAddOpen || editingSong) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#282828] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative custom-scrollbar">
            <h2 className="text-xl font-black text-white mb-1">
              {editingSong ? 'Edit Catalogue Track' : 'Add New Track to Catalogue'}
            </h2>
            <p className="text-xs text-[#b3b3b3] mb-4">
              Enter verified metadata. The song will be immediately streamable via YouTube IFrame API.
            </p>

            {formStatus && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  formStatus.type === 'success'
                    ? 'bg-emerald-950/60 border border-[#1ed760]/40 text-emerald-200'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
                }`}
              >
                {formStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1ed760]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span>{formStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveSong} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Blinding Lights"
                    className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Artist *</label>
                  <input
                    type="text"
                    required
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="e.g. The Weeknd"
                    className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    YouTube Video ID or URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.youtubeId}
                    onChange={(e) => handleYoutubeIdChange(e.target.value)}
                    placeholder="e.g. 4NRXx6U8ABQ"
                    className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Category / Genre</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
                  >
                    {GENRES.filter(g => g !== 'All').map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Preview Box */}
              {formData.youtubeId && (
                <div className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-center gap-3">
                  <img
                    src={formData.thumbnailUrl || `https://img.youtube.com/vi/${formData.youtubeId}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-16 h-12 object-cover rounded-lg border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300';
                    }}
                  />
                  <div className="overflow-hidden flex-1 text-xs">
                    <p className="font-bold text-white truncate">
                      {formData.title || 'Untitled Song'}
                    </p>
                    <p className="text-[#b3b3b3] truncate">{formData.artist || 'Unknown Artist'}</p>
                    <a
                      href={`https://www.youtube.com/watch?v=${formData.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1ed760] text-[11px] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>Verify on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Album (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.album}
                    onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                    placeholder="e.g. After Hours"
                    className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 180 })}
                    placeholder="180"
                    className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Lyrics (Plain text or Synced format: [seconds] Lyric line)
                </label>
                <textarea
                  rows={4}
                  value={formData.lyrics}
                  onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                  placeholder="Example synced format:&#10;[12] First line of song&#10;[24] Second line of song"
                  className="w-full bg-[#121212] border border-[#282828] focus:border-[#1ed760] rounded-xl p-3 text-xs text-white font-mono outline-none custom-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#282828]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingSong(null);
                  }}
                  className="px-4 py-2 text-xs text-[#b3b3b3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1ed760] hover:bg-[#1db954] hover:scale-105 active:scale-95 disabled:opacity-50 text-black text-xs font-black rounded-full shadow-lg shadow-[#1ed760]/30 transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingSong ? 'Update Track' : 'Publish Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSong && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#282828] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>Confirm Track Deletion</span>
            </h2>
            <p className="text-xs text-[#b3b3b3] mb-4">
              Are you sure you want to remove <strong className="text-white">&quot;{deletingSong.title}&quot;</strong> by {deletingSong.artist} from the published catalogue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingSong(null)}
                className="px-4 py-2 text-xs text-[#b3b3b3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full shadow-lg shadow-rose-600/30 transition-all"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Track'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
