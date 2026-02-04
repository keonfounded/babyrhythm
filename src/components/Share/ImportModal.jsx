import React, { useState } from 'react';
import { X, Download, AlertCircle, Check, RefreshCw, GitMerge } from 'lucide-react';

const ImportModal = ({
  isOpen,
  onClose,
  importData,
  onImport
}) => {
  const [importMode, setImportMode] = useState('merge');
  const [importing, setImporting] = useState(false);

  if (!isOpen || !importData) return null;

  const { profile, schedules, settings } = importData;

  const handleImport = () => {
    setImporting(true);
    onImport(importData, importMode);
  };

  // Count events in imported data
  const eventCount = Object.values(schedules || {}).reduce((total, schedule) => {
    return total + (schedule.loggedEvents?.length || 0);
  }, 0);

  const daysCount = Object.keys(schedules || {}).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-800 rounded-lg w-full max-w-md shadow-xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-teal-400" />
            Import Shared Data
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
          <div className="bg-teal-500/20 border border-teal-500/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Shared data received!</h4>
            <p className="text-sm text-gray-300">
              Someone has shared their BabyRhythm data with you.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-white">Data preview:</h4>
            <div className="text-sm text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Baby name:</span>
                <span className="text-white">{profile?.name || 'Unknown'}</span>
              </div>
              {profile?.birthDate && (
                <div className="flex justify-between">
                  <span>Birth date:</span>
                  <span className="text-white">{new Date(profile.birthDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Days of data:</span>
                <span className="text-white">{daysCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total events:</span>
                <span className="text-white">{eventCount}</span>
              </div>
            </div>
          </div>

          {/* Import Mode */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Import mode</label>
            <div className="space-y-2">
              <button
                onClick={() => setImportMode('merge')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  importMode === 'merge'
                    ? 'border-teal-500 bg-teal-500/20'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <GitMerge className={`w-5 h-5 ${importMode === 'merge' ? 'text-teal-400' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className="text-white font-medium">Merge</div>
                  <div className="text-xs text-gray-400">Add new events, keep existing ones</div>
                </div>
                {importMode === 'merge' && (
                  <Check className="w-5 h-5 text-teal-400 ml-auto" />
                )}
              </button>

              <button
                onClick={() => setImportMode('replace')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  importMode === 'replace'
                    ? 'border-orange-500 bg-orange-500/20'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${importMode === 'replace' ? 'text-orange-400' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className="text-white font-medium">Replace</div>
                  <div className="text-xs text-gray-400">Replace all data with imported data</div>
                </div>
                {importMode === 'replace' && (
                  <Check className="w-5 h-5 text-orange-400 ml-auto" />
                )}
              </button>
            </div>
          </div>

          {/* Warning for replace mode */}
          {importMode === 'replace' && (
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-200">
                This will replace your current profile and all logged events. This cannot be undone.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              importMode === 'replace'
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
