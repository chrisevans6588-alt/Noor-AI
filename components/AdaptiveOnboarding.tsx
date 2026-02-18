
import React, { useState, useEffect, useRef } from 'react';
import { UserPersona } from '../types';
import { fetchPrayerTimes } from '../services/islamicApiService';

interface AdaptiveOnboardingProps {
  onComplete: (persona: UserPersona) => void;
}

type Phase = 'void' | 'atmosphere' | 'reflection' | 'gate' | 'covenant' | 'reveal';
type AudioMode = 'quran' | 'nasheed' | 'silent';
type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

const REFLECTION_SCENARIOS = [
  {
    id: 'r1',
    text: "When your heart is heavy, where does it seek rest?",
    options: [
      { id: 'prayer', label: "In Prostration (Sujood)", traits: { emotional: 20, reflection: 10 } },
      { id: 'silence', label: "In Deep Silence", traits: { reflection: 30, knowledge: 0 } },
      { id: 'knowledge', label: "In Sacred Words", traits: { knowledge: 30, reflection: 10 } },
      { id: 'action', label: "In Serving Others", traits: { intensity: 20, reflection: 0 } }
    ]
  },
  {
    id: 'r2',
    text: "The path to Allah is long. How do you travel?",
    options: [
      { id: 'steady', label: "Slow and Steady", traits: { patience: 'patient', intensity: -10 } },
      { id: 'eager', label: "Running with Yearning", traits: { patience: 'rushed', intensity: 20 } },
      { id: 'balanced', label: "Step by Step", traits: { patience: 'balanced', intensity: 0 } }
    ]
  },
  {
    id: 'r3',
    text: "What do you seek most from Noor?",
    options: [
      { id: 'peace', label: "Peace (Sakinah)", traits: { emotional: 10, intensity: -10 } },
      { id: 'discipline', label: "Discipline (Adab)", traits: { knowledge: 10, intensity: 10 } },
      { id: 'knowledge', label: "Knowledge (Ilm)", traits: { knowledge: 30, reflection: 10 } }
    ]
  }
];

const BACKGROUNDS: Record<TimePhase, string> = {
  dawn: 'bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617]', // Cool dawn slate
  day: 'bg-[#051F1A]', // Standard Emerald
  dusk: 'bg-gradient-to-b from-[#311726] via-[#1a0f18] to-[#050305]', // Deep warm dusk
  night: 'bg-[#020617]' // Deep midnight
};

const ACCENTS: Record<TimePhase, string> = {
  dawn: 'text-sky-300',
  day: 'text-[#C6A85E]',
  dusk: 'text-rose-300',
  night: 'text-indigo-300'
};

const AdaptiveOnboarding: React.FC<AdaptiveOnboardingProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('void');
  const [audioMode, setAudioMode] = useState<AudioMode>('silent');
  const [reflectionIndex, setReflectionIndex] = useState(0);
  const [gateProgress, setGateProgress] = useState(0);
  const [isHoldingGate, setIsHoldingGate] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const [timePhase, setTimePhase] = useState<TimePhase>('day');
  const [prayerContext, setPrayerContext] = useState<string>('');

  const [persona, setPersona] = useState<UserPersona>({
    archetype: 'The Seeker',
    intensityScore: 50,
    depthScore: 50,
    visualPreference: 'minimal',
    reflectionDepth: 50,
    knowledgeInclination: 50,
    emotionalSensitivity: 50,
    patienceTempo: 'balanced',
    audioPreference: 'silent',
    onboardingPath: []
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gateInterval = useRef<any>(null);
  const interactionStartTime = useRef<number>(0);

  // Time & Prayer Detection Logic
  useEffect(() => {
    const detectTime = async () => {
      try {
        let calculatedPhase: TimePhase = 'night';
        let contextText = "The Night Watch";

        const coords = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null);

        const lat = coords?.coords.latitude || 21.4225; // Makkah default
        const lng = coords?.coords.longitude || 39.8262;

        const data = await fetchPrayerTimes(lat, lng);
        
        if (data) {
          const now = new Date();
          const currentMins = now.getHours() * 60 + now.getMinutes();
          
          const parseTime = (t: string) => {
            const [h, m] = t.split(':')[0].split(' ')[0].split(':').map(Number);
            return h * 60 + m;
          };

          const fajr = parseTime(data.timings.Fajr);
          const sunrise = parseTime(data.timings.Sunrise);
          const maghrib = parseTime(data.timings.Maghrib);
          const isha = parseTime(data.timings.Isha);

          if (currentMins >= fajr && currentMins < sunrise) {
            calculatedPhase = 'dawn';
            contextText = "The Time of Fajr";
          } else if (currentMins >= sunrise && currentMins < maghrib) {
            calculatedPhase = 'day';
            contextText = "The Light of Day";
          } else if (currentMins >= maghrib && currentMins < isha) {
            calculatedPhase = 'dusk';
            contextText = "The Time of Maghrib";
          } else {
            calculatedPhase = 'night';
            contextText = "The Stillness of Night";
          }
        }
        
        setTimePhase(calculatedPhase);
        setPrayerContext(contextText);
      } catch (e) {
        console.log("Time detection fallback");
      }
    };

    detectTime();
  }, []);

  // Audio Engine Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    
    const fadeOut = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume -= 0.05;
      } else {
        clearInterval(fadeOut);
        audio.pause();
        
        if (audioMode === 'quran') {
          audio.src = 'https://download.quranicaudio.com/quran/mishari_rashid_al_afasy/001.mp3'; 
        } else if (audioMode === 'nasheed') {
          audio.src = 'https://media.blubrry.com/muslim_central_audio/podcasts.muslimcentral.com/mishary-rashid-alafasy/mishary-rashid-alafasy-mustafa.mp3'; 
        } else {
          return;
        }

        // Try to play; silence any errors as play might be blocked if user interaction wasn't registered yet
        audio.load();
        audio.play().catch(() => {});
        
        let vol = 0;
        audio.volume = 0;
        const fadeIn = setInterval(() => {
          if (vol < 0.3) {
            vol += 0.02;
            audio.volume = vol;
          } else {
            clearInterval(fadeIn);
          }
        }, 200);
      }
    }, 100);

    return () => {
      clearInterval(fadeOut);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [audioMode]);

  const handleEnter = () => setPhase('atmosphere');

  const selectAtmosphere = (mode: AudioMode) => {
    // Attempt to unlock audio context on user gesture
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setAudioMode(mode);
    setPersona(p => ({ ...p, audioPreference: mode }));
    setTimeout(() => setPhase('reflection'), 800);
  };

  const handleReflection = (option: any) => {
    const timeSpent = Date.now() - interactionStartTime.current;
    let speedBonus = timeSpent < 2000 ? 10 : -10;

    setPersona(prev => ({
      ...prev,
      reflectionDepth: Math.min(100, prev.reflectionDepth + (option.traits.reflection || 0)),
      knowledgeInclination: Math.min(100, prev.knowledgeInclination + (option.traits.knowledge || 0)),
      emotionalSensitivity: Math.min(100, prev.emotionalSensitivity + (option.traits.emotional || 0)),
      intensityScore: Math.min(100, Math.max(0, prev.intensityScore + (option.traits.intensity || 0) + speedBonus)),
      patienceTempo: option.traits.patience || prev.patienceTempo,
      onboardingPath: [...prev.onboardingPath, option.id]
    }));

    if (reflectionIndex < REFLECTION_SCENARIOS.length - 1) {
      setReflectionIndex(i => i + 1);
      interactionStartTime.current = Date.now();
    } else {
      setPhase('gate');
    }
  };

  useEffect(() => {
    if (phase === 'reflection') interactionStartTime.current = Date.now();
  }, [phase, reflectionIndex]);

  const startGate = () => {
    setIsHoldingGate(true);
    gateInterval.current = setInterval(() => {
      setGateProgress(prev => {
        if (prev >= 100) {
          clearInterval(gateInterval.current);
          setPhase('covenant');
          return 100;
        }
        return prev + 1.5;
      });
    }, 30);
  };

  const stopGate = () => {
    setIsHoldingGate(false);
    clearInterval(gateInterval.current);
    if (gateProgress < 100) {
      setGateProgress(p => Math.max(0, p - 5)); 
    }
  };

  const handleCommit = async () => {
    setIsAuthLoading(true);
    // Simulate connection delay
    setTimeout(() => {
      const finalPersona = { ...persona, archetype: getArchetype() };
      localStorage.setItem('noor_user_persona', JSON.stringify(finalPersona));
      localStorage.setItem('noor_adaptive_onboarded', 'true');
      setIsAuthLoading(false);
      setPhase('reveal');
    }, 1500);
  };

  const getArchetype = () => {
    const { reflectionDepth, knowledgeInclination, emotionalSensitivity } = persona;
    if (reflectionDepth > 70) return "The Contemplative Soul";
    if (knowledgeInclination > 70) return "The Seeker of Truth";
    if (emotionalSensitivity > 70) return "The Soft Heart";
    return "The Balanced Believer";
  };

  const bgClass = BACKGROUNDS[timePhase];
  const accentClass = ACCENTS[timePhase];

  if (phase === 'void') return (
    <div onClick={handleEnter} className={`fixed inset-0 z-[300] ${bgClass} text-white flex flex-col items-center justify-center cursor-pointer overflow-hidden animate-in fade-in duration-1000 transition-colors`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFFFFF11_0%,_transparent_60%)] animate-pulse"></div>
      <div className="text-center space-y-6 relative z-10">
        <span className={`font-arabic text-6xl md:text-8xl opacity-90 drop-shadow-2xl ${accentClass}`}>بسم الله</span>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.6em] text-white/40 font-black animate-pulse">Tap to Begin Journey</p>
          {prayerContext && <p className={`text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 ${accentClass}`}>{prayerContext}</p>}
        </div>
      </div>
    </div>
  );

  if (phase === 'atmosphere') return (
    <div className={`fixed inset-0 z-[300] ${bgClass} text-white flex flex-col items-center justify-center p-8 transition-colors duration-1000`}>
      <div className="max-w-md w-full text-center space-y-12 animate-in slide-in-from-bottom-10 duration-1000">
        <h2 className={`text-2xl font-serif italic ${accentClass}`}>Choose your atmosphere</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'quran', label: 'Sacred Recitation', icon: '📖' },
            { id: 'nasheed', label: 'Vocals Only', icon: '🎙️' },
            { id: 'silent', label: 'Silent Contemplation', icon: '🤫' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => selectAtmosphere(mode.id as AudioMode)}
              className="group relative p-6 border border-white/10 rounded-[2rem] hover:bg-white/5 active:scale-95 transition-all flex items-center justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <span className="text-sm font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">{mode.label}</span>
              <span className="text-2xl">{mode.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (phase === 'reflection') {
    const scenario = REFLECTION_SCENARIOS[reflectionIndex];
    return (
      <div className={`fixed inset-0 z-[300] ${bgClass} text-white flex flex-col justify-center px-8 transition-colors duration-1000`}>
        <div className="max-w-lg mx-auto w-full space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 key={reflectionIndex}">
          <div className="space-y-4 text-center">
             <div className="w-12 h-1 bg-white/20 mx-auto rounded-full">
                <div className={`h-full ${timePhase === 'day' ? 'bg-[#C6A85E]' : 'bg-white'} transition-all duration-500 rounded-full`} style={{ width: `${((reflectionIndex + 1) / REFLECTION_SCENARIOS.length) * 100}%` }}></div>
             </div>
             <h2 className="text-3xl md:text-4xl font-serif leading-relaxed text-white/90">
               {scenario.text}
             </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {scenario.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleReflection(opt)}
                className={`w-full p-6 bg-white/5 border border-white/5 hover:bg-white/10 rounded-[1.5rem] transition-all text-center group active:scale-95 ${timePhase === 'day' ? 'hover:border-[#C6A85E]/50' : 'hover:border-white/30'}`}
              >
                <span className="text-sm font-bold tracking-wide text-white/60 group-hover:text-white transition-colors">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'gate') return (
    <div className={`fixed inset-0 z-[300] ${bgClass} text-white flex flex-col items-center justify-center select-none touch-none transition-colors`}>
      <div className="text-center space-y-6 mb-12 animate-in fade-in duration-1000">
        <h3 className={`font-serif text-2xl ${accentClass}`}>The Covenant</h3>
        <p className="text-white/50 text-sm max-w-xs mx-auto">Hold the light to purify your intention before entering.</p>
      </div>

      <button
        onMouseDown={startGate}
        onMouseUp={stopGate}
        onTouchStart={startGate}
        onTouchEnd={stopGate}
        className="relative w-72 h-72 flex items-center justify-center outline-none"
      >
        <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" viewBox="0 0 100 100">
           <path d="M50,10 A40,40 0 1,0 50,90 A30,30 0 1,1 50,10" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="2" />
        </svg>
        <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" viewBox="0 0 100 100">
           <path 
             d="M50,10 A40,40 0 1,0 50,90 A30,30 0 1,1 50,10" 
             fill="none" 
             stroke={timePhase === 'day' ? '#C6A85E' : '#FFFFFF'} 
             strokeWidth="3" 
             strokeDasharray="250"
             strokeDashoffset={250 - (gateProgress * 2.5)}
             strokeLinecap="round"
             className="transition-all duration-75 ease-linear"
           />
        </svg>
        <div 
          className={`w-32 h-32 rounded-full ${timePhase === 'day' ? 'bg-[#C6A85E]' : 'bg-white'} transition-all duration-300 blur-[40px] opacity-20 ${isHoldingGate ? 'scale-125 opacity-40' : 'animate-pulse'}`}
        ></div>
        <div className={`relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/60 transition-opacity ${isHoldingGate ? 'opacity-100' : 'opacity-50'}`}>
           {isHoldingGate ? 'Intention' : 'Hold'}
        </div>
      </button>
    </div>
  );

  if (phase === 'covenant') return (
    <div className={`fixed inset-0 z-[300] ${bgClass} text-white flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-700 transition-colors`}>
      <div className="max-w-md w-full space-y-10 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="text-center space-y-4">
           <div className={`w-16 h-16 ${timePhase === 'day' ? 'bg-[#C6A85E] text-[#051F1A]' : 'bg-white text-slate-900'} rounded-full flex items-center justify-center text-3xl font-arabic mx-auto shadow-2xl`}>ن</div>
           <div className="space-y-1">
             <h2 className="text-3xl font-serif text-white">Your Sanctuary</h2>
             <p className="text-white/40 text-xs uppercase tracking-widest">Enter with Peace and Sincerity</p>
           </div>
        </div>

        <div className="space-y-6 text-center">
           <p className="text-white/70 text-sm leading-relaxed font-medium italic">
             "I intend to use Noor to purify my heart, increase my knowledge, and draw closer to my Creator."
           </p>
           
           <button 
             onClick={handleCommit}
             disabled={isAuthLoading}
             className={`w-full ${timePhase === 'day' ? 'bg-[#C6A85E] text-[#051F1A]' : 'bg-white text-slate-900'} py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-3`}
           >
             {isAuthLoading ? (
               <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
             ) : (
               'Enter Noor'
             )}
           </button>
        </div>
      </div>
    </div>
  );

  if (phase === 'reveal') return (
    <div className={`fixed inset-0 z-[300] ${bgClass} text-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000 transition-colors`}>
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <p className={`${accentClass} text-xs font-black uppercase tracking-[0.6em] animate-pulse`}>Soul Signature</p>
          <h1 className="text-5xl md:text-6xl font-serif text-white">{getArchetype()}</h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-xs mx-auto">
            Your heart has been mapped. The sanctuary is prepared for your specific spiritual frequency.
          </p>
        </div>

        <button 
          onClick={() => onComplete({ ...persona, archetype: getArchetype() })}
          className="bg-white/10 border border-white/10 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
        >
          Begin
        </button>
      </div>
    </div>
  );

  return null;
};

export default AdaptiveOnboarding;
