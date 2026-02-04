import { getAgeInWeeks } from './sleepPredictor';
import { getDateKey } from './dateHelpers';

/**
 * Age-based feeding intervals (hours between feeds)
 *
 * Sources:
 * - American Academy of Pediatrics (AAP): https://www.aap.org
 * - WHO infant feeding guidelines
 * - "Healthy Sleep Habits, Happy Child" by Dr. Marc Weissbluth
 *
 * Newborns (0-4 weeks): Feed on demand, typically every 1.5-3 hours (8-12 feeds/day)
 * - Small stomach capacity (~1-2 oz) requires frequent feeding
 * - Breastfed babies may feed more frequently than formula-fed
 *
 * 1-4 months: Every 2.5-4 hours (5-8 feeds/day)
 * - Stomach capacity increases, can take more per feed
 *
 * 4+ months: Every 3.5-5 hours (4-6 feeds/day)
 * - May start solids, milk feeds become more spaced
 */
export const FEED_DEFAULTS_BY_AGE = [
  { minWeeks: 0,  maxWeeks: 2,  interval: { min: 1.5, max: 2.5 }, feedsPerDay: { min: 8, max: 12 }, label: 'Newborn (0-2w)' },
  { minWeeks: 2,  maxWeeks: 4,  interval: { min: 2,   max: 3   }, feedsPerDay: { min: 8, max: 10 }, label: 'Newborn (2-4w)' },
  { minWeeks: 4,  maxWeeks: 8,  interval: { min: 2.5, max: 3.5 }, feedsPerDay: { min: 6, max: 8  }, label: '1-2 months' },
  { minWeeks: 8,  maxWeeks: 16, interval: { min: 3,   max: 4   }, feedsPerDay: { min: 5, max: 7  }, label: '2-4 months' },
  { minWeeks: 16, maxWeeks: 28, interval: { min: 3.5, max: 4.5 }, feedsPerDay: { min: 4, max: 6  }, label: '4-7 months' },
  { minWeeks: 28, maxWeeks: 52, interval: { min: 4,   max: 5   }, feedsPerDay: { min: 4, max: 5  }, label: '7-12 months' },
  { minWeeks: 52, maxWeeks: 104, interval: { min: 4,  max: 6   }, feedsPerDay: { min: 3, max: 4  }, label: '1-2 years' },
];

/**
 * Get feed defaults for a given age in weeks
 */
export const getFeedDefaultsForAge = (ageInWeeks) => {
  const match = FEED_DEFAULTS_BY_AGE.find(
    range => ageInWeeks >= range.minWeeks && ageInWeeks < range.maxWeeks
  );
  return match || FEED_DEFAULTS_BY_AGE[FEED_DEFAULTS_BY_AGE.length - 1];
};

/**
 * Extract recent feed events from dailySchedules (last N days)
 */
export const getRecentFeedEvents = (dailySchedules, days = 7) => {
  const events = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = getDateKey(d);
    const schedule = dailySchedules[dateKey];
    if (schedule && schedule.loggedEvents) {
      schedule.loggedEvents
        .filter(e => e.type === 'feed')
        .forEach(e => events.push({ ...e, dateKey }));
    }
  }

  return events.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.startTime - b.startTime;
  });
};

/**
 * Calculate personal average feed interval from logged data
 */
export const getPersonalFeedInterval = (feedEvents) => {
  if (feedEvents.length < 2) return null;

  const intervals = [];
  for (let i = 0; i < feedEvents.length - 1; i++) {
    const current = feedEvents[i];
    const next = feedEvents[i + 1];

    const isSameDay = current.dateKey === next.dateKey;
    const gap = isSameDay
      ? next.startTime - current.startTime
      : (24 - current.startTime) + next.startTime;

    // Filter out unreasonable gaps (< 1h or > 8h)
    if (gap >= 1 && gap <= 8) {
      intervals.push(gap);
    }
  }

  if (intervals.length === 0) return null;

  return {
    average: intervals.reduce((sum, i) => sum + i, 0) / intervals.length,
    min: Math.min(...intervals),
    max: Math.max(...intervals),
    count: intervals.length
  };
};

/**
 * Calculate personal average feed duration from logged data
 */
export const getPersonalFeedDuration = (feedEvents) => {
  // Filter feeds that have an endTime (duration events)
  const withDuration = feedEvents.filter(e => e.endTime && e.endTime > e.startTime);
  if (withDuration.length === 0) return null;

  const durations = withDuration.map(e => e.endTime - e.startTime);
  return {
    average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    min: Math.min(...durations),
    max: Math.max(...durations),
    count: durations.length
  };
};

/**
 * Get the last feed time
 */
export const getLastFeedTime = (dailySchedules) => {
  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 86400000));

  for (const dateKey of [today, yesterday]) {
    const schedule = dailySchedules[dateKey];
    if (!schedule || !schedule.loggedEvents) continue;

    const feeds = schedule.loggedEvents
      .filter(e => e.type === 'feed')
      .sort((a, b) => b.startTime - a.startTime);

    if (feeds.length > 0) {
      return { time: feeds[0].startTime, dateKey, event: feeds[0] };
    }
  }

  return null;
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
 * Predict feeds for the next 24 hours
 * Returns array of predicted feed events
 */
export const predictRemainingFeeds = (birthDate, dailySchedules, defaultFeedDuration = 0.5) => {
  const ageInWeeks = getAgeInWeeks(birthDate);
  const defaults = getFeedDefaultsForAge(ageInWeeks);
  const recentFeeds = getRecentFeedEvents(dailySchedules, 7);
  const personalInterval = getPersonalFeedInterval(recentFeeds);
  const personalDuration = getPersonalFeedDuration(recentFeeds);

  // Determine feed interval (blend personal + age-based)
  // Then clamp to safe range (within 10% of age guidelines)
  const safeMin = defaults.interval.min * 0.9;
  const safeMax = defaults.interval.max * 1.1;

  let feedInterval;
  let source;
  if (personalInterval && personalInterval.count >= 5) {
    const ageAvg = (defaults.interval.min + defaults.interval.max) / 2;
    const blended = personalInterval.average * 0.7 + ageAvg * 0.3;
    // Clamp to safe range
    feedInterval = Math.max(safeMin, Math.min(safeMax, blended));
    source = 'personalized';
  } else {
    feedInterval = (defaults.interval.min + defaults.interval.max) / 2;
    source = 'age-based';
  }

  // Determine feed duration (learn from data or use default)
  let feedDuration;
  if (personalDuration && personalDuration.count >= 3) {
    feedDuration = personalDuration.average;
  } else {
    feedDuration = defaultFeedDuration;
  }

  // Find the most recent feed (today or yesterday)
  const lastFeed = getLastFeedTime(dailySchedules);

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  let startFrom;
  if (lastFeed) {
    // Calculate hours since last feed
    const isToday = lastFeed.dateKey === getDateKey(now);
    if (isToday) {
      startFrom = lastFeed.time;
    } else {
      // Last feed was yesterday - convert to "hours ago"
      startFrom = lastFeed.time - 24; // negative means yesterday
    }
  } else {
    // No feeds logged — assume last feed was at current time minus interval
    startFrom = currentHour - feedInterval;
  }

  // Generate predictions for next 24 hours
  const predictions = [];
  let cursor = startFrom;
  let feedCount = 0;
  const maxFeeds = 15; // Safety limit

  while (feedCount < maxFeeds) {
    const nextFeedStart = cursor + feedInterval;
    const nextFeedEnd = nextFeedStart + feedDuration;

    // Stop if more than 24 hours from now
    if (nextFeedStart > currentHour + 24) break;

    // Only include future predictions (with small buffer for "about to happen")
    if (nextFeedStart > currentHour - 0.25) {
      predictions.push({
        id: `predicted-feed-${feedCount}`,
        type: 'feed',
        startTime: nextFeedStart,
        endTime: nextFeedEnd,
        predicted: true,
        label: `Feed ~${formatHourToTime(nextFeedStart)}`,
        source
      });
    }

    cursor = nextFeedStart;
    feedCount++;
  }

  return {
    predictions,
    feedInterval,
    source,
    ageDefaults: defaults,
    personalStats: personalInterval
  };
};

/**
 * Predict next single feed (for quick display)
 */
export const predictNextFeed = (birthDate, dailySchedules) => {
  const result = predictRemainingFeeds(birthDate, dailySchedules);

  if (result.predictions.length === 0) {
    return {
      predicted: null,
      feedInterval: result.feedInterval,
      source: result.source,
      message: 'No more feeds predicted for today'
    };
  }

  const next = result.predictions[0];
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const minutesFromNow = Math.round((next.startTime - currentHour) * 60);

  return {
    predicted: next.startTime,
    predictedTimeStr: formatHourToTime(next.startTime),
    feedInterval: result.feedInterval,
    minutesFromNow,
    source: result.source,
    message: `Next feed around ${formatHourToTime(next.startTime)} (~${minutesFromNow} min)`
  };
};
