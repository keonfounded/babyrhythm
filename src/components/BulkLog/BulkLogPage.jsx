import React from 'react';
import { Trash2 } from 'lucide-react';
import { EVENT_TYPES } from '../../constants/eventTypes';
import { formatTime } from '../../utils/timeHelpers';
import { formatDate, parseDateString } from '../../utils/dateHelpers';

const BulkLogPage = ({
  bulkLogForm,
  setBulkLogForm,
  handleBulkLogSubmit,
  getScheduleForDate,
  deleteLoggedEvent,
  feedAmountUnit,
  setFeedAmountUnit
}) => {
  const selectedDate = parseDateString(bulkLogForm.date);
  const schedule = getScheduleForDate(bulkLogForm.date);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">📝 Bulk Log Events</h2>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <p className="text-gray-400 mb-6">Enter past events with specific dates and times.</p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={bulkLogForm.date}
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
                <option value="wet">💧 Wet</option>
                <option value="dirty">💩 Dirty</option>
                <option value="both">💧💩 Both</option>
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

              <div className="col-span-2">
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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Note (optional)
            </label>
            <textarea
              value={bulkLogForm.note}
              onChange={(e) => setBulkLogForm({...bulkLogForm, note: e.target.value})}
              placeholder="Add any additional notes..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={handleBulkLogSubmit}
          className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg"
        >
          Log Event
        </button>
      </div>

      {/* Recent Entries */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Entries for {formatDate(selectedDate)}</h3>
        <div className="space-y-2">
          {schedule.loggedEvents.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No events logged yet for this day.</div>
          ) : (
            schedule.loggedEvents.slice().reverse().map(event => (
              <div key={event.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{EVENT_TYPES[event.type].icon}</span>
                  <div>
                    <div className="text-white font-medium">{EVENT_TYPES[event.type].label}</div>
                    <div className="text-gray-400 text-xs">
                      {formatTime(event.startTime)}
                      {event.endTime && ` - ${formatTime(event.endTime)}`}
                      {event.amount && ` • ${event.amount} ${feedAmountUnit}`}
                      {event.diaperType && ` • ${event.diaperType === 'wet' ? '💧 Wet' : event.diaperType === 'dirty' ? '💩 Dirty' : '💧💩 Both'}`}
                      {event.note && ` • ${event.note}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteLoggedEvent(bulkLogForm.date, event.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkLogPage;