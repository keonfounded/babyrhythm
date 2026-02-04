import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissed = localStorage.getItem('babyRhythm_installDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Listen for install prompt (Chrome/Edge/etc)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show iOS prompt after a delay if on iOS and not installed
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('babyRhythm_installDismissed', Date.now().toString());
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gray-800 border border-teal-500/50 rounded-lg shadow-xl z-40 p-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">👶</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Install BabyRhythm</h3>
          <p className="text-sm text-gray-400 mb-3">
            Add to your home screen for quick access and offline use.
          </p>

          {isIOS ? (
            <div className="text-xs text-gray-300 bg-gray-700/50 rounded p-2">
              Tap <span className="inline-block px-1 bg-gray-600 rounded">
                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                </svg>
              </span> then "Add to Home Screen"
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
