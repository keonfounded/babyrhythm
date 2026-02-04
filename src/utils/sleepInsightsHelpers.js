/**
 * Sleep Insights - Rule-based analysis for baby sleep patterns
 * Based on WHO and pediatric sleep guidelines
 */

import { getDateKey } from './dateHelpers';

/**
 * Age-appropriate sleep recommendations (hours per 24h)
 * Based on WHO and American Academy of Pediatrics guidelines
 */
export const SLEEP_RECOMMENDATIONS = {
  // Age in days: { min, ideal, max } hours per 24h
  0: { min: 14, ideal: 16, max: 17, label: 'Newborn (0-1 month)' },
  30: { min: 14, ideal: 15.5, max: 17, label: '1 month' },
  60: { min: 14, ideal: 15, max: 17, label: '2 months' },
  90: { min: 13, ideal: 15, max: 17, label: '3 months' },
  120: { min: 12, ideal: 14.5, max: 16, label: '4 months' },
  150: { min: 12, ideal: 14, max: 16, label: '5 months' },
  180: { min: 12, ideal: 14, max: 15, label: '6 months' },
  270: { min: 12, ideal: 14, max: 15, label: '9 months' },
  365: { min: 11, ideal: 13.5, max: 14, label: '12 months' },
  540: { min: 11, ideal: 13, max: 14, label: '18 months' },
  730: { min: 11, ideal: 12.5, max: 14, label: '24 months' }
};

/**
 * Wake window recommendations by age (hours)
 * Time baby should be awake between naps
 */
export const WAKE_WINDOWS = {
  0: { min: 0.5, max: 1, label: 'Newborn' },
  30: { min: 0.75, max: 1.25, label: '1 month' },
  60: { min: 1, max: 1.5, label: '2 months' },
  90: { min: 1.25, max: 1.75, label: '3 months' },
  120: { min: 1.5, max: 2.25, label: '4 months' },
  150: { min: 1.75, max: 2.5, label: '5 months' },
  180: { min: 2, max: 3, label: '6 months' },
  270: { min: 2.5, max: 3.5, label: '9 months' },
  365: { min: 3, max: 4, label: '12 months' },
  540: { min: 4, max: 5.5, label: '18 months' },
  730: { min: 5, max: 6, label: '24 months' }
};

/**
 * Sleep regression periods (in days)
 */
export const SLEEP_REGRESSIONS = [
  { ageDays: 120, range: 14, label: '4-month regression', description: 'Sleep cycles mature, baby wakes more frequently' },
  { ageDays: 240, range: 14, label: '8-month regression', description: 'Separation anxiety, crawling, teething' },
  { ageDays: 365, range: 14, label: '12-month regression', description: 'Walking, increased independence' },
  { ageDays: 540, range: 14, label: '18-month regression', description: 'Language development, separation anxiety' },
  { ageDays: 730, range: 14, label: '24-month regression', description: 'Toddler independence, potty training' }
];

/**
 * Get sleep recommendation for baby's age
 */
export const getSleepRecommendation = (ageDays) => {
  const ages = Object.keys(SLEEP_RECOMMENDATIONS).map(Number).sort((a, b) => a - b);

  // Find the closest age bracket
  let closest = ages[0];
  for (const age of ages) {
    if (age <= ageDays) {
      closest = age;
    } else {
      break;
    }
  }

  return SLEEP_RECOMMENDATIONS[closest];
};

/**
 * Get wake window recommendation for baby's age
 */
export const getWakeWindowRecommendation = (ageDays) => {
  const ages = Object.keys(WAKE_WINDOWS).map(Number).sort((a, b) => a - b);

  let closest = ages[0];
  for (const age of ages) {
    if (age <= ageDays) {
      closest = age;
    } else {
      break;
    }
  }

  return WAKE_WINDOWS[closest];
};

/**
 * Check if baby is in a sleep regression period
 */
export const checkSleepRegression = (ageDays) => {
  for (const regression of SLEEP_REGRESSIONS) {
    const start = regression.ageDays - regression.range;
    const end = regression.ageDays + regression.range;
    if (ageDays >= start && ageDays <= end) {
      return regression;
    }
  }
  return null;
};

/**
 * Extract sleep events from daily schedules
 */
const getSleepEvents = (dailySchedules, days = 7) => {
  const events = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = getDateKey(date);
    const schedule = dailySchedules[dateKey];

    if (schedule?.loggedEvents) {
      const sleepEvents = schedule.loggedEvents.filter(e => e.type === 'sleep' && e.endTime);
      sleepEvents.forEach(e => {
        events.push({
          ...e,
          dateKey,
          date,
          duration: e.endTime - e.startTime
        });
      });
    }
  }

  return events;
};

/**
 * Calculate daily sleep totals
 */
const getDailySleepTotals = (dailySchedules, days = 7) => {
  const totals = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = getDateKey(date);
    const schedule = dailySchedules[dateKey];

    let totalHours = 0;
    let sessionCount = 0;
    let longestStretch = 0;

    if (schedule?.loggedEvents) {
      const sleepEvents = schedule.loggedEvents.filter(e => e.type === 'sleep' && e.endTime);
      sessionCount = sleepEvents.length;

      sleepEvents.forEach(e => {
        const duration = e.endTime - e.startTime;
        totalHours += duration;
        if (duration > longestStretch) {
          longestStretch = duration;
        }
      });
    }

    totals.push({
      dateKey,
      date,
      totalHours,
      sessionCount,
      longestStretch
    });
  }

  return totals;
};

/**
 * Calculate sleep score (0-100)
 * Based on: meeting recommendations, consistency, longest stretch
 */
export const calculateSleepScore = (dailySchedules, ageDays) => {
  const recommendation = getSleepRecommendation(ageDays);
  const totals = getDailySleepTotals(dailySchedules, 7);

  if (totals.length === 0 || totals.every(t => t.totalHours === 0)) {
    return { score: null, breakdown: null };
  }

  const daysWithData = totals.filter(t => t.totalHours > 0);
  if (daysWithData.length === 0) {
    return { score: null, breakdown: null };
  }

  const avgSleep = daysWithData.reduce((sum, t) => sum + t.totalHours, 0) / daysWithData.length;

  // Score components (each out of ~33 points)

  // 1. Meeting recommendation (0-35 points)
  let recommendationScore = 0;
  if (avgSleep >= recommendation.min && avgSleep <= recommendation.max) {
    // Within range
    const distanceFromIdeal = Math.abs(avgSleep - recommendation.ideal);
    const maxDistance = Math.max(recommendation.ideal - recommendation.min, recommendation.max - recommendation.ideal);
    recommendationScore = 35 * (1 - distanceFromIdeal / maxDistance);
  } else if (avgSleep < recommendation.min) {
    // Below minimum
    const deficit = recommendation.min - avgSleep;
    recommendationScore = Math.max(0, 35 - deficit * 10);
  } else {
    // Above maximum (usually fine for babies)
    recommendationScore = 30;
  }

  // 2. Consistency (0-35 points) - standard deviation of sleep times
  const sleepValues = daysWithData.map(t => t.totalHours);
  const mean = sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length;
  const variance = sleepValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sleepValues.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 35 - stdDev * 10);

  // 3. Longest stretch progress (0-30 points)
  const avgLongestStretch = daysWithData.reduce((sum, t) => sum + t.longestStretch, 0) / daysWithData.length;
  // Newborns: 2-3h is good, older babies: 6-10h is good
  const targetStretch = ageDays < 90 ? 3 : ageDays < 180 ? 5 : ageDays < 365 ? 7 : 10;
  const stretchScore = Math.min(30, (avgLongestStretch / targetStretch) * 30);

  const totalScore = Math.round(recommendationScore + consistencyScore + stretchScore);

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    breakdown: {
      recommendation: Math.round(recommendationScore),
      consistency: Math.round(consistencyScore),
      longestStretch: Math.round(stretchScore)
    },
    avgSleep,
    avgLongestStretch
  };
};

/**
 * Calculate sleep trend (improving, stable, declining)
 */
export const calculateSleepTrend = (dailySchedules) => {
  const totals = getDailySleepTotals(dailySchedules, 14);
  const daysWithData = totals.filter(t => t.totalHours > 0);

  if (daysWithData.length < 4) {
    return { trend: 'insufficient', change: 0 };
  }

  // Compare last 7 days vs previous 7 days
  const recent = daysWithData.slice(0, Math.min(7, Math.floor(daysWithData.length / 2)));
  const previous = daysWithData.slice(Math.min(7, Math.floor(daysWithData.length / 2)));

  if (recent.length === 0 || previous.length === 0) {
    return { trend: 'insufficient', change: 0 };
  }

  const recentAvg = recent.reduce((sum, t) => sum + t.totalHours, 0) / recent.length;
  const previousAvg = previous.reduce((sum, t) => sum + t.totalHours, 0) / previous.length;

  const change = ((recentAvg - previousAvg) / previousAvg) * 100;

  if (change > 10) return { trend: 'improving', change: Math.round(change) };
  if (change < -10) return { trend: 'declining', change: Math.round(change) };
  return { trend: 'stable', change: Math.round(change) };
};

/**
 * Analyze wake windows
 */
export const analyzeWakeWindows = (dailySchedules, ageDays) => {
  const recommendation = getWakeWindowRecommendation(ageDays);
  const events = getSleepEvents(dailySchedules, 7);

  if (events.length < 2) {
    return {
      avgWakeWindow: null,
      recommendation,
      status: 'insufficient'
    };
  }

  // Sort by date and time
  events.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.startTime - b.startTime;
  });

  // Calculate wake windows (time between sleep sessions)
  const wakeWindows = [];
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];

    // Only calculate within same day or consecutive
    if (prev.dateKey === curr.dateKey ||
        new Date(curr.dateKey) - new Date(prev.dateKey) <= 86400000) {
      let wakeTime;
      if (prev.dateKey === curr.dateKey) {
        wakeTime = curr.startTime - prev.endTime;
      } else {
        // Cross-day: time from end of last sleep to start of first sleep next day
        wakeTime = (24 - prev.endTime) + curr.startTime;
      }

      if (wakeTime > 0 && wakeTime < 12) { // Reasonable wake window
        wakeWindows.push(wakeTime);
      }
    }
  }

  if (wakeWindows.length === 0) {
    return { avgWakeWindow: null, recommendation, status: 'insufficient' };
  }

  const avgWakeWindow = wakeWindows.reduce((a, b) => a + b, 0) / wakeWindows.length;

  let status = 'optimal';
  if (avgWakeWindow < recommendation.min) {
    status = 'too_short';
  } else if (avgWakeWindow > recommendation.max) {
    status = 'too_long';
  }

  return {
    avgWakeWindow,
    recommendation,
    status,
    wakeWindows
  };
};

/**
 * Get optimal bedtime suggestion
 */
export const suggestBedtime = (dailySchedules, ageDays) => {
  const events = getSleepEvents(dailySchedules, 14);
  const recommendation = getSleepRecommendation(ageDays);

  // Find night sleep events (starting between 6 PM and 10 PM)
  const nightSleeps = events.filter(e => e.startTime >= 18 && e.startTime <= 22);

  if (nightSleeps.length < 3) {
    // Not enough data, suggest based on age
    const defaultBedtime = ageDays < 90 ? 20 : ageDays < 180 ? 19.5 : ageDays < 365 ? 19 : 19.5;
    return {
      suggested: defaultBedtime,
      confidence: 'low',
      basedOn: 'age_guidelines'
    };
  }

  // Find bedtimes that resulted in good sleep (long duration)
  const goodNights = nightSleeps
    .filter(e => e.duration >= 4) // At least 4 hours stretch
    .map(e => e.startTime);

  if (goodNights.length === 0) {
    const avgBedtime = nightSleeps.reduce((sum, e) => sum + e.startTime, 0) / nightSleeps.length;
    return {
      suggested: avgBedtime,
      confidence: 'medium',
      basedOn: 'average'
    };
  }

  const optimalBedtime = goodNights.reduce((a, b) => a + b, 0) / goodNights.length;

  return {
    suggested: optimalBedtime,
    confidence: 'high',
    basedOn: 'pattern_analysis'
  };
};

/**
 * Generate sleep tips based on analysis
 */
export const generateSleepTips = (dailySchedules, ageDays) => {
  const tips = [];
  const scoreData = calculateSleepScore(dailySchedules, ageDays);
  const wakeWindowData = analyzeWakeWindows(dailySchedules, ageDays);
  const regression = checkSleepRegression(ageDays);
  const trend = calculateSleepTrend(dailySchedules);
  const recommendation = getSleepRecommendation(ageDays);

  // Regression warning
  if (regression) {
    tips.push({
      type: 'warning',
      title: regression.label,
      message: regression.description + '. This is normal and temporary.',
      priority: 1
    });
  }

  // Sleep amount tips
  if (scoreData.avgSleep !== null) {
    if (scoreData.avgSleep < recommendation.min) {
      tips.push({
        type: 'action',
        title: 'Below recommended sleep',
        message: `Baby is averaging ${scoreData.avgSleep.toFixed(1)}h but needs ${recommendation.min}-${recommendation.max}h at this age. Try an earlier bedtime.`,
        priority: 2
      });
    } else if (scoreData.avgSleep > recommendation.max + 2) {
      tips.push({
        type: 'info',
        title: 'Lots of sleep',
        message: `Baby is sleeping ${scoreData.avgSleep.toFixed(1)}h which is above average. This is usually fine, but mention it at your next pediatrician visit.`,
        priority: 3
      });
    }
  }

  // Wake window tips
  if (wakeWindowData.status === 'too_short') {
    tips.push({
      type: 'action',
      title: 'Wake windows too short',
      message: `Try keeping baby awake a bit longer (${wakeWindowData.recommendation.min}-${wakeWindowData.recommendation.max}h) between naps for better sleep quality.`,
      priority: 2
    });
  } else if (wakeWindowData.status === 'too_long') {
    tips.push({
      type: 'action',
      title: 'Wake windows too long',
      message: `Baby may be overtired. Try putting down for naps after ${wakeWindowData.recommendation.min}-${wakeWindowData.recommendation.max}h awake.`,
      priority: 2
    });
  }

  // Trend tips
  if (trend.trend === 'declining' && trend.change < -15) {
    tips.push({
      type: 'warning',
      title: 'Sleep decreasing',
      message: `Sleep has decreased ${Math.abs(trend.change)}% compared to last week. Check for teething, illness, or schedule changes.`,
      priority: 2
    });
  } else if (trend.trend === 'improving' && trend.change > 15) {
    tips.push({
      type: 'success',
      title: 'Great progress!',
      message: `Sleep has improved ${trend.change}% compared to last week. Keep up the good routine!`,
      priority: 3
    });
  }

  // Consistency tips
  if (scoreData.breakdown && scoreData.breakdown.consistency < 15) {
    tips.push({
      type: 'action',
      title: 'Inconsistent sleep times',
      message: 'Try to keep bedtime and wake time consistent (within 30 min) even on weekends.',
      priority: 3
    });
  }

  // Sort by priority
  tips.sort((a, b) => a.priority - b.priority);

  return tips;
};

/**
 * Format time from decimal hours to readable string
 */
export const formatTimeFromDecimal = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get complete sleep insights
 */
export const getSleepInsights = (dailySchedules, ageDays) => {
  return {
    score: calculateSleepScore(dailySchedules, ageDays),
    trend: calculateSleepTrend(dailySchedules),
    wakeWindows: analyzeWakeWindows(dailySchedules, ageDays),
    bedtime: suggestBedtime(dailySchedules, ageDays),
    regression: checkSleepRegression(ageDays),
    recommendation: getSleepRecommendation(ageDays),
    tips: generateSleepTips(dailySchedules, ageDays)
  };
};
