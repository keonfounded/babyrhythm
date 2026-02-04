import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, BarChart3, Trophy, Stethoscope, User } from 'lucide-react';

const Tabs = ({ currentTab, setCurrentTab }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'schedule', labelKey: 'tabs.schedule', icon: Calendar, mobileLabel: 'Home' },
    { id: 'history', labelKey: 'tabs.history', icon: BarChart3, mobileLabel: 'Stats' },
    { id: 'milestones', labelKey: 'tabs.milestones', icon: Trophy, mobileLabel: 'Goals' },
    { id: 'doctor', labelKey: 'tabs.doctor', icon: Stethoscope, mobileLabel: 'Visit' },
    { id: 'profile', labelKey: 'tabs.profile', icon: User, mobileLabel: 'Profile' }
  ];

  return (
    <>
      {/* Desktop tabs - inline at top */}
      <div className="hidden md:flex justify-center gap-2 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                px-6 py-3
                rounded-lg font-semibold
                transition-all duration-200
                flex items-center gap-2
                ${currentTab === tab.id
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Mobile bottom navigation - fixed */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`
                  flex flex-col items-center justify-center
                  flex-1 h-full
                  transition-colors duration-200
                  ${isActive
                    ? 'text-teal-400'
                    : 'text-gray-500 active:text-gray-400'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs mt-1 font-medium">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-20" />
    </>
  );
};

export default Tabs;
