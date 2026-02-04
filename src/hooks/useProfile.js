import { useState } from 'react';
import { getDateKey } from '../utils/dateHelpers';

export const useProfile = () => {
  // Check if onboarding is completed
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    try {
      return localStorage.getItem('babyRhythm_onboardingComplete') === 'true';
    } catch { return false; }
  });

  const [babyProfile, setBabyProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('babyRhythm_babyProfile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [editingProfile, setEditingProfile] = useState(null);

  const getCurrentWeight = (profile) => {
    if (!profile || !profile.weightHistory || profile.weightHistory.length === 0) return 0;
    const sorted = [...profile.weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].weight;
  };

  const getCurrentWeightDate = (profile) => {
    if (!profile || !profile.weightHistory || profile.weightHistory.length === 0) return null;
    const sorted = [...profile.weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].date;
  };

  const startEditingProfile = () => {
    if (babyProfile) {
      setEditingProfile({ ...babyProfile });
    }
  };

  const cancelEditingProfile = () => {
    setEditingProfile(null);
  };

  const saveProfile = () => {
    if (!editingProfile) return;

    const sortedHistory = [...(editingProfile.weightHistory || [])].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    const updated = {
      ...editingProfile,
      weightHistory: sortedHistory
    };
    setBabyProfile(updated);
    try { localStorage.setItem('babyRhythm_babyProfile', JSON.stringify(updated)); } catch {}
    setEditingProfile(null);
  };

  // Called from onboarding wizard
  const completeOnboarding = (profile) => {
    setBabyProfile(profile);
    setOnboardingComplete(true);
    try {
      localStorage.setItem('babyRhythm_babyProfile', JSON.stringify(profile));
      localStorage.setItem('babyRhythm_onboardingComplete', 'true');
    } catch {}
  };

  // Reset all data
  const resetAllData = () => {
    if (!confirm('This will delete ALL your data including logged events, settings, and profile. This cannot be undone. Continue?')) {
      return false;
    }

    try {
      // Clear all babyRhythm keys
      const keys = Object.keys(localStorage).filter(k => k.startsWith('babyRhythm_'));
      keys.forEach(k => localStorage.removeItem(k));

      // Also clear old sleepTreaty keys
      const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('sleepTreaty_'));
      oldKeys.forEach(k => localStorage.removeItem(k));
    } catch {}

    // Reset state
    setBabyProfile(null);
    setOnboardingComplete(false);
    setEditingProfile(null);

    // Reload the page to reset all state
    window.location.reload();
    return true;
  };

  // Load demo data (profile, schedules, milestones)
  const loadDemoData = (demoData) => {
    const { profile, dailySchedules, milestones } = demoData;

    try {
      // Save all data to localStorage first
      localStorage.setItem('babyRhythm_babyProfile', JSON.stringify(profile));
      localStorage.setItem('babyRhythm_onboardingComplete', 'true');
      localStorage.setItem('babyRhythm_dailySchedules', JSON.stringify(dailySchedules));
      localStorage.setItem('babyRhythm_milestones', JSON.stringify(milestones));
      localStorage.setItem('babyRhythm_isDemo', 'true');
      localStorage.setItem('babyRhythm_tutorialShown', 'false'); // Show tutorial for demo
    } catch (e) {
      console.error('Failed to save demo data:', e);
      return;
    }

    // Small delay to ensure localStorage is written, then reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const addWeightEntry = () => {
    if (!editingProfile) return;

    const today = getDateKey(new Date());
    const currentWeight = getCurrentWeight(editingProfile);
    const newEntry = {
      date: today,
      weight: currentWeight ? currentWeight + 0.1 : 3.0,
      note: ""
    };

    setEditingProfile({
      ...editingProfile,
      weightHistory: [...(editingProfile.weightHistory || []), newEntry]
    });
  };

  const removeWeightEntry = (index) => {
    if (!editingProfile) return;

    setEditingProfile({
      ...editingProfile,
      weightHistory: (editingProfile.weightHistory || []).filter((_, i) => i !== index)
    });
  };

  const updateWeightEntry = (index, field, value) => {
    if (!editingProfile) return;

    const updated = [...(editingProfile.weightHistory || [])];
    updated[index] = { ...updated[index], [field]: value };

    setEditingProfile({
      ...editingProfile,
      weightHistory: updated
    });
  };

  const updateEditingProfile = (updates) => {
    if (!editingProfile) return;
    setEditingProfile({ ...editingProfile, ...updates });
  };

  return {
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
  };
};
