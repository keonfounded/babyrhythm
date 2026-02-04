import React from 'react';
import { Check, Calendar, Edit2 } from 'lucide-react';

const MilestoneItem = ({
  milestone,
  isAchieved,
  milestoneData,
  onToggle,
  onEdit,
  categoryColor = 'text-teal-400'
}) => {
  const { date, note } = milestoneData;

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg transition-all
        ${isAchieved
          ? 'bg-gray-700/50 border border-gray-600'
          : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800'}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(milestone.id)}
        className={`
          flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5
          transition-all
          ${isAchieved
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-500 hover:border-gray-400'}
        `}
      >
        {isAchieved && <Check className="w-4 h-4" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${isAchieved ? 'text-gray-300' : 'text-white'}`}>
            {milestone.label}
          </span>
          {!milestone.isCustom && (
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
              {milestone.typicalAge}
            </span>
          )}
          {milestone.isCustom && (
            <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
              Custom
            </span>
          )}
        </div>

        {isAchieved && (
          <div className="mt-1 text-sm">
            {date && (
              <span className="text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
            {note && (
              <p className="text-gray-500 mt-1 italic">"{note}"</p>
            )}
          </div>
        )}
      </div>

      {/* Edit button (only when achieved) */}
      {isAchieved && (
        <button
          onClick={() => onEdit(milestone)}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
          title="Edit milestone"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MilestoneItem;
