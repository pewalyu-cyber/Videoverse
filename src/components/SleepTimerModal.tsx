import React, { useState } from 'react';
import { X, Clock, Moon, AlertCircle, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimerMinutes, sleepTimerRemaining, startSleepTimer, cancelSleepTimer } = usePlayer();
  const [customMinutes, setCustomMinutes] = useState<string>('20');

  if (!isOpen) return null;

  const presets = [15, 30, 45, 60];

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (!isNaN(val) && val > 0 && val <= 480) {
      startSleepTimer(val);
      onClose();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
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
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Sleep Timer</h2>
            <p className="text-xs text-slate-400">Gradually pause playback when you fall asleep</p>
          </div>
        </div>

        {/* Active Timer Status */}
        {sleepTimerRemaining !== null && sleepTimerRemaining > 0 ? (
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold block mb-1">
              Playback stops in
            </span>
            <div className="text-3xl font-mono font-bold text-white mb-3">
              {formatTimer(sleepTimerRemaining)}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  cancelSleepTimer();
                }}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel Timer
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Keep Running
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Presets */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {presets.map((min) => (
                <button
                  key={min}
                  onClick={() => {
                    startSleepTimer(min);
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-violet-600/20 border border-slate-700/60 hover:border-violet-500/50 text-slate-200 hover:text-white font-medium text-sm transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span>{min} Minutes</span>
                  </span>
                  <Check className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleStartCustom} className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Custom Duration (minutes)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Minutes (e.g. 25)"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all"
                >
                  Set Timer
                </button>
              </div>
            </form>
          </>
        )}

        {/* Browser background policy notice */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> Some mobile browsers suspend JavaScript execution when the screen is locked or the tab is in deep background. For maximum reliability, keep this tab active.
          </span>
        </div>
      </div>
    </div>
  );
};
