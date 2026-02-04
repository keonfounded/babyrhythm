// Age-based sleep defaults derived from pediatric sleep research
// Wake windows = how long baby can stay awake between sleeps
// All times in hours

export const SLEEP_DEFAULTS_BY_AGE = [
  { minWeeks: 0,  maxWeeks: 4,  wakeWindow: { min: 0.5,  max: 1.25 }, naps: { min: 4, max: 6 }, totalSleep: { min: 15, max: 17 }, label: 'Newborn' },
  { minWeeks: 4,  maxWeeks: 8,  wakeWindow: { min: 1,    max: 2    }, naps: { min: 4, max: 5 }, totalSleep: { min: 14, max: 16 }, label: '1-2 months' },
  { minWeeks: 8,  maxWeeks: 16, wakeWindow: { min: 1.25, max: 2.5  }, naps: { min: 3, max: 4 }, totalSleep: { min: 13, max: 15 }, label: '2-4 months' },
  { minWeeks: 16, maxWeeks: 28, wakeWindow: { min: 1.5,  max: 2.5  }, naps: { min: 3, max: 4 }, totalSleep: { min: 12, max: 15 }, label: '4-7 months' },
  { minWeeks: 28, maxWeeks: 36, wakeWindow: { min: 2,    max: 3.5  }, naps: { min: 2, max: 3 }, totalSleep: { min: 12, max: 14 }, label: '7-9 months' },
  { minWeeks: 36, maxWeeks: 48, wakeWindow: { min: 2.5,  max: 4    }, naps: { min: 2, max: 2 }, totalSleep: { min: 11, max: 14 }, label: '9-12 months' },
  { minWeeks: 48, maxWeeks: 64, wakeWindow: { min: 3,    max: 5    }, naps: { min: 1, max: 2 }, totalSleep: { min: 11, max: 14 }, label: '12-16 months' },
  { minWeeks: 64, maxWeeks: 78, wakeWindow: { min: 4,    max: 5.5  }, naps: { min: 1, max: 1 }, totalSleep: { min: 11, max: 14 }, label: '16-18 months' },
  { minWeeks: 78, maxWeeks: 130, wakeWindow: { min: 5,   max: 6    }, naps: { min: 1, max: 1 }, totalSleep: { min: 11, max: 13 }, label: '18-30 months' },
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