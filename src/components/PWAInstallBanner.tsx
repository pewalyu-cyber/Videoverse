import React, { useEffect, useState } from 'react';
import { DownloadCloud, X, Smartphone, CheckCircle, Share } from 'lucide-react';

interface PWAInstallBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Install prompt is already loaded or your browser can install directly from the address bar icon.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      onClose();
    }
    setDeferredPrompt(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <DownloadCloud className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Install VideoVerse 2.0</h2>
            <p className="text-xs text-slate-400">Progressive Web App (PWA)</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>VideoVerse is already installed on this device!</span>
          </div>
        ) : (
          <div className="space-y-4 mb-6 text-xs text-slate-300">
            <p className="leading-relaxed">
              Install VideoVerse 2.0 directly to your home screen or desktop for full-screen playback, instant launching, and offline app shell caching.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-violet-300 font-semibold">
                <Smartphone className="w-4 h-4" />
                <span>On Android & Desktop (Chrome / Edge):</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6">
                Click the button below or tap the install icon in your browser address bar.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Share className="w-4 h-4" />
                <span>On iPhone / iPad (Safari):</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6">
                Tap the <strong>Share</strong> button at the bottom of the screen, scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Install Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
