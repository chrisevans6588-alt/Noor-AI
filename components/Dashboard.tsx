
import React, { useState, useEffect, useMemo } from 'react';
import { fetchPrayerTimes, PrayerData } from '../services/islamicApiService';
import { AppState, AdhanSettings, UserSubscription } from '../types';
import { loadAdhanSettings } from '../services/adhanService';
import { loadSubscription } from '../services/subscriptionService';
import DailyAyah from './DailyAyah';
import SunnahDashboardWidget from './SunnahDashboardWidget';
import { auth } from '../services/firebaseClient';

const PrayerHalo: React.FC<{ progress: number; nextName: string; nextTime: string; remaining: string; onConfig: () => void }> = ({ progress, nextName, nextTime, remaining, onConfig }) => {
  const size = 180; 
  const stroke = 3;
  const radius = (size / 2) - (stroke * 4);
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center transform scale-95 md:scale-100">
      <div className="absolute inset-0 bg-gold-primary/10 blur-[60px] rounded-full scale-110 animate-pulse-slow"></div>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle
          stroke="#D4AF37"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset: offset, filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      <button onClick={onConfig} className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10 active:scale-95 transition-transform group">
        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1 group-hover:text-white transition-colors">{nextName}</span>
        <span className="text-4xl font-black text-white tracking-tighter drop-shadow-md">{nextTime}</span>
        <div className="mt-3 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
           <span className="text-[10px] font-bold text-gold-primary tabular-nums tracking-wider">{remaining}</span>
        </div>
      </button>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; desc: string; icon: any; badge?: string; isAI?: boolean; isPremium?: boolean; onClick: () => void }> = ({ title, desc, icon, badge, isAI, isPremium, onClick }) => (
  <button
    onClick={onClick}
    className={`glass-card p-5 rounded-[2rem] flex flex-col items-start text-left h-full group relative overflow-hidden active:scale-[0.98] bg-zinc-900/50 hover:bg-zinc-800/80`}
  >
    {isPremium && (
      <div className="absolute top-4 right-4">
        <span className="text-[8px] font-black bg-gold-primary text-black px-1.5 py-0.5 rounded tracking-tighter shadow-sm border border-gold-primary/20">PRO</span>
      </div>
    )}
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-white/5 ${isAI ? 'bg-indigo-500/10 text-indigo-300' : 'bg-white/5 text-zinc-300'}`}>
      {icon}
    </div>
    <div className="space-y-1 flex-1 w-full relative z-10">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-sm md:text-base text-white leading-tight group-hover:text-gold-primary transition-colors">{title}</h4>
        {badge && <span className="px-1.5 py-0.5 bg-gold-primary/10 text-gold-primary text-[7px] font-black uppercase rounded-full">{badge}</span>}
      </div>
      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed line-clamp-2">{desc}</p>
    </div>
    
    {/* Hover glow */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
  </button>
);

const Dashboard: React.FC<{ onNavigate: (tab: AppState, toolId?: any) => void }> = ({ onNavigate }) => {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; time: string; remaining: string; progress: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [adhanSettings, setAdhanSettings] = useState<AdhanSettings | null>(null);
  const [userName, setUserName] = useState('');
  const [userStreak, setUserStreak] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('noor_user_personalization');
    if (data) setUserName(JSON.parse(data).name || '');
    const j = localStorage.getItem('noor_deen_journey');
    if (j) setUserStreak(JSON.parse(j).streak || 0);

    const loadCore = async () => {
      const user = auth.currentUser;
      if (user) {
        const settings = await loadAdhanSettings(user.uid);
        setAdhanSettings(settings);
        const currentSub = await loadSubscription(user.uid);
        setSub(currentSub);

        navigator.geolocation.getCurrentPosition(async (pos) => {
          const d = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude, settings.method);
          if (d) setPrayerData(d);
        }, () => fetchPrayerTimes(21.4225, 39.8262, settings.method).then(d => d && setPrayerData(d)));
      }
    };
    loadCore();

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!prayerData) return;
    const update = () => {
      const now = new Date();
      const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const getP = (s: string) => { const [h, m] = prayerData.timings[s].split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d; };
      let ni = 0; for (let i = 0; i < order.length; i++) { if (now < getP(order[i])) { ni = i; break; } if (i === 5) ni = 0; }
      const nn = order[ni]; let nt = getP(nn); if (ni === 0 && now > getP('Isha')) nt.setDate(nt.getDate() + 1);
      const prev = (ni - 1 + order.length) % order.length; const pt = getP(order[prev]);
      const total = nt.getTime() - pt.getTime(); const el = now.getTime() - pt.getTime(); const prog = Math.min(100, (el / total) * 100);
      const d = nt.getTime() - now.getTime(); const h = Math.floor(d/36e5), m = Math.floor((d%36e5)/6e4), s = Math.floor((d%6e4)/1e3);
      setNextPrayerInfo({ name: nn, time: prayerData.timings[nn], remaining: `${h}h ${m}m ${s}s`, progress: prog });
    };
    update(); const int = setInterval(update, 1000); return () => clearInterval(int);
  }, [prayerData]);

  const greeting = useMemo(() => {
    const h = currentTime.getHours();
    if (h >= 5 && h < 12) return { ar: "صباح النور", en: "Dawn" };
    if (h >= 12 && h < 17) return { ar: "السلام عليكم", en: "Presence" };
    return { ar: "مساء السكينة", en: "Stillness" };
  }, [currentTime]);

  return (
    <div className="space-y-8 md:space-y-12 pb-32 w-full max-w-[1800px] mx-auto">
      {/* Hero Card */}
      <section className="glass-card p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden text-center border border-white/5 bg-zinc-900/40">
        {/* Animated Background Gradient - Neutral */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 to-transparent opacity-60"></div>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-arabic text-[12rem] select-none pointer-events-none text-white">نور</div>
        
        <div className="relative z-10 space-y-8">
           <div className="space-y-2">
              <h2 className="text-4xl md:text-6xl font-arabic text-gold-primary leading-none drop-shadow-sm">{greeting.ar}</h2>
              <div className="flex flex-col items-center gap-1">
                {userName && <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">{userName}</p>}
                {sub?.tier === 'premium' && <span className="text-[8px] bg-gold-primary/20 text-gold-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-gold-primary/30">Premium</span>}
              </div>
           </div>
           
           <div className="flex justify-center py-4">
              <PrayerHalo 
                progress={nextPrayerInfo?.progress || 0} 
                nextName={nextPrayerInfo?.name || '--'} 
                nextTime={nextPrayerInfo?.time || '--:--'} 
                remaining={nextPrayerInfo?.remaining || '0h 0m 0s'} 
                onConfig={() => onNavigate(AppState.AdhanSettings)}
              />
           </div>

           <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button onClick={() => onNavigate(AppState.DeenJourney)} className="bg-gold-primary text-black px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-transform shadow-lg shadow-gold-primary/10 w-full md:w-auto">Open Journey</button>
              <div className="glass-panel px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-white/10">Streak: {userStreak} Days</div>
           </div>
        </div>
      </section>

      {/* Primary Actions */}
      <div className="flex flex-col gap-6">
        <SunnahDashboardWidget onNavigate={onNavigate} />
        <DailyAyah />
      </div>

      {/* Prayer Strip */}
      {prayerData && (
        <section className="space-y-4">
          <div className="flex justify-between items-center px-4">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Sanctuary Timings</h3>
             <button onClick={() => onNavigate(AppState.AdhanSettings)} className="text-[10px] font-bold uppercase text-gold-primary hover:text-white transition-colors">Config</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(name => {
              const isActive = nextPrayerInfo?.name === name;
              return (
                <div key={name} className={`glass-card p-4 rounded-3xl text-center space-y-2 relative transition-all ${isActive ? 'bg-white/10 border-gold-primary/30 shadow-lg' : 'bg-white/5 border-white/5'}`}>
                  <span className={`text-[8px] font-bold uppercase tracking-widest block ${isActive ? 'text-gold-primary' : 'text-zinc-500'}`}>{name}</span>
                  <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{prayerData.timings[name]}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <FeatureCard title="Sunnah" desc="Prophetic guidance." icon="🌿" onClick={() => onNavigate(AppState.Sunnah)} isPremium />
        <FeatureCard title="Art Studio" desc="Sacred Vision AI." icon="🎨" isAI isPremium onClick={() => onNavigate(AppState.ImageGen)} />
        <FeatureCard title="Hifdh" desc="Memory architect." icon="🕋" isAI onClick={() => onNavigate(AppState.Hifdh)} />
        <FeatureCard title="Hadith" desc="Sacred Archives." icon="📜" onClick={() => onNavigate(AppState.Hadith)} />
        <FeatureCard title="Academy" desc="Advanced Sciences" icon="🏛️" isPremium onClick={() => onNavigate(AppState.Academy)} />
        <FeatureCard title="Quran" desc="Academic depth." icon="📖" onClick={() => onNavigate(AppState.Learning)} />
        <FeatureCard title="Dua" desc="Sacred Treasury." icon="🤲" onClick={() => onNavigate(AppState.DuaLibrary)} />
        <FeatureCard title="Ask Noor" desc="AI Inquiries." icon="💭" isAI isPremium onClick={() => onNavigate(AppState.Chat)} />
        <FeatureCard title="Radio" desc="Live streams." icon="📻" onClick={() => onNavigate(AppState.Radio)} />
        <FeatureCard title="Toolkit" desc="Tasbih & Qibla." icon="🧭" onClick={() => onNavigate(AppState.Tools)} isPremium />
      </div>
    </div>
  );
};

export default Dashboard;
