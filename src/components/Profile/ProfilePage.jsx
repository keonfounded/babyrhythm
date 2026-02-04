import React, { useState } from 'react';
import { User, Calendar, Save, X, Plus, Trash2, Download, Globe, AlertTriangle, RefreshCw, HelpCircle, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateAge } from '../../utils/dateHelpers';
import { exportWeightHistoryToCSV } from '../../utils/csvExportHelpers';

const ProfilePage = ({
  babyProfile,
  editingProfile,
  getCurrentWeight,
  getCurrentWeightDate,
  startEditingProfile,
  cancelEditingProfile,
  saveProfile,
  addWeightEntry,
  removeWeightEntry,
  updateWeightEntry,
  updateEditingProfile,
  resetAllData,
  showTutorial,
  theme,
  toggleTheme
}) => {
  // Check if in demo mode
  const isDemo = (() => {
    try {
      return localStorage.getItem('babyRhythm_isDemo') === 'true';
    } catch { return false; }
  })();
  const { t, i18n } = useTranslation();
  const profile = editingProfile || babyProfile;
  const isEditing = editingProfile !== null;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  const displayWeight = getCurrentWeight(profile);
  const displayWeightDate = getCurrentWeightDate(profile);
  const babyAge = calculateAge(profile.birthDate);

  const sortedHistory = [...profile.weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">👶 Baby Profile</h2>
        {!isEditing ? (
          <button
            onClick={startEditingProfile}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={cancelEditingProfile}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={saveProfile}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-teal-300 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Baby's Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateEditingProfile({ name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            ) : (
              <div className="text-white text-lg">{profile.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => updateEditingProfile({ birthDate: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            ) : (
              <div className="text-white text-lg">
                {new Date(profile.birthDate).toLocaleDateString()}
                <span className="text-sm text-gray-400 ml-2">
                  ({babyAge.weeks}w {babyAge.days}d • {babyAge.totalDays} days)
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Weight
            </label>
            <div className="text-white text-lg">
              {displayWeight} {profile.weightUnit}
              {displayWeightDate && (
                <span className="text-sm text-gray-400 ml-2">
                  (as of {new Date(displayWeightDate).toLocaleDateString()})
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Synced with latest weight history entry
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Weight Unit
            </label>
            {isEditing ? (
              <select
                value={profile.weightUnit}
                onChange={(e) => updateEditingProfile({ weightUnit: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            ) : (
              <div className="text-white text-lg">{profile.weightUnit}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sex
            </label>
            {isEditing ? (
              <select
                value={profile.sex || 'boy'}
                onChange={(e) => updateEditingProfile({ sex: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
              </select>
            ) : (
              <div className="text-white text-lg">
                {profile.sex === 'girl' ? 'Girl' : 'Boy'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Feeding Type
            </label>
            {isEditing ? (
              <select
                value={profile.feedingType}
                onChange={(e) => updateEditingProfile({ feedingType: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="breast">🤱 Breastfeeding</option>
                <option value="bottle">🍼 Bottle feeding</option>
                <option value="mixed">🤱🍼 Mixed</option>
              </select>
            ) : (
              <div className="text-white text-lg">
                {profile.feedingType === 'breast' ? '🤱 Breastfeeding' : 
                 profile.feedingType === 'bottle' ? '🍼 Bottle feeding' : 
                 '🤱🍼 Mixed'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weight History */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-teal-300">Weight History</h3>
          <div className="flex gap-2">
            {profile.weightHistory && profile.weightHistory.length > 0 && (
              <button
                onClick={() => exportWeightHistoryToCSV(profile.weightHistory, profile.weightUnit, profile.name)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded flex items-center gap-1"
                title="Export weight history to CSV"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            )}
            {isEditing && (
              <button
                onClick={addWeightEntry}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {sortedHistory.map((entry, index) => {
            const originalIndex = profile.weightHistory.findIndex(
              e => e.date === entry.date && e.weight === entry.weight
            );
            
            return (
              <div key={index} className="flex items-center gap-4 bg-gray-700 p-3 rounded">
                {isEditing ? (
                  <>
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateWeightEntry(originalIndex, 'date', e.target.value)}
                      className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={entry.weight}
                      onChange={(e) => updateWeightEntry(originalIndex, 'weight', parseFloat(e.target.value))}
                      className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                    />
                    <span className="text-gray-400 text-sm">{profile.weightUnit}</span>
                    <input
                      type="text"
                      value={entry.note}
                      onChange={(e) => updateWeightEntry(originalIndex, 'note', e.target.value)}
                      placeholder="Note (optional)"
                      className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                    />
                    <button
                      onClick={() => removeWeightEntry(originalIndex)}
                      className="p-1 bg-red-600 hover:bg-red-700 rounded"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="text-white font-semibold">{entry.weight} {profile.weightUnit}</span>
                    {entry.note && <span className="text-gray-400 text-sm">({entry.note})</span>}
                    {index === 0 && <span className="text-teal-400 text-xs ml-auto">← Current</span>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Medical Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-teal-300 mb-4">Medical Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pediatrician
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.pediatrician}
                onChange={(e) => updateEditingProfile({ pediatrician: e.target.value })}
                placeholder="Dr. Name, Clinic Name, Phone"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            ) : (
              <div className="text-white">{profile.pediatrician || 'Not specified'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Allergies
            </label>
            {isEditing ? (
              <textarea
                value={profile.allergies}
                onChange={(e) => updateEditingProfile({ allergies: e.target.value })}
                placeholder="List any known allergies"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                rows={2}
              />
            ) : (
              <div className="text-white">{profile.allergies || 'None known'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Medications
            </label>
            {isEditing ? (
              <textarea
                value={profile.medications}
                onChange={(e) => updateEditingProfile({ medications: e.target.value })}
                placeholder="List any medications"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                rows={2}
              />
            ) : (
              <div className="text-white">{profile.medications || 'None'}</div>
            )}
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-semibold text-teal-300 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('profile.settings')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.language')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  i18n.language === 'en' || i18n.language.startsWith('en-')
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => changeLanguage('ko')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  i18n.language === 'ko' || i18n.language.startsWith('ko-')
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🇰🇷 한국어
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
            </div>
          </div>

          {/* Show Tutorial Again */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Help
            </label>
            <button
              onClick={showTutorial}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Show Tutorial
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Data Management
        </h3>

        {isDemo && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <div className="text-yellow-200 font-medium">Demo Mode Active</div>
                <div className="text-yellow-200/70 text-sm mt-1">
                  You're viewing sample data. Reset to start tracking your own baby.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-gray-400 text-sm">
            Reset all data to start fresh. This will delete all logged events, profile information, and settings.
          </p>

          <button
            onClick={resetAllData}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {isDemo ? 'Exit Demo & Start Fresh' : 'Reset All Data'}
          </button>

          <p className="text-gray-500 text-xs">
            This action cannot be undone. Consider exporting your data first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;