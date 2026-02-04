import React, { useState } from 'react';
import { Moon, Coffee, Baby } from 'lucide-react';

const SleepTreaty = () => {
  // We'll add state in the next steps
  
  // Helper: Convert hour (0-12) to time label
  const getTimeLabel = (hour) => {
    const actualHour = (20 + hour) % 24; // Start at 8 PM (20:00)
    const period = actualHour >= 12 ? 'AM' : 'PM';
    const displayHour = actualHour === 0 ? 12 : actualHour > 12 ? actualHour - 12 : actualHour;
    return `${displayHour} ${period}`;
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
          
          {/* Sidebar - We'll build this in Step 2 */}
          <div className="w-80 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-300">Settings</h2>
            <p className="text-gray-500 text-sm">Controls coming in Step 2...</p>
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

                {/* Baby Row (Feeds) */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <Baby className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-medium text-gray-300 w-16">Baby</span>
                  </div>
                  <div className="relative h-12 bg-gray-700 rounded">
                    {/* Hour Grid Lines */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-600"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}
                    {/* Feed markers will go here in Step 2 */}
                  </div>
                </div>

                {/* Mom Row */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <Coffee className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300 w-16">Mom</span>
                  </div>
                  <div className="relative h-16 bg-gray-700 rounded">
                    {/* Hour Grid Lines */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-600"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}
                    {/* Sleep/Duty blocks will go here in Step 3 */}
                  </div>
                </div>

                {/* Dad Row */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <Coffee className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300 w-16">Dad</span>
                  </div>
                  <div className="relative h-16 bg-gray-700 rounded">
                    {/* Hour Grid Lines */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-600"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}
                    {/* Sleep/Duty blocks will go here in Step 3 */}
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