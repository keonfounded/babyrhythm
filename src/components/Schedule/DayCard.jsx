import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { formatDate, getCurrentDateKey } from '../../utils/dateHelpers';

const DayCard = ({
  date,
  dateKey,
  schedule,
  stats,
  autoSolveDay,
  renderVerticalTimeline
}) => {
  const isToday = dateKey === getCurrentDateKey();

  return (
    <div className="relative">
      {/* Day separator/header - sticky */}
      <div className={`sticky top-0 z-20 flex items-center justify-between py-3 px-4 ${
        isToday ? 'bg-teal-900/90' : 'bg-gray-800/95'
      } backdrop-blur-sm border-b-2 ${isToday ? 'border-teal-500' : 'border-gray-600'}`}>
        <div className="flex items-center gap-3">
          <Calendar className={`w-5 h-5 ${isToday ? 'text-teal-400' : 'text-gray-400'}`} />
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${isToday ? 'text-teal-300' : 'text-gray-200'}`}>
              {formatDate(date)}
            </h3>
            {isToday && (
              <span className="px-2 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full">
                TODAY
              </span>
            )}
          </div>
          {schedule.loggedEvents.length > 0 && (
            <span className="text-xs text-green-400">
              ✓ {schedule.loggedEvents.length} logged
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-400 hidden sm:block">
            Mom: {stats.mom.totalSleep.toFixed(1)}h | Dad: {stats.dad.totalSleep.toFixed(1)}h
          </div>
          <button
            onClick={() => autoSolveDay(dateKey)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Auto-Solve
          </button>
        </div>
      </div>

      {/* Timeline - always visible */}
      <div className="bg-gray-800/50 p-4">
        {renderVerticalTimeline(dateKey, date)}
      </div>
    </div>
  );
};

export default DayCard;
