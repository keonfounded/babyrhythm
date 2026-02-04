import React, { useState } from 'react';
import { Clock, X, Undo2 } from 'lucide-react';
import { formatTime, getCurrentTimeInHours } from '../../utils/timeHelpers';

const QuickLogToolbar = ({
  activeSleepSession,
  logEventNow,
  beginSleep,
  endSleep,
  feedAmountUnit,
  setFeedAmountUnit,
  undoLastAction,
  canUndo,
  undoLabel
}) => {
  const [showFeedAmount, setShowFeedAmount] = useState(false);
  const [feedAmount, setFeedAmount] = useState('');
  const [showDiaperType, setShowDiaperType] = useState(false);

  const handleFeedNow = () => {
    const amount = feedAmount ? parseFloat(feedAmount) : null;
    logEventNow('feed', amount);
    setFeedAmount('');
    setShowFeedAmount(false);
  };

  // Mobile quick action buttons
  const QuickButton = ({ onClick, className, children, pulse = false }) => (
    <button
      onClick={onClick}
      className={`
        flex-1 md:flex-none
        min-h-[56px] md:min-h-0
        px-3 md:px-4 py-3 md:py-2
        rounded-xl md:rounded
        flex items-center justify-center gap-2
        text-sm md:text-base font-medium
        active:scale-95 transition-transform
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* Desktop toolbar */}
      <div className="hidden md:block mb-4 p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quick Log (Current Time: {formatTime(getCurrentTimeInHours())})
          </h3>
          <div className="flex gap-2 items-center">
            {/* Feed with optional amount */}
            {showFeedAmount ? (
              <div className="flex gap-2 items-center bg-pink-600/20 px-3 py-2 rounded border border-pink-600">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Amount"
                  value={feedAmount}
                  onChange={(e) => setFeedAmount(e.target.value)}
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  autoFocus
                />
                <select
                  value={feedAmountUnit}
                  onChange={(e) => setFeedAmountUnit(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="oz">oz</option>
                  <option value="ml">ml</option>
                </select>
                <button
                  onClick={handleFeedNow}
                  className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm font-semibold"
                >
                  Log
                </button>
                <button
                  onClick={() => {
                    setShowFeedAmount(false);
                    setFeedAmount('');
                  }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowFeedAmount(true)}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded flex items-center gap-2"
              >
                🍼 Feed Now
              </button>
            )}

            {activeSleepSession ? (
              <button
                onClick={endSleep}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2 animate-pulse"
              >
                ⏹️ End Sleep
              </button>
            ) : (
              <button
                onClick={beginSleep}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-2"
              >
                😴 Begin Sleep
              </button>
            )}
            {showDiaperType ? (
              <div className="flex gap-2 items-center bg-yellow-600/20 px-3 py-2 rounded border border-yellow-600">
                <button
                  onClick={() => { logEventNow('diaper', null, 'wet'); setShowDiaperType(false); }}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold"
                >
                  💧 Wet
                </button>
                <button
                  onClick={() => { logEventNow('diaper', null, 'dirty'); setShowDiaperType(false); }}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-semibold"
                >
                  💩 Dirty
                </button>
                <button
                  onClick={() => { logEventNow('diaper', null, 'both'); setShowDiaperType(false); }}
                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-semibold"
                >
                  💧💩 Both
                </button>
                <button
                  onClick={() => setShowDiaperType(false)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDiaperType(true)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded flex items-center gap-2"
              >
                💩 Diaper Now
              </button>
            )}
            <button
              onClick={() => logEventNow('note')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center gap-2"
            >
              📝 Note Now
            </button>
            {canUndo && (
              <button
                onClick={undoLastAction}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center gap-2 animate-pulse"
              >
                <Undo2 className="w-4 h-4" />
                {undoLabel}
              </button>
            )}
          </div>
        </div>
        {activeSleepSession && (
          <div className="mt-2 text-xs text-indigo-400">
            ⏱️ Sleep session active - click "End Sleep" to complete
          </div>
        )}
      </div>

      {/* Mobile floating bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-gray-900 border-t border-gray-700 safe-area-pb">
        {/* Expanded states (feed amount or diaper type) */}
        {showFeedAmount && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-pink-400 text-lg">🍼</span>
              <span className="text-white font-medium">Log Feed</span>
              <button
                onClick={() => { setShowFeedAmount(false); setFeedAmount(''); }}
                className="ml-auto p-1 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.5"
                inputMode="decimal"
                placeholder="Amount (optional)"
                value={feedAmount}
                onChange={(e) => setFeedAmount(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg"
                autoFocus
              />
              <select
                value={feedAmountUnit}
                onChange={(e) => setFeedAmountUnit(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white"
              >
                <option value="oz">oz</option>
                <option value="ml">ml</option>
              </select>
              <button
                onClick={handleFeedNow}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold"
              >
                Log
              </button>
            </div>
          </div>
        )}

        {showDiaperType && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400 text-lg">💩</span>
              <span className="text-white font-medium">Log Diaper</span>
              <button
                onClick={() => setShowDiaperType(false)}
                className="ml-auto p-1 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { logEventNow('diaper', null, 'wet'); setShowDiaperType(false); }}
                className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-medium text-lg"
              >
                💧 Wet
              </button>
              <button
                onClick={() => { logEventNow('diaper', null, 'dirty'); setShowDiaperType(false); }}
                className="flex-1 py-4 bg-yellow-600 text-white rounded-xl font-medium text-lg"
              >
                💩 Dirty
              </button>
              <button
                onClick={() => { logEventNow('diaper', null, 'both'); setShowDiaperType(false); }}
                className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-medium text-lg"
              >
                Both
              </button>
            </div>
          </div>
        )}

        {/* Main quick action buttons */}
        <div className="p-3 flex gap-2">
          {!showFeedAmount && !showDiaperType && (
            <>
              <QuickButton
                onClick={() => setShowFeedAmount(true)}
                className="bg-pink-600 text-white"
              >
                <span className="text-xl">🍼</span>
                <span className="hidden xs:inline">Feed</span>
              </QuickButton>

              {activeSleepSession ? (
                <QuickButton
                  onClick={endSleep}
                  className="bg-red-600 text-white"
                  pulse
                >
                  <span className="text-xl">⏹️</span>
                  <span className="hidden xs:inline">Wake</span>
                </QuickButton>
              ) : (
                <QuickButton
                  onClick={beginSleep}
                  className="bg-indigo-600 text-white"
                >
                  <span className="text-xl">😴</span>
                  <span className="hidden xs:inline">Sleep</span>
                </QuickButton>
              )}

              <QuickButton
                onClick={() => setShowDiaperType(true)}
                className="bg-yellow-600 text-white"
              >
                <span className="text-xl">💩</span>
                <span className="hidden xs:inline">Diaper</span>
              </QuickButton>

              {canUndo ? (
                <QuickButton
                  onClick={undoLastAction}
                  className="bg-orange-600 text-white"
                  pulse
                >
                  <Undo2 className="w-5 h-5" />
                </QuickButton>
              ) : (
                <QuickButton
                  onClick={() => logEventNow('note')}
                  className="bg-gray-700 text-white"
                >
                  <span className="text-xl">📝</span>
                </QuickButton>
              )}
            </>
          )}
        </div>

        {/* Undo available indicator */}
        {canUndo && !showFeedAmount && !showDiaperType && (
          <div className="px-3 pb-2 -mt-1">
            <div className="text-xs text-center text-orange-400 bg-orange-900/30 rounded-lg py-2">
              {undoLabel} available (30s)
            </div>
          </div>
        )}

        {/* Active sleep indicator */}
        {activeSleepSession && !canUndo && !showFeedAmount && !showDiaperType && (
          <div className="px-3 pb-3 -mt-1">
            <div className="text-xs text-center text-indigo-400 bg-indigo-900/30 rounded-lg py-2">
              ⏱️ Sleep in progress...
            </div>
          </div>
        )}
      </div>

      {/* Spacer for mobile bottom bar */}
      <div className="md:hidden h-24" />
    </>
  );
};

export default QuickLogToolbar;
