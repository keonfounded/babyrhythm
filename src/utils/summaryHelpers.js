import { getDateKey } from './dateHelpers';

/**
 * Get events for a specific date from dailySchedules
 */
const getEventsForDate = (dailySchedules, dateKey) => {
  const schedule = dailySchedules[dateKey];
  return schedule?.loggedEvents || [];
};

/**
 * Get date key for N days ago
 */
const getDateKeyDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getDateKey(date);
};

/**
 * Calculate sleep hours from events
 */
const calculateSleepHours = (events) => {
  const sleepEvents = events.filter(e => e.type === 'sleep' && e.endTime);
  return sleepEvents.reduce((total, e) => total + (e.endTime - e.startTime), 0);
};

/**
 * Calculate feed count and total amount
 */
const calculateFeedStats = (events) => {
  const feedEvents = events.filter(e => e.type === 'feed');
  const totalAmount = feedEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
  return {
    count: feedEvents.length,
    amount: totalAmount
  };
};

/**
 * Calculate diaper count by type
 */
const calculateDiaperStats = (events) => {
  const diaperEvents = events.filter(e => e.type === 'diaper');
  return {
    total: diaperEvents.length,
    wet: diaperEvents.filter(e => e.diaperType === 'wet').length,
    dirty: diaperEvents.filter(e => e.diaperType === 'dirty').length,
    both: diaperEvents.filter(e => e.diaperType === 'both').length
  };
};

/**
 * Calculate today's summary stats
 */
export const getTodaySummary = (dailySchedules) => {
  const todayKey = getDateKey(new Date());
  const events = getEventsForDate(dailySchedules, todayKey);

  const sleepHours = calculateSleepHours(events);
  const sleepSessions = events.filter(e => e.type === 'sleep' && e.endTime).length;
  const feeds = calculateFeedStats(events);
  const diapers = calculateDiaperStats(events);

  return {
    sleepHours,
    sleepSessions,
    feedCount: feeds.count,
    feedAmount: feeds.amount,
    diaperCount: diapers.total,
    diaperWet: diapers.wet,
    diaperDirty: diapers.dirty,
    noteCount: events.filter(e => e.type === 'note').length
  };
};

/**
 * Calculate weekly summary (last 7 days including today)
 */
export const getWeekSummary = (dailySchedules) => {
  let totalSleepHours = 0;
  let totalFeeds = 0;
  let totalFeedAmount = 0;
  let totalDiapers = 0;
  let daysWithData = 0;

  for (let i = 0; i < 7; i++) {
    const dateKey = getDateKeyDaysAgo(i);
    const events = getEventsForDate(dailySchedules, dateKey);

    if (events.length > 0) {
      daysWithData++;
      totalSleepHours += calculateSleepHours(events);
      const feeds = calculateFeedStats(events);
      totalFeeds += feeds.count;
      totalFeedAmount += feeds.amount;
      totalDiapers += calculateDiaperStats(events).total;
    }
  }

  const avgSleepHours = daysWithData > 0 ? totalSleepHours / daysWithData : 0;
  const avgFeeds = daysWithData > 0 ? totalFeeds / daysWithData : 0;
  const avgDiapers = daysWithData > 0 ? totalDiapers / daysWithData : 0;

  return {
    totalSleepHours,
    totalFeeds,
    totalFeedAmount,
    totalDiapers,
    avgSleepHours,
    avgFeeds,
    avgDiapers,
    daysWithData
  };
};

/**
 * Calculate yesterday's summary for comparison
 */
export const getYesterdaySummary = (dailySchedules) => {
  const yesterdayKey = getDateKeyDaysAgo(1);
  const events = getEventsForDate(dailySchedules, yesterdayKey);

  const sleepHours = calculateSleepHours(events);
  const feeds = calculateFeedStats(events);
  const diapers = calculateDiaperStats(events);

  return {
    sleepHours,
    feedCount: feeds.count,
    diaperCount: diapers.total
  };
};

/**
 * Calculate last week summary (7-13 days ago) for comparison
 */
export const getLastWeekSummary = (dailySchedules) => {
  let totalSleepHours = 0;
  let totalFeeds = 0;
  let totalDiapers = 0;
  let daysWithData = 0;

  for (let i = 7; i < 14; i++) {
    const dateKey = getDateKeyDaysAgo(i);
    const events = getEventsForDate(dailySchedules, dateKey);

    if (events.length > 0) {
      daysWithData++;
      totalSleepHours += calculateSleepHours(events);
      totalFeeds += calculateFeedStats(events).count;
      totalDiapers += calculateDiaperStats(events).total;
    }
  }

  return {
    avgSleepHours: daysWithData > 0 ? totalSleepHours / daysWithData : 0,
    avgFeeds: daysWithData > 0 ? totalFeeds / daysWithData : 0,
    avgDiapers: daysWithData > 0 ? totalDiapers / daysWithData : 0,
    daysWithData
  };
};

/**
 * Calculate trend indicator (-1: down, 0: stable, 1: up)
 * Returns the trend and percentage change
 */
export const calculateTrend = (current, previous) => {
  if (previous === 0) {
    return { direction: current > 0 ? 1 : 0, change: 0 };
  }

  const change = ((current - previous) / previous) * 100;

  // Consider +/- 10% as stable
  if (Math.abs(change) < 10) {
    return { direction: 0, change: Math.round(change) };
  }

  return {
    direction: change > 0 ? 1 : -1,
    change: Math.round(change)
  };
};

/**
 * Get full summary with trends
 */
export const getFullSummary = (dailySchedules) => {
  const today = getTodaySummary(dailySchedules);
  const yesterday = getYesterdaySummary(dailySchedules);
  const thisWeek = getWeekSummary(dailySchedules);
  const lastWeek = getLastWeekSummary(dailySchedules);

  return {
    today,
    thisWeek,
    trends: {
      sleepVsYesterday: calculateTrend(today.sleepHours, yesterday.sleepHours),
      feedsVsYesterday: calculateTrend(today.feedCount, yesterday.feedCount),
      diapersVsYesterday: calculateTrend(today.diaperCount, yesterday.diaperCount),
      avgSleepVsLastWeek: calculateTrend(thisWeek.avgSleepHours, lastWeek.avgSleepHours),
      avgFeedsVsLastWeek: calculateTrend(thisWeek.avgFeeds, lastWeek.avgFeeds),
      avgDiapersVsLastWeek: calculateTrend(thisWeek.avgDiapers, lastWeek.avgDiapers)
    }
  };
};
