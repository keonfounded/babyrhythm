/**
 * Migrate localStorage keys from old app name to new
 * This runs once on app load to preserve user data
 */

const KEY_MIGRATIONS = {
  'sleepTreaty_settings': 'babyRhythm_settings',
  'sleepTreaty_feedAmountUnit': 'babyRhythm_feedAmountUnit',
  'sleepTreaty_babyProfile': 'babyRhythm_babyProfile',
  'sleepTreaty_dailySchedules': 'babyRhythm_dailySchedules',
};

export const migrateStorage = () => {
  try {
    // Check if migration already done
    if (localStorage.getItem('babyRhythm_migrated')) {
      return;
    }

    // Migrate each key
    Object.entries(KEY_MIGRATIONS).forEach(([oldKey, newKey]) => {
      const oldData = localStorage.getItem(oldKey);
      if (oldData && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldData);
        console.log(`Migrated ${oldKey} -> ${newKey}`);
      }
    });

    // Mark migration as complete
    localStorage.setItem('babyRhythm_migrated', 'true');
  } catch (e) {
    console.warn('Storage migration failed:', e);
  }
};
