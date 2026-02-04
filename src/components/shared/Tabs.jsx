import React from 'react';

const Tabs = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: '📅', mobileLabel: 'Home' },
    { id: 'history', label: 'History', icon: '📊', mobileLabel: 'History' },
    { id: 'milestones', label: 'Milestones', icon: '🏆', mobileLabel: 'Goals' },
    { id: 'doctor', label: 'Doctor', icon: '🩺', mobileLabel: 'Doctor' },
    { id: 'profile', label: 'Profile', icon: '👶', mobileLabel: 'Profile' }
  ];

  return (
    <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`
            px-3 sm:px-6 py-2 sm:py-3
            rounded-lg font-semibold
            transition-colors
            text-sm sm:text-base
            ${currentTab === tab.id
              ? 'bg-teal-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }
          `}
        >
          <span className="sm:hidden">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
