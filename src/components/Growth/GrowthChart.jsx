import React, { useMemo } from 'react';
import { getAgePoints } from '../../data/whoGrowthData';
import {
  getPercentilesForAge,
  calculatePercentile,
  prepareWeightHistoryForChart,
  getPercentileDescription,
  getWeightInUnit
} from '../../utils/growthHelpers';

const GrowthChart = ({ weightHistory, birthDate, sex = 'boy', weightUnit = 'kg' }) => {
  // Chart dimensions
  const chartWidth = 600;
  const chartHeight = 350;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate max age to display based on baby's age
  const babyAgeDays = useMemo(() => {
    if (!birthDate) return 365;
    const birth = new Date(birthDate);
    const today = new Date();
    return Math.floor((today - birth) / (1000 * 60 * 60 * 24));
  }, [birthDate]);

  // Show chart up to 6 months ahead of current age, max 24 months
  const maxDisplayDays = Math.min(730, Math.max(180, babyAgeDays + 180));

  // Prepare data
  const chartData = useMemo(() => {
    // Generate percentile curves
    const agePoints = getAgePoints().filter(age => age <= maxDisplayDays);

    const curves = {
      p3: [],
      p15: [],
      p50: [],
      p85: [],
      p97: []
    };

    agePoints.forEach(age => {
      const percentiles = getPercentilesForAge(age, sex);
      Object.keys(curves).forEach(p => {
        curves[p].push({ age, weight: percentiles[p] });
      });
    });

    // Prepare baby's weight data
    const babyData = prepareWeightHistoryForChart(weightHistory, birthDate, weightUnit);

    // Calculate weight range
    const allWeights = [
      ...Object.values(curves).flatMap(c => c.map(p => p.weight)),
      ...babyData.map(d => d.weight)
    ];
    const minWeight = Math.floor(Math.min(...allWeights) * 0.9);
    const maxWeight = Math.ceil(Math.max(...allWeights) * 1.1);

    return { curves, babyData, minWeight, maxWeight, maxAge: maxDisplayDays };
  }, [weightHistory, birthDate, sex, weightUnit, maxDisplayDays]);

  // Scale functions
  const scaleX = (age) => padding.left + (age / chartData.maxAge) * innerWidth;
  const scaleY = (weight) => {
    const range = chartData.maxWeight - chartData.minWeight;
    return padding.top + innerHeight - ((weight - chartData.minWeight) / range) * innerHeight;
  };

  // Generate path for a curve
  const generatePath = (points) => {
    if (points.length === 0) return '';
    return points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(p.age)} ${scaleY(p.weight)}`
    ).join(' ');
  };

  // Generate area between two curves (for shaded bands)
  const generateArea = (curve1, curve2) => {
    if (curve1.length === 0 || curve2.length === 0) return '';
    const forward = curve1.map(p => `${scaleX(p.age)} ${scaleY(p.weight)}`).join(' L ');
    const backward = [...curve2].reverse().map(p => `${scaleX(p.age)} ${scaleY(p.weight)}`).join(' L ');
    return `M ${forward} L ${backward} Z`;
  };

  // Get current percentile for latest weight
  const latestPercentile = useMemo(() => {
    if (chartData.babyData.length === 0) return null;
    const latest = chartData.babyData[chartData.babyData.length - 1];
    return {
      ...latest,
      percentile: calculatePercentile(latest.weight, latest.age, sex)
    };
  }, [chartData.babyData, sex]);

  // X-axis labels (months)
  const xAxisLabels = useMemo(() => {
    const labels = [];
    const maxMonths = Math.ceil(chartData.maxAge / 30);
    for (let m = 0; m <= maxMonths; m += 3) {
      const days = m * 30;
      if (days <= chartData.maxAge) {
        labels.push({ days, label: `${m}m` });
      }
    }
    return labels;
  }, [chartData.maxAge]);

  // Y-axis labels
  const yAxisLabels = useMemo(() => {
    const labels = [];
    const step = weightUnit === 'lbs' ? 2 : 1;
    const minVal = Math.floor(getWeightInUnit(chartData.minWeight, weightUnit));
    const maxVal = Math.ceil(getWeightInUnit(chartData.maxWeight, weightUnit));

    for (let w = minVal; w <= maxVal; w += step) {
      const weightKg = weightUnit === 'lbs' ? w * 0.453592 : w;
      if (weightKg >= chartData.minWeight && weightKg <= chartData.maxWeight) {
        labels.push({ weight: weightKg, label: `${w}${weightUnit === 'lbs' ? 'lb' : 'kg'}` });
      }
    }
    return labels;
  }, [chartData.minWeight, chartData.maxWeight, weightUnit]);

  if (!weightHistory || weightHistory.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Growth Chart</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No weight data to display</p>
          <p className="text-gray-500 text-sm mt-2">Add weight entries in Profile to see growth chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Growth Chart ({sex === 'girl' ? 'Girls' : 'Boys'})
        </h3>
        {latestPercentile && (
          <div className="text-sm text-right">
            <span className="text-gray-400">Current: </span>
            <span className="text-teal-400 font-semibold">
              {Math.round(latestPercentile.percentile)}th percentile
            </span>
            <div className="text-xs text-gray-500">
              {getPercentileDescription(latestPercentile.percentile)}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="min-w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Shaded percentile bands */}
          <path
            d={generateArea(chartData.curves.p3, chartData.curves.p97)}
            fill="rgba(45, 212, 191, 0.1)"
          />
          <path
            d={generateArea(chartData.curves.p15, chartData.curves.p85)}
            fill="rgba(45, 212, 191, 0.15)"
          />
          <path
            d={generateArea(chartData.curves.p50, chartData.curves.p50)}
            fill="none"
          />

          {/* Percentile curves */}
          <path
            d={generatePath(chartData.curves.p3)}
            stroke="rgba(107, 114, 128, 0.5)"
            strokeWidth="1"
            strokeDasharray="4 2"
            fill="none"
          />
          <path
            d={generatePath(chartData.curves.p15)}
            stroke="rgba(107, 114, 128, 0.6)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d={generatePath(chartData.curves.p50)}
            stroke="rgba(45, 212, 191, 0.8)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d={generatePath(chartData.curves.p85)}
            stroke="rgba(107, 114, 128, 0.6)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d={generatePath(chartData.curves.p97)}
            stroke="rgba(107, 114, 128, 0.5)"
            strokeWidth="1"
            strokeDasharray="4 2"
            fill="none"
          />

          {/* Baby's weight line */}
          {chartData.babyData.length > 1 && (
            <path
              d={generatePath(chartData.babyData)}
              stroke="#14b8a6"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Baby's weight points */}
          {chartData.babyData.map((point, i) => (
            <g key={i}>
              <circle
                cx={scaleX(point.age)}
                cy={scaleY(point.weight)}
                r="6"
                fill="#14b8a6"
                stroke="#0f766e"
                strokeWidth="2"
              />
              {/* Tooltip on hover would require interactivity */}
            </g>
          ))}

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#374151"
            strokeWidth="1"
          />
          {xAxisLabels.map((label, i) => (
            <g key={i}>
              <line
                x1={scaleX(label.days)}
                y1={chartHeight - padding.bottom}
                x2={scaleX(label.days)}
                y2={chartHeight - padding.bottom + 5}
                stroke="#374151"
              />
              <text
                x={scaleX(label.days)}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
              >
                {label.label}
              </text>
            </g>
          ))}
          <text
            x={chartWidth / 2}
            y={chartHeight - 5}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="12"
          >
            Age (months)
          </text>

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#374151"
            strokeWidth="1"
          />
          {yAxisLabels.map((label, i) => (
            <g key={i}>
              <line
                x1={padding.left - 5}
                y1={scaleY(label.weight)}
                x2={padding.left}
                y2={scaleY(label.weight)}
                stroke="#374151"
              />
              <text
                x={padding.left - 10}
                y={scaleY(label.weight) + 4}
                textAnchor="end"
                fill="#9ca3af"
                fontSize="11"
              >
                {label.label}
              </text>
              {/* Grid line */}
              <line
                x1={padding.left}
                y1={scaleY(label.weight)}
                x2={chartWidth - padding.right}
                y2={scaleY(label.weight)}
                stroke="#374151"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            </g>
          ))}
          <text
            x={15}
            y={chartHeight / 2}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="12"
            transform={`rotate(-90, 15, ${chartHeight / 2})`}
          >
            Weight ({weightUnit === 'lbs' ? 'lbs' : 'kg'})
          </text>

          {/* Percentile labels */}
          <text
            x={chartWidth - padding.right + 5}
            y={scaleY(chartData.curves.p97[chartData.curves.p97.length - 1]?.weight || 0)}
            fill="#6b7280"
            fontSize="10"
          >
            97th
          </text>
          <text
            x={chartWidth - padding.right + 5}
            y={scaleY(chartData.curves.p50[chartData.curves.p50.length - 1]?.weight || 0)}
            fill="#14b8a6"
            fontSize="10"
          >
            50th
          </text>
          <text
            x={chartWidth - padding.right + 5}
            y={scaleY(chartData.curves.p3[chartData.curves.p3.length - 1]?.weight || 0)}
            fill="#6b7280"
            fontSize="10"
          >
            3rd
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-teal-500"></div>
          <span>Baby's weight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-teal-500/50"></div>
          <span>50th percentile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-teal-500/15 rounded"></div>
          <span>Normal range (15th-85th)</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="font-medium text-gray-300">Based on WHO Child Growth Standards.</span>{' '}
          Percentiles are screening tools, not diagnoses. Many healthy babies fall outside the "normal" range.
          Consult your pediatrician for interpretation of your baby's growth pattern.
        </p>
      </div>
    </div>
  );
};

export default GrowthChart;
