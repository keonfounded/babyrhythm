import React from 'react';

const SleepChart = ({ data, targetHours = 8 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No sleep data to display</p>
        <p className="text-gray-500 text-sm mt-2">Log some sleep events to see your chart!</p>
      </div>
    );
  }

  const dataMax = Math.max(...data.map(d => d.hours || 0));
  const maxHours = Math.max(dataMax + 1, targetHours, 4);
  const chartHeight = 300; // pixels

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Sleep Hours by Day
      </h3>
      
      {/* Chart container */}
      <div className="flex gap-4">
        {/* Y-axis */}
        <div className="w-12 flex flex-col justify-between text-xs text-gray-400" style={{ height: `${chartHeight}px` }}>
          <span className="text-right">{maxHours.toFixed(0)}h</span>
          <span className="text-right">{(maxHours * 0.75).toFixed(1)}h</span>
          <span className="text-right">{(maxHours * 0.5).toFixed(1)}h</span>
          <span className="text-right">{(maxHours * 0.25).toFixed(1)}h</span>
          <span className="text-right">0h</span>
        </div>

        {/* Chart area */}
        <div className="flex-1 relative" style={{ height: `${chartHeight}px` }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-700"
              style={{ top: `${(1 - ratio) * 100}%` }}
            />
          ))}

          {/* Target line */}
          {targetHours > 0 && targetHours <= maxHours && (
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-500 z-10"
              style={{ top: `${(1 - targetHours / maxHours) * 100}%` }}
            >
              <span className="absolute right-2 -top-2 text-xs text-yellow-400 bg-gray-800 px-2 py-0.5 rounded">
                Target: {targetHours}h
              </span>
            </div>
          )}

          {/* Bars container */}
          <div className="absolute inset-0 flex items-end gap-2 px-2">
            {data.map((item, index) => {
              const hours = item.hours || 0;
              const barHeight = (hours / maxHours) * chartHeight;
              const isAboveTarget = hours >= targetHours;
              const color = isAboveTarget ? 'bg-green-500' : 'bg-blue-500';

              return (
                <div 
                  key={index} 
                  className="flex-1 flex items-end group"
                >
                  <div className="w-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl border border-gray-700">
                      <div className="font-semibold text-center">{item.date}</div>
                      <div className="text-teal-400 text-center font-bold">{hours.toFixed(1)}h</div>
                    </div>
                    
                    {/* Bar */}
                    <div
                      className={`${color} hover:brightness-110 rounded-t transition-all cursor-pointer w-full`}
                      style={{ 
                        height: `${barHeight}px`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-4 mt-2">
        <div className="w-12" />
        <div className="flex-1 flex gap-2 px-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center text-xs text-gray-400">
              {item.date}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 flex justify-between text-xs text-gray-400 border-t border-gray-700 pt-3">
        <span>{data.length} day{data.length !== 1 ? 's' : ''}</span>
        <span>Avg: {(data.reduce((sum, d) => sum + d.hours, 0) / data.length).toFixed(1)}h</span>
        <span>Max: {dataMax.toFixed(1)}h</span>
      </div>
    </div>
  );
};

export default SleepChart;