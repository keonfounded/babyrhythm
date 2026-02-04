import { useState, useEffect } from 'react';
import { getCurrentTimeInHours } from '../utils/timeHelpers';
import { getCurrentDateKey } from '../utils/dateHelpers';

export const useEventLogging = (getScheduleForDate, updateScheduleForDate) => {
  const [activeSleepSession, setActiveSleepSession] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [feedAmountUnit, setFeedAmountUnit] = useState(() => {
    try { return localStorage.getItem('babyRhythm_feedAmountUnit') || 'oz'; } catch { return 'oz'; }
  });

  useEffect(() => {
    try { localStorage.setItem('babyRhythm_feedAmountUnit', feedAmountUnit); } catch {}
  }, [feedAmountUnit]);

  // Clear undo after 30 seconds
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 30000);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  const logEvent = (dateKey, eventType, customTime = null, amount = null, diaperType = null) => {
    const now = new Date();
    const timeInHours = customTime !== null ? customTime : getCurrentTimeInHours();

    const schedule = getScheduleForDate(dateKey);
    const maxId = schedule.loggedEvents.length > 0
      ? Math.max(...schedule.loggedEvents.map(e => e.id))
      : 0;

    const newEvent = {
      id: maxId + 1,
      type: eventType,
      startTime: timeInHours,
      endTime: null,
      timestamp: now.toISOString(),
      metadata: {},
      note: '',
      amount: amount,
      diaperType: diaperType
    };

    updateScheduleForDate(dateKey, {
      loggedEvents: [...schedule.loggedEvents, newEvent].sort((a, b) => a.startTime - b.startTime)
    });

    // Track for undo
    setLastAction({
      type: 'add',
      dateKey,
      eventId: maxId + 1,
      eventType,
      event: newEvent
    });

    return maxId + 1;
  };

  const beginSleep = () => {
    const dateKey = getCurrentDateKey();
    const eventId = logEvent(dateKey, 'sleep');
    setActiveSleepSession({ dateKey, eventId });
  };

  const endSleep = () => {
    if (!activeSleepSession) return;

    const { dateKey, eventId } = activeSleepSession;
    const endTime = getCurrentTimeInHours();

    const schedule = getScheduleForDate(dateKey);
    const originalEvent = schedule.loggedEvents.find(e => e.id === eventId);

    updateScheduleForDate(dateKey, {
      loggedEvents: schedule.loggedEvents.map(e =>
        e.id === eventId ? { ...e, endTime } : e
      )
    });

    // Track for undo
    setLastAction({
      type: 'endSleep',
      dateKey,
      eventId,
      previousEndTime: originalEvent?.endTime
    });

    setActiveSleepSession(null);
  };

  const logEventNow = (eventType, amount = null, diaperType = null) => {
    const dateKey = getCurrentDateKey();
    logEvent(dateKey, eventType, null, amount, diaperType);
  };

  const deleteLoggedEvent = (dateKey, eventId) => {
    const schedule = getScheduleForDate(dateKey);
    const deletedEvent = schedule.loggedEvents.find(e => e.id === eventId);

    updateScheduleForDate(dateKey, {
      loggedEvents: schedule.loggedEvents.filter(e => e.id !== eventId)
    });

    // Track for undo
    if (deletedEvent) {
      setLastAction({
        type: 'delete',
        dateKey,
        eventId,
        event: deletedEvent
      });
    }
  };

  const undoLastAction = () => {
    if (!lastAction) return false;

    const { type, dateKey, eventId, event, previousEndTime } = lastAction;
    const schedule = getScheduleForDate(dateKey);

    switch (type) {
      case 'add':
        // Undo add = delete the event
        updateScheduleForDate(dateKey, {
          loggedEvents: schedule.loggedEvents.filter(e => e.id !== eventId)
        });
        // If it was a sleep session, clear it
        if (activeSleepSession?.eventId === eventId) {
          setActiveSleepSession(null);
        }
        break;

      case 'delete':
        // Undo delete = restore the event
        updateScheduleForDate(dateKey, {
          loggedEvents: [...schedule.loggedEvents, event].sort((a, b) => a.startTime - b.startTime)
        });
        break;

      case 'endSleep':
        // Undo end sleep = restore the session
        updateScheduleForDate(dateKey, {
          loggedEvents: schedule.loggedEvents.map(e =>
            e.id === eventId ? { ...e, endTime: previousEndTime } : e
          )
        });
        setActiveSleepSession({ dateKey, eventId });
        break;

      default:
        return false;
    }

    setLastAction(null);
    return true;
  };

  const canUndo = lastAction !== null;
  const undoLabel = lastAction ? getUndoLabel(lastAction) : null;

  return {
    activeSleepSession,
    feedAmountUnit,
    setFeedAmountUnit,
    logEvent,
    beginSleep,
    endSleep,
    logEventNow,
    deleteLoggedEvent,
    undoLastAction,
    canUndo,
    undoLabel
  };
};

// Helper to get human-readable undo label
function getUndoLabel(action) {
  const typeLabels = {
    feed: 'Feed',
    sleep: 'Sleep',
    diaper: 'Diaper',
    note: 'Note'
  };

  switch (action.type) {
    case 'add':
      return `Undo ${typeLabels[action.eventType] || action.eventType}`;
    case 'delete':
      return `Restore ${typeLabels[action.event?.type] || 'Event'}`;
    case 'endSleep':
      return 'Undo Wake';
    default:
      return 'Undo';
  }
}
