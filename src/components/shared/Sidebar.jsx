import React from 'react';
import { Sparkles, Trash2, Bell, BellOff } from 'lucide-react';

const Sidebar = ({
  babyProfile,
  babyAge,
  currentWeight,
  setCurrentTab,
  feedInterval,
  setFeedInterval,
  feedDuration,
  setFeedDuration,
  targetSleepDuration,
  setTargetSleepDuration,
  momPreferredSleepStart,
  setMomPreferredSleepStart,
  dadPreferredSleepStart,
  setDadPreferredSleepStart,
  allowOverlap,
  setAllowOverlap,
  showPredictions,
  setShowPredictions,
  autoSolveAllDays,
  getTimeLabel,
  resetAllData,
  // Notification props
  notificationsEnabled,
  setNotificationsEnabled,
  feedNotificationsEnabled,
  setFeedNotificationsEnabled,
  napNotificationsEnabled,
  setNapNotificationsEnabled,
  leadTimeMinutes,
  setLeadTimeMinutes,
  permissionStatus,
  sendTestNotification
}) => {
  return (
    <div className="w-80 space-y-4">
      
      {/* Baby Profile Card */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-teal-300">👶 Baby Profile</h2>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-white">{babyProfile.name}</div>
            <div className="text-sm text-gray-400">
              {babyAge.weeks}w {babyAge.days}d old ({babyAge.totalDays} days)
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Weight:</span>
            <span className="text-white font-semibold">{currentWeight} {babyProfile.weightUnit}</span>
            <span className="text-green-400">📈</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Feeding:</span>
            <span className="text-white">
              {babyProfile.feedingType === 'breast' ? '🤱 Breast' : 
               babyProfile.feedingType === 'bottle' ? '🍼 Bottle' : 
               '🤱🍼 Mixed'}
            </span>
          </div>
          
          <button 
            onClick={() => setCurrentTab('profile')}
            className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-gray-300 rounded transition-colors"
          >
            View Full Profile
          </button>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4 text-teal-300">Settings</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Feed Interval (Default)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="6"
              step="0.5"
              value={feedInterval}
              onChange={(e) => setFeedInterval(parseFloat(e.target.value))}
              className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
            <span className="text-gray-400 text-sm">hours</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Feed Duration
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0.25"
              max="2"
              step="0.25"
              value={feedDuration}
              onChange={(e) => setFeedDuration(parseFloat(e.target.value))}
              className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
            <span className="text-gray-400 text-sm">({Math.round(feedDuration * 60)} min)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Sleep Duration
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="3"
              max="8"
              step="0.5"
              value={targetSleepDuration}
              onChange={(e) => setTargetSleepDuration(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3h</span>
              <span className="text-teal-400 font-semibold">{targetSleepDuration}h</span>
              <span>8h</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Default: Mom's Preferred Sleep Start
          </label>
          <select
            value={momPreferredSleepStart}
            onChange={(e) => setMomPreferredSleepStart(parseInt(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i}>
                {getTimeLabel(i)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Default: Dad's Preferred Sleep Start
          </label>
          <select
            value={dadPreferredSleepStart}
            onChange={(e) => setDadPreferredSleepStart(parseInt(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i}>
                {getTimeLabel(i)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowOverlap}
              onChange={(e) => setAllowOverlap(e.target.checked)}
              className="w-5 h-5 accent-teal-500"
            />
            <span className="text-sm text-gray-300">
              Allow Sleep Overlap
            </span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={(e) => setShowPredictions(e.target.checked)}
              className="w-5 h-5 accent-teal-500"
            />
            <span className="text-sm text-gray-300">
              Show Predicted Sleep
            </span>
          </label>
        </div>

        <button
          onClick={autoSolveAllDays}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Auto-Solve All Days
        </button>

        {/* Notification Settings */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Reminders
          </h3>

          {/* Permission denied banner */}
          {permissionStatus === 'denied' && (
            <div className="mb-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300">
              <div className="flex items-center gap-2 mb-1">
                <BellOff className="w-4 h-4" />
                <span className="font-medium">Notifications Blocked</span>
              </div>
              <p className="text-red-400 text-xs">
                Please enable notifications in your browser settings to receive reminders.
              </p>
            </div>
          )}

          {permissionStatus === 'unsupported' && (
            <div className="mb-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-sm text-yellow-300">
              <p className="text-yellow-400 text-xs">
                Notifications are not supported in this browser.
              </p>
            </div>
          )}

          {/* Main toggle */}
          <div className="mb-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                disabled={permissionStatus === 'denied' || permissionStatus === 'unsupported'}
                className="w-5 h-5 accent-teal-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">
                Enable Reminders
              </span>
            </label>
          </div>

          {/* Sub-toggles (only shown when enabled) */}
          {notificationsEnabled && permissionStatus === 'granted' && (
            <div className="ml-8 space-y-2 mb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedNotificationsEnabled}
                  onChange={(e) => setFeedNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-teal-500"
                />
                <span className="text-sm text-gray-400">
                  Feed reminders
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={napNotificationsEnabled}
                  onChange={(e) => setNapNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-teal-500"
                />
                <span className="text-sm text-gray-400">
                  Nap reminders
                </span>
              </label>
            </div>
          )}

          {/* Lead time dropdown */}
          {notificationsEnabled && permissionStatus === 'granted' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Remind me before
              </label>
              <select
                value={leadTimeMinutes}
                onChange={(e) => setLeadTimeMinutes(parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          )}

          {/* Test notification button */}
          {notificationsEnabled && permissionStatus === 'granted' && (
            <button
              onClick={sendTestNotification}
              className="w-full mt-3 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Send Test Notification
            </button>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          <button
            onClick={resetAllData}
            className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;