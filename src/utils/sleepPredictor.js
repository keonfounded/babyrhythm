import { getDefaultsForAge } from '../constants/sleepDefaults';
import { getDateKey } from './dateHelpers';

/**
 * Calculate baby's age in weeks from birth date
 */
export const getAgeInWeeks = (birthDate) => {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now - birth;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
};

/**
 * Extract recent sleep events from dailySchedules (last N days)
 */
export const getRecentSleepEvents = (dailySchedules, days = 7) => {
  const events = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = getDateKey(d);
    const schedule = dailySchedules[dateKey];
    if (schedule && schedule.loggedEvents) {
      schedule.loggedEvents
        .filter(e => e.type === 'sleep')
        .forEach(e => events.push({ ...e, dateKey }));
    }
  }

  return events.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.startTime - b.startTime;
  });
};

/**
 * Calculate the baby's personal average wake window from logged data
 * Looks at gaps between sleep-end and next sleep-start
 */
export const getPersonalWakeWindow = (sleepEvents) => {
  const completed = sleepEvents.filter(e => e.endTime !== null);
  if (completed.length < 2) return null;

  const wakeWindows = [];
  for (let i = 0; i < completed.length - 1; i++) {
    const wakeUp = completed[i].endTime;
    const nextSleep = completed[i + 1].startTime;

    // Only count if same day or consecutive days make sense
    const isSameDay = completed[i].dateKey === completed[i + 1].dateKey;
    const gap = isSameDay
      ? nextSleep - wakeUp
      : (24 - wakeUp) + nextSleep;

    // Filter out unreasonable gaps (< 0.25h or > 8h)
    if (gap > 0.25 && gap < 8) {
      wakeWindows.push(gap);
    }
  }

  if (wakeWindows.length === 0) return null;

  return {
    average: wakeWindows.reduce((sum, w) => sum + w, 0) / wakeWindows.length,
    min: Math.min(...wakeWindows),
    max: Math.max(...wakeWindows),
    count: wakeWindows.length
  };
};

/**
 * Get the last time the baby woke up
 */
export const getLastWakeTime = (dailySchedules) => {
  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 86400000));

  // Check today first, then yesterday
  for (const dateKey of [today, yesterday]) {
    const schedule = dailySchedules[dateKey];
    if (!schedule || !schedule.loggedEvents) continue;

    const sleeps = schedule.loggedEvents
      .filter(e => e.type === 'sleep' && e.endTime !== null)
      .sort((a, b) => b.endTime - a.endTime);

    if (sleeps.length > 0) {
      return { time: sleeps[0].endTime, dateKey };
    }
  }

  return null;
};

/**
 * Main prediction function
 * Returns predicted next nap time and confidence info
 */
export const predictNextNap = (birthDate, dailySchedules) => {
  const ageInWeeks = getAgeInWeeks(birthDate);
  const defaults = getDefaultsForAge(ageInWeeks);
  const recentSleep = getRecentSleepEvents(dailySchedules, 7);
  const personalWW = getPersonalWakeWindow(recentSleep);
  const lastWake = getLastWakeTime(dailySchedules);

  // Determine the wake window to use
  let wakeWindow;
  let source;

  if (personalWW && personalWW.count >= 3) {
    // Blend personal data with age defaults (70% personal, 30% age)
    const ageAvg = (defaults.wakeWindow.min + defaults.wakeWindow.max) / 2;
    wakeWindow = personalWW.average * 0.7 + ageAvg * 0.3;
    source = 'personalized';
  } else {
    // Use midpoint of age-based range
    wakeWindow = (defaults.wakeWindow.min + defaults.wakeWindow.max) / 2;
    source = 'age-based';
  }

  // If we don't know when baby last woke up, give general guidance
  if (!lastWake) {
    return {
      predicted: null,
      wakeWindow: Math.round(wakeWindow * 100) / 100,
      source,
      ageDefaults: defaults,
      personalStats: personalWW,
      message: `Based on age, aim for ${wakeWindow.toFixed(1)}h wake windows`
    };
  }

  // Calculate predicted nap time
  const predictedHour = lastWake.time + wakeWindow;
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Is the predicted time in the past?
  const isPast = lastWake.dateKey === getDateKey(now) && predictedHour < currentHour;

  // Format the prediction
  const predHour = Math.floor(predictedHour % 24);
  const predMin = Math.round((predictedHour % 1) * 60);
  const predictedTimeStr = `${predHour}:${predMin.toString().padStart(2, '0')}`;

  // Minutes from now
  let minutesFromNow = null;
  if (lastWake.dateKey === getDateKey(now)) {
    minutesFromNow = Math.round((predictedHour - currentHour) * 60);
  }

  return {
    predicted: predictedHour,
    predictedTimeStr,
    wakeWindow: Math.round(wakeWindow * 100) / 100,
    lastWakeTime: lastWake.time,
    lastWakeDateKey: lastWake.dateKey,
    minutesFromNow,
    isPast,
    source,
    ageDefaults: defaults,
    personalStats: personalWW,
    message: isPast
      ? `Baby may be overtired — nap was expected around ${predictedTimeStr}`
      : minutesFromNow !== null
        ? `Next nap around ${predictedTimeStr} (~${minutesFromNow} min from now)`
        : `Next nap around ${predictedTimeStr}`
  };
};

/**
 * Get average nap duration from logged data
 */
export const getPersonalNapDuration = (sleepEvents) => {
  const completed = sleepEvents.filter(e => e.endTime !== null);
  if (completed.length === 0) return null;

  const durations = completed.map(e => e.endTime - e.startTime);
  return {
    average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    count: durations.length
  };
};

/**
 * Format hour (decimal) to time string
 */
const formatHourToTime = (hour) => {
  const h = Math.floor(hour % 24);
  const m = Math.round((hour % 1) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

/**
 * Predict naps for the next 24 hours
 *
 * Newborn cycle: Feed → Short wake → Sleep → Feed → Short wake → Sleep...
 * Sleep fills the gaps BETWEEN feeds to reach age-appropriate total sleep.
 *
 * Target daily sleep by age:
 * - 0-4 weeks: 15-17 hours
 * - 1-2 months: 14-16 hours
 * - 2-4 months: 13-15 hours
 * - 4-12 months: 12-14 hours
 */
export const predictRemainingDay = (birthDate, dailySchedules, predictedFeeds = []) => {
  const ageInWeeks = getAgeInWeeks(birthDate);
  const defaults = getDefaultsForAge(ageInWeeks);
  const recentSleep = getRecentSleepEvents(dailySchedules, 7);
  const personalWW = getPersonalWakeWindow(recentSleep);

  // Determine wake window (time awake AFTER feed before sleep)
  let wakeWindow;
  let source;
  if (personalWW && personalWW.count >= 3) {
    const ageAvg = (defaults.wakeWindow.min + defaults.wakeWindow.max) / 2;
    wakeWindow = personalWW.average * 0.7 + ageAvg * 0.3;
    source = 'personalized';
  } else {
    wakeWindow = (defaults.wakeWindow.min + defaults.wakeWindow.max) / 2;
    source = 'age-based';
  }

  // For newborns, wake window INCLUDES feeding time
  // Post-feed awake time is very short (15-30 min)
  const postFeedAwakeTime = ageInWeeks < 8 ? 0.25 : ageInWeeks < 16 ? 0.5 : wakeWindow * 0.4;

  // Target total daily sleep
  const targetDailySleep = (defaults.totalSleep.min + defaults.totalSleep.max) / 2;

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Combine logged feeds with predicted feeds
  const today = getDateKey(new Date());
  const todaySchedule = dailySchedules[today];
  const todayFeeds = todaySchedule?.loggedEvents
    ?.filter(e => e.type === 'feed')
    ?.map(f => ({
      startTime: f.startTime,
      endTime: f.endTime || f.startTime + 0.5,
      predicted: false
    })) || [];

  const allFeeds = [
    ...todayFeeds,
    ...predictedFeeds.map(f => ({
      startTime: f.startTime,
      endTime: f.endTime,
      predicted: true
    }))
  ].filter(f => f.startTime <= currentHour + 24)
   .sort((a, b) => a.startTime - b.startTime);

  // Check for active sleep (baby sleeping now)
  const activeSleep = todaySchedule?.loggedEvents
    ?.find(e => e.type === 'sleep' && e.endTime === null);

  // Generate sleep predictions between feeds
  const predictions = [];
  let napCount = 0;

  // For each feed, predict sleep that follows it (until next feed)
  for (let i = 0; i < allFeeds.length; i++) {
    const feed = allFeeds[i];
    const nextFeed = allFeeds[i + 1];

    // Sleep starts after feed ends + short awake time
    const sleepStart = feed.endTime + postFeedAwakeTime;

    // Skip if this sleep would be in the past
    if (sleepStart < currentHour - 0.5) continue;

    // Skip if baby is currently sleeping during this time
    if (activeSleep && sleepStart < activeSleep.startTime + 2) continue;

    // Sleep ends when next feed starts (baby wakes to feed)
    // Or after a reasonable duration if no next feed
    let sleepEnd;
    if (nextFeed) {
      // Wake up a bit before next feed
      sleepEnd = nextFeed.startTime;
    } else {
      // No next feed predicted - use typical nap duration
      const typicalNapDuration = ageInWeeks < 16 ? 1.5 : ageInWeeks < 36 ? 1.25 : 1.0;
      sleepEnd = sleepStart + typicalNapDuration;
    }

    // Minimum sleep duration of 30 min
    if (sleepEnd - sleepStart < 0.5) continue;

    // Cap individual sleep at reasonable duration (4h for newborns, less for older)
    const maxSleepDuration = ageInWeeks < 8 ? 4 : ageInWeeks < 16 ? 3 : 2.5;
    if (sleepEnd - sleepStart > maxSleepDuration) {
      sleepEnd = sleepStart + maxSleepDuration;
    }

    // Stop if beyond 24h window
    if (sleepStart > currentHour + 24) break;

    predictions.push({
      id: `predicted-nap-${napCount}`,
      type: 'sleep',
      startTime: sleepStart,
      endTime: sleepEnd,
      predicted: true,
      isBedtime: false,
      label: `Sleep ~${formatHourToTime(sleepStart)}`,
      duration: sleepEnd - sleepStart,
      source
    });

    napCount++;
  }

  // Calculate total predicted sleep
  const totalPredictedSleep = predictions.reduce((sum, p) => sum + (p.endTime - p.startTime), 0);

  return {
    predictions,
    wakeWindow,
    postFeedAwakeTime,
    targetDailySleep,
    totalPredictedSleep,
    source,
    ageDefaults: defaults
  };
};