
import React, { useState, useEffect } from 'react';
import { fetchPrayerTimes, PrayerData } from '../services/islamicApiService';

const DHIKR_PHRASES = [
  { ar: 'سُبْحَانَ ٱللَّٰهِ', en: 'SubhanAllah', color: 'text-emerald-500' },
  { ar: 'ٱلْحَمْدُ لِلَّٰهِ', en: 'Alhamdulillah', color: 'text-amber-500' },
  { ar: 'لَا إِلَهَ إِلَّا الله', en: 'La ilaha illallah', color: 'text-indigo-500' },
  { ar: 'ٱللَّٰهُ أَكْبَرُ', en: 'Allahu Akbar', color: 'text-rose-500' }
];

const PresenceMode: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [activeDhikrIdx, setActiveDhikrIdx] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = async () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const data = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
        if (data) {
           const now = new Date();
           const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
           const getP = (s: string) => { 
             const [h, m] = data.timings[s].split(':').map(Number); 
             const d = new Date(); d.setHours(h, m, 0, 0); return d; 
           };
           let ni = 0; for (let i = 0; i < order.length; i++) { if (now < getP(order[i])) { ni = i; break; } if (i === 5) ni = 0; }
           const nn = order[ni]; let nt = getP(nn); if (ni === 0 && now > getP('Isha')) nt.setDate(nt.getDate() + 1);
           const d = nt.getTime() - now.getTime(); 
           const h = Math.floor(d/36e5), m = Math.floor((d%36e5)/6e4), s = Math.floor((d%6e4)/1e3);
           setNextPrayer({ name: nn, time: data.timings[nn], remaining: `${h}h ${m}m ${s}s` });
        }
      });
    };
    update(); const int = setInterval(update, 1000); return () => clearInterval(int);
  }, []);

  const handleDhikr = () => {
    setCount(c => c + 1);
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const phrase = DHIKR_PHRASES[activeDhikrIdx];

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--accent-gold)_0%,_transparent_70%)]"></div>
      
      <button onClick={onExit} className="absolute top-10 right-10 w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="text-center space-y-2 mb-20">
         <span className="text-[10px] font-black uppercase text-[#A68B5B] tracking-[0.6em]">Coming Upon</span>
         <h2 className="text-4xl md:text-6xl font-black tracking-tightest leading-none">{nextPrayer?.name}</h2>
         <p className="text-xl md:text-2xl font-bold tabular-nums text-slate-400">{nextPrayer?.remaining}</p>
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1">
         {/* Breathing Circle */}
         <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-slate-100 animate-ping opacity-20" style={{ animationDuration: '4s' }}></div>
         <div className="absolute w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-slate-50/50 animate-pulse" style={{ animationDuration: '3s' }}></div>
         
         <button 
          onClick={handleDhikr}
          className="relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-full bg-white shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center active:scale-95 transition-all group"
         >
            <span className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter text-slate-900 group-hover:text-[#A68B5B] transition-colors">{count}</span>
            <p className={`text-2xl md:text-3xl font-arabic mt-4 ${phrase.color} drop-shadow-sm`}>{phrase.ar}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mt-6 group-hover:text-slate-400">Touch to Reminisce</p>
         </button>

         <div className="flex gap-3 mt-16 relative z-10">
            {DHIKR_PHRASES.map((p, i) => (
              <button 
                key={p.en} 
                onClick={() => { setActiveDhikrIdx(i); setCount(0); }}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeDhikrIdx === i ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {p.en}
              </button>
            ))}
         </div>
      </div>

      <div className="mt-20 text-center space-y-4">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.8em]">MURAQABAH MODE ACTIVE</p>
         <p className="text-xs text-slate-400 italic max-w-sm font-medium">"Therefore remember Me, I will remember you."</p>
      </div>
    </div>
  );
};

export default PresenceMode;
