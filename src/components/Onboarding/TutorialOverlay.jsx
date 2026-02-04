import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Calendar, BarChart3, Trophy, Stethoscope, User, Moon, Utensils, Baby } from 'lucide-react';

const tutorialSteps = [
  {
    title: 'Welcome to BabyRhythm!',
    description: 'Let\'s take a quick tour of how to track your baby\'s daily rhythm. This will only take a minute.',
    icon: Baby,
    highlight: null
  },
  {
    title: 'Schedule Tab',
    description: 'This is your home base. Log sleep, feeds, and diapers with one tap. See your baby\'s daily timeline and get predictions for the next nap or feed.',
    icon: Calendar,
    highlight: 'schedule'
  },
  {
    title: 'Quick Logging',
    description: 'Use the toolbar at the top to quickly log events. Tap "Start Sleep" when baby falls asleep, then "End Sleep" when they wake up. Feeds and diapers are logged instantly.',
    icon: Moon,
    highlight: 'quicklog'
  },
  {
    title: 'History & Analytics',
    description: 'View trends over time with beautiful charts. See sleep patterns, feeding schedules, and diaper changes. Export data to CSV anytime.',
    icon: BarChart3,
    highlight: 'history'
  },
  {
    title: 'Sleep Insights',
    description: 'Get personalized recommendations based on your baby\'s age. See sleep scores, ideal wake windows, and suggested bedtimes.',
    icon: Moon,
    highlight: 'insights'
  },
  {
    title: 'Milestones',
    description: 'Track developmental milestones like first smile, first steps, and first words. Check them off as your baby grows!',
    icon: Trophy,
    highlight: 'milestones'
  },
  {
    title: 'Doctor Visits',
    description: 'Generate printable reports for pediatrician visits. All your baby\'s data summarized in one place.',
    icon: Stethoscope,
    highlight: 'doctor'
  },
  {
    title: 'Profile & Settings',
    description: 'Manage baby info, track weight history, backup to Google Drive, and share data with caregivers via QR code.',
    icon: User,
    highlight: 'profile'
  },
  {
    title: 'You\'re Ready!',
    description: 'Start logging your first event. The more you track, the better insights you\'ll get. Happy parenting!',
    icon: Baby,
    highlight: null
  }
];

const TutorialOverlay = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-center relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-bold text-white">{step.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-center leading-relaxed">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {tutorialSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-teal-500 w-6'
                    : idx < currentStep
                    ? 'bg-teal-500/50'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              isFirstStep
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
