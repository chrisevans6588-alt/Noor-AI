
import React, { useState } from 'react';
import { TUTORIAL_CONTENT, TutorialStep } from '../services/tutorialData.ts';
import { AppState } from '../types';

interface Props {
  currentTab: AppState;
  onClose: () => void;
}

const FeatureTutorial: React.FC<Props> = ({ currentTab, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps: TutorialStep[] | undefined = TUTORIAL_CONTENT[currentTab];

  if (!steps) return null;

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStepIndex(i => i + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Header Graphic */}
        <div className="bg-emerald-900 h-32 relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 to-transparent"></div>
           <div className="text-6xl animate-bounce shadow-lg">{currentStep.icon}</div>
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
           >
             ✕
           </button>
        </div>

        <div className="p-8 text-center space-y-6">
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">{currentStep.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{currentStep.description}</p>
           </div>

           {/* Progress Dots */}
           <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-200'}`} 
                />
              ))}
           </div>

           <div className="flex gap-3 pt-2">
              {stepIndex > 0 && (
                <button 
                  onClick={() => setStepIndex(i => i - 1)}
                  className="flex-1 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isLast ? 'Got it' : 'Next Tip'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTutorial;
