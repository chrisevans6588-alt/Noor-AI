
import React, { useState } from 'react';

interface AppTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to Noor",
    desc: "Your AI-powered spiritual companion. Noor integrates authentic knowledge with modern intelligence to guide your journey.",
    icon: "✨",
    image: null
  },
  {
    title: "The Sanctuary Dashboard",
    desc: "Your central hub. View live prayer times, track daily Sunnah habits, and receive personalized Quranic reflections instantly.",
    icon: "🏠",
    image: null // Could add screenshots here if available
  },
  {
    title: "Ask Noor AI",
    desc: "A compassionate, scholarly-trained AI. Ask about Fiqh, emotional guidance, or history. It remembers context for deep conversations.",
    icon: "💬",
    image: null
  },
  {
    title: "Specialized Modules",
    desc: "Access powerful tools via the Sidebar: Hifdh Tracker, Dream Interpretation, Ethical Scenarios, and the Global Quran Radio.",
    icon: "🛠️",
    image: null
  },
  {
    title: "Premium Access",
    desc: "Unlock the full potential: Scholarly deep-dives, unlimited AI queries, and exclusive content like the Khutbah Studio.",
    icon: "💎",
    image: null
  }
];

const AppTour: React.FC<AppTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-void/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col">
        {/* Background Ambient Light */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--accent-gold-glow)_0%,_transparent_50%)] opacity-10 pointer-events-none"></div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/5">
          <div 
            className="h-full bg-gold-primary transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          ></div>
        </div>

        <div className="p-10 md:p-12 flex flex-col items-center text-center space-y-8 relative z-10">
          <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-5xl shadow-lg animate-bounce">
            {step.icon}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{step.title}</h3>
            <p className="text-zinc-400 font-medium leading-relaxed text-sm md:text-base">
              {step.desc}
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Start Journey" : "Next"}
            </button>
            
            <button 
              onClick={onSkip}
              className="py-3 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
            >
              Skip Tour
            </button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="pb-8 flex justify-center gap-2 relative z-10">
          {TOUR_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-gold-primary scale-125' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppTour;
