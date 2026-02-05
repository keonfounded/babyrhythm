/**
 * Shared utilities for prediction algorithms
 * Implements: weighted recency, confidence scoring, pattern detection, circadian adjustments
 *
 * IMPORTANT DISCLAIMER:
 * These predictions are for INFORMATIONAL PURPOSES ONLY.
 * They are NOT medical advice and have NOT been clinically validated.
 *
 * Algorithm Design Notes:
 * - Weighted recency uses standard exponential decay (7-day half-life)
 * - Confidence scores are HEURISTIC, not scientifically validated
 * - Circadian adjustments are simplified approximations based on general patterns
 * - Individual babies vary significantly from any prediction
 *
 * The confidence scoring system is a custom algorithm designed to give
 * users a sense of prediction reliability based on data volume, recency,
 * and consistency. It has not been validated against actual prediction
 * accuracy in clinical studies.
 *
 * Always consult your pediatrician for concerns about your baby's
 * sleep, feeding, or development patterns.
 */

/**
 * Calculate weighted average with exponential decay for recency
 * More recent observations have higher weight
 *
 * @param {Array} observations - Array of { value, dateKey } objects
 * @param {number} halfLifeDays - Days until weight drops to 50% (default 7)
 * @returns {number|null} - Weighted average or null if no observations
 */
export const getWeightedAverage = (observations, halfLifeDays = 7) => {
  if (!observations || observations.length === 0) return null;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const decayRate = Math.log(2) / halfLifeDays; // Exponential decay constant

  let weightedSum = 0;
  let totalWeight = 0;

  observations.forEach(obs => {
    const obsDate = obs.dateKey ? new Date(obs.dateKey) : new Date();
    const daysAgo = Math.max(0, (now - obsDate.getTime()) / dayMs);
    const weight = Math.exp(-decayRate * daysAgo);

    weightedSum += obs.value * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : null;
};

/**
 * Daytime hours definition (6 AM to 8 PM)
 */
export const DAYTIME_HOURS = { start: 6, end: 20 };

/**
 * Check if an hour is during daytime
 * @param {number} hour - Hour in 24h format (can be decimal)
 * @returns {boolean}
 */
export const isDaytime = (hour) => {
  const normalizedHour = ((hour % 24) + 24) % 24;
  return normalizedHour >= DAYTIME_HOURS.start && normalizedHour < DAYTIME_HOURS.end;
};

/**
 * Split observations into daytime and nighttime groups
 * @param {Array} events - Array of events with startTime or endTime
 * @param {string} timeField - Which field to use ('startTime' or 'endTime')
 * @returns {{ daytime: Array, nighttime: Array }}
 */
export const splitByTimeOfDay = (events, timeField = 'endTime') => {
  const daytime = [];
  const nighttime = [];

  events.forEach(event => {
    const hour = event[timeField];
    if (hour !== null && hour !== undefined) {
      if (isDaytime(hour)) {
        daytime.push(event);
      } else {
        nighttime.push(event);
      }
    }
  });

  return { daytime, nighttime };
};

/**
 * Calculate confidence score for predictions (0-100)
 * Based on data volume, recency, and consistency
 *
 * NOTE: This is a HEURISTIC scoring system, not a scientifically validated metric.
 * The scores provide a rough indication of prediction reliability based on:
 * - How much data is available
 * - How recent the data is
 * - How consistent the patterns are
 *
 * These scores have NOT been validated against actual prediction accuracy.
 * Use them as a general guide, not a precise measure.
 *
 * @param {Object} params
 * @param {number} params.dataPoints - Number of observations
 * @param {number} params.minRequired - Minimum required for personalized predictions
 * @param {Array} params.values - Raw values for consistency calculation
 * @param {Array} params.observations - Array with dateKey for recency calculation
 * @returns {{ score: number, level: string, factors: Object }}
 */
export const calculateConfidence = ({ dataPoints, minRequired, values = [], observations = [] }) => {
  let score = 40; // Base score
  const factors = {
    dataVolume: 0,
    recency: 0,
    consistency: 0
  };

  // Data volume factor (up to +30 points)
  // Reaches max at 3x minimum required
  const volumeRatio = Math.min(dataPoints / (minRequired * 3), 1);
  factors.dataVolume = Math.round(volumeRatio * 30);
  score += factors.dataVolume;

  // Recency factor (up to +20 points)
  // Based on average age of observations
  if (observations.length > 0) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const avgDaysAgo = observations.reduce((sum, obs) => {
      const obsDate = obs.dateKey ? new Date(obs.dateKey) : new Date();
      return sum + (now - obsDate.getTime()) / dayMs;
    }, 0) / observations.length;

    // Full points if avg < 2 days, declining to 0 at 14 days
    factors.recency = Math.round(Math.max(0, 20 - (avgDaysAgo / 14) * 20));
    score += factors.recency;
  }

  // Consistency factor (up to +10 points)
  // Lower standard deviation = higher score
  if (values.length >= 3) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

    // Full points at CV < 0.1, zero at CV > 0.5
    factors.consistency = Math.round(Math.max(0, 10 - (coefficientOfVariation / 0.5) * 10));
    score += factors.consistency;
  }

  // Determine confidence level
  let level;
  if (score >= 80) level = 'high';
  else if (score >= 60) level = 'good';
  else if (score >= 40) level = 'moderate';
  else level = 'low';

  return {
    score: Math.min(100, Math.max(0, score)),
    level,
    factors
  };
};

/**
 * Detect if baby is transitioning between nap schedules
 *
 * Typical transitions:
 * - 3-4 months: 4-5 naps → 3-4 naps
 * - 6-8 months: 3 naps → 2 naps
 * - 12-18 months: 2 naps → 1 nap
 *
 * @param {Array} dailyNapCounts - Array of { dateKey, count } for recent days
 * @param {number} ageWeeks - Baby's age in weeks
 * @returns {{ transitioning: boolean, from: number, to: number, progress: number, recommendation: string }}
 */
export const detectNapTransition = (dailyNapCounts, ageWeeks) => {
  if (dailyNapCounts.length < 5) {
    return { transitioning: false, from: null, to: null, progress: 0, recommendation: null };
  }

  // Typical nap counts by age
  const getTypicalNaps = (weeks) => {
    if (weeks < 12) return 4;
    if (weeks < 26) return 3;
    if (weeks < 52) return 2;
    return 1;
  };

  const typicalNaps = getTypicalNaps(ageWeeks);
  const avgNaps = dailyNapCounts.reduce((sum, d) => sum + d.count, 0) / dailyNapCounts.length;

  // Check if averaging fewer naps than typical
  const difference = typicalNaps - avgNaps;

  if (difference > 0.3 && difference < 1.3) {
    // Baby is transitioning
    const progress = Math.min(100, Math.round((difference / 1) * 100));
    const from = typicalNaps;
    const to = typicalNaps - 1;

    let recommendation;
    if (progress < 50) {
      recommendation = `Baby may be starting to transition from ${from} to ${to} naps. Watch for signs of readiness.`;
    } else {
      recommendation = `Baby appears to be transitioning to ${to} nap(s). Expect wake windows to lengthen.`;
    }

    return {
      transitioning: true,
      from,
      to,
      progress,
      recommendation
    };
  }

  return { transitioning: false, from: null, to: null, progress: 0, recommendation: null };
};

/**
 * Circadian adjustment factors by time of day
 * Babies tend to have different patterns at different times
 *
 * @param {number} hour - Hour of day (0-24)
 * @returns {{ sleepPropensity: number, wakeWindowAdjustment: number }}
 */
export const getCircadianFactors = (hour) => {
  const normalizedHour = ((hour % 24) + 24) % 24;

  // Sleep propensity (0-1, higher = more likely to sleep well)
  // Peaks around 1-3 PM and 7-9 PM
  let sleepPropensity;
  if (normalizedHour >= 13 && normalizedHour <= 15) {
    sleepPropensity = 0.9; // Afternoon dip - best nap time
  } else if (normalizedHour >= 19 && normalizedHour <= 21) {
    sleepPropensity = 1.0; // Bedtime window
  } else if (normalizedHour >= 9 && normalizedHour <= 11) {
    sleepPropensity = 0.7; // Morning nap window
  } else if (normalizedHour >= 4 && normalizedHour <= 6) {
    sleepPropensity = 0.5; // Early morning (light sleep)
  } else {
    sleepPropensity = 0.6;
  }

  // Wake window adjustment (multiplier)
  // Babies can stay awake longer in morning, shorter before bed
  let wakeWindowAdjustment;
  if (normalizedHour >= 6 && normalizedHour <= 10) {
    wakeWindowAdjustment = 1.1; // Can handle slightly longer wake in morning
  } else if (normalizedHour >= 16 && normalizedHour <= 19) {
    wakeWindowAdjustment = 0.9; // Shorter wake window before bed
  } else {
    wakeWindowAdjustment = 1.0;
  }

  return { sleepPropensity, wakeWindowAdjustment };
};

/**
 * Calculate standard deviation
 * @param {Array<number>} values
 * @returns {number}
 */
export const calculateStdDev = (values) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * Get the trend direction from recent values
 * @param {Array<{ value: number, dateKey: string }>} observations - Must be sorted oldest to newest
 * @returns {{ direction: 'increasing'|'decreasing'|'stable', magnitude: number }}
 */
export const getTrend = (observations) => {
  if (observations.length < 3) {
    return { direction: 'stable', magnitude: 0 };
  }

  // Compare first half average to second half average
  const midpoint = Math.floor(observations.length / 2);
  const firstHalf = observations.slice(0, midpoint);
  const secondHalf = observations.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, o) => sum + o.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, o) => sum + o.value, 0) / secondHalf.length;

  const percentChange = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  let direction;
  if (percentChange > 10) direction = 'increasing';
  else if (percentChange < -10) direction = 'decreasing';
  else direction = 'stable';

  return { direction, magnitude: Math.abs(percentChange) };
};
