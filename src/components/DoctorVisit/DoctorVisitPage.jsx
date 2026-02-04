import React, { useState, useMemo } from 'react';
import { Printer, FileText, Moon, Baby, Droplet, AlertCircle, Stethoscope, Download } from 'lucide-react';
import { generateDoctorSummary, formatHours } from '../../utils/doctorSummaryHelpers';
import { exportDoctorReportToCSV } from '../../utils/csvExportHelpers';
import PrintableReport from './PrintableReport';

const StatCard = ({ icon: Icon, iconColor, label, value, subValue }) => (
  <div className="bg-gray-700/50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className="text-xl font-bold text-white">{value}</div>
    {subValue && (
      <div className="text-xs text-gray-500 mt-1">{subValue}</div>
    )}
  </div>
);

const DoctorVisitPage = ({ babyProfile, dailySchedules }) => {
  const [weeksBack, setWeeksBack] = useState(2);
  const [concerns, setConcerns] = useState('');

  const summary = useMemo(() => {
    return generateDoctorSummary(babyProfile, dailySchedules, weeksBack);
  }, [babyProfile, dailySchedules, weeksBack]);

  const handlePrint = () => {
    window.print();
  };

  if (!summary) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Stethoscope className="w-8 h-8" />
          Doctor Visit
        </h2>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">No profile data available</p>
        </div>
      </div>
    );
  }

  const { baby, period, sleep, feeds, diapers, notes, medical } = summary;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Screen Content (hidden when printing) */}
      <div className="print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-teal-400" />
            Doctor Visit
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => exportDoctorReportToCSV(summary, concerns, babyProfile?.name || 'Baby')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <label className="block text-sm text-gray-400 mb-2">Report Period</label>
          <div className="flex gap-2">
            {[1, 2, 4].map((weeks) => (
              <button
                key={weeks}
                onClick={() => setWeeksBack(weeks)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  weeksBack === weeks
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {weeks === 1 ? 'Last Week' : `Last ${weeks} Weeks`}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
          </p>
        </div>

        {/* Baby Info Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Patient Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Name</div>
              <div className="text-white font-medium">{baby.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Age</div>
              <div className="text-white font-medium">{baby.age.weeks}w {baby.age.days}d</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Sex</div>
              <div className="text-white font-medium">{baby.sex === 'girl' ? 'Female' : 'Male'}</div>
            </div>
            {baby.currentWeight && (
              <div>
                <div className="text-sm text-gray-400">Weight</div>
                <div className="text-white font-medium">
                  {baby.currentWeight} {baby.weightUnit}
                  {baby.percentile && (
                    <span className="text-teal-400 text-sm ml-1">
                      ({Math.round(baby.percentile)}th %ile)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Sleep */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              Sleep
            </h3>
            <div className="space-y-3">
              <StatCard
                icon={Moon}
                iconColor="text-indigo-400"
                label="Avg per Day"
                value={formatHours(sleep.avgHoursPerDay)}
              />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-700/50 rounded p-2">
                  <div className="text-gray-400">Sessions</div>
                  <div className="text-white font-semibold">{sleep.totalSessions}</div>
                </div>
                <div className="bg-gray-700/50 rounded p-2">
                  <div className="text-gray-400">Longest</div>
                  <div className="text-white font-semibold">{formatHours(sleep.longestStretch)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feeding */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-400" />
              Feeding
            </h3>
            <div className="space-y-3">
              <StatCard
                icon={Baby}
                iconColor="text-pink-400"
                label="Avg per Day"
                value={feeds.avgFeedsPerDay.toFixed(1)}
                subValue={`${feeds.totalFeeds} total feeds`}
              />
              <div className="grid grid-cols-2 gap-2 text-sm">
                {feeds.avgAmount > 0 && (
                  <div className="bg-gray-700/50 rounded p-2">
                    <div className="text-gray-400">Avg Amount</div>
                    <div className="text-white font-semibold">{feeds.avgAmount.toFixed(1)} oz</div>
                  </div>
                )}
                {feeds.avgInterval > 0 && (
                  <div className="bg-gray-700/50 rounded p-2">
                    <div className="text-gray-400">Avg Interval</div>
                    <div className="text-white font-semibold">{formatHours(feeds.avgInterval)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diapers */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-yellow-400" />
              Diapers
            </h3>
            <div className="space-y-3">
              <StatCard
                icon={Droplet}
                iconColor="text-yellow-400"
                label="Avg per Day"
                value={diapers.avgPerDay.toFixed(1)}
                subValue={`${diapers.total} total changes`}
              />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-gray-700/50 rounded p-2 text-center">
                  <div className="text-gray-400">Wet</div>
                  <div className="text-white font-semibold">{diapers.wet}</div>
                </div>
                <div className="bg-gray-700/50 rounded p-2 text-center">
                  <div className="text-gray-400">Dirty</div>
                  <div className="text-white font-semibold">{diapers.dirty}</div>
                </div>
                <div className="bg-gray-700/50 rounded p-2 text-center">
                  <div className="text-gray-400">Both</div>
                  <div className="text-white font-semibold">{diapers.both}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        {notes.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Notes</h3>
            <ul className="space-y-2">
              {notes.map((note, i) => (
                <li key={i} className="text-sm bg-gray-700/50 rounded p-3">
                  <span className="text-gray-400">
                    {new Date(note.date).toLocaleDateString()}:
                  </span>
                  <span className="text-white ml-2">{note.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns Input */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Concerns for Doctor
          </h3>
          <textarea
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            placeholder="Write any concerns or questions you want to discuss with your pediatrician..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-2">
            This will be included in the printed report
          </p>
        </div>

        {/* Medical Info */}
        {(medical.pediatrician || medical.allergies || medical.medications) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Medical Information</h3>
            <div className="space-y-2 text-sm">
              {medical.pediatrician && (
                <div>
                  <span className="text-gray-400">Pediatrician:</span>
                  <span className="text-white ml-2">{medical.pediatrician}</span>
                </div>
              )}
              {medical.allergies && (
                <div>
                  <span className="text-gray-400">Allergies:</span>
                  <span className="text-white ml-2">{medical.allergies}</span>
                </div>
              )}
              {medical.medications && (
                <div>
                  <span className="text-gray-400">Medications:</span>
                  <span className="text-white ml-2">{medical.medications}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Print Button */}
        <div className="text-center">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors text-lg font-semibold"
          >
            <Printer className="w-5 h-5" />
            Print Report for Doctor
          </button>
        </div>
      </div>

      {/* Printable Report (hidden on screen, visible when printing) */}
      <PrintableReport summary={summary} concerns={concerns} />
    </div>
  );
};

export default DoctorVisitPage;
