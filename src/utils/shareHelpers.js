/**
 * Utilities for sharing baby data via QR code or link
 */

const SHARE_VERSION = 2;
const BASE_URL = 'https://babyrhythm.vercel.app';

/**
 * Compress and encode data for sharing
 * Uses base64 encoding with URL-safe characters
 */
export const encodeShareData = (data) => {
  try {
    const payload = {
      v: SHARE_VERSION,
      t: 'share',
      ts: Date.now(),
      d: data
    };

    const jsonString = JSON.stringify(payload);
    // Use encodeURIComponent to handle special characters, then base64
    const base64 = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode('0x' + p1)
    ));
    // Make URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Error encoding share data:', error);
    return null;
  }
};

/**
 * Decode shared data from URL-safe base64
 */
export const decodeShareData = (encoded) => {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const jsonString = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    const payload = JSON.parse(jsonString);

    // Validate payload
    if (payload.v !== SHARE_VERSION) {
      console.warn('Share data version mismatch');
    }
    if (payload.t !== 'share') {
      throw new Error('Invalid share data type');
    }

    return payload.d;
  } catch (error) {
    console.error('Error decoding share data:', error);
    return null;
  }
};

/**
 * Generate a share URL with the encoded data
 */
export const generateShareUrl = (profile, schedules, settings) => {
  const data = {
    profile: {
      name: profile.name,
      birthDate: profile.birthDate,
      sex: profile.sex,
      weightUnit: profile.weightUnit,
      feedingType: profile.feedingType,
      weightHistory: profile.weightHistory,
      pediatrician: profile.pediatrician,
      allergies: profile.allergies,
      medications: profile.medications
    },
    schedules: schedules,
    settings: settings
  };

  const encoded = encodeShareData(data);
  if (!encoded) return null;

  return `${BASE_URL}/#share=${encoded}`;
};

/**
 * Check if current URL contains share data
 */
export const getShareDataFromUrl = () => {
  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return null;

  const encoded = hash.slice(7); // Remove '#share='
  return decodeShareData(encoded);
};

/**
 * Clear share data from URL without page reload
 */
export const clearShareFromUrl = () => {
  if (window.location.hash.startsWith('#share=')) {
    history.replaceState(null, '', window.location.pathname);
  }
};

/**
 * Merge imported schedules with existing ones
 * Mode: 'merge' - skip duplicates, 'replace' - overwrite all
 */
export const mergeSchedules = (existingSchedules, importedSchedules, mode = 'merge') => {
  if (mode === 'replace') {
    return { ...importedSchedules };
  }

  // Merge mode - combine, preferring imported for same dates
  const merged = { ...existingSchedules };

  Object.entries(importedSchedules).forEach(([dateKey, schedule]) => {
    if (!merged[dateKey]) {
      // New date, just add it
      merged[dateKey] = schedule;
    } else {
      // Existing date - merge events
      const existingEvents = merged[dateKey].loggedEvents || [];
      const importedEvents = schedule.loggedEvents || [];

      // Create a set of existing event IDs to check for duplicates
      const existingIds = new Set(existingEvents.map(e => e.id));

      // Add imported events that don't already exist
      const newEvents = importedEvents.filter(e => !existingIds.has(e.id));

      merged[dateKey] = {
        ...merged[dateKey],
        loggedEvents: [...existingEvents, ...newEvents]
      };
    }
  });

  return merged;
};

/**
 * Calculate approximate size of share data in characters
 */
export const getShareDataSize = (profile, schedules) => {
  const data = { profile, schedules };
  const encoded = encodeShareData(data);
  return encoded ? encoded.length : 0;
};

/**
 * Check if share data is too large for QR code (max ~2000 chars for reliable scanning)
 */
export const isShareDataTooLarge = (profile, schedules) => {
  const size = getShareDataSize(profile, schedules);
  return size > 2000;
};

/**
 * Trim schedules to last N days to reduce size
 */
export const trimSchedulesToDays = (schedules, days = 14) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffKey = cutoff.toISOString().split('T')[0];

  const trimmed = {};
  Object.entries(schedules).forEach(([dateKey, schedule]) => {
    if (dateKey >= cutoffKey) {
      trimmed[dateKey] = schedule;
    }
  });

  return trimmed;
};
