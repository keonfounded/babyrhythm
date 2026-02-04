import React, { useState } from 'react';
import { Clock, X, Undo2, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [showFeedAmount, setShowFeedAmount] = useState(false);
  const [feedAmount, setFeedAmount] = useState('');
  const [showDiaperType, setShowDiaperType] = useState(false);
  const [showPumpForm, setShowPumpForm] = useState(false);
  const [pumpAmount, setPumpAmount] = useState('');
  const [pumpSide, setPumpSide] = useState('both');
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleFeedNow = () => {
    const amount = feedAmount ? parseFloat(feedAmount) : null;
    logEventNow('feed', amount);
    setFeedAmount('');
    setShowFeedAmount(false);
  };

  const handlePumpNow = () => {
    const amount = pumpAmount ? parseFloat(pumpAmount) : null;
    logEventNow('pump', amount, pumpSide);
    setPumpAmount('');
    setPumpSide('both');
    setShowPumpForm(false);
  };

  const handleMedNow = () => {
    logEventNow('medication', null, null, `${medName}${medDosage ? ` - ${medDosage}` : ''}`);
    setMedName('');
    setMedDosage('');
    setShowMedForm(false);
  };

  const closeAllForms = () => {
    setShowFeedAmount(false);
    setShowDiaperType(false);
    setShowPumpForm(false);
    setShowMedForm(false);
    setShowMoreMenu(false);
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
            {/* Pump */}
            {showPumpForm ? (
              <div className="flex gap-2 items-center bg-purple-600/20 px-3 py-2 rounded border border-purple-600">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Amount"
                  value={pumpAmount}
                  onChange={(e) => setPumpAmount(e.target.value)}
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
                <select
                  value={pumpSide}
                  onChange={(e) => setPumpSide(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both</option>
                </select>
                <button
                  onClick={handlePumpNow}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold"
                >
                  Log
                </button>
                <button
                  onClick={() => { setShowPumpForm(false); setPumpAmount(''); }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPumpForm(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2"
              >
                🧴 Pump
              </button>
            )}

            {/* Medication */}
            {showMedForm ? (
              <div className="flex gap-2 items-center bg-red-600/20 px-3 py-2 rounded border border-red-600">
                <input
                  type="text"
                  placeholder="Med name"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-28 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
                <button
                  onClick={handleMedNow}
                  disabled={!medName.trim()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold disabled:opacity-50"
                >
                  Log
                </button>
                <button
                  onClick={() => { setShowMedForm(false); setMedName(''); setMedDosage(''); }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowMedForm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2"
              >
                💊 Med
              </button>
            )}

            <button
              onClick={() => logEventNow('note')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center gap-2"
            >
              📝 Note
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

      {/* Mobile floating bottom bar - above the tab navigation */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 shadow-lg">
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

        {showPumpForm && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-400 text-lg">🧴</span>
              <span className="text-white font-medium">Log Pump</span>
              <button
                onClick={() => { setShowPumpForm(false); setPumpAmount(''); }}
                className="ml-auto p-1 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setPumpSide('left')}
                className={`flex-1 py-3 rounded-xl font-medium ${pumpSide === 'left' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Left
              </button>
              <button
                onClick={() => setPumpSide('right')}
                className={`flex-1 py-3 rounded-xl font-medium ${pumpSide === 'right' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Right
              </button>
              <button
                onClick={() => setPumpSide('both')}
                className={`flex-1 py-3 rounded-xl font-medium ${pumpSide === 'both' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Both
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.5"
                inputMode="decimal"
                placeholder="Amount (optional)"
                value={pumpAmount}
                onChange={(e) => setPumpAmount(e.target.value)}
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
                onClick={handlePumpNow}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold"
              >
                Log
              </button>
            </div>
          </div>
        )}

        {showMedForm && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-400 text-lg">💊</span>
              <span className="text-white font-medium">Log Medication</span>
              <button
                onClick={() => { setShowMedForm(false); setMedName(''); setMedDosage(''); }}
                className="ml-auto p-1 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Medication name"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg"
                autoFocus
              />
              <input
                type="text"
                placeholder="Dosage"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg"
              />
              <button
                onClick={handleMedNow}
                disabled={!medName.trim()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Log
              </button>
            </div>
          </div>
        )}

        {showMoreMenu && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400 text-lg">➕</span>
              <span className="text-white font-medium">More Actions</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="ml-auto p-1 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setShowMoreMenu(false); setShowPumpForm(true); }}
                className="py-4 bg-purple-600 text-white rounded-xl font-medium"
              >
                🧴 Pump
              </button>
              <button
                onClick={() => { setShowMoreMenu(false); setShowMedForm(true); }}
                className="py-4 bg-red-600 text-white rounded-xl font-medium"
              >
                💊 Med
              </button>
              <button
                onClick={() => { logEventNow('note'); setShowMoreMenu(false); }}
                className="py-4 bg-gray-600 text-white rounded-xl font-medium"
              >
                📝 Note
              </button>
            </div>
          </div>
        )}

        {/* Main quick action buttons */}
        <div className="p-3 flex gap-2">
          {!showFeedAmount && !showDiaperType && !showPumpForm && !showMedForm && !showMoreMenu && (
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
                  onClick={() => setShowMoreMenu(true)}
                  className="bg-gray-700 text-white"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </QuickButton>
              )}
            </>
          )}
        </div>

        {/* Undo available indicator */}
        {canUndo && !showFeedAmount && !showDiaperType && !showPumpForm && !showMedForm && !showMoreMenu && (
          <div className="px-3 pb-2 -mt-1">
            <div className="text-xs text-center text-orange-400 bg-orange-900/30 rounded-lg py-2">
              {undoLabel} available (30s)
            </div>
          </div>
        )}

        {/* Active sleep indicator */}
        {activeSleepSession && !canUndo && !showFeedAmount && !showDiaperType && !showPumpForm && !showMedForm && !showMoreMenu && (
          <div className="px-3 pb-3 -mt-1">
            <div className="text-xs text-center text-indigo-400 bg-indigo-900/30 rounded-lg py-2">
              ⏱️ Sleep in progress...
            </div>
          </div>
        )}
      </div>

      {/* Spacer for mobile quick log bar (above the nav bar) */}
      <div className="md:hidden h-28" />
    </>
  );
};

export default QuickLogToolbar;
