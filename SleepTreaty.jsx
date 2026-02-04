import React, { useState, useRef } from 'react';
import { Moon, Coffee, Baby, Droplet } from 'lucide-react';

const SleepTreaty = () => {
  // State for all parameters
  const [feedInterval, setFeedInterval] = useState(3);
  const [feedDuration, setFeedDuration] = useState(0.5);
  const [shiftStart, setShiftStart] = useState(20);
  const [momPriority, setMomPriority] = useState(0.5);
  const [dadPriority, setDadPriority] = useState(0.5);
  const [allowOverlap, setAllowOverlap] = useState(false);

  // State for schedule blocks
  const [momBlocks, setMomBlocks] = useState([
    { id: 1, type: 'sleep', start: 0, end: 4 },
    { id: 2, type: 'duty', start: 4, end: 8 },
    { id: 3, type: 'sleep', start: 8, end: 12 }
  ]);
  
  const [dadBlocks, setDadBlocks] = useState([
    { id: 1, type: 'duty', start: 0, end: 4 },
    { id: 2, type: 'sleep', start: 4, end: 8 },
    { id: 3, type: 'duty', start: 8, end: 12 }
  ]);

  const [dragging, setDragging] = useState(null);
  const timelineRef = useRef(null);

  // Calculate feed times
  const getFeedTimes = () => {
    const feeds = [];
    let currentTime = 0;
    while (currentTime < 12) {
      feeds.push(currentTime);
      currentTime += feedInterval;
    }
    return feeds;
  };

  const feedTimes = getFeedTimes();

  // Helper: Convert hour to time label
  const getTimeLabel = (hour) => {
    const actualHour = (shiftStart + hour) % 24;
    let displayHour = actualHour % 12;
    if (displayHour === 0) displayHour = 12;
    const period = actualHour >= 12 && actualHour < 24 ? 'AM' : 'PM';
    return `${displayHour} ${period}`;
  };

  // Convert mouse position to timeline hours
  const getHourFromPosition = (clientX) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(percentage * 12 * 4) / 4; // Snap to 15-min intervals
  };

  // Handle dragging
  const handleMouseDown = (person, blockId, edge, e) => {
    e.preventDefault();
    setDragging({ person, blockId, edge });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const newHour = getHourFromPosition(e.clientX);
    const { person, blockId, edge } = dragging;
    
    const updateBlocks = person === 'mom' ? setMomBlocks : setDadBlocks;
    
    updateBlocks(blocks => {
      return blocks.map(block => {
        if (block.id !== blockId) return block;
        
        if (edge === 'start') {
          return { ...block, start: Math.min(newHour, block.end - 0.25) };
        } else if (edge === 'end') {
          return { ...block, end: Math.max(newHour, block.start + 0.25) };
        } else {
          // Move entire block
          const duration = block.end - block.start;
          const newStart = Math.max(0, Math.min(12 - duration, newHour - duration / 2));
          return { ...block, start: newStart, end: newStart + duration };
        }
      });
    });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Add event listeners
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging]);

  // Render a block
  const renderBlock = (block, person) => {
    const isActive = dragging?.person === person && dragging?.blockId === block.id;
    const colors = {
      sleep: person === 'mom' ? 'bg-purple-500' : 'bg-blue-500',
      duty: 'bg-red-500/70'
    };

    return (
      <div
        key={block.id}
        className={`absolute top-0 bottom-0 ${colors[block.type]} rounded cursor-move transition-opacity ${
          isActive ? 'opacity-80' : 'opacity-90 hover:opacity-100'
        }`}
        style={{
          left: `${(block.start / 12) * 100}%`,
          width: `${((block.end - block.start) / 12) * 100}%`
        }}
        onMouseDown={(e) => handleMouseDown(person, block.id, 'move', e)}
      >
        {/* Left edge handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(person, block.id, 'start', e);
          }}
        />
        
        {/* Block label */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white pointer-events-none">
          {block.type === 'sleep' ? '😴 Sleep' : '👁️ Duty'}
        </div>

        {/* Right edge handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(person, block.id, 'end', e);
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2 flex items-center justify-center gap-3">
            <Moon className="w-8 h-8" />
            Sleep Treaty
            <Baby className="w-8 h-8" />
          </h1>
          <p className="text-gray-400">Smart shift optimizer for new parents</p>
        </div>

        <div className="flex gap-8">
          
          {/* Sidebar Controls */}
          <div className="w-80 bg-gray-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-300">Settings</h2>
            
            {/* Feed Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Feed Interval
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="6"
                  step="0.5"
                  value={feedInterval}
                  onChange={(e) => setFeedInterval(parseFloat(e.target.value))}
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
                <span className="text-gray-400 text-sm">hours</span>
              </div>
            </div>

            {/* Feed Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Feed Duration
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0.25"
                  max="2"
                  step="0.25"
                  value={feedDuration}
                  onChange={(e) => setFeedDuration(parseFloat(e.target.value))}
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
                <span className="text-gray-400 text-sm">({Math.round(feedDuration * 60)} min)</span>
              </div>
            </div>

            {/* Shift Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shift Start Time
              </label>
              <select
                value={shiftStart}
                onChange={(e) => setShiftStart(parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value={19}>7:00 PM</option>
                <option value={20}>8:00 PM</option>
                <option value={21}>9:00 PM</option>
                <option value={22}>10:00 PM</option>
              </select>
            </div>

            {/* Mom Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mom's Sleep Priority
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={momPriority}
                  onChange={(e) => setMomPriority(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Early Night</span>
                  <span>Late Morning</span>
                </div>
              </div>
            </div>

            {/* Dad Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dad's Sleep Priority
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={dadPriority}
                  onChange={(e) => setDadPriority(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Early Night</span>
                  <span>Late Morning</span>
                </div>
              </div>
            </div>

            {/* Overlap Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowOverlap}
                  onChange={(e) => setAllowOverlap(e.target.checked)}
                  className="w-5 h-5 accent-teal-500"
                />
                <span className="text-sm text-gray-300">
                  Allow Sleep Overlap
                  <span className="block text-xs text-gray-500 mt-1">
                    Both parents can sleep if no feed needed
                  </span>
                </span>
              </label>
            </div>

            {/* Auto-Solve Button */}
            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Auto-Solve Schedule
            </button>
          </div>

          {/* Main Timeline */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg p-6">
              
              {/* Timeline Container */}
              <div className="space-y-6">
                
                {/* Hour Markers */}
                <div className="relative h-8 mb-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    {Array.from({ length: 13 }).map((_, i) => (
                      <div key={i} className="w-0 text-center">
                        <div className="relative -left-6 w-12">
                          {getTimeLabel(i)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Baby Row */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <Baby className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-medium text-gray-300 w-16">Baby</span>
                  </div>
                  <div className="relative h-12 bg-gray-700 rounded overflow-hidden">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-600"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}
                    
                    {feedTimes.map((time, idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 bg-pink-500/30 border-l-2 border-pink-500 flex items-center justify-center"
                        style={{
                          left: `${(time / 12) * 100}%`,
                          width: `${(feedDuration / 12) * 100}%`
                        }}
                      >
                        <Droplet className="w-4 h-4 text-pink-300" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mom Row */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <Coffee className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300 w-16">Mom</span>
                  </div>
                  <div ref={timelineRef} className="relative h-16 bg-gray-700 rounded">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-600"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}
                    {momBlocks.map(block => renderBlock(block, 'mom'))}
                  </div>
                </div>

                {/* Dad Row */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <Coffee className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300 w-16">Dad</span>
                  </div>
                  <div className="relative h-16 bg-gray-700 rounded">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-600"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}
                    {dadBlocks.map(block => renderBlock(block, 'dad'))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SleepTreaty;