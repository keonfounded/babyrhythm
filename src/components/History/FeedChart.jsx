import React from 'react';

const FeedChart = ({ data, unit = 'oz' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No feeding data to display</p>
        <p className="text-gray-500 text-sm mt-2">Log feeds with amounts to see your chart!</p>
      </div>
    );
  }

  const dataMax = Math.max(...data.map(d => d.amount || 0));
  const maxAmount = Math.max(dataMax + 2, 10); // Add 2 unit padding, min 10 units scale
  const chartHeight = 300; // pixels

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Daily Feeding Amount ({unit})
      </h3>
      
      {/* Chart container */}
      <div className="flex gap-4">
        {/* Y-axis */}
        <div className="w-12 flex flex-col justify-between text-xs text-gray-400" style={{ height: `${chartHeight}px` }}>
          <span className="text-right">{maxAmount.toFixed(0)}</span>
          <span className="text-right">{(maxAmount * 0.75).toFixed(0)}</span>
          <span className="text-right">{(maxAmount * 0.5).toFixed(0)}</span>
          <span className="text-right">{(maxAmount * 0.25).toFixed(0)}</span>
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
              const amount = item.amount || 0;
              const barHeight = (amount / maxAmount) * chartHeight;
              const color = amount > 0 ? 'bg-pink-500' : 'bg-gray-600';

              return (
                <div 
                  key={index} 
                  className="flex-1 flex items-end group"
                >
                  <div className="w-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl border border-gray-700">
                      <div className="font-semibold text-center">{item.date}</div>
                      <div className="text-pink-400 text-center font-bold">{amount.toFixed(1)} {unit}</div>
                      <div className="text-gray-400 text-center text-xs">{item.count} feeds</div>
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
        <span>Avg: {(data.reduce((sum, d) => sum + d.amount, 0) / data.length).toFixed(1)} {unit}/day</span>
        <span>Max: {dataMax.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
};

export default FeedChart;