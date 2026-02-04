import React, { useState, useMemo } from 'react';
import { Moon, Baby, Droplet, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { getFullSummary } from '../../utils/summaryHelpers';

const TrendIndicator = ({ trend, positiveIsGood = true }) => {
  if (!trend || trend.direction === 0) {
    return (
      <span className="flex items-center text-gray-400 text-xs">
        <Minus className="w-3 h-3 mr-0.5" />
        Stable
      </span>
    );
  }

  const isPositive = trend.direction > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;

  return (
    <span className={`flex items-center text-xs ${isGood ? 'text-green-400' : 'text-orange-400'}`}>
      {isPositive ? (
        <TrendingUp className="w-3 h-3 mr-0.5" />
      ) : (
        <TrendingDown className="w-3 h-3 mr-0.5" />
      )}
      {Math.abs(trend.change)}%
    </span>
  );
};

const StatCard = ({ icon: Icon, iconColor, label, value, subValue, trend, trendLabel, positiveIsGood = true }) => (
  <div className="bg-gray-700/50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subValue && (
      <div className="text-xs text-gray-500 mt-1">{subValue}</div>
    )}
    {trend && (
      <div className="mt-2 flex items-center gap-1">
        <TrendIndicator trend={trend} positiveIsGood={positiveIsGood} />
        <span className="text-xs text-gray-500">{trendLabel}</span>
      </div>
    )}
  </div>
);

const SummaryCards = ({ dailySchedules }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const summary = useMemo(() => {
    return getFullSummary(dailySchedules);
  }, [dailySchedules]);

  const { today, thisWeek, trends } = summary;

  return (
    <div className="bg-gray-800 rounded-lg mb-6 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">Quick Summary</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Today: {today.sleepHours.toFixed(1)}h sleep, {today.feedCount} feeds, {today.diaperCount} diapers
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Today's Stats */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Today</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={Moon}
                iconColor="text-indigo-400"
                label="Sleep"
                value={`${today.sleepHours.toFixed(1)}h`}
                subValue={`${today.sleepSessions} session${today.sleepSessions !== 1 ? 's' : ''}`}
                trend={trends.sleepVsYesterday}
                trendLabel="vs yesterday"
                positiveIsGood={true}
              />
              <StatCard
                icon={Baby}
                iconColor="text-pink-400"
                label="Feeds"
                value={today.feedCount}
                subValue={today.feedAmount > 0 ? `${today.feedAmount.toFixed(1)} total` : null}
                trend={trends.feedsVsYesterday}
                trendLabel="vs yesterday"
              />
              <StatCard
                icon={Droplet}
                iconColor="text-yellow-400"
                label="Diapers"
                value={today.diaperCount}
                subValue={today.diaperWet > 0 || today.diaperDirty > 0
                  ? `${today.diaperWet} wet, ${today.diaperDirty} dirty`
                  : null}
                trend={trends.diapersVsYesterday}
                trendLabel="vs yesterday"
              />
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  <span className="text-sm text-gray-400">Notes</span>
                </div>
                <div className="text-2xl font-bold text-white">{today.noteCount}</div>
                <div className="text-xs text-gray-500 mt-1">logged today</div>
              </div>
            </div>
          </div>

          {/* This Week's Stats */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">This Week (Last 7 Days)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={Moon}
                iconColor="text-indigo-400"
                label="Avg Sleep/Day"
                value={`${thisWeek.avgSleepHours.toFixed(1)}h`}
                subValue={`${thisWeek.totalSleepHours.toFixed(1)}h total`}
                trend={trends.avgSleepVsLastWeek}
                trendLabel="vs last week"
                positiveIsGood={true}
              />
              <StatCard
                icon={Baby}
                iconColor="text-pink-400"
                label="Avg Feeds/Day"
                value={thisWeek.avgFeeds.toFixed(1)}
                subValue={`${thisWeek.totalFeeds} total`}
                trend={trends.avgFeedsVsLastWeek}
                trendLabel="vs last week"
              />
              <StatCard
                icon={Droplet}
                iconColor="text-yellow-400"
                label="Avg Diapers/Day"
                value={thisWeek.avgDiapers.toFixed(1)}
                subValue={`${thisWeek.totalDiapers} total`}
                trend={trends.avgDiapersVsLastWeek}
                trendLabel="vs last week"
              />
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  <span className="text-sm text-gray-400">Data Days</span>
                </div>
                <div className="text-2xl font-bold text-white">{thisWeek.daysWithData}</div>
                <div className="text-xs text-gray-500 mt-1">of 7 days tracked</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCards;
