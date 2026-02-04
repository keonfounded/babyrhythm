import React from 'react';
import { Trash2 } from 'lucide-react';
import { EVENT_TYPES } from '../../constants/eventTypes';
import { formatTime } from '../../utils/timeHelpers';
import { getDateKey } from '../../utils/dateHelpers';
import { predictRemainingDay } from '../../utils/sleepPredictor';

const EventsSidebar = ({ schedule, dateKey, deleteLoggedEvent, feedAmountUnit, birthDate, dailySchedules }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate overlaps and positioning for events
  const calculateEventLayout = (events) => {
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
    const columns = [];
    
    sortedEvents.forEach(event => {
      const eventStart = event.startTime;
      const eventEnd = event.endTime || event.startTime + 0.5; // Instant events get 30 min visual duration
      
      // Find a column where this event doesn't overlap
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
    
    // Calculate position and width for each event
    const layout = {};
    sortedEvents.forEach(event => {
      // Find which column this event is in
      let columnIndex = 0;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].includes(event)) {
          columnIndex = i;
          break;
        }
      }
      
      // Find max columns needed at this event's time
      const eventStart = event.startTime;
      const eventEnd = event.endTime || event.startTime + 0.5;
      let maxColumns = 1;
      
      sortedEvents.forEach(other => {
        if (other.id === event.id) return;
        const otherStart = other.startTime;
        const otherEnd = other.endTime || other.startTime + 0.5;
        
        // Check if they overlap
        if (eventStart < otherEnd && eventEnd > otherStart) {
          // Find which column the other event is in
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

  // Get predictions only for today
  const today = getDateKey(new Date());
  const isToday = dateKey === today;
  const predictionData = isToday && birthDate
    ? predictRemainingDay(birthDate, dailySchedules)
    : { predictions: [] };
  const predictedEvents = predictionData.predictions || [];

  // Combine logged events and predictions for layout calculation
  const allEvents = [...schedule.loggedEvents, ...predictedEvents];
  const eventLayout = calculateEventLayout(allEvents);

  return (
    <div className="w-48 flex-shrink-0 border-l-2 border-gray-700 pl-2">
      <div className="text-xs font-medium text-green-400 mb-1 sticky top-0 bg-gray-900 py-1">
        ✓ Actual ({schedule.loggedEvents.length})
        {isToday && predictedEvents.length > 0 && (
          <span className="ml-2 text-blue-400">⏱ Predicted ({predictedEvents.length})</span>
        )}
      </div>
      
      {/* Timeline-aligned event display */}
      <div className="relative bg-gray-800/30 rounded" style={{ height: `${24 * 40}px` }}>
        {/* Hour grid lines for alignment */}
        {hours.map(hour => (
          <div key={hour} className="h-10 border-b border-gray-700/30"></div>
        ))}

        {/* Events positioned at their actual times */}
        {schedule.loggedEvents.map(event => {
          const eventType = EVENT_TYPES[event.type];
          const topPercent = (event.startTime / 24) * 100;
          
          // For instant events, show 30 minutes visual height
          // For duration events, show actual duration
          const visualDuration = event.endTime 
            ? event.endTime - event.startTime 
            : 1; // 1 hour for instant events
          
          const heightPercent = (visualDuration / 24) * 100;
          const isInstant = !event.endTime;

          // Get layout info
          const layout = eventLayout[event.id];
          const widthPercent = 100 / layout.totalColumns;
          const leftPercent = (layout.column / layout.totalColumns) * 100;

          return (
            <div
              key={event.id}
              className={`absolute ${eventType.color}/60 border-l-2 ${eventType.color.replace('bg-', 'border-')} group rounded`}
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
                left: `${leftPercent}%`,
                width: `${widthPercent}%`
              }}
            >
              {/* Event content */}
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
                      {/* Show amount for feeds */}
                      {event.type === 'feed' && event.amount && (
                        <div className="text-xs text-pink-300 font-semibold">
                          {event.amount}{feedAmountUnit}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteLoggedEvent(dateKey, event.id)}
                    className="p-0.5 bg-red-600 hover:bg-red-700 rounded opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
                
                {/* Note - only show if there's space */}
                {event.note && visualDuration > 1 && (
                  <div className="text-xs text-gray-300 truncate mt-0.5" title={event.note}>
                    {event.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Predicted events - translucent with dashed border */}
        {predictedEvents.map(event => {
          const topPercent = (event.startTime / 24) * 100;
          const visualDuration = event.endTime - event.startTime;
          const heightPercent = (visualDuration / 24) * 100;

          // Get layout info for overlap handling
          const layout = eventLayout[event.id];
          const widthPercent = layout ? 100 / layout.totalColumns : 100;
          const leftPercent = layout ? (layout.column / layout.totalColumns) * 100 : 0;

          return (
            <div
              key={event.id}
              className="absolute bg-blue-500/20 border-2 border-dashed border-blue-400/60 rounded"
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
                left: `${leftPercent}%`,
                width: `${widthPercent}%`
              }}
            >
              <div className="p-1 flex flex-col h-full overflow-hidden">
                <div className="flex items-start gap-1">
                  <span className="text-sm flex-shrink-0">
                    {event.isBedtime ? '🌙' : '😴'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-blue-300 truncate">
                      {event.isBedtime ? 'Bedtime' : `Nap`}
                    </div>
                    <div className="text-xs text-blue-200/70">
                      ~{formatTime(event.startTime)}
                    </div>
                    <div className="text-xs text-blue-300/60">
                      {((event.endTime - event.startTime) * 60).toFixed(0)}m
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {schedule.loggedEvents.length === 0 && predictedEvents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-gray-500 text-center">No events logged</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsSidebar;