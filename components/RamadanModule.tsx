
import React, { useState, useEffect } from 'react';
import { 
  getRamadanStatus, 
  getDailyChallenge, 
  fetchDailyStats, 
  updateDailyStat,
  calculateQiyamSchedule
} from '../services/ramadanService';
import { generateTaraweehInsight } from '../services/geminiService';
import { fetchPrayerTimes } from '../services/islamicApiService';
import { RamadanDayConfig, RamadanDailyStat, RamadanChallenge, QiyamSchedule, TaraweehInsight, AppState } from '../types';
import { auth } from '../services/firebaseClient';

interface Props {
  onNavigate: (tab: AppState) => void;
}

const RamadanModule: React.FC<Props> = ({ onNavigate }) => {
  const [ramadanConfig, setRamadanConfig] = useState<RamadanDayConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'qiyam' | 'taraweeh'>('tracker');
  const [dailyStats, setDailyStats] = useState<RamadanDailyStat>({ date: '', quranPages: 0, fasting: false, taraweeh: false, challengeCompleted: false });
  const [challenge, setChallenge] = useState<RamadanChallenge | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Qiyam State
  const [qiyamSchedule, setQiyamSchedule] = useState<QiyamSchedule | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);

  // Taraweeh State
  const [taraweehInput, setTaraweehInput] = useState('Juz 1');
  const [taraweehInsight, setTaraweehInsight] = useState<TaraweehInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authUser = auth.currentUser;
      if (authUser) setUser(authUser);

      // Get Location
      const coords = await new Promise<GeolocationPosition>((resolve) => 
        navigator.geolocation.getCurrentPosition(resolve, () => resolve({ coords: { latitude: 21.4225, longitude: 39.8262 } } as any))
      );
      
      const lat = coords.coords.latitude;
      const lng = coords.coords.longitude;

      // 1. Fetch Real Ramadan Status
      const config = await getRamadanStatus(lat, lng);
      setRamadanConfig(config);
      
      // 2. Fetch Challenge
      const todayChallenge = getDailyChallenge(config.hijriDay);
      setChallenge(todayChallenge);

      // 3. Fetch Stats
      if (authUser) {
        const stats = await fetchDailyStats(authUser.uid, new Date().toISOString());
        setDailyStats(stats);
      }

      // 4. Fetch Prayer Times for Qiyam
      const pt = await fetchPrayerTimes(lat, lng);
      if (pt) {
        setPrayerTimes(pt.timings);
        // Initial Calc
        const sched = calculateQiyamSchedule(pt.timings.Fajr, pt.timings.Maghrib);
        setQiyamSchedule(sched);
      }
    };
    init();

    // Timer for Qiyam Update
    const interval = setInterval(() => {
      if (prayerTimes) {
        const sched = calculateQiyamSchedule(prayerTimes.Fajr, prayerTimes.Maghrib);
        setQiyamSchedule(sched);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const handleStatToggle = async (field: keyof RamadanDailyStat) => {
    if (!user) return;
    const newVal = !dailyStats[field];
    const newStats = { ...dailyStats, [field]: newVal };
    setDailyStats(newStats);
    await updateDailyStat(user.uid, { [field]: newVal });
  };

  const handleChallengeComplete = async () => {
    if (!user) return;
    const newVal = !dailyStats.challengeCompleted;
    setDailyStats(prev => ({ ...prev, challengeCompleted: newVal }));
    await updateDailyStat(user.uid, { challengeCompleted: newVal });
  };

  const handleGenerateInsight = async () => {
    if (!taraweehInput.trim()) return;
    setIsInsightLoading(true);
    try {
      const result = await generateTaraweehInsight(taraweehInput);
      setTaraweehInsight(result);
    } catch (e) {
      alert("Failed to get insight. Please try again.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  if (!ramadanConfig) return <div className="py-40 text-center animate-pulse text-amber-500 font-black">Syncing Lunar Calendar...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 px-4 animate-in fade-in duration-1000">
      
      {/* Dynamic Header */}
      <div className="relative text-center space-y-4 py-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-amber-500/50 to-transparent"></div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
            {ramadanConfig.isRamadan ? `Ramadan Day ${ramadanConfig.hijriDay}` : `Waiting for Ramadan`}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif text-white drop-shadow-2xl tracking-tight">
          {ramadanConfig.isRamadan ? "The Blessed Month" : "Prepare Your Heart"}
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto font-medium italic">
          {ramadanConfig.phase === 'mercy' ? "The first ten days are Mercy." : ramadanConfig.phase === 'forgiveness' ? "The second ten days are Forgiveness." : "The last ten days are Freedom from Fire."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        {[
          { id: 'tracker', label: 'Tracker', icon: '📊' },
          { id: 'qiyam', label: 'Advanced Qiyam', icon: '🌌' },
          { id: 'taraweeh', label: 'Taraweeh Insight', icon: '📖' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <span className="text-lg">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[500px]">
        
        {/* 1. TRACKER & CHALLENGE */}
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            {/* 30 Day Challenge Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-500/30 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🏆</div>
               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                     <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">{challenge?.category} Challenge</span>
                     <span className="text-[10px] font-black text-slate-400">Day {ramadanConfig.hijriDay}/30</span>
                  </div>
                  <div>
                     <h3 className="text-3xl font-black text-white mb-2">{challenge?.title}</h3>
                     <p className="text-emerald-100/80 font-medium leading-relaxed">{challenge?.description}</p>
                  </div>
                  <button 
                    onClick={handleChallengeComplete}
                    className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 ${dailyStats.challengeCompleted ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {dailyStats.challengeCompleted ? 'Challenge Complete ✓' : 'Mark Complete'}
                  </button>
               </div>
            </div>

            {/* Daily Habits */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8">
               <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-[0.3em] text-center">Daily Pillars</h4>
               <div className="space-y-4">
                  <button onClick={() => handleStatToggle('fasting')} className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between group ${dailyStats.fasting ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                     <div className="flex items-center gap-4">
                        <span className="text-2xl">🌙</span>
                        <span className="font-bold text-white">Fasting (Roza)</span>
                     </div>
                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${dailyStats.fasting ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`}>
                        {dailyStats.fasting && <span className="text-black text-xs font-bold">✓</span>}
                     </div>
                  </button>

                  <button onClick={() => handleStatToggle('taraweeh')} className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between group ${dailyStats.taraweeh ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                     <div className="flex items-center gap-4">
                        <span className="text-2xl">🕌</span>
                        <span className="font-bold text-white">Taraweeh Prayer</span>
                     </div>
                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${dailyStats.taraweeh ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}>
                        {dailyStats.taraweeh && <span className="text-black text-xs font-bold">✓</span>}
                     </div>
                  </button>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <span className="text-2xl">📖</span>
                        <span className="font-bold text-white">Quran Pages</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => updateDailyStat(user?.uid, { quranPages: Math.max(0, dailyStats.quranPages - 1) })} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">-</button>
                        <span className="text-xl font-black text-white w-8 text-center">{dailyStats.quranPages}</span>
                        <button onClick={() => updateDailyStat(user?.uid, { quranPages: dailyStats.quranPages + 1 })} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">+</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* 2. ADVANCED QIYAM MODE */}
        {activeTab === 'qiyam' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95">
             <div className="md:col-span-2 space-y-6">
                {qiyamSchedule && (
                  <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                     
                     <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🌌</div>
                           <div>
                              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-1">Time until Fajr</p>
                              <h2 className="text-5xl font-black text-white tracking-tighter">{qiyamSchedule.timeRemaining}</h2>
                           </div>
                           <div className="inline-block px-4 py-1 bg-white/10 rounded-lg text-xs font-bold text-slate-300">Phase: {qiyamSchedule.phase}</div>
                        </div>

                        <div className="space-y-4">
                           <h3 className="text-xl font-black text-white">Recommended Actions</h3>
                           <div className="space-y-2">
                              {qiyamSchedule.suggestedActs.map((act, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                   <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 text-xs text-center leading-tight p-1 shrink-0">{act.time}</div>
                                   <div>
                                      <h4 className="font-bold text-white text-lg">{act.act}</h4>
                                      <p className="text-xs text-slate-400">{act.benefit}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                )}
             </div>

             <div className="md:col-span-1">
                <button 
                  onClick={() => onNavigate(AppState.LaylatulQadr)}
                  className="w-full h-full bg-gradient-to-b from-amber-500 to-amber-600 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden group active:scale-95 transition-all"
                >
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                   <div className="absolute top-[-20%] left-[-20%] w-[200px] h-[200px] bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="text-6xl group-hover:scale-110 transition-transform duration-500">🌙</div>
                   <div className="relative z-10">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Enter Night Vigil</h3>
                      <p className="text-slate-900/70 font-bold text-xs mt-2 uppercase tracking-widest">Laylatul Qadr Mode</p>
                   </div>
                   <div className="px-6 py-2 bg-slate-900/10 rounded-full text-[10px] font-black uppercase text-slate-900 tracking-widest">Launch Experience</div>
                </button>
             </div>
          </div>
        )}

        {/* 3. TARAWEEH INSIGHT */}
        {activeTab === 'taraweeh' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4">
             <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 h-fit">
                <h3 className="text-xl font-black text-white">What did you recite?</h3>
                <p className="text-sm text-slate-400">Enter the Juz or Surah range to get a scholarly summary.</p>
                <input 
                  type="text" 
                  value={taraweehInput}
                  onChange={(e) => setTaraweehInput(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 outline-none focus:border-amber-500 transition-all"
                  placeholder="e.g. Juz 4 or Surah Yasin"
                />
                <button 
                  onClick={handleGenerateInsight}
                  disabled={isInsightLoading}
                  className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isInsightLoading ? 'Consulting Scholars...' : 'Generate Insight'}
                </button>
             </div>

             <div className="lg:col-span-2">
                {taraweehInsight ? (
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8 animate-in zoom-in-95">
                     <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em]">Spiritual Summary</span>
                        <p className="text-lg text-slate-200 leading-relaxed italic border-l-4 border-amber-500 pl-6">"{taraweehInsight.summary}"</p>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Key Themes</h4>
                           <ul className="space-y-2">
                              {taraweehInsight.keyThemes.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                   <span className="text-amber-500">•</span> {t}
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Action Points</h4>
                           <ul className="space-y-2">
                              {taraweehInsight.actionPoints.map((p, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                   <span className="text-emerald-500">→</span> {p}
                                </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center opacity-30 border border-white/10 rounded-[2.5rem]">
                     <span className="text-6xl mb-4">📖</span>
                     <p className="text-sm font-black uppercase tracking-widest">Awaiting Recitation Input</p>
                  </div>
                )}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RamadanModule;
