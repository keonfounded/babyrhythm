/**
 * Get all events across all days, sorted by date
 * @param {Object} dailySchedules - All daily schedules
 * @returns {Array} - Sorted array of events with dateKey
 */
export const getAllEvents = (dailySchedules) => {
  const allEvents = [];
  
  Object.keys(dailySchedules).forEach(dateKey => {
    const schedule = dailySchedules[dateKey];
    if (schedule.loggedEvents && schedule.loggedEvents.length > 0) {
      schedule.loggedEvents.forEach(event => {
        allEvents.push({
          ...event,
          dateKey,
          date: new Date(dateKey + 'T00:00:00') // Force midnight local time
        });
      });
    }
  });
  
  return allEvents.sort((a, b) => {
    // Sort by date first, then by time within the day
    const dateCompare = a.date - b.date;
    if (dateCompare !== 0) return dateCompare;
    return a.startTime - b.startTime;
  });
};

/**
 * Get events filtered by type
 * @param {Array} events - All events
 * @param {string} eventType - Type to filter by
 * @returns {Array} - Filtered events
 */
export const getEventsByType = (events, eventType) => {
  return events.filter(e => e.type === eventType);
};

/**
 * Get events within a date range
 * @param {Array} events - All events
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (inclusive)
 * @returns {Array} - Filtered events
 */
export const getEventsInRange = (events, startDate, endDate) => {
  return events.filter(e => e.date >= startDate && e.date <= endDate);
};

/**
 * Calculate sleep statistics from events
 * @param {Array} sleepEvents - Sleep events with endTime
 * @returns {Object} - Statistics
 */
export const calculateSleepStats = (sleepEvents) => {
  const completedSleeps = sleepEvents.filter(e => e.endTime !== null);
  
  if (completedSleeps.length === 0) {
    return {
      totalSleeps: 0,
      totalHours: 0,
      averageDuration: 0,
      longestSleep: 0,
      shortestSleep: 0
    };
  }
  
  const durations = completedSleeps.map(e => e.endTime - e.startTime);
  const totalHours = durations.reduce((sum, d) => sum + d, 0);
  
  return {
    totalSleeps: completedSleeps.length,
    totalHours: totalHours,
    averageDuration: totalHours / completedSleeps.length,
    longestSleep: Math.max(...durations),
    shortestSleep: Math.min(...durations)
  };
};

/**
 * Group events by day
 * @param {Array} events - All events
 * @returns {Object} - Events grouped by dateKey
 */
export const groupEventsByDay = (events) => {
  const grouped = {};
  
  events.forEach(event => {
    if (!grouped[event.dateKey]) {
      grouped[event.dateKey] = [];
    }
    grouped[event.dateKey].push(event);
  });
  
  return grouped;
};

/**
 * Calculate daily totals by event type
 * @param {Object} groupedEvents - Events grouped by day
 * @returns {Array} - Daily summaries
 */
export const calculateDailySummaries = (groupedEvents) => {
  return Object.keys(groupedEvents).map(dateKey => {
    const dayEvents = groupedEvents[dateKey];
    const sleepEvents = dayEvents.filter(e => e.type === 'sleep' && e.endTime);
    const totalSleep = sleepEvents.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
    
    return {
      dateKey,
      date: new Date(dateKey + 'T00:00:00'),
      totalSleep,
      feedCount: dayEvents.filter(e => e.type === 'feed').length,
      diaperCount: dayEvents.filter(e => e.type === 'diaper').length,
      sleepCount: sleepEvents.length,
      noteCount: dayEvents.filter(e => e.type === 'note').length
    };
  }).sort((a, b) => b.date - a.date);
};

/**
 * Get sleep data for charting (last N days)
 * @param {Array} dailySummaries - Daily summaries
 * @param {number} days - Number of days to include
 * @returns {Array} - Chart data
 */
export const getSleepChartData = (dailySummaries, days = 7) => {
  return dailySummaries
    .slice(0, days)
    .reverse()
    .map(summary => ({
      date: summary.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateKey: summary.dateKey,
      hours: parseFloat(summary.totalSleep.toFixed(1))
    }));
};

/**
 * Calculate feeding statistics from events
 * @param {Array} feedEvents - Feed events
 * @returns {Object} - Statistics
 */
export const calculateFeedStats = (feedEvents) => {
  const eventsWithAmount = feedEvents.filter(e => e.amount !== null && e.amount > 0);
  
  if (eventsWithAmount.length === 0) {
    return {
      totalFeeds: feedEvents.length,
      totalAmount: 0,
      averageAmount: 0,
      feedsWithAmount: 0
    };
  }
  
  const totalAmount = eventsWithAmount.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    totalFeeds: feedEvents.length,
    totalAmount,
    averageAmount: totalAmount / eventsWithAmount.length,
    feedsWithAmount: eventsWithAmount.length
  };
};

/**
 * Get feeding data for charting (last N days)
 * @param {Array} dailySummaries - Daily summaries with feed data
 * @param {Object} groupedEvents - Events grouped by day
 * @param {number} days - Number of days to include
 * @returns {Array} - Chart data
 */
export const getFeedChartData = (dailySummaries, groupedEvents, days = 7) => {
  return dailySummaries
    .slice(0, days)
    .reverse()
    .map(summary => {
      const dayEvents = groupedEvents[summary.dateKey] || [];
      const feedEvents = dayEvents.filter(e => e.type === 'feed' && e.amount);
      const totalAmount = feedEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      return {
        date: summary.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateKey: summary.dateKey,
        amount: parseFloat(totalAmount.toFixed(1)),
        count: summary.feedCount
      };
    });
};

/**
 * Get diaper data for charting (last N days)
 * @param {Array} dailySummaries - Daily summaries
 * @param {Object} groupedEvents - Events grouped by day
 * @param {number} days - Number of days to include
 * @returns {Array} - Chart data with type breakdown
 */
export const getDiaperChartData = (dailySummaries, groupedEvents, days = 7) => {
  return dailySummaries
    .slice(0, days)
    .reverse()
    .map(summary => {
      const dayEvents = groupedEvents[summary.dateKey] || [];
      const diaperEvents = dayEvents.filter(e => e.type === 'diaper');
      
      return {
        date: summary.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateKey: summary.dateKey,
        wet: diaperEvents.filter(e => e.diaperType === 'wet').length,
        dirty: diaperEvents.filter(e => e.diaperType === 'dirty').length,
        both: diaperEvents.filter(e => e.diaperType === 'both').length,
        total: diaperEvents.length
      };
    });
};