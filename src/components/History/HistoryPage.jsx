import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Moon, Droplet, Baby, Download } from 'lucide-react';
import { EVENT_TYPES } from '../../constants/eventTypes';
import { formatTime } from '../../utils/timeHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { exportEventsToCSV, exportDailySummaryToCSV } from '../../utils/csvExportHelpers';
import {
  getAllEvents,
  getEventsByType,
  calculateSleepStats,
  calculateFeedStats,
  groupEventsByDay,
  calculateDailySummaries,
  getSleepChartData,
  getFeedChartData,
  getDiaperChartData
} from '../../utils/analyticsHelpers';
import SleepChart from './SleepChart';
import FeedChart from './FeedChart';
import DiaperChart from './DiaperChart';
import SummaryCards from '../Summary/SummaryCards';
import GrowthChart from '../Growth/GrowthChart';
import AddPastEventSection from './AddPastEventSection';
import SleepInsights from './SleepInsights';

const HistoryPage = ({
  dailySchedules,
  feedAmountUnit = 'oz',
  setFeedAmountUnit,
  babyProfile,
  bulkLogForm,
  setBulkLogForm,
  handleBulkLogSubmit,
  getScheduleForDate,
  deleteLoggedEvent
}) => {
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [timeRange, setTimeRange] = useState(7); // days

  // Calculate all analytics data
  const analytics = useMemo(() => {
    
    const allEvents = getAllEvents(dailySchedules);
    
    const sleepEvents = getEventsByType(allEvents, 'sleep');
    
    const feedEvents = getEventsByType(allEvents, 'feed');
    const diaperEvents = getEventsByType(allEvents, 'diaper');
    
    const groupedEvents = groupEventsByDay(allEvents);
    
    const dailySummaries = calculateDailySummaries(groupedEvents);
    
    const chartData = getSleepChartData(dailySummaries, timeRange);
    
    const sleepStats = calculateSleepStats(sleepEvents);

    const feedChartData = getFeedChartData(dailySummaries, groupedEvents, timeRange);
    const feedStats = calculateFeedStats(feedEvents);
    const diaperChartData = getDiaperChartData(dailySummaries, groupedEvents, timeRange);

    return {
      allEvents,
      sleepEvents,
      feedEvents,
      diaperEvents,
      dailySummaries,
      chartData,
      sleepStats,
      feedChartData,
      feedStats,
      diaperChartData
    };
  }, [dailySchedules, timeRange]);

  // Filter events for display
  const displayEvents = useMemo(() => {
    if (selectedEventType === 'all') {
      return analytics.allEvents;
    }
    return getEventsByType(analytics.allEvents, selectedEventType);
  }, [analytics.allEvents, selectedEventType]);

  if (Object.keys(dailySchedules).length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">📊 History & Analytics</h2>
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No data yet!</p>
          <p className="text-gray-500 text-sm mt-2">Start logging events to see your analytics here.</p>
        </div>
      </div>
    );
  }

  const handleExportEvents = () => {
    const count = exportEventsToCSV(dailySchedules, babyProfile?.name || 'Baby');
    alert(`Exported ${count} events to CSV`);
  };

  const handleExportSummary = () => {
    const count = exportDailySummaryToCSV(dailySchedules, babyProfile?.name || 'Baby');
    alert(`Exported ${count} days of summary data to CSV`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">📊 History & Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportEvents}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
            title="Export all events to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Events CSV</span>
          </button>
          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
            title="Export daily summary to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Summary CSV</span>
          </button>
        </div>
      </div>

      {/* Add Past Event Section */}
      {bulkLogForm && (
        <AddPastEventSection
          bulkLogForm={bulkLogForm}
          setBulkLogForm={setBulkLogForm}
          handleBulkLogSubmit={handleBulkLogSubmit}
          getScheduleForDate={getScheduleForDate}
          deleteLoggedEvent={deleteLoggedEvent}
          feedAmountUnit={feedAmountUnit}
          setFeedAmountUnit={setFeedAmountUnit}
        />
      )}

      {/* Quick Summary Section */}
      <SummaryCards dailySchedules={dailySchedules} />

      {/* Sleep Insights */}
      {babyProfile?.birthDate && (
        <SleepInsights
          dailySchedules={dailySchedules}
          birthDate={babyProfile.birthDate}
        />
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Events */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Baby className="w-5 h-5 text-teal-400" />
            <span className="text-sm text-gray-400">Total Events</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.allEvents.length}</div>
        </div>

        {/* Sleep Stats */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-gray-400">Total Sleep</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.sleepStats.totalHours.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.sleepStats.totalSleeps} sessions
          </div>
        </div>

        {/* Average Sleep */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Avg Sleep</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.sleepStats.averageDuration.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500 mt-1">
            per session
          </div>
        </div>

        {/* Feeds */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5 text-pink-400" />
            <span className="text-sm text-gray-400">Total Feeds</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.feedEvents.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.diaperEvents.length} diapers
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTimeRange(7)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            timeRange === 7
              ? 'bg-teal-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange(14)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            timeRange === 14
              ? 'bg-teal-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Last 14 Days
        </button>
        <button
          onClick={() => setTimeRange(30)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            timeRange === 30
              ? 'bg-teal-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Last 30 Days
        </button>
      </div>

      {/* Sleep Chart */}
      <div className="mb-6">
        <SleepChart data={analytics.chartData} targetHours={8} />
      </div>

      {/* Feed Chart */}
      <div className="mb-6">
        <FeedChart data={analytics.feedChartData} unit={feedAmountUnit} />
      </div>

      {/* Diaper Chart */}
      <div className="mb-6">
        <DiaperChart data={analytics.diaperChartData} />
      </div>

      {/* Growth Chart */}
      {babyProfile && babyProfile.weightHistory && babyProfile.weightHistory.length > 0 && (
        <div className="mb-6">
          <GrowthChart
            weightHistory={babyProfile.weightHistory}
            birthDate={babyProfile.birthDate}
            sex={babyProfile.sex || 'boy'}
            weightUnit={babyProfile.weightUnit || 'kg'}
          />
        </div>
      )}

      {/* Daily Summaries Table */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium py-2 px-4">Date</th>
                <th className="text-center text-gray-400 font-medium py-2 px-4">😴 Sleep</th>
                <th className="text-center text-gray-400 font-medium py-2 px-4">🍼 Feeds</th>
                <th className="text-center text-gray-400 font-medium py-2 px-4">💩 Diapers</th>
                <th className="text-center text-gray-400 font-medium py-2 px-4">📝 Notes</th>
              </tr>
            </thead>
            <tbody>
              {analytics.dailySummaries.slice(0, timeRange).map(summary => (
                <tr key={summary.dateKey} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-white">{formatDate(summary.date)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-indigo-400 font-semibold">
                      {summary.totalSleep.toFixed(1)}h
                    </span>
                    <span className="text-gray-500 text-xs ml-1">
                      ({summary.sleepCount})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-pink-400 font-semibold">
                    {summary.feedCount}
                  </td>
                  <td className="py-3 px-4 text-center text-yellow-400 font-semibold">
                    {summary.diaperCount}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400 font-semibold">
                    {summary.noteCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Event Timeline</h3>
          
          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All Events</option>
            {Object.entries(EVENT_TYPES).map(([key, type]) => (
              <option key={key} value={key}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {displayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No {selectedEventType !== 'all' ? EVENT_TYPES[selectedEventType].label.toLowerCase() : ''} events found
            </div>
          ) : (
            displayEvents.slice().reverse().map((event, index) => (
              <div
                key={`${event.dateKey}-${event.id}`}
                className={`flex items-center gap-4 p-3 rounded ${EVENT_TYPES[event.type].color}/20 border-l-4 ${EVENT_TYPES[event.type].color.replace('bg-', 'border-')}`}
              >
                <span className="text-2xl">{EVENT_TYPES[event.type].icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {event.type === 'diaper' && event.diaperType
                        ? (event.diaperType === 'wet' ? '💧 Wet Diaper' : event.diaperType === 'dirty' ? '💩 Dirty Diaper' : '💧💩 Both')
                        : EVENT_TYPES[event.type].label}
                    </span>
                    {event.endTime && (
                      <span className="text-green-400 text-xs">
                        ({((event.endTime - event.startTime) * 60).toFixed(0)} min)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(event.date)} at {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </div>
                  {event.note && (
                    <div className="text-sm text-gray-500 mt-1">{event.note}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;