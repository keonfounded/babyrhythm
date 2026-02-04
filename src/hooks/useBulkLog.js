import { useState } from 'react';
import { getDateKey } from '../utils/dateHelpers';

export const useBulkLog = (getScheduleForDate, updateScheduleForDate) => {
  const [bulkLogForm, setBulkLogForm] = useState({
    date: getDateKey(new Date()),
    eventType: 'feed',
    startTime: '12:00',
    endTime: '',
    duration: '',
    amount: '', // NEW
    note: ''
  });

  const handleBulkLogSubmit = () => {
    const [hours, minutes] = bulkLogForm.startTime.split(':').map(Number);
    const startTimeInHours = hours + minutes / 60;

    let endTimeInHours = null;
    if (bulkLogForm.eventType === 'sleep') {
      if (bulkLogForm.endTime) {
        const [endHours, endMinutes] = bulkLogForm.endTime.split(':').map(Number);
        endTimeInHours = endHours + endMinutes / 60;
      } else if (bulkLogForm.duration) {
        endTimeInHours = startTimeInHours + parseFloat(bulkLogForm.duration);
      }
    }

    const timestamp = new Date(bulkLogForm.date + 'T' + bulkLogForm.startTime).toISOString();
    const dateKey = bulkLogForm.date;

    const schedule = getScheduleForDate(dateKey);
    const maxId = schedule.loggedEvents.length > 0 
      ? Math.max(...schedule.loggedEvents.map(e => e.id))
      : 0;
    
    const newEvent = {
      id: maxId + 1,
      type: bulkLogForm.eventType,
      startTime: startTimeInHours,
      endTime: endTimeInHours,
      timestamp,
      metadata: {},
      note: bulkLogForm.note,
      amount: bulkLogForm.amount ? parseFloat(bulkLogForm.amount) : null,
      diaperType: bulkLogForm.eventType === 'diaper' ? (bulkLogForm.diaperType || 'wet') : null
    };
    
    updateScheduleForDate(dateKey, {
      loggedEvents: [...schedule.loggedEvents, newEvent].sort((a, b) => a.startTime - b.startTime)
    });

    setBulkLogForm({
      ...bulkLogForm,
      startTime: '12:00',
      endTime: '',
      duration: '',
      amount: '',
      diaperType: '',
      note: ''
    });

    alert('Event logged successfully!');
  };

  return {
    bulkLogForm,
    setBulkLogForm,
    handleBulkLogSubmit
  };
};