import React from 'react';
import { predictNextNap } from '../../utils/sleepPredictor';

const NapPredictor = ({ birthDate, dailySchedules }) => {
  const prediction = predictNextNap(birthDate, dailySchedules);

  if (!prediction) return null;

  const { source, ageDefaults, personalStats, isPast, minutesFromNow, predicted } = prediction;

  // Determine urgency color
  let urgencyColor = 'border-teal-500 bg-teal-500/10';
  let urgencyText = 'text-teal-400';
  if (isPast) {
    urgencyColor = 'border-red-500 bg-red-500/10';
    urgencyText = 'text-red-400';
  } else if (minutesFromNow !== null && minutesFromNow <= 15) {
    urgencyColor = 'border-yellow-500 bg-yellow-500/10';
    urgencyText = 'text-yellow-400';
  }

  return (
    <div className={`mb-4 p-3 md:p-4 rounded-lg border-2 ${urgencyColor}`}>
      <div className="flex items-start md:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">🔮</span>
            <h3 className="text-xs md:text-sm font-semibold text-gray-300">Next Nap</h3>
            <span className="text-[10px] md:text-xs bg-gray-700 text-gray-400 px-1.5 md:px-2 py-0.5 rounded">
              {source === 'personalized' ? '✨ Personal' : '📊 Age'}
            </span>
          </div>
          <div className={`text-base md:text-2xl font-bold ${urgencyText} break-words`}>
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

      {/* Details row - hidden on mobile, visible on desktop */}
      <div className="mt-2 md:mt-3 flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-gray-400">
        <span className="hidden sm:inline">👶 {ageDefaults.label}</span>
        <span>⏱️ {prediction.wakeWindow.toFixed(1)}h wake</span>
        <span className="hidden md:inline">💤 {ageDefaults.naps.min}-{ageDefaults.naps.max} naps/day</span>
        {personalStats && (
          <span className="hidden lg:inline">📈 {personalStats.count} observations</span>
        )}
      </div>
    </div>
  );
};

export default NapPredictor;
