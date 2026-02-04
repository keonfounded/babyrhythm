import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trophy, Download } from 'lucide-react';
import { MILESTONE_CATEGORIES, MILESTONES } from '../../data/milestoneDefinitions';
import { exportMilestonesToCSV } from '../../utils/csvExportHelpers';
import { useMilestones } from '../../hooks/useMilestones';
import MilestoneItem from './MilestoneItem';
import MilestoneModal from './MilestoneModal';

const MilestonesPage = () => {
  const {
    customMilestones,
    isAchieved,
    getMilestoneData,
    toggleMilestone,
    updateMilestone,
    addCustomMilestone,
    removeCustomMilestone,
    getCategoryProgress,
    getTotalProgress
  } = useMilestones();

  const [expandedCategories, setExpandedCategories] = useState({
    motor: true,
    social: true,
    language: true,
    cognitive: true
  });

  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newMilestoneLabel, setNewMilestoneLabel] = useState('');
  const [newMilestoneCategory, setNewMilestoneCategory] = useState('motor');

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddCustom = () => {
    if (!newMilestoneLabel.trim()) return;

    addCustomMilestone(newMilestoneLabel.trim(), newMilestoneCategory);
    setNewMilestoneLabel('');
    setShowAddCustom(false);
  };

  // Get all predefined milestones as flat array for total progress
  const allPredefinedMilestones = Object.values(MILESTONES).flat();
  const totalProgress = getTotalProgress(allPredefinedMilestones);

  // Combine predefined and custom milestones for each category
  const getMilestonesForCategory = (categoryId) => {
    const predefined = MILESTONES[categoryId] || [];
    const custom = customMilestones.filter(m => m.category === categoryId);
    return [...predefined, ...custom];
  };

  const handleExportMilestones = () => {
    exportMilestonesToCSV(milestones, MILESTONES, 'Baby');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Milestones
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportMilestones}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
            title="Export milestones to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-white font-semibold">
            {totalProgress.achieved} / {totalProgress.total} milestones
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-500"
            style={{ width: `${totalProgress.percentage}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-sm text-teal-400 font-medium">{totalProgress.percentage}%</span>
        </div>
      </div>

      {/* Add Custom Milestone Form */}
      {showAddCustom && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-teal-500/50">
          <h3 className="text-lg font-semibold text-white mb-3">Add Custom Milestone</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Milestone Name</label>
              <input
                type="text"
                value={newMilestoneLabel}
                onChange={(e) => setNewMilestoneLabel(e.target.value)}
                placeholder="e.g., First tooth"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={newMilestoneCategory}
                onChange={(e) => setNewMilestoneCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {Object.entries(MILESTONE_CATEGORIES).map(([id, cat]) => (
                  <option key={id} value={id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddCustom(false)}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustom}
                disabled={!newMilestoneLabel.trim()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded transition-colors"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(MILESTONE_CATEGORIES).map(([categoryId, category]) => {
          const milestonesInCategory = getMilestonesForCategory(categoryId);
          const progress = getCategoryProgress(milestonesInCategory);
          const isExpanded = expandedCategories[categoryId];

          return (
            <div
              key={categoryId}
              className={`bg-gray-800 rounded-lg border ${category.borderColor}/30 overflow-hidden`}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <h3 className={`font-semibold ${category.color}`}>{category.label}</h3>
                    <span className="text-xs text-gray-500">
                      {progress.achieved} of {progress.total} complete
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress bar */}
                  <div className="hidden sm:block w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${category.borderColor.replace('border-', 'bg-')} transition-all duration-300`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${category.color}`}>
                    {progress.percentage}%
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Milestones List */}
              {isExpanded && (
                <div className="p-4 pt-0 space-y-2">
                  {milestonesInCategory.map(milestone => (
                    <MilestoneItem
                      key={milestone.id}
                      milestone={milestone}
                      isAchieved={isAchieved(milestone.id)}
                      milestoneData={getMilestoneData(milestone.id)}
                      onToggle={toggleMilestone}
                      onEdit={(m) => setEditingMilestone(m)}
                      categoryColor={category.color}
                    />
                  ))}
                  {milestonesInCategory.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No milestones in this category yet
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <MilestoneModal
        isOpen={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        milestone={editingMilestone}
        milestoneData={editingMilestone ? getMilestoneData(editingMilestone.id) : null}
        onUpdate={updateMilestone}
        onRemoveCustom={removeCustomMilestone}
      />
    </div>
  );
};

export default MilestonesPage;
