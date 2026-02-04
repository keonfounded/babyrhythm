import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Link2, QrCode, AlertCircle, Users } from 'lucide-react';
import {
  generateShareUrl,
  isShareDataTooLarge,
  trimSchedulesToDays
} from '../../utils/shareHelpers';

const ShareModal = ({
  isOpen,
  onClose,
  babyProfile,
  dailySchedules,
  settings
}) => {
  const [copied, setCopied] = useState(false);
  const [daysToShare, setDaysToShare] = useState(14);

  // Generate share URL with trimmed data
  const shareData = useMemo(() => {
    if (!isOpen || !babyProfile) return null;

    const trimmedSchedules = trimSchedulesToDays(dailySchedules, daysToShare);
    const url = generateShareUrl(babyProfile, trimmedSchedules, settings);
    const isTooLarge = isShareDataTooLarge(babyProfile, trimmedSchedules);

    return { url, isTooLarge };
  }, [isOpen, babyProfile, dailySchedules, settings, daysToShare]);

  const handleCopy = async () => {
    if (!shareData?.url) return;

    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareData.url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-800 rounded-lg w-full max-w-md shadow-xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            Share with Caregiver
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
          <p className="text-sm text-gray-400">
            Share your baby's data with a partner, nanny, or family member. They can scan the QR code or use the link to import the data.
          </p>

          {/* Days selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Include data from</label>
            <div className="flex gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysToShare(days)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    daysToShare === days
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>

          {/* QR Code */}
          {shareData?.url && (
            <div className="flex flex-col items-center">
              {shareData.isTooLarge ? (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-200">
                    Data is too large for QR code. Please use the link below or reduce the number of days.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={shareData.url}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                Scan with phone camera
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareData?.url || ''}
                readOnly
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* What's included */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-2">What's shared:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Baby profile (name, birth date, weight history)</li>
              <li>• Logged events from the last {daysToShare} days</li>
              <li>• App settings</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
