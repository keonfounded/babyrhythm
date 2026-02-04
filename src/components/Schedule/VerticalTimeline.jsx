import React from 'react';
import { Coffee, Baby, Plus, Trash2, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTimeLabel } from '../../utils/timeHelpers';
import BabyCalendar from './BabyCalendar';

const VerticalTimeline = ({
  dateKey,
  date,
  schedule,
  feedTimes,
  predictions,
  feedDuration,
  showPredictions,
  timelineRefs,
  dragging,
  handleMouseDown,
  addBlock,
  removeBlock,
  deleteLoggedEvent,
  feedAmountUnit,
  birthDate,
  dailySchedules,
  showParents,
  toggleParents
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const renderParentTimeline = (person, color, blocks) => {
    const colorClasses = person === 'mom'
      ? { text: 'text-purple-400', bg: 'bg-purple-500', btn: 'bg-purple-600 hover:bg-purple-700' }
      : { text: 'text-blue-400', bg: 'bg-blue-500', btn: 'bg-blue-600 hover:bg-blue-700' };

    const blockColors = {
      sleep: colorClasses.bg,
      duty: 'bg-red-500/70',
      work: 'bg-orange-500/70'
    };
    const labels = { sleep: '😴', duty: '👁️', work: '💼' };

    return (
      <div className="flex-[0.2]">
        <div className={`text-xs font-medium ${colorClasses.text} mb-1 flex items-center justify-between`}>
          <div className="flex items-center gap-1">
            <Coffee className="w-3 h-3" />
            {person === 'mom' ? 'Mom' : 'Dad'}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => addBlock(dateKey, person, 'sleep')}
              className={`p-0.5 ${colorClasses.btn} rounded text-white`}
              title="Add sleep"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => addBlock(dateKey, person, 'work')}
              className="p-0.5 bg-orange-600 hover:bg-orange-700 rounded text-white"
              title="Add work"
            >
              <Briefcase className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div
          ref={(el) => timelineRefs.current[`${person}-${dateKey}`] = el}
          className="relative bg-gray-700 rounded"
        >
          {hours.map(hour => (
            <div key={hour} className="h-10 border-b border-gray-600"></div>
          ))}

          {blocks.map(block => {
            const isActive = dragging?.dateKey === dateKey && dragging?.person === person && dragging?.blockId === block.id;

            return (
              <div
                key={block.id}
                className={`absolute left-0 right-0 ${blockColors[block.type]} cursor-move group ${
                  isActive ? 'ring-2 ring-white' : ''
                }`}
                style={{
                  top: `${(block.start / 24) * 100}%`,
                  height: `${((block.end - block.start) / 24) * 100}%`
                }}
                onMouseDown={(e) => handleMouseDown(dateKey, person, block.id, 'move', e)}
              >
                <div
                  className="absolute left-0 right-0 top-0 h-2 cursor-ns-resize hover:bg-white/30 z-10"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(dateKey, person, block.id, 'start', e);
                  }}
                />

                <div className="px-1 py-0.5 text-xs text-white font-semibold text-center">
                  {labels[block.type]}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(dateKey, person, block.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute top-0 right-0 p-0.5 bg-red-600 rounded-bl opacity-0 group-hover:opacity-100 z-20"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>

                <div
                  className="absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize hover:bg-white/30 z-10"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(dateKey, person, block.id, 'end', e);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-2">
      {/* Time labels */}
      <div className="w-14 flex flex-col flex-shrink-0">
        {hours.map(hour => (
          <div key={hour} className="h-10 flex items-center justify-end pr-2 text-xs text-gray-500 border-b border-gray-700">
            {getTimeLabel(hour)}
          </div>
        ))}
      </div>

      {/* Collapse/Expand toggle for parents */}
      <button
        onClick={toggleParents}
        className="flex-shrink-0 w-6 flex flex-col items-center justify-start pt-6 text-gray-500 hover:text-gray-300"
        title={showParents ? 'Hide parent schedules' : 'Show parent schedules'}
      >
        {showParents ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Parent timelines (collapsible) */}
      {showParents && (
        <>
          {renderParentTimeline('mom', 'purple', schedule.momBlocks)}
          {renderParentTimeline('dad', 'blue', schedule.dadBlocks)}
        </>
      )}

      {/* Baby Calendar - merged predicted + actual */}
      <BabyCalendar
        dateKey={dateKey}
        schedule={schedule}
        birthDate={birthDate}
        dailySchedules={dailySchedules}
        feedDuration={feedDuration}
        deleteLoggedEvent={deleteLoggedEvent}
        feedAmountUnit={feedAmountUnit}
        showParents={showParents}
      />
    </div>
  );
};

export default VerticalTimeline;
