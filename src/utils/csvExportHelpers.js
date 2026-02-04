/**
 * CSV Export utilities for BabyRhythm data
 */

/**
 * Convert array of objects to CSV string
 */
const arrayToCSV = (data, columns) => {
  if (!data || data.length === 0) return '';

  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const value = c.getValue ? c.getValue(row) : row[c.key];
      // Escape quotes and wrap in quotes if contains comma or newline
      const strValue = String(value ?? '');
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',')
  );

  return [headers, ...rows].join('\n');
};

/**
 * Trigger file download
 */
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format time from decimal hours to HH:MM
 */
const formatTimeForCSV = (decimalHours) => {
  if (decimalHours === null || decimalHours === undefined) return '';
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Export all events to CSV
 */
export const exportEventsToCSV = (dailySchedules, babyName = 'Baby') => {
  const events = [];

  Object.entries(dailySchedules).forEach(([dateKey, schedule]) => {
    if (schedule.loggedEvents) {
      schedule.loggedEvents.forEach(event => {
        events.push({
          date: dateKey,
          type: event.type,
          startTime: event.startTime,
          endTime: event.endTime,
          duration: event.endTime ? (event.endTime - event.startTime).toFixed(2) : '',
          amount: event.amount,
          diaperType: event.diaperType,
          note: event.note
        });
      });
    }
  });

  // Sort by date and time
  events.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime - b.startTime;
  });

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Event Type' },
    { label: 'Start Time', getValue: (row) => formatTimeForCSV(row.startTime) },
    { label: 'End Time', getValue: (row) => formatTimeForCSV(row.endTime) },
    { label: 'Duration (hours)', getValue: (row) => row.duration },
    { key: 'amount', label: 'Amount' },
    { key: 'diaperType', label: 'Diaper Type' },
    { key: 'note', label: 'Note' }
  ];

  const csv = arrayToCSV(events, columns);
  const filename = `${babyName.toLowerCase().replace(/\s+/g, '-')}-events-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);

  return events.length;
};

/**
 * Export weight history to CSV
 */
export const exportWeightHistoryToCSV = (weightHistory, weightUnit, babyName = 'Baby') => {
  if (!weightHistory || weightHistory.length === 0) {
    return 0;
  }

  const sorted = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));

  const columns = [
    { key: 'date', label: 'Date' },
    { label: `Weight (${weightUnit})`, getValue: (row) => row.weight },
    { key: 'note', label: 'Note' }
  ];

  const csv = arrayToCSV(sorted, columns);
  const filename = `${babyName.toLowerCase().replace(/\s+/g, '-')}-weight-history-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);

  return sorted.length;
};

/**
 * Export milestones to CSV
 */
export const exportMilestonesToCSV = (milestones, milestoneDefinitions, babyName = 'Baby') => {
  const data = [];

  // Get all predefined milestones with their achievement status
  Object.entries(milestoneDefinitions).forEach(([category, categoryMilestones]) => {
    categoryMilestones.forEach(milestone => {
      const achievement = milestones[milestone.id];
      data.push({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        milestone: milestone.label,
        typicalAge: milestone.typicalAge,
        achieved: achievement?.achieved ? 'Yes' : 'No',
        dateAchieved: achievement?.date || '',
        note: achievement?.note || ''
      });
    });
  });

  const columns = [
    { key: 'category', label: 'Category' },
    { key: 'milestone', label: 'Milestone' },
    { key: 'typicalAge', label: 'Typical Age' },
    { key: 'achieved', label: 'Achieved' },
    { key: 'dateAchieved', label: 'Date Achieved' },
    { key: 'note', label: 'Note' }
  ];

  const csv = arrayToCSV(data, columns);
  const filename = `${babyName.toLowerCase().replace(/\s+/g, '-')}-milestones-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);

  return data.length;
};

/**
 * Export daily summary to CSV
 */
export const exportDailySummaryToCSV = (dailySchedules, babyName = 'Baby') => {
  const summaries = [];

  Object.entries(dailySchedules).forEach(([dateKey, schedule]) => {
    const events = schedule.loggedEvents || [];

    const sleepEvents = events.filter(e => e.type === 'sleep' && e.endTime);
    const totalSleep = sleepEvents.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);

    const feedEvents = events.filter(e => e.type === 'feed');
    const totalFeedAmount = feedEvents.reduce((sum, e) => sum + (e.amount || 0), 0);

    const diaperEvents = events.filter(e => e.type === 'diaper');

    summaries.push({
      date: dateKey,
      sleepHours: totalSleep.toFixed(2),
      sleepSessions: sleepEvents.length,
      feedCount: feedEvents.length,
      feedAmount: totalFeedAmount.toFixed(1),
      diaperCount: diaperEvents.length,
      wetDiapers: diaperEvents.filter(e => e.diaperType === 'wet').length,
      dirtyDiapers: diaperEvents.filter(e => e.diaperType === 'dirty').length,
      noteCount: events.filter(e => e.type === 'note').length
    });
  });

  // Sort by date
  summaries.sort((a, b) => a.date.localeCompare(b.date));

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'sleepHours', label: 'Sleep (hours)' },
    { key: 'sleepSessions', label: 'Sleep Sessions' },
    { key: 'feedCount', label: 'Feeds' },
    { key: 'feedAmount', label: 'Feed Amount' },
    { key: 'diaperCount', label: 'Total Diapers' },
    { key: 'wetDiapers', label: 'Wet Diapers' },
    { key: 'dirtyDiapers', label: 'Dirty Diapers' },
    { key: 'noteCount', label: 'Notes' }
  ];

  const csv = arrayToCSV(summaries, columns);
  const filename = `${babyName.toLowerCase().replace(/\s+/g, '-')}-daily-summary-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);

  return summaries.length;
};

/**
 * Export doctor visit report to CSV
 */
export const exportDoctorReportToCSV = (summary, concerns, babyName = 'Baby') => {
  if (!summary) return 0;

  const { baby, period, sleep, feeds, diapers, notes } = summary;

  // Create a formatted report as CSV
  const data = [
    { section: 'Patient Information', field: 'Name', value: baby.name },
    { section: 'Patient Information', field: 'Birth Date', value: baby.birthDate },
    { section: 'Patient Information', field: 'Age', value: `${baby.age.weeks} weeks, ${baby.age.days} days` },
    { section: 'Patient Information', field: 'Sex', value: baby.sex === 'girl' ? 'Female' : 'Male' },
    { section: 'Patient Information', field: 'Current Weight', value: baby.currentWeight ? `${baby.currentWeight} ${baby.weightUnit}` : 'N/A' },
    { section: 'Patient Information', field: 'Weight Percentile', value: baby.percentile ? `${Math.round(baby.percentile)}th` : 'N/A' },
    { section: '', field: '', value: '' },
    { section: 'Report Period', field: 'Start Date', value: period.start },
    { section: 'Report Period', field: 'End Date', value: period.end },
    { section: 'Report Period', field: 'Days', value: period.days },
    { section: '', field: '', value: '' },
    { section: 'Sleep Summary', field: 'Average per Day', value: `${sleep.avgHoursPerDay.toFixed(1)} hours` },
    { section: 'Sleep Summary', field: 'Total Sessions', value: sleep.totalSessions },
    { section: 'Sleep Summary', field: 'Avg Session Duration', value: `${sleep.avgDurationPerSession.toFixed(1)} hours` },
    { section: 'Sleep Summary', field: 'Longest Stretch', value: `${sleep.longestStretch.toFixed(1)} hours` },
    { section: '', field: '', value: '' },
    { section: 'Feeding Summary', field: 'Average per Day', value: feeds.avgFeedsPerDay.toFixed(1) },
    { section: 'Feeding Summary', field: 'Total Feeds', value: feeds.totalFeeds },
    { section: 'Feeding Summary', field: 'Average Amount', value: feeds.avgAmount > 0 ? `${feeds.avgAmount.toFixed(1)} oz` : 'N/A' },
    { section: '', field: '', value: '' },
    { section: 'Diaper Summary', field: 'Average per Day', value: diapers.avgPerDay.toFixed(1) },
    { section: 'Diaper Summary', field: 'Total Changes', value: diapers.total },
    { section: 'Diaper Summary', field: 'Wet', value: diapers.wet },
    { section: 'Diaper Summary', field: 'Dirty', value: diapers.dirty },
  ];

  if (concerns) {
    data.push({ section: '', field: '', value: '' });
    data.push({ section: 'Parent Concerns', field: 'Notes', value: concerns });
  }

  if (notes && notes.length > 0) {
    data.push({ section: '', field: '', value: '' });
    notes.forEach((note, i) => {
      data.push({ section: 'Recent Notes', field: note.date, value: note.note });
    });
  }

  const columns = [
    { key: 'section', label: 'Section' },
    { key: 'field', label: 'Field' },
    { key: 'value', label: 'Value' }
  ];

  const csv = arrayToCSV(data, columns);
  const filename = `${babyName.toLowerCase().replace(/\s+/g, '-')}-doctor-report-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);

  return data.length;
};
