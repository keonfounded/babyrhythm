import React from 'react';
import { Baby, Trash2 } from 'lucide-react';
import { EVENT_TYPES } from '../../constants/eventTypes';
import { formatTime } from '../../utils/timeHelpers';
import { getDateKey } from '../../utils/dateHelpers';
import { predictRemainingDay } from '../../utils/sleepPredictor';
import { predictRemainingFeeds } from '../../utils/feedPredictor';

const BabyCalendar = ({
  dateKey,
  schedule,
  birthDate,
  dailySchedules,
  feedDuration,
  deleteLoggedEvent,
  feedAmountUnit,
  showParents
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get predictions only for today
  const today = getDateKey(new Date());
  const isToday = dateKey === today;

  // Get feed predictions first
  const feedPredictionData = isToday && birthDate
    ? predictRemainingFeeds(birthDate, dailySchedules, feedDuration)
    : { predictions: [] };
  const predictedFeeds = feedPredictionData.predictions || [];

  // Get sleep predictions, passing in predicted feeds so they can affect wake windows
  const sleepPredictionData = isToday && birthDate
    ? predictRemainingDay(birthDate, dailySchedules, predictedFeeds)
    : { predictions: [] };
  const predictedSleeps = sleepPredictionData.predictions || [];

  // Combine all predictions for rendering
  const allPredictions = [
    ...predictedSleeps,
    ...predictedFeeds
  ];

  // Layout calculation for overlapping events
  const calculateEventLayout = (events) => {
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
    const columns = [];

    sortedEvents.forEach(event => {
      const eventStart = event.startTime;
      const eventEnd = event.endTime || event.startTime + 0.5;

      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const hasOverlap = column.some(e => {
          const eStart = e.startTime;
          const eEnd = e.endTime || e.startTime + 0.5;
          return eventStart < eEnd && eventEnd > eStart;
        });

        if (!hasOverlap) {
          column.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([event]);
      }
    });

    const layout = {};
    sortedEvents.forEach(event => {
      let columnIndex = 0;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].includes(event)) {
          columnIndex = i;
          break;
        }
      }

      const eventStart = event.startTime;
      const eventEnd = event.endTime || event.startTime + 0.5;
      let maxColumns = 1;

      sortedEvents.forEach(other => {
        if (other.id === event.id) return;
        const otherStart = other.startTime;
        const otherEnd = other.endTime || other.startTime + 0.5;

        if (eventStart < otherEnd && eventEnd > otherStart) {
          for (let i = 0; i < columns.length; i++) {
            if (columns[i].includes(other)) {
              maxColumns = Math.max(maxColumns, i + 1);
              break;
            }
          }
        }
      });

      maxColumns = Math.max(maxColumns, columnIndex + 1);

      layout[event.id] = {
        column: columnIndex,
        totalColumns: maxColumns
      };
    });

    return layout;
  };

  // Separate layouts for predicted and actual
  const predictedLayout = calculateEventLayout(allPredictions);
  const actualLayout = calculateEventLayout(schedule.loggedEvents);

  // Current time for the time indicator line
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentTimePercent = (currentHour / 24) * 100;

  // Width adjusts when parents are hidden
  const widthClass = showParents ? 'flex-1' : 'flex-1';

  return (
    <div className={`${widthClass} flex flex-col`}>
      {/* Header */}
      <div className="text-xs font-medium text-pink-400 mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Baby className="w-3 h-3" />
          Baby Calendar
        </div>
        <div className="flex gap-2 text-gray-400">
          {isToday && sleepPredictionData.totalPredictedSleep !== undefined && (
            <>
              <span className="text-indigo-400" title={`Target: ${sleepPredictionData.targetDailySleep?.toFixed(1)}h/day`}>
                😴 {sleepPredictionData.totalPredictedSleep.toFixed(1)}h predicted
              </span>
              <span className="text-pink-400">
                🍼 {predictedFeeds.length} feeds
              </span>
              <span className="text-gray-500">|</span>
            </>
          )}
          <span className="text-green-400">✓ {schedule.loggedEvents.length} logged</span>
        </div>
      </div>

      {/* Split calendar: Predicted (left) | Actual (right) */}
      <div className="flex gap-1 flex-1">
        {/* Predicted events column */}
        <div className="flex-1 relative bg-gray-800/40 rounded" style={{ height: `${24 * 40}px` }}>
          {/* Hour grid */}
          {hours.map(hour => (
            <div key={hour} className="h-10 border-b border-gray-700/30"></div>
          ))}

          {/* Current time line */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: `${currentTimePercent}%` }}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
              </div>
            </div>
          )}

          {/* Predicted sleep events */}
          {predictedSleeps.map(event => {
            const topPercent = (event.startTime / 24) * 100;
            const heightPercent = ((event.endTime - event.startTime) / 24) * 100;
            const layout = predictedLayout[event.id];
            const widthPercent = layout ? 100 / layout.totalColumns : 100;
            const leftPercent = layout ? (layout.column / layout.totalColumns) * 100 : 0;

            return (
              <div
                key={event.id}
                className="absolute bg-indigo-500/25 border-2 border-dashed border-indigo-400/50 rounded"
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`
                }}
              >
                <div className="p-1 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">😴</span>
                    <div className="text-xs text-indigo-300 truncate">
                      Sleep
                    </div>
                  </div>
                  <div className="text-xs text-indigo-200/60">
                    ~{formatTime(event.startTime)}
                  </div>
                  <div className="text-xs text-indigo-300/50">
                    {((event.endTime - event.startTime) * 60).toFixed(0)}m
                  </div>
                </div>
              </div>
            );
          })}

          {/* Predicted feed events */}
          {predictedFeeds.map(event => {
            const topPercent = (event.startTime / 24) * 100;
            const heightPercent = ((event.endTime - event.startTime) / 24) * 100;
            const layout = predictedLayout[event.id];
            const widthPercent = layout ? 100 / layout.totalColumns : 100;
            const leftPercent = layout ? (layout.column / layout.totalColumns) * 100 : 0;

            return (
              <div
                key={event.id}
                className="absolute bg-pink-500/20 border-2 border-dashed border-pink-400/50 rounded"
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`
                }}
              >
                <div className="p-1 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🍼</span>
                    <div className="text-xs text-pink-300 truncate">Feed</div>
                  </div>
                  <div className="text-xs text-pink-200/60">
                    ~{formatTime(event.startTime)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state for predictions */}
          {!isToday && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-gray-500 text-center">
                Predictions show<br />for today only
              </div>
            </div>
          )}
          {isToday && allPredictions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-gray-500 text-center">
                No events<br />predicted
              </div>
            </div>
          )}

          {/* Column label */}
          <div className="absolute bottom-1 left-1 text-xs text-gray-500 bg-gray-900/80 px-1 rounded">
            Predicted
          </div>
        </div>

        {/* Actual events column */}
        <div className="flex-1 relative bg-gray-800/60 rounded" style={{ height: `${24 * 40}px` }}>
          {/* Hour grid */}
          {hours.map(hour => (
            <div key={hour} className="h-10 border-b border-gray-700/30"></div>
          ))}

          {/* Current time line */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: `${currentTimePercent}%` }}
            >
              <div className="flex items-center">
                <div className="flex-1 h-0.5 bg-red-500"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full -mr-1"></div>
              </div>
            </div>
          )}

          {/* Actual logged events */}
          {schedule.loggedEvents.map(event => {
            const eventType = EVENT_TYPES[event.type];
            const topPercent = (event.startTime / 24) * 100;
            const visualDuration = event.endTime
              ? event.endTime - event.startTime
              : 1;
            const heightPercent = (visualDuration / 24) * 100;
            const isInstant = !event.endTime;

            const layout = actualLayout[event.id];
            const widthPercent = layout ? 100 / layout.totalColumns : 100;
            const leftPercent = layout ? (layout.column / layout.totalColumns) * 100 : 0;

            return (
              <div
                key={event.id}
                className={`absolute ${eventType.color} border-l-3 ${eventType.color.replace('bg-', 'border-')} group rounded shadow-sm`}
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`
                }}
              >
                <div className="p-1 flex flex-col h-full overflow-hidden">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      <span className="text-sm flex-shrink-0">{eventType.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {event.type === 'diaper' && event.diaperType
                            ? (event.diaperType === 'wet' ? '💧 Wet' : event.diaperType === 'dirty' ? '💩 Dirty' : '💧💩 Both')
                            : eventType.label}
                        </div>
                        <div className="text-xs text-gray-200">
                          {formatTime(event.startTime)}
                        </div>
                        {!isInstant && (
                          <div className="text-xs text-green-300">
                            {((event.endTime - event.startTime) * 60).toFixed(0)}m
                          </div>
                        )}
                        {event.type === 'feed' && event.amount && (
                          <div className="text-xs text-pink-300 font-semibold">
                            {event.amount}{feedAmountUnit}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteLoggedEvent(dateKey, event.id)}
                      className="p-0.5 bg-red-600 hover:bg-red-700 rounded opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  {event.note && visualDuration > 1 && (
                    <div className="text-xs text-gray-300 truncate mt-0.5" title={event.note}>
                      {event.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty state for actual events */}
          {schedule.loggedEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-gray-500 text-center">
                No events<br />logged yet
              </div>
            </div>
          )}

          {/* Column label */}
          <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-gray-900/80 px-1 rounded">
            Actual
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyCalendar;
