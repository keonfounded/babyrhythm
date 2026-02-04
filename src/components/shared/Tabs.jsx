import React from 'react';
import { useTranslation } from 'react-i18next';

const Tabs = ({ currentTab, setCurrentTab }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'schedule', labelKey: 'tabs.schedule', icon: '📅', mobileLabelKey: 'tabs.home' },
    { id: 'history', labelKey: 'tabs.history', icon: '📊', mobileLabelKey: 'tabs.history' },
    { id: 'milestones', labelKey: 'tabs.milestones', icon: '🏆', mobileLabelKey: 'tabs.goals' },
    { id: 'doctor', labelKey: 'tabs.doctor', icon: '🩺', mobileLabelKey: 'tabs.doctor' },
    { id: 'profile', labelKey: 'tabs.profile', icon: '👶', mobileLabelKey: 'tabs.profile' }
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
          <span className="hidden sm:inline">{tab.icon} {t(tab.labelKey)}</span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
