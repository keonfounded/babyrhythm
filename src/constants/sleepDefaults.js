/**
 * Age-based Sleep Guidelines
 *
 * IMPORTANT DISCLAIMER:
 * Wake window guidelines are NOT official AAP/WHO recommendations.
 * The AAP does not publish specific wake window charts.
 * These values are derived from:
 * - Clinical observations and sleep consultant consensus
 * - Cleveland Clinic: https://health.clevelandclinic.org/wake-windows-by-age
 * - Sleep Foundation: https://www.sleepfoundation.org/baby-sleep/newborn-wake-windows
 *
 * Total sleep recommendations are from:
 * - American Academy of Sleep Medicine (AASM), endorsed by AAP
 * - Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4877308/
 * - AASM recommends: 4-12 months: 12-16 hours; 1-2 years: 11-14 hours
 *
 * Individual babies vary significantly. These are general guidelines only.
 * Always consult your pediatrician for concerns about your baby's sleep.
 *
 * Wake windows = how long baby can comfortably stay awake between sleeps
 * All times in hours
 */

export const SLEEP_DEFAULTS_BY_AGE = [
  // Newborn: Very short wake windows (30-60 min per Cleveland Clinic, Sleep Foundation)
  { minWeeks: 0,  maxWeeks: 4,  wakeWindow: { min: 0.5,  max: 1    }, naps: { min: 4, max: 6 }, totalSleep: { min: 14, max: 17 }, label: 'Newborn (0-4 weeks)' },

  // 1-2 months: Slightly longer (45-90 min)
  { minWeeks: 4,  maxWeeks: 8,  wakeWindow: { min: 0.75, max: 1.5  }, naps: { min: 4, max: 5 }, totalSleep: { min: 14, max: 16 }, label: '1-2 months' },

  // 2-4 months: 1-2 hours
  { minWeeks: 8,  maxWeeks: 16, wakeWindow: { min: 1,    max: 2    }, naps: { min: 3, max: 4 }, totalSleep: { min: 12, max: 16 }, label: '2-4 months' },

  // 4-6 months: 1.5-2.5 hours
  { minWeeks: 16, maxWeeks: 28, wakeWindow: { min: 1.5,  max: 2.5  }, naps: { min: 3, max: 4 }, totalSleep: { min: 12, max: 16 }, label: '4-7 months' },

  // 7-9 months: 2-3.5 hours
  { minWeeks: 28, maxWeeks: 36, wakeWindow: { min: 2,    max: 3.5  }, naps: { min: 2, max: 3 }, totalSleep: { min: 12, max: 16 }, label: '7-9 months' },

  // 9-12 months: 2.5-4 hours
  { minWeeks: 36, maxWeeks: 48, wakeWindow: { min: 2.5,  max: 4    }, naps: { min: 2, max: 2 }, totalSleep: { min: 12, max: 16 }, label: '9-12 months' },

  // 12-16 months: 3-5 hours (transitioning to 1 nap)
  { minWeeks: 48, maxWeeks: 64, wakeWindow: { min: 3,    max: 5    }, naps: { min: 1, max: 2 }, totalSleep: { min: 11, max: 14 }, label: '12-16 months' },

  // 16-18 months: 4-5.5 hours
  { minWeeks: 64, maxWeeks: 78, wakeWindow: { min: 4,    max: 5.5  }, naps: { min: 1, max: 1 }, totalSleep: { min: 11, max: 14 }, label: '16-18 months' },

  // 18-30 months: 5-6 hours (single nap)
  { minWeeks: 78, maxWeeks: 130, wakeWindow: { min: 5,   max: 6    }, naps: { min: 1, max: 1 }, totalSleep: { min: 11, max: 14 }, label: '18-30 months' },
];

/**
 * Get sleep defaults for a given age in weeks
 */
export const getDefaultsForAge = (ageInWeeks) => {
  const match = SLEEP_DEFAULTS_BY_AGE.find(
    range => ageInWeeks >= range.minWeeks && ageInWeeks < range.maxWeeks
  );
  return match || SLEEP_DEFAULTS_BY_AGE[SLEEP_DEFAULTS_BY_AGE.length - 1];
};
