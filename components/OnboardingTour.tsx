
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';

interface OnboardingStep {
  title: string;
  description: string;
  targetTab: AppState;
  icon: string;
}

const TOUR_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to Noor",
    description: "Your advanced Islamic AI companion. We've designed Noor to support your spiritual growth with authentic knowledge and modern tools.",
    targetTab: AppState.Dashboard,
    icon: "✨"
  },
  {
    title: "Your Spiritual Dashboard",
    description: "Stay mindful with live prayer times, daily Quranic wisdom, and tracking for your personal spiritual goals.",
    targetTab: AppState.Dashboard,
    icon: "🏠"
  },
  {
    title: "Ask Noor Anything",
    description: "Connect with our AI guide for compassionate, research-backed answers on Islamic practice, character, and daily life challenges.",
    targetTab: AppState.Chat,
    icon: "💬"
  },
  {
    title: "Daily Check-in",
    description: "Take a moment for self-reflection. Track your prayers and mood to receive personalized spiritual guidance and challenges.",
    targetTab: AppState.CheckIn,
    icon: "✅"
  },
  {
    title: "Knowledge Repository",
    description: "Dive deep into the Holy Quran and Sahih Hadith collections with scholarly analysis and modern reflections.",
    targetTab: AppState.Learning,
    icon: "📖"
  },
  {
    title: "Spiritual Toolkit",
    description: "Access essential utilities like a digital Tasbih, Qibla Finder, and ethical decision-making frameworks.",
    targetTab: AppState.Tools,
    icon: "🛠️"
  }
];

interface OnboardingTourProps {
  onTabChange: (tab: AppState) => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onTabChange, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to let the app settle
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onTabChange(TOUR_STEPS[nextStep].targetTab);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible && currentStep === 0) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md" onClick={handleFinish} />

      {/* Tour Card */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-emerald-900 p-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-arabic">ن</span>
          </div>
          <div className="w-20 h-20 bg-emerald-800 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl border border-emerald-700/50">
            {step.icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
          <div className="w-full bg-emerald-800/50 h-1.5 rounded-full mt-4 overflow-hidden max-w-[150px] mx-auto">
            <div 
              className="bg-emerald-400 h-full transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="p-8 pt-10">
          <p className="text-slate-600 text-lg leading-relaxed text-center mb-10">
            {step.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={handleFinish}
              className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Skip Tour
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={handleNext}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2"
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Start My Journey" : "Next Step"}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="px-8 pb-6 flex justify-center gap-1.5">
          {TOUR_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-100'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
