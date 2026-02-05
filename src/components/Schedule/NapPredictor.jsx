import React from 'react';
import { predictNextNap } from '../../utils/sleepPredictor';

const NapPredictor = ({ birthDate, dailySchedules }) => {
  const prediction = predictNextNap(birthDate, dailySchedules);

  if (!prediction) return null;

  const {
    source,
    ageDefaults,
    personalStats,
    isPast,
    minutesFromNow,
    predicted,
    wakeWindow,
    confidence,
    napTransition,
    trend
  } = prediction;

  // Calculate wake window progress
  const maxWakeWindow = ageDefaults.wakeWindow.max;
  const wakeWindowProgress = Math.min((wakeWindow / maxWakeWindow) * 100, 100);

  // Determine urgency color based on wake window
  let urgencyColor = 'border-teal-500 bg-teal-500/10';
  let urgencyText = 'text-teal-400';
  let progressColor = 'bg-teal-500';
  let wakeStatus = 'Good';

  if (isPast || wakeWindow > maxWakeWindow) {
    urgencyColor = 'border-red-500 bg-red-500/10';
    urgencyText = 'text-red-400';
    progressColor = 'bg-red-500';
    wakeStatus = 'Overtired';
  } else if (minutesFromNow !== null && minutesFromNow <= 15) {
    urgencyColor = 'border-yellow-500 bg-yellow-500/10';
    urgencyText = 'text-yellow-400';
    progressColor = 'bg-yellow-500';
    wakeStatus = 'Soon';
  } else if (wakeWindowProgress > 75) {
    urgencyColor = 'border-yellow-500 bg-yellow-500/10';
    urgencyText = 'text-yellow-400';
    progressColor = 'bg-yellow-500';
    wakeStatus = 'Watch';
  }

  // Format wake window for display - use clear labels
  const formatWakeTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
  };

  // Get confidence badge style
  const getConfidenceBadge = () => {
    if (!confidence) return null;

    const styles = {
      high: { bg: 'bg-green-900/50 border border-green-500/50', text: 'text-green-400', label: 'High', icon: '🎯' },
      good: { bg: 'bg-teal-900/50 border border-teal-500/50', text: 'text-teal-400', label: 'Good', icon: '✓' },
      moderate: { bg: 'bg-yellow-900/50 border border-yellow-500/50', text: 'text-yellow-400', label: 'OK', icon: '~' },
      low: { bg: 'bg-gray-700 border border-gray-600', text: 'text-gray-400', label: 'Learning', icon: '📊' }
    };

    const style = styles[confidence.level] || styles.low;
    return (
      <span className={`text-[10px] md:text-xs ${style.bg} ${style.text} px-1.5 py-0.5 rounded font-medium`}>
        {style.icon} {confidence.score}%
      </span>
    );
  };

  // Get source badge
  const getSourceBadge = () => {
    const sourceLabels = {
      'personalized-daytime': '☀️ Day Pattern',
      'personalized-nighttime': '🌙 Night Pattern',
      'personalized': '✨ Personal',
      'age-based': '📊 Age-based'
    };
    return sourceLabels[source] || sourceLabels['age-based'];
  };

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!trend) return null;

    const indicators = {
      increasing: { icon: '↗️', text: 'Wake windows increasing' },
      decreasing: { icon: '↘️', text: 'Wake windows decreasing' },
      stable: null
    };

    return indicators[trend.direction];
  };

  const trendInfo = getTrendIndicator();

  return (
    <div className={`mb-4 p-3 md:p-4 rounded-lg border-2 ${urgencyColor}`}>
      {/* Wake Window - Prominent Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <div>
            <div className="text-xs text-gray-400">Awake for</div>
            <div className={`text-xl md:text-2xl font-bold ${urgencyText}`}>
              {formatWakeTime(wakeWindow)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold ${urgencyText}`}>{wakeStatus}</div>
          <div className="text-xs text-gray-500">
            max {formatWakeTime(maxWakeWindow)}
          </div>
        </div>
      </div>

      {/* Wake Window Progress Bar */}
      <div className="h-2 bg-gray-700 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
          style={{ width: `${wakeWindowProgress}%` }}
        />
      </div>

      {/* Next Nap Prediction */}
      <div className="flex items-start md:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">🔮</span>
            <h3 className="text-xs md:text-sm font-semibold text-gray-300">Next Nap</h3>
            <span className="text-[10px] md:text-xs bg-gray-700 text-gray-400 px-1.5 md:px-2 py-0.5 rounded">
              {getSourceBadge()}
            </span>
            {getConfidenceBadge()}
          </div>
          <div className={`text-base md:text-xl font-bold ${urgencyText} break-words`}>
            {prediction.message}
          </div>
        </div>

        {predicted && !isPast && minutesFromNow !== null && minutesFromNow > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] md:text-xs text-gray-400">in</div>
            <div className={`text-2xl md:text-3xl font-bold ${urgencyText}`}>
              {minutesFromNow} <span className="text-base">min</span>
            </div>
          </div>
        )}
      </div>

      {/* Nap Transition Alert */}
      {napTransition && napTransition.transitioning && (
        <div className="mt-3 p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span>🔄</span>
            <span className="text-purple-300 font-medium">Nap Transition Detected</span>
          </div>
          <p className="text-xs text-purple-200/80 mt-1">
            {napTransition.recommendation}
          </p>
          <div className="mt-2 h-1.5 bg-purple-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${napTransition.progress}%` }}
            />
          </div>
          <div className="text-[10px] text-purple-400 mt-1">
            {napTransition.from} naps → {napTransition.to} nap{napTransition.to > 1 ? 's' : ''} ({napTransition.progress}% complete)
          </div>
        </div>
      )}

      {/* Trend Indicator */}
      {trendInfo && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <span>{trendInfo.icon}</span>
          <span>{trendInfo.text}</span>
        </div>
      )}

      {/* Details row */}
      <div className="mt-2 md:mt-3 flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-gray-400">
        <span>👶 {ageDefaults.label}</span>
        <span>💤 {ageDefaults.naps.min}-{ageDefaults.naps.max} naps/day</span>
        {personalStats && (
          <span className="hidden md:inline">📈 {personalStats.count} observations</span>
        )}
        {personalStats?.daytime && personalStats?.nighttime && (
          <span className="hidden lg:inline">
            ☀️ Day: {personalStats.daytime.count} | 🌙 Night: {personalStats.nighttime.count}
          </span>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-3 pt-2 border-t border-gray-700/50">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Predictions are estimates based on logged patterns and general guidelines.
          Not medical advice. Every baby is different.
        </p>
      </div>
    </div>
  );
};

export default NapPredictor;
