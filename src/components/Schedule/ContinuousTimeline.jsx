import React, { useRef, useEffect, useState } from 'react';
import { Baby, Coffee, ChevronUp, ChevronDown, Plus, Trash2, Briefcase } from 'lucide-react';
import { EVENT_TYPES } from '../../constants/eventTypes';
import { formatTime } from '../../utils/timeHelpers';
import { getDateKey } from '../../utils/dateHelpers';
import { predictRemainingDay } from '../../utils/sleepPredictor';
import { predictRemainingFeeds } from '../../utils/feedPredictor';

const HOUR_HEIGHT = 48; // pixels per hour (desktop)
const HOUR_HEIGHT_MOBILE = 40; // pixels per hour (mobile)

const ContinuousTimeline = ({
  dailySchedules,
  birthDate,
  feedDuration,
  deleteLoggedEvent,
  feedAmountUnit,
  showParents,
  toggleParents,
  getScheduleForDate,
  addBlock,
  removeBlock
}) => {
  const scrollRef = useRef(null);
  const [hoursRange, setHoursRange] = useState({ past: 24, future: 24 });
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hourHeight = isMobile ? HOUR_HEIGHT_MOBILE : HOUR_HEIGHT;

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const today = getDateKey(now);

  // Calculate time boundaries
  const startTime = new Date(now.getTime() - hoursRange.past * 60 * 60 * 1000);
  const totalHours = hoursRange.past + hoursRange.future;
  const totalHeight = totalHours * hourHeight;

  // Position of "now" within the timeline
  const nowOffsetHours = hoursRange.past + (now.getMinutes() / 60);
  const nowPositionPx = nowOffsetHours * hourHeight;

  // Generate hour slots
  const generateHourSlots = () => {
    const slots = [];
    const cursor = new Date(startTime);

    for (let i = 0; i < totalHours; i++) {
      const hour = cursor.getHours();
      const dateKey = getDateKey(cursor);

      slots.push({
        index: i,
        hour,
        dateKey,
        isMidnight: hour === 0,
        isNoon: hour === 12,
        date: new Date(cursor),
        label: `${hour.toString().padStart(2, '0')}:00`
      });

      cursor.setHours(cursor.getHours() + 1);
    }
    return slots;
  };

  const hourSlots = generateHourSlots();

  // Get absolute hour position for an event (timezone-safe)
  const getAbsoluteHour = (dateKey, hour) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day, Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
    const diffMs = eventDate.getTime() - startTime.getTime();
    return diffMs / (60 * 60 * 1000);
  };

  // Collect events from all visible days
  const collectEvents = () => {
    const events = [];
    const seenDates = new Set();

    hourSlots.forEach(slot => {
      if (!seenDates.has(slot.dateKey)) {
        seenDates.add(slot.dateKey);
        const schedule = getScheduleForDate(slot.dateKey);
        if (schedule?.loggedEvents) {
          schedule.loggedEvents.forEach(event => {
            const absHour = getAbsoluteHour(slot.dateKey, event.startTime);
            const absEndHour = event.endTime
              ? getAbsoluteHour(slot.dateKey, event.endTime)
              : absHour + 1;

            if (absHour >= 0 && absHour <= totalHours) {
              events.push({
                ...event,
                dateKey: slot.dateKey,
                absoluteHour: absHour,
                absoluteEndHour: absEndHour
              });
            }
          });
        }
      }
    });
    return events;
  };

  // Collect parent blocks
  const collectParentBlocks = (person) => {
    const blocks = [];
    const seenDates = new Set();

    hourSlots.forEach(slot => {
      if (!seenDates.has(slot.dateKey)) {
        seenDates.add(slot.dateKey);
        const schedule = getScheduleForDate(slot.dateKey);
        const personBlocks = person === 'mom' ? schedule?.momBlocks : schedule?.dadBlocks;

        if (personBlocks) {
          personBlocks.forEach(block => {
            const absStart = getAbsoluteHour(slot.dateKey, block.start);
            const absEnd = getAbsoluteHour(slot.dateKey, block.end);

            if (absStart >= 0 && absStart <= totalHours) {
              blocks.push({
                ...block,
                dateKey: slot.dateKey,
                absoluteStart: absStart,
                absoluteEnd: absEnd
              });
            }
          });
        }
      }
    });
    return blocks;
  };

  // Get predictions
  const feedPredictions = birthDate
    ? predictRemainingFeeds(birthDate, dailySchedules, feedDuration)
    : { predictions: [] };

  const sleepPredictions = birthDate
    ? predictRemainingDay(birthDate, dailySchedules, feedPredictions.predictions)
    : { predictions: [], totalPredictedSleep: 0 };

  // Position predictions
  const positionedPredictions = [
    ...sleepPredictions.predictions.map(p => ({
      ...p,
      absoluteHour: getAbsoluteHour(today, p.startTime),
      absoluteEndHour: getAbsoluteHour(today, p.endTime)
    })),
    ...feedPredictions.predictions.map(p => ({
      ...p,
      absoluteHour: getAbsoluteHour(today, p.startTime),
      absoluteEndHour: getAbsoluteHour(today, p.endTime)
    }))
  ].filter(p => p.absoluteHour >= 0 && p.absoluteHour <= totalHours);

  const allEvents = collectEvents();
  const momBlocks = collectParentBlocks('mom');
  const dadBlocks = collectParentBlocks('dad');

  // Auto-scroll to current time on mount (NOW at 1/4 from top)
  useEffect(() => {
    if (scrollRef.current) {
      const scrollPosition = nowPositionPx - scrollRef.current.clientHeight / 4;
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, []);

  const loadMorePast = () => setHoursRange(prev => ({ ...prev, past: prev.past + 24 }));
  const loadMoreFuture = () => setHoursRange(prev => ({ ...prev, future: prev.future + 24 }));

  const formatDayLabel = (date) => {
    const dateKey = getDateKey(date);
    const isToday = dateKey === today;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { isToday, dayName, monthDay, full: isToday ? 'TODAY' : `${dayName} ${monthDay}` };
  };

  // Format hour for display (12-hour with am/pm)
  const formatHourLabel = (hour) => {
    if (hour === 0) return '12a';
    if (hour === 12) return '12p';
    if (hour < 12) return `${hour}a`;
    return `${hour - 12}p`;
  };

  // Render parent column
  const renderParentColumn = (person, blocks, color) => {
    const colorClasses = person === 'mom'
      ? { text: 'text-purple-400', sleep: 'bg-purple-500', duty: 'bg-red-500/70', work: 'bg-orange-500/70' }
      : { text: 'text-blue-400', sleep: 'bg-blue-500', duty: 'bg-red-500/70', work: 'bg-orange-500/70' };

    return (
      <div className="w-12 md:w-20 flex-shrink-0 relative border-r border-gray-700">
        {/* Header */}
        <div className={`sticky top-0 z-10 bg-gray-800 ${colorClasses.text} text-xs font-semibold px-1 py-1 border-b border-gray-600 flex items-center justify-center md:justify-between`}>
          <span className="flex items-center gap-1">
            <Coffee className="w-3 h-3" />
            <span className="hidden md:inline">{person === 'mom' ? 'Mom' : 'Dad'}</span>
          </span>
        </div>

        {/* Hour grid */}
        {hourSlots.map((slot, i) => (
          <div
            key={i}
            className={`absolute w-full border-b ${slot.isMidnight ? 'border-teal-500/70 border-b-2' : 'border-gray-800/30'}`}
            style={{ top: i * hourHeight + 28, height: hourHeight }}
          />
        ))}

        {/* Blocks */}
        {blocks.map((block, i) => (
          <div
            key={block.id || i}
            className={`absolute left-1 right-1 ${colorClasses[block.type]} rounded group`}
            style={{
              top: block.absoluteStart * hourHeight + 28,
              height: Math.max((block.absoluteEnd - block.absoluteStart) * hourHeight, 20)
            }}
          >
            <div className="text-xs text-white text-center p-0.5">
              {block.type === 'sleep' ? '😴' : block.type === 'work' ? '💼' : '👁️'}
            </div>
            <button
              onClick={() => removeBlock(block.dateKey, person, block.id)}
              className="absolute top-0 right-0 p-0.5 bg-red-600 rounded-bl opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-2 h-2 text-white" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleParents}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-gray-700 rounded hidden md:block"
          >
            {showParents ? 'Hide Parents' : 'Show Parents'}
          </button>
          <span className="text-xs md:text-sm text-white font-semibold">Timeline</span>
        </div>
        <div className="flex gap-2 md:gap-3 text-xs">
          {sleepPredictions.totalPredictedSleep !== undefined && (
            <span className="text-indigo-400">
              😴 {sleepPredictions.totalPredictedSleep.toFixed(1)}h
            </span>
          )}
          <span className="text-pink-400">
            🍼 {feedPredictions.predictions.length}
          </span>
        </div>
      </div>

      {/* Load more past */}
      <button
        onClick={loadMorePast}
        className="flex items-center justify-center gap-1 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs"
      >
        <ChevronUp className="w-3 h-3" />
        Load earlier
      </button>

      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-900"
        style={{ minHeight: '600px' }}
      >
        <div className="flex relative" style={{ height: totalHeight + 30 }}>

          {/* Time labels */}
          <div className="w-16 md:w-20 flex-shrink-0 border-r border-gray-700 pt-7">
            {hourSlots.map((slot, i) => {
              const dayInfo = slot.isMidnight ? formatDayLabel(slot.date) : null;

              return (
                <div
                  key={i}
                  className="relative"
                  style={{ height: hourHeight }}
                >
                  {/* Day separator bar at midnight */}
                  {slot.isMidnight && (
                    <div className="absolute -top-0.5 left-0 right-0 h-1 bg-teal-500/60 rounded-r" />
                  )}

                  {/* Date label at midnight */}
                  {slot.isMidnight && dayInfo && (
                    <div className={`absolute top-1 left-1 right-1 ${dayInfo.isToday ? 'bg-teal-600' : 'bg-gray-700'} rounded px-1 py-0.5`}>
                      <div className={`text-[10px] md:text-xs font-bold ${dayInfo.isToday ? 'text-white' : 'text-teal-300'} leading-tight`}>
                        {dayInfo.isToday ? 'TODAY' : dayInfo.dayName}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-gray-300 leading-tight">
                        {dayInfo.monthDay}
                      </div>
                    </div>
                  )}

                  {/* Hour label */}
                  {!slot.isMidnight && (
                    <div className={`
                      text-[11px] md:text-xs font-medium pl-1
                      ${slot.isNoon ? 'text-yellow-400' : slot.hour % 6 === 0 ? 'text-gray-300' : 'text-gray-500'}
                    `}>
                      {formatHourLabel(slot.hour)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Parent columns (collapsible) */}
          {showParents && (
            <>
              {renderParentColumn('mom', momBlocks, 'purple')}
              {renderParentColumn('dad', dadBlocks, 'blue')}
            </>
          )}

          {/* Baby columns: Predicted + Actual */}
          <div className="flex flex-1 min-w-0">
            {/* Predicted */}
            <div className="flex-1 relative bg-gray-800/30 border-r border-gray-600">
              <div className="sticky top-0 z-10 bg-gray-800 text-[10px] md:text-xs text-blue-400 px-1 md:px-2 py-1 border-b border-gray-600 text-center">
                <span className="hidden sm:inline">Predicted</span>
                <span className="sm:hidden">Pred</span>
              </div>

              {/* Hour grid */}
              {hourSlots.map((slot, i) => (
                <div
                  key={i}
                  className={`absolute w-full border-b ${slot.isMidnight ? 'border-teal-500/70 border-b-2' : 'border-gray-800/30'}`}
                  style={{ top: i * hourHeight + 28, height: hourHeight }}
                />
              ))}

              {/* Predicted events */}
              {positionedPredictions.map((event, i) => {
                const top = event.absoluteHour * hourHeight + 28;
                const height = (event.absoluteEndHour - event.absoluteHour) * hourHeight;
                const isSleep = event.type === 'sleep';

                return (
                  <div
                    key={event.id || i}
                    className={`absolute left-1 right-1 rounded border-2 border-dashed ${
                      isSleep ? 'bg-indigo-500/25 border-indigo-400/50' : 'bg-pink-500/25 border-pink-400/50'
                    }`}
                    style={{ top, height: Math.max(height, 16) }}
                  >
                    <div className="p-0.5 text-xs truncate">
                      <span>{isSleep ? '😴' : '🍼'}</span>
                      <span className={isSleep ? 'text-indigo-300' : 'text-pink-300'}>
                        {formatTime(event.startTime)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actual */}
            <div className="flex-1 relative bg-gray-800/50">
              <div className="sticky top-0 z-10 bg-gray-800 text-[10px] md:text-xs text-green-400 px-1 md:px-2 py-1 border-b border-gray-600 text-center">
                <span className="hidden sm:inline">Actual</span>
                <span className="sm:hidden">Log</span>
              </div>

              {/* Hour grid */}
              {hourSlots.map((slot, i) => (
                <div
                  key={i}
                  className={`absolute w-full border-b ${slot.isMidnight ? 'border-teal-500/70 border-b-2' : 'border-gray-800/30'}`}
                  style={{ top: i * hourHeight + 28, height: hourHeight }}
                />
              ))}

              {/* Actual events */}
              {allEvents.map((event, i) => {
                const top = event.absoluteHour * hourHeight + 28;
                const height = (event.absoluteEndHour - event.absoluteHour) * hourHeight;
                const eventType = EVENT_TYPES[event.type];

                return (
                  <div
                    key={event.id || i}
                    className={`absolute left-1 right-1 rounded ${eventType?.color || 'bg-gray-600'} group`}
                    style={{ top, height: Math.max(height, 16) }}
                  >
                    <div className="p-0.5 text-xs truncate flex items-center gap-1">
                      <span>{eventType?.icon}</span>
                      <span className="text-white">{formatTime(event.startTime)}</span>
                    </div>
                    <button
                      onClick={() => deleteLoggedEvent(event.dateKey, event.id)}
                      className="absolute top-0 right-0 p-0.5 bg-red-600 rounded-bl opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-2 h-2 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NOW indicator - positioned inside the scroll container */}
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: nowPositionPx + 28 }}
          >
            <div className="w-16 md:w-20 text-right pr-1">
              <span className="text-[10px] text-red-400 font-bold bg-gray-900 px-1 rounded">
                {formatTime(currentHour)}
              </span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1 h-0.5 bg-red-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Load more future */}
      <button
        onClick={loadMoreFuture}
        className="flex items-center justify-center gap-1 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs"
      >
        <ChevronDown className="w-3 h-3" />
        Load later
      </button>
    </div>
  );
};

export default ContinuousTimeline;
