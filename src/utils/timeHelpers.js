/**
 * Get time label in 12-hour format
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {string} - Time label like "3 PM"
 */
export const getTimeLabel = (hour) => {
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  const period = hour < 12 ? 'AM' : 'PM';
  return `${displayHour} ${period}`;
};

/**
 * Format hours as time string
 * @param {number} hours - Time in decimal hours (e.g., 14.5 = 2:30 PM)
 * @returns {string} - Formatted time like "2:30 PM"
 */
export const formatTime = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const displayHour = h % 12 || 12;
  const period = h < 12 ? 'AM' : 'PM';
  return m > 0 
    ? `${displayHour}:${m.toString().padStart(2, '0')} ${period}` 
    : `${displayHour}:00 ${period}`;
};

/**
 * Get current time in decimal hours
 * @returns {number} - Current time (e.g., 14.5 for 2:30 PM)
 */
export const getCurrentTimeInHours = () => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
};

/**
 * Convert mouse Y position to time in hours for vertical timeline
 * @param {number} clientY - Mouse Y coordinate
 * @param {HTMLElement} timelineElement - Timeline DOM element
 * @returns {number} - Time in hours (0-24), snapped to 15-minute intervals
 */
export const getTimeFromMouseY = (clientY, timelineElement) => {
  if (!timelineElement) return 0;
  const rect = timelineElement.getBoundingClientRect();
  const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
  const percentage = y / rect.height;
  const hours = percentage * 24;
  return Math.round(hours * 4) / 4; // Snap to 15 minutes
};