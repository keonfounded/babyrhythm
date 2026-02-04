import React from 'react';
import { predictNextNap } from '../../utils/sleepPredictor';

const NapPredictor = ({ birthDate, dailySchedules }) => {
  const prediction = predictNextNap(birthDate, dailySchedules);

  if (!prediction) return null;

  const { source, ageDefaults, personalStats, isPast, minutesFromNow, predicted, wakeWindow } = prediction;

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

  // Format wake window for display
  const formatWakeTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

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
              {source === 'personalized' ? '✨ Personal' : '📊 Age'}
            </span>
          </div>
          <div className={`text-base md:text-xl font-bold ${urgencyText} break-words`}>
            {prediction.message}
          </div>
        </div>

        {predicted && !isPast && minutesFromNow !== null && minutesFromNow > 0 && (
          <div className="text-right flex-shrink-0">
            <div className={`text-2xl md:text-3xl font-bold ${urgencyText}`}>
              {minutesFromNow}
            </div>
            <div className="text-[10px] md:text-xs text-gray-400">min</div>
          </div>
        )}
      </div>

      {/* Details row */}
      <div className="mt-2 md:mt-3 flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-gray-400">
        <span>👶 {ageDefaults.label}</span>
        <span>💤 {ageDefaults.naps.min}-{ageDefaults.naps.max} naps/day</span>
        {personalStats && (
          <span className="hidden md:inline">📈 {personalStats.count} observations</span>
        )}
      </div>
    </div>
  );
};

export default NapPredictor;
