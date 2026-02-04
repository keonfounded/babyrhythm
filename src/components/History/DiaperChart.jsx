import React from 'react';

const DiaperChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No diaper data to display</p>
        <p className="text-gray-500 text-sm mt-2">Log diaper events to see your chart!</p>
      </div>
    );
  }

  const dataMax = Math.max(...data.map(d => d.total || 0));
  const maxCount = Math.max(dataMax + 2, 6);
  const chartHeight = 300;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Daily Diaper Count
      </h3>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded inline-block" /> Wet</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded inline-block" /> Dirty</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-400 rounded inline-block" /> Both</span>
      </div>

      {/* Chart container */}
      <div className="flex gap-4">
        {/* Y-axis */}
        <div className="w-12 flex flex-col justify-between text-xs text-gray-400" style={{ height: `${chartHeight}px` }}>
          <span className="text-right">{maxCount}</span>
          <span className="text-right">{Math.round(maxCount * 0.75)}</span>
          <span className="text-right">{Math.round(maxCount * 0.5)}</span>
          <span className="text-right">{Math.round(maxCount * 0.25)}</span>
          <span className="text-right">0</span>
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

          {/* Bars container */}
          <div className="absolute inset-0 flex items-end gap-2 px-2">
            {data.map((item, index) => {
              const wetHeight = (item.wet / maxCount) * chartHeight;
              const dirtyHeight = (item.dirty / maxCount) * chartHeight;
              const bothHeight = (item.both / maxCount) * chartHeight;

              return (
                <div key={index} className="flex-1 flex items-end group">
                  <div className="w-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl border border-gray-700">
                      <div className="font-semibold text-center">{item.date}</div>
                      <div className="text-center font-bold">{item.total} total</div>
                      {item.wet > 0 && <div className="text-blue-400">💧 Wet: {item.wet}</div>}
                      {item.dirty > 0 && <div className="text-yellow-400">💩 Dirty: {item.dirty}</div>}
                      {item.both > 0 && <div className="text-orange-400">💧💩 Both: {item.both}</div>}
                    </div>

                    {/* Stacked bars */}
                    <div className="flex flex-col-reverse w-full">
                      {item.wet > 0 && (
                        <div className="bg-blue-400 hover:brightness-110 rounded-t-none w-full" style={{ height: `${wetHeight}px` }} />
                      )}
                      {item.dirty > 0 && (
                        <div className="bg-yellow-500 hover:brightness-110 w-full" style={{ height: `${dirtyHeight}px` }} />
                      )}
                      {item.both > 0 && (
                        <div className="bg-orange-400 hover:brightness-110 rounded-t w-full" style={{ height: `${bothHeight}px` }} />
                      )}
                    </div>
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
        <span>Avg: {(data.reduce((sum, d) => sum + d.total, 0) / data.length).toFixed(1)}/day</span>
        <span>Max: {dataMax}/day</span>
      </div>
    </div>
  );
};

export default DiaperChart;