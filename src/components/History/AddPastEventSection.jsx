import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { EVENT_TYPES } from '../../constants/eventTypes';
import { formatTime } from '../../utils/timeHelpers';
import { formatDate, getDateKey, parseDateString } from '../../utils/dateHelpers';

const AddPastEventSection = ({
  bulkLogForm,
  setBulkLogForm,
  handleBulkLogSubmit,
  getScheduleForDate,
  deleteLoggedEvent,
  feedAmountUnit,
  setFeedAmountUnit
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedDate = parseDateString(bulkLogForm.date);
  const schedule = getScheduleForDate(bulkLogForm.date);
  const todayKey = getDateKey(new Date());

  return (
    <div className="bg-gray-800 rounded-lg mb-6 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Add Past Event</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-4">Log past events with specific dates and times.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={bulkLogForm.date}
                max={todayKey}
                onChange={(e) => setBulkLogForm({...bulkLogForm, date: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">{formatDate(selectedDate)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Type
              </label>
              <select
                value={bulkLogForm.eventType}
                onChange={(e) => setBulkLogForm({...bulkLogForm, eventType: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                {Object.entries(EVENT_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={bulkLogForm.startTime}
                onChange={(e) => setBulkLogForm({...bulkLogForm, startTime: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Feed Amount Field */}
            {bulkLogForm.eventType === 'feed' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={bulkLogForm.amount || ''}
                    onChange={(e) => setBulkLogForm({...bulkLogForm, amount: e.target.value})}
                    placeholder="e.g. 4"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                  <select
                    value={feedAmountUnit}
                    onChange={(e) => setFeedAmountUnit(e.target.value)}
                    className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-2 text-white"
                  >
                    <option value="oz">oz</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>
            )}

            {/* Diaper Type Field */}
            {bulkLogForm.eventType === 'diaper' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diaper Type
                </label>
                <select
                  value={bulkLogForm.diaperType || 'wet'}
                  onChange={(e) => setBulkLogForm({...bulkLogForm, diaperType: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="wet">Wet</option>
                  <option value="dirty">Dirty</option>
                  <option value="both">Both</option>
                </select>
              </div>
            )}

            {/* Sleep Duration Fields */}
            {bulkLogForm.eventType === 'sleep' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time (optional)
                  </label>
                  <input
                    type="time"
                    value={bulkLogForm.endTime}
                    onChange={(e) => setBulkLogForm({...bulkLogForm, endTime: e.target.value, duration: ''})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OR Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={bulkLogForm.duration}
                    onChange={(e) => setBulkLogForm({...bulkLogForm, duration: e.target.value, endTime: ''})}
                    placeholder="e.g. 2.5"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Note (optional)
              </label>
              <textarea
                value={bulkLogForm.note}
                onChange={(e) => setBulkLogForm({...bulkLogForm, note: e.target.value})}
                placeholder="Add any additional notes..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white resize-none"
                rows={2}
              />
            </div>
          </div>

          <button
            onClick={handleBulkLogSubmit}
            className="mt-4 w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Log Event
          </button>

          {/* Recent Entries for selected date */}
          {schedule.loggedEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Events for {formatDate(selectedDate)}
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {schedule.loggedEvents.slice().reverse().map(event => (
                  <div key={event.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span>{EVENT_TYPES[event.type].icon}</span>
                      <span className="text-white">{EVENT_TYPES[event.type].label}</span>
                      <span className="text-gray-400">
                        {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteLoggedEvent(bulkLogForm.date, event.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddPastEventSection;
