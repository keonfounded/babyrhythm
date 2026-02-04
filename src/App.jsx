import React, { useState, useRef, useEffect } from 'react';
import { Moon, Coffee, Baby, Droplet, Sparkles, Plus, Trash2, ChevronDown, ChevronRight, Copy, Briefcase, User, Calendar, Save, X, Clock, Edit2, Menu, Settings } from 'lucide-react';
import { EVENT_TYPES } from './constants/eventTypes';
import { getTimeLabel, formatTime, getCurrentTimeInHours, getTimeFromMouseY } from './utils/timeHelpers';
import { getDateKey, formatDate, getCurrentDateKey, calculateAge, getViewDates } from './utils/dateHelpers';
import { migrateStorage } from './utils/storageMigration';
import { useProfile } from './hooks/useProfile';
import { useEventLogging } from './hooks/useEventLogging';
import { useDragging } from './hooks/useDragging';
import { useSchedule } from './hooks/useSchedule';
import { useBulkLog } from './hooks/useBulkLog';
import { useNotifications } from './hooks/useNotifications';
import { predictNextNap } from './utils/sleepPredictor';
import { predictNextFeed } from './utils/feedPredictor';

import QuickLogToolbar from './components/Schedule/QuickLogToolbar';
import NapPredictor from './components/Schedule/NapPredictor';
import Tabs from './components/shared/Tabs';
import Sidebar from './components/shared/Sidebar';
import ContinuousTimeline from './components/Schedule/ContinuousTimeline';
import ProfilePage from './components/Profile/ProfilePage';
import BulkLogPage from './components/BulkLog/BulkLogPage';
import HistoryPage from './components/History/HistoryPage';
import InstallPrompt from './components/shared/InstallPrompt';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import TutorialOverlay from './components/Onboarding/TutorialOverlay';
import MilestonesPage from './components/Milestones/MilestonesPage';
import DoctorVisitPage from './components/DoctorVisit/DoctorVisitPage';
import ShareModal from './components/Share/ShareModal';
import ImportModal from './components/Share/ImportModal';
import BackupModal from './components/Backup/BackupModal';
import { getShareDataFromUrl, clearShareFromUrl, mergeSchedules } from './utils/shareHelpers';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { useTheme } from './hooks/useTheme';

// Run storage migration on load
migrateStorage();

const BabyRhythm = () => {
  const fileInputRef = useRef(null);

  // Navigation state
  const [currentTab, setCurrentTab] = useState('schedule');

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Share modals state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);

  // Backup modal state
  const [showBackupModal, setShowBackupModal] = useState(false);
  const googleDrive = useGoogleDrive();

  // Theme
  const { theme, toggleTheme } = useTheme();

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return localStorage.getItem('babyRhythm_tutorialShown') !== 'true';
    } catch { return true; }
  });

  const {
    babyProfile,
    editingProfile,
    onboardingComplete,
    getCurrentWeight,
    getCurrentWeightDate,
    startEditingProfile,
    cancelEditingProfile,
    saveProfile,
    addWeightEntry,
    removeWeightEntry,
    updateWeightEntry,
    updateEditingProfile,
    completeOnboarding,
    resetAllData,
    loadDemoData
  } = useProfile();

  // Tutorial completion handler
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    try {
      localStorage.setItem('babyRhythm_tutorialShown', 'true');
    } catch {}
  };

  // Demo data loading handler
  const handleLoadDemo = (demoData) => {
    loadDemoData(demoData);
    setShowTutorial(true); // Show tutorial after loading demo
  };

  // State for all parameters - load from localStorage
  const [savedSettings] = useState(() => {
    try {
      const s = localStorage.getItem('babyRhythm_settings');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  const [feedInterval, setFeedInterval] = useState(savedSettings.feedInterval ?? 3);
  const [feedDuration, setFeedDuration] = useState(savedSettings.feedDuration ?? 0.5);
  const [allowOverlap, setAllowOverlap] = useState(savedSettings.allowOverlap ?? false);
  const [targetSleepDuration, setTargetSleepDuration] = useState(savedSettings.targetSleepDuration ?? 4);
  const [showPredictions, setShowPredictions] = useState(savedSettings.showPredictions ?? true);
  const [momPreferredSleepStart, setMomPreferredSleepStart] = useState(savedSettings.momPreferredSleepStart ?? 0);
  const [dadPreferredSleepStart, setDadPreferredSleepStart] = useState(savedSettings.dadPreferredSleepStart ?? 8);
  const [showParents, setShowParents] = useState(savedSettings.showParents ?? true);

  const toggleParents = () => setShowParents(prev => !prev);

  // Calculate derived values (with fallbacks for pre-onboarding)
  const babyAge = babyProfile ? calculateAge(babyProfile.birthDate) : { weeks: 0, days: 0, totalDays: 0 };
  const currentWeight = babyProfile ? getCurrentWeight(babyProfile) : 0;
  const currentWeightDate = babyProfile ? getCurrentWeightDate(babyProfile) : null;

  // Schedule hook
  const {
    viewStartDate,
    selectedDays,
    expandedDays,
    dailySchedules,
    getScheduleForDate,
    updateScheduleForDate,
    toggleDay,
    recalculateDutyBlocks,
    addBlock,
    removeBlock,
    getFeedTimes,
    getPredictedSleep,
    calculateStats,
    autoSolveDay,
    batchAutoSolveDays
  } = useSchedule(
    babyAge,
    feedInterval,
    feedDuration,
    targetSleepDuration,
    showPredictions,
    momPreferredSleepStart,
    dadPreferredSleepStart,
    allowOverlap
  );

  const {
    activeSleepSession,
    feedAmountUnit,
    setFeedAmountUnit,
    logEvent,
    beginSleep,
    endSleep,
    logEventNow,
    deleteLoggedEvent,
    undoLastAction,
    canUndo,
    undoLabel
  } = useEventLogging(getScheduleForDate, updateScheduleForDate);

  const {
    bulkLogForm,
    setBulkLogForm,
    handleBulkLogSubmit
  } = useBulkLog(getScheduleForDate, updateScheduleForDate);

  const {
    dragging,
    timelineRefs,
    handleMouseDown
  } = useDragging(getScheduleForDate, updateScheduleForDate, recalculateDutyBlocks);

  const {
    notificationsEnabled,
    feedNotificationsEnabled,
    napNotificationsEnabled,
    leadTimeMinutes,
    permissionStatus,
    setNotificationsEnabled,
    setFeedNotificationsEnabled,
    setNapNotificationsEnabled,
    setLeadTimeMinutes,
    scheduleNotifications,
    sendTestNotification
  } = useNotifications();

  useEffect(() => {
    try {
      localStorage.setItem('babyRhythm_settings', JSON.stringify({
        feedInterval, feedDuration, allowOverlap, targetSleepDuration,
        showPredictions, momPreferredSleepStart, dadPreferredSleepStart, showParents
      }));
    } catch {}
  }, [feedInterval, feedDuration, allowOverlap, targetSleepDuration, showPredictions, momPreferredSleepStart, dadPreferredSleepStart, showParents]);

  // Schedule notifications when predictions or settings change
  useEffect(() => {
    if (!babyProfile || !notificationsEnabled) return;

    const feedPrediction = predictNextFeed(babyProfile.birthDate, dailySchedules);
    const napPrediction = predictNextNap(babyProfile.birthDate, dailySchedules);

    scheduleNotifications(feedPrediction, napPrediction, babyProfile.name);
  }, [
    babyProfile,
    dailySchedules,
    notificationsEnabled,
    feedNotificationsEnabled,
    napNotificationsEnabled,
    leadTimeMinutes,
    scheduleNotifications
  ]);

  // Refresh notifications when page regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && babyProfile && notificationsEnabled) {
        const feedPrediction = predictNextFeed(babyProfile.birthDate, dailySchedules);
        const napPrediction = predictNextNap(babyProfile.birthDate, dailySchedules);
        scheduleNotifications(feedPrediction, napPrediction, babyProfile.name);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [babyProfile, dailySchedules, notificationsEnabled, scheduleNotifications]);

  const autoSolveAllDays = () => {
    const dates = getViewDates(viewStartDate, selectedDays);
    const dateKeys = dates.map(date => getDateKey(date));
    batchAutoSolveDays(dateKeys);
  };

  // Check for shared data in URL on mount
  useEffect(() => {
    const shareData = getShareDataFromUrl();
    if (shareData) {
      setPendingImportData(shareData);
      setShowImportModal(true);
      clearShareFromUrl();
    }
  }, []);

  // Listen for service worker messages (notification actions)
  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'LOG_FEED_NOW') {
        logEventNow('feed');
      } else if (event.data?.type === 'BEGIN_SLEEP') {
        if (!activeSleepSession) {
          beginSleep();
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [logEventNow, beginSleep, activeSleepSession]);

  // Handle import from shared data
  const handleImportSharedData = (importData, mode) => {
    const { profile, schedules, settings: importedSettings } = importData;

    // Merge or replace schedules
    const mergedSchedules = mergeSchedules(dailySchedules, schedules || {}, mode);
    Object.entries(mergedSchedules).forEach(([dateKey, schedule]) => {
      updateScheduleForDate(dateKey, schedule);
    });

    // Apply imported settings if in replace mode
    if (mode === 'replace' && importedSettings) {
      if (importedSettings.feedInterval !== undefined) setFeedInterval(importedSettings.feedInterval);
      if (importedSettings.feedDuration !== undefined) setFeedDuration(importedSettings.feedDuration);
      if (importedSettings.targetSleepDuration !== undefined) setTargetSleepDuration(importedSettings.targetSleepDuration);
    }

    // Close modal and clear pending data
    setShowImportModal(false);
    setPendingImportData(null);

    alert(`Data imported successfully! ${mode === 'merge' ? 'New events have been merged.' : 'All data has been replaced.'}`);
  };

  // Get current settings for sharing
  const getCurrentSettings = () => ({
    feedInterval,
    feedDuration,
    targetSleepDuration,
    momPreferredSleepStart,
    dadPreferredSleepStart
  });

  // Handle Google Drive backup
  const handleGoogleDriveBackup = async () => {
    const data = {
      babyProfile,
      dailySchedules,
      settings: getCurrentSettings(),
      milestones: JSON.parse(localStorage.getItem('babyRhythm_milestones') || '{}'),
      customMilestones: JSON.parse(localStorage.getItem('babyRhythm_milestones_custom') || '[]')
    };

    const success = await googleDrive.backup(data);
    if (success) {
      alert('Backup saved to Google Drive!');
    }
  };

  // Handle Google Drive restore
  const handleGoogleDriveRestore = async () => {
    if (!confirm('This will replace all current data with the backup. Continue?')) {
      return;
    }

    const data = await googleDrive.restore();
    if (data) {
      // Restore schedules
      if (data.dailySchedules) {
        Object.entries(data.dailySchedules).forEach(([dateKey, schedule]) => {
          updateScheduleForDate(dateKey, schedule);
        });
      }

      // Restore settings
      if (data.settings) {
        if (data.settings.feedInterval !== undefined) setFeedInterval(data.settings.feedInterval);
        if (data.settings.feedDuration !== undefined) setFeedDuration(data.settings.feedDuration);
        if (data.settings.targetSleepDuration !== undefined) setTargetSleepDuration(data.settings.targetSleepDuration);
      }

      // Restore milestones
      if (data.milestones) {
        localStorage.setItem('babyRhythm_milestones', JSON.stringify(data.milestones));
      }
      if (data.customMilestones) {
        localStorage.setItem('babyRhythm_milestones_custom', JSON.stringify(data.customMilestones));
      }

      alert('Data restored from backup! Refreshing...');
      window.location.reload();
    }
  };

  // Show onboarding if not complete (AFTER all hooks)
  if (!onboardingComplete || !babyProfile) {
    return <OnboardingWizard onComplete={completeOnboarding} onLoadDemo={handleLoadDemo} />;
  }


  // Show tutorial from profile page
  const handleShowTutorialFromProfile = () => {
    setShowTutorial(true);
  };

  // Render Profile Page
  const renderProfilePage = () => {
    return (
      <ProfilePage
        babyProfile={babyProfile}
        editingProfile={editingProfile}
        getCurrentWeight={getCurrentWeight}
        getCurrentWeightDate={getCurrentWeightDate}
        startEditingProfile={startEditingProfile}
        cancelEditingProfile={cancelEditingProfile}
        saveProfile={saveProfile}
        addWeightEntry={addWeightEntry}
        removeWeightEntry={removeWeightEntry}
        updateWeightEntry={updateWeightEntry}
        updateEditingProfile={updateEditingProfile}
        resetAllData={resetAllData}
        showTutorial={handleShowTutorialFromProfile}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  };

  // Bulk Log Page
  const renderBulkLogPage = () => {
    return (
      <BulkLogPage
        bulkLogForm={bulkLogForm}
        setBulkLogForm={setBulkLogForm}
        handleBulkLogSubmit={handleBulkLogSubmit}
        getScheduleForDate={getScheduleForDate}
        deleteLoggedEvent={deleteLoggedEvent}
        feedAmountUnit={feedAmountUnit}
        setFeedAmountUnit={setFeedAmountUnit}
      />
    );
  };

const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      babyProfile,
      dailySchedules,
      settings: {
        feedInterval,
        feedDuration,
        feedAmountUnit,
        targetSleepDuration,
        showPredictions,
        momPreferredSleepStart,
        dadPreferredSleepStart,
        allowOverlap
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `babyrhythm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.version || !data.dailySchedules) {
          alert('Invalid backup file.');
          return;
        }
        if (!confirm('This will replace all current data. Continue?')) return;
        // Restore schedules
        Object.entries(data.dailySchedules).forEach(([dateKey, schedule]) => {
          updateScheduleForDate(dateKey, schedule);
        });
        // Restore settings if present
        if (data.settings) {
          setFeedInterval(data.settings.feedInterval ?? feedInterval);
          setFeedDuration(data.settings.feedDuration ?? feedDuration);
          setFeedAmountUnit(data.settings.feedAmountUnit ?? feedAmountUnit);
          setTargetSleepDuration(data.settings.targetSleepDuration ?? targetSleepDuration);
          setShowPredictions(data.settings.showPredictions ?? showPredictions);
          setMomPreferredSleepStart(data.settings.momPreferredSleepStart ?? momPreferredSleepStart);
          setDadPreferredSleepStart(data.settings.dadPreferredSleepStart ?? dadPreferredSleepStart);
          setAllowOverlap(data.settings.allowOverlap ?? allowOverlap);
        }
        alert('Data imported successfully!');
      } catch (err) {
        alert('Error reading file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // History Page
  const renderHistoryPage = () => {
    return (
      <HistoryPage
        dailySchedules={dailySchedules}
        feedAmountUnit={feedAmountUnit}
        setFeedAmountUnit={setFeedAmountUnit}
        babyProfile={babyProfile}
        bulkLogForm={bulkLogForm}
        setBulkLogForm={setBulkLogForm}
        handleBulkLogSubmit={handleBulkLogSubmit}
        getScheduleForDate={getScheduleForDate}
        deleteLoggedEvent={deleteLoggedEvent}
      />
    );
  };

  // MAIN RENDER
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header - responsive */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between md:justify-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-2xl md:text-4xl font-bold text-teal-400 flex items-center gap-2 md:gap-3">
              <Baby className="w-6 h-6 md:w-8 md:h-8" />
              <span className="hidden sm:inline">BabyRhythm</span>
              <span className="sm:hidden">BR</span>
              <Moon className="w-6 h-6 md:w-8 md:h-8" />
            </h1>

            {/* Mobile settings button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-400 text-center text-sm md:text-base mt-2 hidden md:block">Track, predict, and sync your baby's rhythm</p>
        </div>

        {/* Tabs - responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
            <div className="flex gap-2 justify-center sm:justify-end">
              <button
                onClick={() => setShowShareModal(true)}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm"
              >
                <span className="hidden sm:inline">👥 Share</span>
                <span className="sm:hidden">👥</span>
              </button>
              <button
                onClick={() => setShowBackupModal(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
                title="Cloud Backup"
              >
                <span className="hidden sm:inline">☁️ Backup</span>
                <span className="sm:hidden">☁️</span>
              </button>
              <button
                onClick={exportData}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                <span className="hidden sm:inline">📤 Export</span>
                <span className="sm:hidden">📤</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                <span className="hidden sm:inline">📥 Import</span>
                <span className="sm:hidden">📥</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </div>
          </div>

        {currentTab === 'schedule' && (
            <>
              <NapPredictor
                birthDate={babyProfile.birthDate}
                dailySchedules={dailySchedules}
              />
              <QuickLogToolbar
                activeSleepSession={activeSleepSession}
                logEventNow={logEventNow}
                beginSleep={beginSleep}
                endSleep={endSleep}
                feedAmountUnit={feedAmountUnit}
                setFeedAmountUnit={setFeedAmountUnit}
                undoLastAction={undoLastAction}
                canUndo={canUndo}
                undoLabel={undoLabel}
              />
            </>
          )}

        {/* Content based on current tab */}
        {currentTab === 'schedule' && (
          <div className="md:flex md:gap-6">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar - slide-out on mobile, inline on desktop */}
            <div className={`
              fixed md:relative inset-y-0 left-0 z-50 md:z-auto
              transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
              transition-transform duration-300 ease-in-out
              w-80 bg-gray-900 md:bg-transparent
              overflow-y-auto md:overflow-visible
              ${sidebarOpen ? 'block' : 'hidden md:block'}
              md:flex-shrink-0
            `}>
              {/* Close button on mobile */}
              <div className="flex justify-end p-4 md:hidden">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="px-4 pb-4 md:p-0">
                <Sidebar
                  babyProfile={babyProfile}
                  babyAge={babyAge}
                  currentWeight={currentWeight}
                  setCurrentTab={(tab) => { setCurrentTab(tab); setSidebarOpen(false); }}
                  feedInterval={feedInterval}
                  setFeedInterval={setFeedInterval}
                  feedDuration={feedDuration}
                  setFeedDuration={setFeedDuration}
                  targetSleepDuration={targetSleepDuration}
                  setTargetSleepDuration={setTargetSleepDuration}
                  momPreferredSleepStart={momPreferredSleepStart}
                  setMomPreferredSleepStart={setMomPreferredSleepStart}
                  dadPreferredSleepStart={dadPreferredSleepStart}
                  setDadPreferredSleepStart={setDadPreferredSleepStart}
                  allowOverlap={allowOverlap}
                  setAllowOverlap={setAllowOverlap}
                  showPredictions={showPredictions}
                  setShowPredictions={setShowPredictions}
                  autoSolveAllDays={autoSolveAllDays}
                  getTimeLabel={getTimeLabel}
                  resetAllData={resetAllData}
                  notificationsEnabled={notificationsEnabled}
                  setNotificationsEnabled={setNotificationsEnabled}
                  feedNotificationsEnabled={feedNotificationsEnabled}
                  setFeedNotificationsEnabled={setFeedNotificationsEnabled}
                  napNotificationsEnabled={napNotificationsEnabled}
                  setNapNotificationsEnabled={setNapNotificationsEnabled}
                  leadTimeMinutes={leadTimeMinutes}
                  setLeadTimeMinutes={setLeadTimeMinutes}
                  permissionStatus={permissionStatus}
                  sendTestNotification={() => sendTestNotification(babyProfile.name)}
                />
              </div>
            </div>

            {/* Main Content - Continuous Timeline */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 h-[calc(100vh-320px)] md:h-[calc(100vh-200px)]">
                <ContinuousTimeline
                  dailySchedules={dailySchedules}
                  birthDate={babyProfile.birthDate}
                  feedDuration={feedDuration}
                  deleteLoggedEvent={deleteLoggedEvent}
                  feedAmountUnit={feedAmountUnit}
                  showParents={showParents}
                  toggleParents={toggleParents}
                  getScheduleForDate={getScheduleForDate}
                  addBlock={addBlock}
                  removeBlock={removeBlock}
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === 'profile' && renderProfilePage()}
        {currentTab === 'history' && renderHistoryPage()}
        {currentTab === 'milestones' && <MilestonesPage />}
        {currentTab === 'doctor' && <DoctorVisitPage babyProfile={babyProfile} dailySchedules={dailySchedules} />}

      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        babyProfile={babyProfile}
        dailySchedules={dailySchedules}
        settings={getCurrentSettings()}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setPendingImportData(null);
        }}
        importData={pendingImportData}
        onImport={handleImportSharedData}
      />

      {/* Backup Modal */}
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        googleDrive={googleDrive}
        onBackup={handleGoogleDriveBackup}
        onRestore={handleGoogleDriveRestore}
      />

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
        />
      )}
    </div>
  );
};

export default BabyRhythm;
