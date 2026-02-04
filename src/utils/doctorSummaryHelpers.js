import { getDateKey, calculateAge } from './dateHelpers';
import { calculatePercentile, convertToKg } from './growthHelpers';

/**
 * Get events for a date range
 */
const getEventsInRange = (dailySchedules, startDate, endDate) => {
  const events = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  Object.entries(dailySchedules).forEach(([dateKey, schedule]) => {
    const date = new Date(dateKey + 'T00:00:00');
    if (date >= start && date <= end && schedule.loggedEvents) {
      schedule.loggedEvents.forEach(event => {
        events.push({ ...event, dateKey, date });
      });
    }
  });

  return events.sort((a, b) => a.date - b.date);
};

/**
 * Calculate sleep summary for a period
 */
const calculateSleepSummary = (events) => {
  const sleepEvents = events.filter(e => e.type === 'sleep' && e.endTime);

  if (sleepEvents.length === 0) {
    return {
      totalSessions: 0,
      totalHours: 0,
      avgHoursPerDay: 0,
      avgDurationPerSession: 0,
      longestStretch: 0
    };
  }

  const durations = sleepEvents.map(e => e.endTime - e.startTime);
  const totalHours = durations.reduce((sum, d) => sum + d, 0);

  // Group by day to get average per day
  const dayGroups = {};
  sleepEvents.forEach(e => {
    if (!dayGroups[e.dateKey]) dayGroups[e.dateKey] = 0;
    dayGroups[e.dateKey] += e.endTime - e.startTime;
  });
  const daysWithSleep = Object.keys(dayGroups).length;

  return {
    totalSessions: sleepEvents.length,
    totalHours: totalHours,
    avgHoursPerDay: daysWithSleep > 0 ? totalHours / daysWithSleep : 0,
    avgDurationPerSession: totalHours / sleepEvents.length,
    longestStretch: Math.max(...durations)
  };
};

/**
 * Calculate feeding summary for a period
 */
const calculateFeedSummary = (events) => {
  const feedEvents = events.filter(e => e.type === 'feed');

  if (feedEvents.length === 0) {
    return {
      totalFeeds: 0,
      totalAmount: 0,
      avgAmount: 0,
      avgFeedsPerDay: 0,
      avgInterval: 0
    };
  }

  const feedsWithAmount = feedEvents.filter(e => e.amount && e.amount > 0);
  const totalAmount = feedsWithAmount.reduce((sum, e) => sum + e.amount, 0);

  // Group by day
  const dayGroups = {};
  feedEvents.forEach(e => {
    if (!dayGroups[e.dateKey]) dayGroups[e.dateKey] = 0;
    dayGroups[e.dateKey]++;
  });
  const daysWithFeeds = Object.keys(dayGroups).length;

  // Calculate average interval between feeds
  let totalInterval = 0;
  let intervalCount = 0;
  for (let i = 1; i < feedEvents.length; i++) {
    if (feedEvents[i].dateKey === feedEvents[i - 1].dateKey) {
      const interval = feedEvents[i].startTime - feedEvents[i - 1].startTime;
      if (interval > 0 && interval < 12) { // Filter out unrealistic intervals
        totalInterval += interval;
        intervalCount++;
      }
    }
  }

  return {
    totalFeeds: feedEvents.length,
    totalAmount: totalAmount,
    avgAmount: feedsWithAmount.length > 0 ? totalAmount / feedsWithAmount.length : 0,
    avgFeedsPerDay: daysWithFeeds > 0 ? feedEvents.length / daysWithFeeds : 0,
    avgInterval: intervalCount > 0 ? totalInterval / intervalCount : 0
  };
};

/**
 * Calculate diaper summary for a period
 */
const calculateDiaperSummary = (events) => {
  const diaperEvents = events.filter(e => e.type === 'diaper');

  if (diaperEvents.length === 0) {
    return {
      total: 0,
      wet: 0,
      dirty: 0,
      both: 0,
      avgPerDay: 0
    };
  }

  const wet = diaperEvents.filter(e => e.diaperType === 'wet').length;
  const dirty = diaperEvents.filter(e => e.diaperType === 'dirty').length;
  const both = diaperEvents.filter(e => e.diaperType === 'both').length;

  // Group by day
  const daysWithDiapers = new Set(diaperEvents.map(e => e.dateKey)).size;

  return {
    total: diaperEvents.length,
    wet,
    dirty,
    both,
    avgPerDay: daysWithDiapers > 0 ? diaperEvents.length / daysWithDiapers : 0
  };
};

/**
 * Get recent notes
 */
const getRecentNotes = (events, limit = 5) => {
  return events
    .filter(e => e.type === 'note' && e.note)
    .slice(-limit)
    .reverse()
    .map(e => ({
      date: e.dateKey,
      note: e.note
    }));
};

/**
 * Generate complete doctor visit summary
 */
export const generateDoctorSummary = (babyProfile, dailySchedules, weeksBack = 2) => {
  if (!babyProfile) return null;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeksBack * 7));

  const events = getEventsInRange(dailySchedules, startDate, endDate);
  const babyAge = calculateAge(babyProfile.birthDate);

  // Get current weight and percentile
  let currentWeight = null;
  let percentile = null;

  if (babyProfile.weightHistory && babyProfile.weightHistory.length > 0) {
    const sorted = [...babyProfile.weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    currentWeight = sorted[0].weight;

    // Convert to kg if needed for percentile calculation
    const weightKg = babyProfile.weightUnit === 'lbs'
      ? convertToKg(currentWeight, 'lbs')
      : currentWeight;

    percentile = calculatePercentile(weightKg, babyAge.totalDays, babyProfile.sex || 'boy');
  }

  return {
    baby: {
      name: babyProfile.name,
      birthDate: babyProfile.birthDate,
      sex: babyProfile.sex || 'boy',
      age: babyAge,
      currentWeight,
      weightUnit: babyProfile.weightUnit || 'kg',
      percentile,
      feedingType: babyProfile.feedingType
    },
    period: {
      start: getDateKey(startDate),
      end: getDateKey(endDate),
      days: weeksBack * 7
    },
    sleep: calculateSleepSummary(events),
    feeds: calculateFeedSummary(events),
    diapers: calculateDiaperSummary(events),
    notes: getRecentNotes(events),
    medical: {
      pediatrician: babyProfile.pediatrician,
      allergies: babyProfile.allergies,
      medications: babyProfile.medications
    }
  };
};

/**
 * Format time in hours to readable string
 */
export const formatHours = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
