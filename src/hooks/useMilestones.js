import { useState, useCallback } from 'react';
import { getDateKey } from '../utils/dateHelpers';

const STORAGE_KEY = 'babyRhythm_milestones';

/**
 * Hook for managing baby milestones
 * Stores achieved milestones with dates and notes
 */
export const useMilestones = () => {
  const [milestones, setMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customMilestones, setCustomMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_custom');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever milestones change
  const saveMilestones = useCallback((newMilestones) => {
    setMilestones(newMilestones);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMilestones));
    } catch {}
  }, []);

  const saveCustomMilestones = useCallback((newCustom) => {
    setCustomMilestones(newCustom);
    try {
      localStorage.setItem(STORAGE_KEY + '_custom', JSON.stringify(newCustom));
    } catch {}
  }, []);

  /**
   * Check if a milestone is achieved
   */
  const isAchieved = useCallback((milestoneId) => {
    return milestones[milestoneId]?.achieved === true;
  }, [milestones]);

  /**
   * Get milestone data
   */
  const getMilestoneData = useCallback((milestoneId) => {
    return milestones[milestoneId] || { achieved: false, date: null, note: '' };
  }, [milestones]);

  /**
   * Toggle milestone achievement
   */
  const toggleMilestone = useCallback((milestoneId) => {
    const current = milestones[milestoneId];
    const isCurrentlyAchieved = current?.achieved === true;

    if (isCurrentlyAchieved) {
      // Unmark as achieved
      const updated = { ...milestones };
      delete updated[milestoneId];
      saveMilestones(updated);
    } else {
      // Mark as achieved with today's date
      saveMilestones({
        ...milestones,
        [milestoneId]: {
          achieved: true,
          date: getDateKey(new Date()),
          note: ''
        }
      });
    }
  }, [milestones, saveMilestones]);

  /**
   * Update milestone date
   */
  const updateMilestoneDate = useCallback((milestoneId, date) => {
    if (!milestones[milestoneId]) return;

    saveMilestones({
      ...milestones,
      [milestoneId]: {
        ...milestones[milestoneId],
        date
      }
    });
  }, [milestones, saveMilestones]);

  /**
   * Update milestone note
   */
  const updateMilestoneNote = useCallback((milestoneId, note) => {
    if (!milestones[milestoneId]) return;

    saveMilestones({
      ...milestones,
      [milestoneId]: {
        ...milestones[milestoneId],
        note
      }
    });
  }, [milestones, saveMilestones]);

  /**
   * Update milestone with full data
   */
  const updateMilestone = useCallback((milestoneId, data) => {
    saveMilestones({
      ...milestones,
      [milestoneId]: {
        ...milestones[milestoneId],
        ...data
      }
    });
  }, [milestones, saveMilestones]);

  /**
   * Add a custom milestone
   */
  const addCustomMilestone = useCallback((label, category = 'motor') => {
    const id = `custom_${Date.now()}`;
    const newMilestone = {
      id,
      label,
      category,
      typicalAge: 'Custom',
      isCustom: true
    };
    saveCustomMilestones([...customMilestones, newMilestone]);
    return id;
  }, [customMilestones, saveCustomMilestones]);

  /**
   * Remove a custom milestone
   */
  const removeCustomMilestone = useCallback((milestoneId) => {
    // Remove from custom milestones list
    saveCustomMilestones(customMilestones.filter(m => m.id !== milestoneId));

    // Also remove any achievement data
    if (milestones[milestoneId]) {
      const updated = { ...milestones };
      delete updated[milestoneId];
      saveMilestones(updated);
    }
  }, [customMilestones, milestones, saveCustomMilestones, saveMilestones]);

  /**
   * Get count of achieved milestones in a category
   */
  const getCategoryProgress = useCallback((categoryMilestones) => {
    const achieved = categoryMilestones.filter(m => milestones[m.id]?.achieved).length;
    return {
      achieved,
      total: categoryMilestones.length,
      percentage: categoryMilestones.length > 0
        ? Math.round((achieved / categoryMilestones.length) * 100)
        : 0
    };
  }, [milestones]);

  /**
   * Get total progress across all milestones
   */
  const getTotalProgress = useCallback((allMilestones) => {
    const total = allMilestones.length + customMilestones.length;
    const achieved = Object.values(milestones).filter(m => m.achieved).length;
    return {
      achieved,
      total,
      percentage: total > 0 ? Math.round((achieved / total) * 100) : 0
    };
  }, [milestones, customMilestones]);

  return {
    milestones,
    customMilestones,
    isAchieved,
    getMilestoneData,
    toggleMilestone,
    updateMilestoneDate,
    updateMilestoneNote,
    updateMilestone,
    addCustomMilestone,
    removeCustomMilestone,
    getCategoryProgress,
    getTotalProgress
  };
};
