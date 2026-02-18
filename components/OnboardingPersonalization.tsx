
import React, { useState, useEffect, useRef } from 'react';
import { fetchRandomAyah, Ayah } from '../services/quranApiService';
import { getAyahAudioUrl } from '../services/audioQuranService';

interface OnboardingPersonalizationProps {
  onComplete: (data: { name: string; mood: string; challenge: string }) => void;
}

const WALLPAPERS = [
  "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=2000&auto=format&fit=crop", // Blue Mosque Detail
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=2000&auto=format&fit=crop", // Geometric Ceiling
  "https://images.unsplash.com/photo-1555967675-9c9dc756df69?q=80&w=2000&auto=format&fit=crop", // Warm Mosque Interior
  "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2000&auto=format&fit=crop"  // Sheikh Zayed Arch
];

const OnboardingPersonalization: React.FC<OnboardingPersonalizationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [mood, setMood] = useState('');
  const [challenge, setChallenge] = useState('');
  const [randomAyah, setRandomAyah] = useState<Ayah | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bgImage, setBgImage] = useState(WALLPAPERS[0]);

  useEffect(() => {
    // Preload image
    const img = new Image();
    img.src = WALLPAPERS[0];
    
    setBgImage(WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)]);
    fetchRandomAyah().then(data => {
      setRandomAyah(data);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startJourney = () => {
    if (randomAyah && !audioRef.current) {
      audioRef.current = new Audio(getAyahAudioUrl('ar.alafasy', randomAyah.number));
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log("Audio requires interaction"));
      setIsAudioPlaying(true);
    }
    setStep(1);
  };

  const handleFinish = () => {
    onComplete({ name, mood, challenge });
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-black text-white">
      {/* Cinematic Background with Smart Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-in-out scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Gradient: Dark at bottom for text readability, clear in middle for image, dark at top for focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90"></div>
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* Top Branding - Always visible but subtle */}
      <div className="relative z-10 w-full pt-8 flex justify-center">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-3xl font-arabic pb-2 shadow-2xl">
          ن
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-lg flex flex-col justify-center min-h-[60%]">
        {step === 0 && (
          <div className="space-y-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none drop-shadow-2xl">
                Divine<br/><span className="text-amber-400">Vault</span>
              </h1>
              <div className="w-20 h-1 bg-amber-400/50 mx-auto rounded-full"></div>
              <p className="text-lg md:text-xl font-medium text-white/80 leading-relaxed max-w-xs mx-auto drop-shadow-md">
                Your intelligent companion for the spiritual journey.
              </p>
            </div>
            <div className="pt-8">
              <button 
                onClick={startJourney}
                className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] text-xs md:text-sm"
              >
                Enter Sanctuary
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="space-y-2 text-center">
              <p className="text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px]">Identity</p>
              <h2 className="text-4xl font-bold leading-tight">What shall we call you?</h2>
            </div>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
              placeholder="Your Name"
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] px-8 py-6 text-2xl text-white placeholder:text-white/30 outline-none focus:border-amber-400/50 focus:bg-white/20 transition-all font-medium text-center shadow-2xl"
            />
            <button 
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              className="w-full bg-amber-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-50 disabled:scale-100 active:scale-95 hover:scale-[1.02] transition-all shadow-xl"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="space-y-2 text-center">
              <p className="text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px]">Current State</p>
              <h2 className="text-3xl font-bold leading-tight">How is your heart feeling today, {name}?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Peaceful', 'Heavy', 'Anxious', 'Grateful', 'Lost', 'Hopeful'].map(m => (
                <button 
                  key={m}
                  onClick={() => { setMood(m); setStep(3); }}
                  className={`p-6 rounded-3xl border backdrop-blur-xl transition-all text-center ${mood === m ? 'bg-amber-500 border-amber-500 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30'}`}
                >
                  <span className="font-bold text-sm md:text-base">{m}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="w-full py-4 text-white/40 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="space-y-2 text-center">
              <p className="text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px]">Intention</p>
              <h2 className="text-3xl font-bold leading-tight">What is your primary focus?</h2>
            </div>
            <div className="space-y-3">
               {[
                 'Consistency in Prayer',
                 'Learning the Quran',
                 'Finding Peace & Purpose',
                 'Improving Character',
                 'General Knowledge'
               ].map((c) => (
                 <button 
                   key={c}
                   onClick={() => { setChallenge(c); }}
                   className={`w-full p-6 rounded-3xl border text-left transition-all backdrop-blur-xl ${challenge === c ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 border-white/10 text-white hover:border-white/30'}`}
                 >
                   <span className="font-bold">{c}</span>
                 </button>
               ))}
            </div>
            <button 
              onClick={handleFinish}
              disabled={!challenge}
              className="w-full bg-amber-500 text-black py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              Begin Journey
            </button>
          </div>
        )}
      </div>

      {/* Audio Indicator Bottom */}
      <div className="relative z-10 w-full h-20 flex items-center justify-center">
        {isAudioPlaying && (
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex gap-1 h-4 items-end">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Quran Recitation Active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPersonalization;
