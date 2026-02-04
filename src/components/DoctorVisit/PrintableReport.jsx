import React from 'react';
import { formatHours } from '../../utils/doctorSummaryHelpers';

const PrintableReport = ({ summary, concerns }) => {
  if (!summary) return null;

  const { baby, period, sleep, feeds, diapers, notes, medical } = summary;

  return (
    <div className="print-report hidden print:block bg-white text-black p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">Baby Health Summary Report</h1>
        <p className="text-gray-600 mt-1">
          Generated on {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Baby Info */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Patient Information</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Name:</strong> {baby.name}</div>
          <div><strong>Date of Birth:</strong> {new Date(baby.birthDate).toLocaleDateString()}</div>
          <div><strong>Age:</strong> {baby.age.weeks} weeks, {baby.age.days} days</div>
          <div><strong>Sex:</strong> {baby.sex === 'girl' ? 'Female' : 'Male'}</div>
          {baby.currentWeight && (
            <div><strong>Current Weight:</strong> {baby.currentWeight} {baby.weightUnit}</div>
          )}
          {baby.percentile && (
            <div><strong>Weight Percentile:</strong> {Math.round(baby.percentile)}th</div>
          )}
          <div><strong>Feeding Type:</strong> {
            baby.feedingType === 'breast' ? 'Breastfeeding' :
            baby.feedingType === 'bottle' ? 'Bottle/Formula' : 'Mixed'
          }</div>
        </div>
      </section>

      {/* Report Period */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Report Period</h2>
        <p className="text-sm">
          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
          ({period.days} days)
        </p>
      </section>

      {/* Sleep Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Sleep Summary</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Average per day:</strong> {formatHours(sleep.avgHoursPerDay)}</div>
          <div><strong>Total sessions:</strong> {sleep.totalSessions}</div>
          <div><strong>Avg session duration:</strong> {formatHours(sleep.avgDurationPerSession)}</div>
          <div><strong>Longest stretch:</strong> {formatHours(sleep.longestStretch)}</div>
        </div>
      </section>

      {/* Feeding Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Feeding Summary</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Average feeds per day:</strong> {feeds.avgFeedsPerDay.toFixed(1)}</div>
          <div><strong>Total feeds:</strong> {feeds.totalFeeds}</div>
          {feeds.avgAmount > 0 && (
            <div><strong>Average amount:</strong> {feeds.avgAmount.toFixed(1)} oz</div>
          )}
          {feeds.avgInterval > 0 && (
            <div><strong>Average interval:</strong> {formatHours(feeds.avgInterval)}</div>
          )}
        </div>
      </section>

      {/* Diaper Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Diaper Summary</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Average per day:</strong> {diapers.avgPerDay.toFixed(1)}</div>
          <div><strong>Total changes:</strong> {diapers.total}</div>
          <div><strong>Wet:</strong> {diapers.wet}</div>
          <div><strong>Dirty:</strong> {diapers.dirty}</div>
        </div>
      </section>

      {/* Medical Info */}
      {(medical.pediatrician || medical.allergies || medical.medications) && (
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Medical Information</h2>
          <div className="text-sm space-y-1">
            {medical.pediatrician && (
              <div><strong>Pediatrician:</strong> {medical.pediatrician}</div>
            )}
            {medical.allergies && (
              <div><strong>Allergies:</strong> {medical.allergies}</div>
            )}
            {medical.medications && (
              <div><strong>Medications:</strong> {medical.medications}</div>
            )}
          </div>
        </section>
      )}

      {/* Recent Notes */}
      {notes.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Recent Notes</h2>
          <ul className="text-sm space-y-1">
            {notes.map((note, i) => (
              <li key={i}>
                <strong>{new Date(note.date).toLocaleDateString()}:</strong> {note.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Concerns */}
      {concerns && (
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Parent Concerns</h2>
          <p className="text-sm whitespace-pre-wrap">{concerns}</p>
        </section>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
        <p>Generated by BabyRhythm - babyrhythm.vercel.app</p>
        <p>This report is for informational purposes only and is not a substitute for professional medical advice.</p>
      </div>
    </div>
  );
};

export default PrintableReport;
