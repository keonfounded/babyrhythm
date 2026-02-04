import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

const MilestoneModal = ({
  isOpen,
  onClose,
  milestone,
  milestoneData,
  onUpdate,
  onRemoveCustom
}) => {
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && milestoneData) {
      setDate(milestoneData.date || '');
      setNote(milestoneData.note || '');
    }
  }, [isOpen, milestoneData]);

  if (!isOpen || !milestone) return null;

  const handleSave = () => {
    onUpdate(milestone.id, { date, note });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Remove this custom milestone?')) {
      onRemoveCustom(milestone.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-800 rounded-lg w-full max-w-md shadow-xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Edit Milestone</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Milestone Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Milestone</label>
            <div className="text-white font-medium">{milestone.label}</div>
            {!milestone.isCustom && milestone.typicalAge && (
              <div className="text-xs text-gray-500 mt-1">
                Typical age: {milestone.typicalAge}
              </div>
            )}
          </div>

          {/* Date Achieved */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date Achieved</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a memory or note about this milestone..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <div>
            {milestone.isCustom && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;
