import React, { useState, useEffect } from 'react';
import { X, Cloud, CloudOff, Upload, Download, Check, AlertCircle, Loader2 } from 'lucide-react';

const BackupModal = ({
  isOpen,
  onClose,
  googleDrive,
  onBackup,
  onRestore
}) => {
  const [backupExists, setBackupExists] = useState(false);
  const [checkingBackup, setCheckingBackup] = useState(false);

  const {
    isConfigured,
    isSignedIn,
    isLoading,
    error,
    userEmail,
    lastBackupTime,
    signIn,
    signOut,
    checkBackupExists
  } = googleDrive;

  // Check if backup exists when signed in
  useEffect(() => {
    if (isOpen && isSignedIn) {
      setCheckingBackup(true);
      checkBackupExists().then(exists => {
        setBackupExists(exists);
        setCheckingBackup(false);
      });
    }
  }, [isOpen, isSignedIn, checkBackupExists]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-800 rounded-lg w-full max-w-md shadow-xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-teal-400" />
            Cloud Backup
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!isConfigured ? (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-200 font-medium">Setup Required</h4>
                  <p className="text-sm text-yellow-200/80 mt-1">
                    Google Drive backup requires configuration. Add your Google Cloud OAuth Client ID to enable this feature.
                  </p>
                  <p className="text-xs text-yellow-200/60 mt-2">
                    Set VITE_GOOGLE_CLIENT_ID in your environment variables.
                  </p>
                </div>
              </div>
            </div>
          ) : !isSignedIn ? (
            <>
              <p className="text-gray-400 text-sm">
                Sign in with Google to backup your data to Google Drive. Your data will be stored securely in your own Google Drive account.
              </p>

              <button
                onClick={signIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Signed in status */}
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-green-200 font-medium text-sm">Connected</div>
                  <div className="text-green-200/70 text-xs">{userEmail}</div>
                </div>
                <button
                  onClick={signOut}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Sign out
                </button>
              </div>

              {/* Last backup info */}
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">Last backup</div>
                <div className="text-white font-medium">
                  {formatDate(lastBackupTime)}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-200">{error}</span>
                </div>
              )}

              {/* Backup/Restore buttons */}
              <div className="space-y-2">
                <button
                  onClick={onBackup}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Backup Now
                    </>
                  )}
                </button>

                <button
                  onClick={onRestore}
                  disabled={isLoading || checkingBackup || !backupExists}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {checkingBackup ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Restore from Backup
                    </>
                  )}
                </button>

                {!checkingBackup && !backupExists && isSignedIn && (
                  <p className="text-xs text-gray-500 text-center">
                    No backup found in your Google Drive
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Backups are stored in your Google Drive in a "BabyRhythm Backups" folder
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;
