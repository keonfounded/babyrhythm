import { WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS, getAgePoints } from '../data/whoGrowthData';
import { parseDateString } from './dateHelpers';

/**
 * Linear interpolation between two values
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Get interpolated percentile values for a specific age in days
 */
export const getPercentilesForAge = (ageDays, sex = 'boy') => {
  const data = sex === 'girl' ? WHO_WEIGHT_GIRLS : WHO_WEIGHT_BOYS;
  const agePoints = getAgePoints();

  // Clamp age to valid range
  const clampedAge = Math.max(0, Math.min(730, ageDays));

  // Find surrounding data points
  let lowerAge = agePoints[0];
  let upperAge = agePoints[agePoints.length - 1];

  for (let i = 0; i < agePoints.length - 1; i++) {
    if (agePoints[i] <= clampedAge && agePoints[i + 1] >= clampedAge) {
      lowerAge = agePoints[i];
      upperAge = agePoints[i + 1];
      break;
    }
  }

  // If exact match
  if (data[clampedAge]) {
    return data[clampedAge];
  }

  // Interpolate
  const t = (clampedAge - lowerAge) / (upperAge - lowerAge);
  const lowerData = data[lowerAge];
  const upperData = data[upperAge];

  return {
    p3: lerp(lowerData.p3, upperData.p3, t),
    p15: lerp(lowerData.p15, upperData.p15, t),
    p50: lerp(lowerData.p50, upperData.p50, t),
    p85: lerp(lowerData.p85, upperData.p85, t),
    p97: lerp(lowerData.p97, upperData.p97, t)
  };
};

/**
 * Calculate which percentile a weight falls into for a given age
 */
export const calculatePercentile = (weightKg, ageDays, sex = 'boy') => {
  const percentiles = getPercentilesForAge(ageDays, sex);

  if (weightKg <= percentiles.p3) return 3;
  if (weightKg <= percentiles.p15) {
    const t = (weightKg - percentiles.p3) / (percentiles.p15 - percentiles.p3);
    return 3 + t * 12;
  }
  if (weightKg <= percentiles.p50) {
    const t = (weightKg - percentiles.p15) / (percentiles.p50 - percentiles.p15);
    return 15 + t * 35;
  }
  if (weightKg <= percentiles.p85) {
    const t = (weightKg - percentiles.p50) / (percentiles.p85 - percentiles.p50);
    return 50 + t * 35;
  }
  if (weightKg <= percentiles.p97) {
    const t = (weightKg - percentiles.p85) / (percentiles.p97 - percentiles.p85);
    return 85 + t * 12;
  }
  return 97;
};

/**
 * Convert lbs to kg
 */
export const lbsToKg = (lbs) => lbs * 0.453592;

/**
 * Convert kg to lbs
 */
export const kgToLbs = (kg) => kg / 0.453592;

/**
 * Get weight in the appropriate unit
 */
export const getWeightInUnit = (weightKg, unit) => {
  if (unit === 'lbs') {
    return kgToLbs(weightKg);
  }
  return weightKg;
};

/**
 * Convert weight to kg from any unit
 */
export const convertToKg = (weight, unit) => {
  if (unit === 'lbs') {
    return lbsToKg(weight);
  }
  return weight;
};

/**
 * Generate chart data points for percentile curves
 * Returns data for SVG path generation
 */
export const generatePercentileCurve = (sex = 'boy', percentile = 'p50', maxDays = 730) => {
  const data = sex === 'girl' ? WHO_WEIGHT_GIRLS : WHO_WEIGHT_BOYS;
  const agePoints = getAgePoints().filter(age => age <= maxDays);

  return agePoints.map(age => ({
    age,
    weight: data[age][percentile]
  }));
};

/**
 * Prepare weight history for chart display
 * Returns array of { age (days), weight (kg), date }
 */
export const prepareWeightHistoryForChart = (weightHistory, birthDate, weightUnit = 'kg') => {
  if (!weightHistory || !birthDate) return [];

  const birth = parseDateString(birthDate);

  return weightHistory
    .map(entry => {
      const entryDate = parseDateString(entry.date);
      const ageDays = Math.floor((entryDate - birth) / (1000 * 60 * 60 * 24));

      // Convert to kg if needed
      const weightKg = weightUnit === 'lbs'
        ? lbsToKg(entry.weight)
        : entry.weight;

      return {
        age: ageDays,
        weight: weightKg,
        date: entry.date,
        displayWeight: entry.weight,
        unit: weightUnit
      };
    })
    .filter(entry => entry.age >= 0 && entry.age <= 730)
    .sort((a, b) => a.age - b.age);
};

/**
 * Get percentile description text
 */
export const getPercentileDescription = (percentile) => {
  if (percentile < 3) return 'Below 3rd percentile';
  if (percentile < 15) return 'Between 3rd-15th percentile';
  if (percentile < 50) return 'Between 15th-50th percentile';
  if (percentile < 85) return 'Between 50th-85th percentile';
  if (percentile < 97) return 'Between 85th-97th percentile';
  return 'Above 97th percentile';
};
