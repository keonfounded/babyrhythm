/**
 * Parse a date string (YYYY-MM-DD) as local time, not UTC
 * This prevents off-by-one day errors in timezones west of UTC
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} - Date object in local timezone
 */
export const parseDateString = (dateStr) => {
  return new Date(dateStr + 'T00:00:00');
};

/**
 * Get date key in YYYY-MM-DD format (LOCAL time, not UTC)
 * @param {Date} date - Date object
 * @returns {string} - Date key like "2025-01-29"
 */
export const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date as human-readable string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date like "Thursday, Jan 29"
 */
export const formatDate = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const month = months[date.getMonth()];
  const dayNum = date.getDate();
  
  return `${dayName}, ${month} ${dayNum}`;
};

/**
 * Get current date key (today)
 * @returns {string} - Today's date key
 */
export const getCurrentDateKey = () => {
  return getDateKey(new Date());
};

/**
 * Calculate baby's age from birth date
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {Object} - { weeks, days, totalDays }
 */
export const calculateAge = (birthDate) => {
  const birth = parseDateString(birthDate);
  const now = new Date();
  const diffTime = Math.abs(now - birth);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  return { weeks, days, totalDays: diffDays };
};

/**
 * Generate array of dates starting from a given date
 * @param {Date} startDate - Starting date
 * @param {number} numDays - Number of days to generate
 * @returns {Array<Date>} - Array of Date objects
 */
export const getViewDates = (startDate, numDays) => {
  const dates = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
};