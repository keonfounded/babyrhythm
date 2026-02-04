import React, { useMemo } from 'react';
import {
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Target
} from 'lucide-react';
import {
  getSleepInsights,
  formatTimeFromDecimal
} from '../../utils/sleepInsightsHelpers';
import { calculateAge } from '../../utils/dateHelpers';

const ScoreGauge = ({ score }) => {
  if (score === null) return null;

  const getColor = (s) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-teal-400';
    if (s >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs attention';
  };

  return (
    <div className="text-center">
      <div className={`text-5xl font-bold ${getColor(score)}`}>{score}</div>
      <div className="text-sm text-gray-400 mt-1">{getLabel(score)}</div>
    </div>
  );
};

const TrendBadge = ({ trend, change }) => {
  if (trend === 'insufficient') {
    return <span className="text-xs text-gray-500">Not enough data</span>;
  }

  const config = {
    improving: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/20' },
    declining: { icon: TrendingDown, color: 'text-orange-400', bg: 'bg-orange-400/20' },
    stable: { icon: Minus, color: 'text-gray-400', bg: 'bg-gray-400/20' }
  };

  const { icon: Icon, color, bg } = config[trend];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color} ${bg}`}>
      <Icon className="w-3 h-3" />
      {trend === 'stable' ? 'Stable' : `${Math.abs(change)}% ${trend}`}
    </span>
  );
};

const TipCard = ({ tip }) => {
  const config = {
    warning: { icon: AlertTriangle, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
    action: { icon: Lightbulb, color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
    success: { icon: CheckCircle, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
    info: { icon: Info, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' }
  };

  const { icon: Icon, color, border, bg } = config[tip.type] || config.info;

  return (
    <div className={`p-3 rounded-lg border ${border} ${bg}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
        <div>
          <div className={`font-medium text-sm ${color}`}>{tip.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">{tip.message}</div>
        </div>
      </div>
    </div>
  );
};

const SleepInsights = ({ dailySchedules, birthDate }) => {
  const insights = useMemo(() => {
    if (!birthDate) return null;
    const age = calculateAge(birthDate);
    return getSleepInsights(dailySchedules, age.totalDays);
  }, [dailySchedules, birthDate]);

  if (!insights) {
    return null;
  }

  const { score, trend, wakeWindows, bedtime, regression, recommendation, tips } = insights;

  // Check if we have enough data
  const hasData = score.score !== null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-400" />
          Sleep Insights
        </h3>
        <TrendBadge trend={trend.trend} change={trend.change} />
      </div>

      {!hasData ? (
        <div className="text-center py-8 text-gray-400">
          <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Not enough sleep data yet</p>
          <p className="text-sm text-gray-500 mt-1">Log a few days of sleep to see insights</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score and Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sleep Score */}
            <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-400 mb-2">Sleep Score</div>
              <ScoreGauge score={score.score} />
              {score.breakdown && (
                <div className="flex gap-3 mt-3 text-xs text-gray-500">
                  <span title="Meeting recommendations">Rec: {score.breakdown.recommendation}</span>
                  <span title="Consistency">Con: {score.breakdown.consistency}</span>
                  <span title="Longest stretch">Str: {score.breakdown.longestStretch}</span>
                </div>
              )}
            </div>

            {/* Sleep Stats */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-3">Daily Average</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Sleep</span>
                  <span className="text-white font-semibold">
                    {score.avgSleep?.toFixed(1) || '--'}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Target</span>
                  <span className="text-teal-400 text-sm">
                    {recommendation.min}-{recommendation.max}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Longest stretch</span>
                  <span className="text-white font-semibold">
                    {score.avgLongestStretch?.toFixed(1) || '--'}h
                  </span>
                </div>
              </div>
            </div>

            {/* Wake Windows & Bedtime */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-3">Timing</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Wake window</span>
                  <span className={`font-semibold ${
                    wakeWindows.status === 'optimal' ? 'text-green-400' :
                    wakeWindows.status === 'insufficient' ? 'text-gray-500' : 'text-yellow-400'
                  }`}>
                    {wakeWindows.avgWakeWindow?.toFixed(1) || '--'}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Target window</span>
                  <span className="text-teal-400 text-sm">
                    {wakeWindows.recommendation.min}-{wakeWindows.recommendation.max}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Best bedtime</span>
                  <span className="text-white font-semibold">
                    {formatTimeFromDecimal(bedtime.suggested)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Regression Alert */}
          {regression && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-purple-200 font-medium">{regression.label}</div>
                <div className="text-purple-200/70 text-sm mt-1">
                  {regression.description}. This typically lasts 2-4 weeks. Stay consistent with routines.
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div>
              <div className="text-sm text-gray-400 mb-2">Recommendations</div>
              <div className="space-y-2">
                {tips.slice(0, 3).map((tip, i) => (
                  <TipCard key={i} tip={tip} />
                ))}
              </div>
            </div>
          )}

          {/* Age Context */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
            <Target className="w-3 h-3 inline mr-1" />
            Based on {recommendation.label} sleep guidelines
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepInsights;
