/**
 * Show a notification - tries service worker first, falls back to direct Notification API
 */
export const sendNotificationToSW = async (title, body, tag, data = {}) => {
  // Check if notifications are supported and permitted
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  // Try to use service worker for better background support
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Use showNotification directly on the registration for reliability
      await registration.showNotification(title, {
        body,
        tag,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        data,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        renotify: true
      });
      return true;
    } catch (error) {
      console.warn('Service worker notification failed, using fallback:', error);
    }
  }

  // Fallback: Use direct Notification API
  try {
    new Notification(title, {
      body,
      tag,
      icon: '/icons/icon-192.png'
    });
    return true;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return false;
  }
};

/**
 * Calculate delay in milliseconds for scheduling a notification
 * @param {number} minutesFromNow - When the predicted event occurs (from predictor)
 * @param {number} leadTimeMinutes - How many minutes before the event to notify
 * @returns {number} Delay in milliseconds, or -1 if the notification time has passed
 */
export const calculateNotificationDelay = (minutesFromNow, leadTimeMinutes) => {
  const notifyMinutesFromNow = minutesFromNow - leadTimeMinutes;

  // If notification time has already passed, return -1
  if (notifyMinutesFromNow <= 0) {
    return -1;
  }

  return notifyMinutesFromNow * 60 * 1000;
};

/**
 * Format feed notification content
 * @param {number} minutesUntilFeed - Minutes until the predicted feed time
 * @param {string} predictedTimeStr - Formatted time string (e.g., "14:30")
 * @param {string} babyName - Baby's name for personalized notification
 * @returns {{ title: string, body: string, tag: string }}
 */
export const formatFeedNotification = (minutesUntilFeed, predictedTimeStr, babyName = 'Baby') => {
  const mins = Math.round(minutesUntilFeed);
  const name = babyName || 'Baby';

  if (mins <= 1) {
    return {
      title: `🍼 Feed Time for ${name}`,
      body: `It's feeding time! Predicted around ${predictedTimeStr}`,
      tag: 'babyrhythm-feed'
    };
  }

  return {
    title: `🍼 ${name}'s Feed Coming Up`,
    body: `Get ready - next feed in about ${mins} minutes (~${predictedTimeStr})`,
    tag: 'babyrhythm-feed'
  };
};

/**
 * Format nap notification content
 * @param {number} minutesUntilNap - Minutes until the predicted nap time
 * @param {string} predictedTimeStr - Formatted time string (e.g., "14:30")
 * @param {string} babyName - Baby's name for personalized notification
 * @returns {{ title: string, body: string, tag: string }}
 */
export const formatNapNotification = (minutesUntilNap, predictedTimeStr, babyName = 'Baby') => {
  const mins = Math.round(minutesUntilNap);
  const name = babyName || 'Baby';

  if (mins <= 1) {
    return {
      title: `😴 Nap Time for ${name}`,
      body: `${name} might be getting sleepy! Watch for tired signs.`,
      tag: 'babyrhythm-nap'
    };
  }

  return {
    title: `😴 ${name}'s Nap Coming Up`,
    body: `Start winding down - ${name} may be ready for a nap in ~${mins} minutes (${predictedTimeStr})`,
    tag: 'babyrhythm-nap'
  };
};

/**
 * Format a test notification
 * @param {string} babyName - Baby's name
 * @returns {{ title: string, body: string, tag: string }}
 */
export const formatTestNotification = (babyName = 'Baby') => {
  const name = babyName || 'Baby';
  return {
    title: `✅ BabyRhythm Notifications Active`,
    body: `You'll receive reminders for ${name}'s feeds and naps!`,
    tag: 'babyrhythm-test'
  };
};

/**
 * Format time from decimal hours to HH:MM string
 * @param {number} decimalHours - Time in decimal hours (e.g., 14.5 for 14:30)
 * @returns {string} Formatted time string
 */
export const formatTimeFromDecimal = (decimalHours) => {
  const hours = Math.floor(decimalHours % 24);
  const minutes = Math.round((decimalHours % 1) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};
