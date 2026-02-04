import { useState, useEffect, useCallback, useRef } from 'react';
import {
  sendNotificationToSW,
  calculateNotificationDelay,
  formatFeedNotification,
  formatNapNotification,
  formatTestNotification,
  formatTimeFromDecimal
} from '../utils/notificationScheduler';

const STORAGE_KEY = 'babyRhythm_notificationSettings';

const DEFAULT_SETTINGS = {
  notificationsEnabled: false,
  feedNotificationsEnabled: true,
  napNotificationsEnabled: true,
  leadTimeMinutes: 10
};

/**
 * Get the current notification permission status
 */
const getPermissionStatus = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Hook for managing push notifications for predicted feed and nap times
 */
export const useNotifications = () => {
  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [permissionStatus, setPermissionStatus] = useState(getPermissionStatus);

  // Refs to track scheduled timeouts
  const feedTimeoutRef = useRef(null);
  const napTimeoutRef = useRef(null);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Update permission status when page regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setPermissionStatus(getPermissionStatus());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Request notification permission from the user
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      setPermissionStatus(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, []);

  // Clear existing scheduled notifications
  const clearScheduledNotifications = useCallback(() => {
    if (feedTimeoutRef.current) {
      clearTimeout(feedTimeoutRef.current);
      feedTimeoutRef.current = null;
    }
    if (napTimeoutRef.current) {
      clearTimeout(napTimeoutRef.current);
      napTimeoutRef.current = null;
    }
  }, []);

  // Schedule notifications based on predictions
  const scheduleNotifications = useCallback((feedPrediction, napPrediction, babyName = 'Baby') => {
    // Clear any existing scheduled notifications
    clearScheduledNotifications();

    // Don't schedule if notifications are disabled or permission not granted
    if (!settings.notificationsEnabled || permissionStatus !== 'granted') {
      return;
    }

    const { leadTimeMinutes, feedNotificationsEnabled, napNotificationsEnabled } = settings;

    // Schedule feed notification
    if (feedNotificationsEnabled && feedPrediction?.minutesFromNow != null) {
      const delay = calculateNotificationDelay(feedPrediction.minutesFromNow, leadTimeMinutes);

      if (delay > 0) {
        const predictedTimeStr = feedPrediction.predictedTimeStr ||
          formatTimeFromDecimal(feedPrediction.predicted);

        feedTimeoutRef.current = setTimeout(() => {
          const { title, body, tag } = formatFeedNotification(leadTimeMinutes, predictedTimeStr, babyName);
          sendNotificationToSW(title, body, tag, { type: 'feed' });
        }, delay);
      }
    }

    // Schedule nap notification
    if (napNotificationsEnabled && napPrediction?.minutesFromNow != null && !napPrediction.isPast) {
      const delay = calculateNotificationDelay(napPrediction.minutesFromNow, leadTimeMinutes);

      if (delay > 0) {
        const predictedTimeStr = napPrediction.predictedTimeStr ||
          formatTimeFromDecimal(napPrediction.predicted);

        napTimeoutRef.current = setTimeout(() => {
          const { title, body, tag } = formatNapNotification(leadTimeMinutes, predictedTimeStr, babyName);
          sendNotificationToSW(title, body, tag, { type: 'nap' });
        }, delay);
      }
    }
  }, [settings, permissionStatus, clearScheduledNotifications]);

  // Send a test notification
  const sendTestNotification = useCallback(async (babyName = 'Baby') => {
    if (permissionStatus !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        return false;
      }
    }

    const { title, body, tag } = formatTestNotification(babyName);
    return sendNotificationToSW(title, body, tag, { type: 'test' });
  }, [permissionStatus, requestPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearScheduledNotifications();
  }, [clearScheduledNotifications]);

  // Toggle main notifications enabled
  const setNotificationsEnabled = useCallback(async (enabled) => {
    if (enabled && permissionStatus === 'default') {
      const result = await requestPermission();
      if (result !== 'granted') {
        return; // Don't enable if permission denied
      }
    }

    setSettings(prev => ({ ...prev, notificationsEnabled: enabled }));
  }, [permissionStatus, requestPermission]);

  // Toggle feed notifications
  const setFeedNotificationsEnabled = useCallback((enabled) => {
    setSettings(prev => ({ ...prev, feedNotificationsEnabled: enabled }));
  }, []);

  // Toggle nap notifications
  const setNapNotificationsEnabled = useCallback((enabled) => {
    setSettings(prev => ({ ...prev, napNotificationsEnabled: enabled }));
  }, []);

  // Set lead time
  const setLeadTimeMinutes = useCallback((minutes) => {
    setSettings(prev => ({ ...prev, leadTimeMinutes: minutes }));
  }, []);

  return {
    // Settings
    notificationsEnabled: settings.notificationsEnabled,
    feedNotificationsEnabled: settings.feedNotificationsEnabled,
    napNotificationsEnabled: settings.napNotificationsEnabled,
    leadTimeMinutes: settings.leadTimeMinutes,

    // Permission status
    permissionStatus,

    // Actions
    requestPermission,
    setNotificationsEnabled,
    setFeedNotificationsEnabled,
    setNapNotificationsEnabled,
    setLeadTimeMinutes,
    scheduleNotifications,
    clearScheduledNotifications,
    sendTestNotification
  };
};
