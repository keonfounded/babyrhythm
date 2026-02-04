import React, { useState } from 'react';
import { Baby, Calendar, Scale, Heart, ArrowRight, Check, Play, Sparkles } from 'lucide-react';
import { getDateKey } from '../../utils/dateHelpers';
import { generateDemoData } from '../../data/demoData';

const OnboardingWizard = ({ onComplete, onLoadDemo }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    birthDate: getDateKey(new Date()),
    sex: 'boy',
    weightUnit: 'kg',
    feedingType: 'mixed',
    weight: '',
  });

  const steps = [
    { title: 'Welcome', icon: Baby },
    { title: 'Baby Info', icon: Calendar },
    { title: 'Weight', icon: Scale },
    { title: 'Feeding', icon: Heart },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const finalProfile = {
      name: profile.name || 'Baby',
      birthDate: profile.birthDate,
      sex: profile.sex,
      weightUnit: profile.weightUnit,
      feedingType: profile.feedingType,
      weightHistory: profile.weight
        ? [{ date: profile.birthDate, weight: parseFloat(profile.weight), note: 'Birth weight' }]
        : [],
      pediatrician: '',
      allergies: '',
      medications: ''
    };
    onComplete(finalProfile);
  };

  const handleLoadDemo = () => {
    const demoData = generateDemoData();
    onLoadDemo(demoData);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return profile.name.trim() !== '' && profile.birthDate;
      case 2: return true; // Weight is optional
      case 3: return true;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i <= step ? 'bg-teal-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Baby className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">BabyRhythm</h1>
              <p className="text-gray-400 mb-6">
                Track, predict, and sync your baby's sleep and feeding patterns.
              </p>

              {/* Feature list */}
              <div className="space-y-3 text-left text-sm text-gray-300 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span>Predict next nap & feed times</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span>Learn your baby's unique rhythm</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span>Track growth, milestones & more</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span>Works offline, data stays private</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Fresh
                </button>

                <button
                  onClick={handleLoadDemo}
                  className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Try Demo First
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Demo shows sample data for a 1-year-old baby
              </p>
            </div>
          )}

          {/* Step 1: Baby Info */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">About your baby</h2>
              <p className="text-gray-400 mb-6">We'll use this to personalize predictions.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Baby's name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sex
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setProfile({ ...profile, sex: 'boy' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        profile.sex === 'boy'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Boy
                    </button>
                    <button
                      onClick={() => setProfile({ ...profile, sex: 'girl' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        profile.sex === 'girl'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Girl
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`w-full mt-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                  canProceed()
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setStep(0)}
                className="w-full mt-3 py-2 text-gray-400 hover:text-gray-300 text-sm"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 2: Weight */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Birth weight</h2>
              <p className="text-gray-400 mb-6">Optional - helps track growth over time.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight unit
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setProfile({ ...profile, weightUnit: 'kg' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        profile.weightUnit === 'kg'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Kilograms (kg)
                    </button>
                    <button
                      onClick={() => setProfile({ ...profile, weightUnit: 'lbs' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        profile.weightUnit === 'lbs'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Pounds (lbs)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Birth weight ({profile.weightUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    placeholder={profile.weightUnit === 'kg' ? 'e.g., 3.5' : 'e.g., 7.5'}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={handleNext}
                className="w-full mt-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-3 py-2 text-gray-400 hover:text-gray-300 text-sm"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 3: Feeding */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Feeding type</h2>
              <p className="text-gray-400 mb-6">How are you feeding your baby?</p>

              <div className="space-y-3">
                {[
                  { value: 'breast', label: 'Breastfeeding', icon: '🤱' },
                  { value: 'bottle', label: 'Bottle/Formula', icon: '🍼' },
                  { value: 'mixed', label: 'Mixed (both)', icon: '🤱🍼' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setProfile({ ...profile, feedingType: option.value })}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg font-medium transition-colors ${
                      profile.feedingType === option.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span>{option.label}</span>
                    {profile.feedingType === option.value && (
                      <Check className="w-5 h-5 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <button
                onClick={handleComplete}
                className="w-full mt-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Get Started
                <Check className="w-5 h-5" />
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-3 py-2 text-gray-400 hover:text-gray-300 text-sm"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Your data stays on this device
        </p>
      </div>
    </div>
  );
};

export default OnboardingWizard;
