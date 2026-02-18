
import React, { useState, useEffect, useRef } from 'react';
import { isOddNight, MOTIVATIONS, WORSHIP_STAGES, LQ_DUA, NIGHTLY_PROTOCOLS, ProtocolItem } from '../services/laylatulQadrService';
import { getRamadanDay } from '../services/ramadanService';

interface LaylatulQadrModuleProps {
  hijriDayOverride?: number | null;
}

const LaylatulQadrModule: React.FC<LaylatulQadrModuleProps> = ({ hijriDayOverride }) => {
  const systemRamadanDay = hijriDayOverride || getRamadanDay();
  const [viewNight, setViewNight] = useState(systemRamadanDay);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [dhikrCount, setDhikrCount] = useState(0);
  const [motivation, setMotivation] = useState(MOTIVATIONS[0]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showInactivityAlert, setShowInactivityAlert] = useState(false);
  const [activeView, setActiveView] = useState<'roadmap' | 'protocol'>('protocol');

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    const activityCheck = setInterval(() => {
      if (Date.now() - lastActivity > 120000 && !timerActive) { // 2 mins inactivity
        setShowInactivityAlert(true);
        setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
      }
    }, 60000);
    return () => clearInterval(activityCheck);
  }, [lastActivity, timerActive]);

  const logActivity = () => {
    setLastActivity(Date.now());
    setShowInactivityAlert(false);
  };

  const currentStage = WORSHIP_STAGES[activeStageIdx];
  const progress = ((activeStageIdx + 1) / WORSHIP_STAGES.length) * 100;
  const isOdd = isOddNight(viewNight, 9);
  const protocols = NIGHTLY_PROTOCOLS[viewNight] || [];

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const incrementDhikr = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setDhikrCount(c => c + 1);
    logActivity();
    // Simple haptic feedback simulation via scale
    const btn = e.currentTarget as HTMLElement;
    btn.classList.add('scale-110');
    setTimeout(() => btn.classList.remove('scale-110'), 100);
  };

  return (
    <div className="min-h-screen w-full text-white relative flex flex-col padding-safe-top" onClick={logActivity}>
      {/* Absolute Persistent Background */}
      <div className={`fixed inset-0 z-0 transition-colors duration-1000 ${isOdd ? 'bg-[#061811]' : 'bg-slate-950'}`}>
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-amber-500/5 rounded-full blur-[80px] md:blur-[120px]"></div>
        {isOdd && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#C6A85E11_0%,_transparent_70%)] animate-pulse"></div>
        )}
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-8 md:space-y-16 relative z-10 p-4 md:p-12 pb-32">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mt-4 md:mt-0">
          <div className="space-y-2 text-center md:text-left w-full md:w-auto">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-lg ${isOdd ? 'bg-amber-500 text-slate-900 animate-pulse' : 'bg-emerald-600 text-white'}`}>
                {isOdd ? `Night ${viewNight} • Shab-e-Qadr` : `Night ${viewNight} • The Last Ten`}
              </span>
              <div className="flex bg-white/10 rounded-2xl p-1.5 border border-white/10 gap-1 overflow-x-auto no-scrollbar max-w-[280px] md:max-w-none">
                 {[21, 23, 25, 27, 29].map(n => (
                   <button 
                    key={n} 
                    onClick={() => { setViewNight(n); setActiveView('protocol'); }}
                    className={`min-w-[40px] h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${viewNight === n ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-white/60 hover:bg-white/10'}`}
                   >
                     {n}
                   </button>
                 ))}
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mt-2">Night Companion</h2>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-6 md:gap-8 shadow-2xl w-full md:w-auto">
             <div className="flex-1 text-center">
                <p className="text-[8px] md:text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Status</p>
                <p className={`text-sm md:text-xl font-black truncate ${isOdd ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isOdd ? 'Peak Power' : 'Steadfastness'}
                </p>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div className="flex-1 text-center">
                <p className="text-[8px] md:text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Dhikr</p>
                <p className="text-2xl md:text-3xl font-black text-white tabular-nums">{dhikrCount}</p>
             </div>
          </div>
        </header>

        {showInactivityAlert && (
          <div className="bg-amber-500/20 border border-amber-500/30 p-6 md:p-8 rounded-[2rem] animate-in zoom-in-95 duration-500 flex flex-col md:flex-row items-center gap-6 shadow-xl">
             <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0">✨</div>
             <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-amber-400 uppercase text-[10px] tracking-widest mb-1">Divine Reminder</h4>
                <p className="text-base md:text-xl font-bold italic leading-relaxed">"{motivation}"</p>
             </div>
             <button onClick={() => setShowInactivityAlert(false)} className="w-full md:w-auto bg-white text-slate-900 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0">I'm Present</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          {/* LEFT: PROGRESS & NAVIGATION */}
          <div className="lg:col-span-4 space-y-6 md:space-y-10 order-2 lg:order-1">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-center space-y-6 md:space-y-8 shadow-xl">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto">
                   <svg className="w-full h-full rotate-[-90deg]">
                      <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                      <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="264" strokeDashoffset={264 - (264 * progress / 100)} className="text-emerald-500 transition-all duration-1000" strokeLinecap="round" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-4xl font-black">{Math.round(progress)}%</span>
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-white/30 tracking-widest">Ascending</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl md:text-2xl font-black">{currentStage.name}</h3>
                   <p className="text-white/40 text-xs md:text-sm font-medium">{currentStage.desc}</p>
                </div>
                <div className="flex justify-between gap-3">
                   <button 
                    disabled={activeStageIdx === 0}
                    onClick={() => setActiveStageIdx(i => i - 1)}
                    className="flex-1 py-3.5 md:py-4 bg-white/5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest disabled:opacity-10 active:scale-95 transition-all"
                   >
                     Prev
                   </button>
                   <button 
                    disabled={activeStageIdx === WORSHIP_STAGES.length - 1}
                    onClick={() => setActiveStageIdx(i => i + 1)}
                    className="flex-1 py-3.5 md:py-4 bg-emerald-600 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest active:scale-95 transition-all shadow-xl"
                   >
                     Next Stage
                   </button>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">Sacred Guide</h4>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button onClick={() => setActiveView('protocol')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${activeView === 'protocol' ? 'bg-white/10 text-amber-400 shadow-sm' : 'text-white/20'}`}>Protocol</button>
                    <button onClick={() => setActiveView('roadmap')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${activeView === 'roadmap' ? 'bg-white/10 text-amber-400 shadow-sm' : 'text-white/20'}`}>Map</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                  {activeView === 'roadmap' ? WORSHIP_STAGES.map((s, i) => (
                    <button 
                      key={s.id}
                      onClick={() => setActiveStageIdx(i)}
                      className={`w-full flex items-center gap-5 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border transition-all text-left active:scale-[0.98] ${activeStageIdx === i ? 'bg-white/10 border-white/30 shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl transition-all ${activeStageIdx === i ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/30'}`}>
                        {s.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className={`font-black text-xs md:text-sm truncate transition-all ${activeStageIdx === i ? 'text-white' : 'text-white/40'}`}>{s.name}</h5>
                        <p className={`text-[9px] md:text-[10px] font-medium truncate ${activeStageIdx === i ? 'text-white/40' : 'text-white/20'}`}>{s.desc}</p>
                      </div>
                    </button>
                  )) : (
                    <>
                      {protocols.map((p, i) => (
                        <div key={i} className="w-full flex flex-col gap-3 p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-white/10 bg-white/5 group transition-all active:bg-white/10 animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                          <div className="flex items-center justify-between">
                              <span className={`text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded ${p.type === 'prayer' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{p.type}</span>
                              {p.rakats && <span className="text-[9px] md:text-[10px] font-black text-white/40 tracking-widest">{p.rakats} Rakats</span>}
                          </div>
                          <h5 className="font-black text-xs md:text-sm text-white group-hover:text-amber-400 transition-colors leading-snug">{p.title}</h5>
                          <p className="text-[10px] md:text-[11px] text-white/40 leading-relaxed font-medium">{p.instruction}</p>
                          <div className="mt-1 pt-2 border-t border-white/5">
                              <p className="text-[8px] md:text-[9px] font-bold text-amber-500/60 italic uppercase tracking-wider">Benefit: {p.benefit}</p>
                          </div>
                        </div>
                      ))}
                      {protocols.length === 0 && (
                        <div className="p-8 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                          <p className="text-[10px] font-black uppercase text-white/20 tracking-widest leading-relaxed">Focus on intensive personal worship, Quran recitation, and Tahajjud tonight.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
             </div>
          </div>

          {/* RIGHT: FOCUS AREA */}
          <div className="lg:col-span-8 space-y-6 md:space-y-10 order-1 lg:order-2">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group min-h-[500px] md:min-h-[650px] flex flex-col">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] font-arabic text-[10rem] md:text-[15rem] select-none pointer-events-none group-hover:scale-110 transition-transform">ليل</div>
                
                <div className="relative z-10 space-y-8 md:space-y-12 flex-1 flex flex-col">
                   <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                      <div className="space-y-1 text-center md:text-left">
                         <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Current Ritual</span>
                         <h3 className="text-3xl md:text-5xl font-black leading-tight">{currentStage.name}</h3>
                      </div>
                      <div className="text-center md:text-right bg-white/5 px-6 py-3 rounded-2xl border border-white/5 w-full md:w-auto">
                         <p className="text-[8px] md:text-[9px] font-black uppercase text-white/30 tracking-widest mb-0.5">Session Progress</p>
                         <p className="text-2xl md:text-4xl font-black text-amber-400 tabular-nums font-mono drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">{formatTime(seconds)}</p>
                      </div>
                   </div>

                   <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 flex flex-col items-center text-center space-y-8 flex-1 justify-center relative overflow-hidden">
                      {/* Interactive Visual Element */}
                      <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-1000 bg-emerald-500/50 ${timerActive ? 'opacity-100' : 'opacity-0'}`}></div>

                      {currentStage.id === 'dua' ? (
                        <div className="space-y-6 md:space-y-10 w-full">
                           <div className="space-y-4">
                              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">Prophetic Supplication (Aisha's Dua)</p>
                              <p className="font-arabic text-3xl md:text-6xl leading-[1.8] md:leading-[1.6]" dir="rtl">{LQ_DUA.arabic}</p>
                           </div>
                           <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
                              <p className="text-[10px] md:text-xs font-black text-white/30 italic leading-relaxed uppercase tracking-widest">{LQ_DUA.transliteration}</p>
                              <p className="text-base md:text-2xl font-medium italic border-l-2 border-emerald-500 pl-4 md:pl-8 text-left text-white/80">"{LQ_DUA.translation}"</p>
                           </div>
                        </div>
                      ) : (
                        <div className="py-8 md:py-16 space-y-6 md:space-y-8 max-w-lg mx-auto">
                           <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-4xl md:text-6xl shadow-2xl mx-auto transition-all duration-700 ${timerActive ? 'bg-emerald-600/30 scale-110' : 'bg-white/5'}`}>
                             {currentStage.icon}
                           </div>
                           <p className="text-lg md:text-2xl text-white/70 font-medium italic leading-relaxed">
                             "{currentStage.desc}" — Immersing your soul in this divine station. Every breath is a step toward your Creator.
                           </p>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setTimerActive(!timerActive)}
                        className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs md:text-sm transition-all shadow-2xl max-w-md ${timerActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'}`}
                      >
                        {timerActive ? 'Pause Session' : 'Start Worship'}
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <button 
                        onClick={incrementDhikr}
                        className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[2rem] flex items-center justify-between group/counter transition-all active:bg-white/10"
                      >
                         <div className="text-left">
                            <p className="text-[8px] md:text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Nightly Adhkar</p>
                            <p className="text-3xl md:text-5xl font-black text-white tabular-nums">{dhikrCount}</p>
                         </div>
                         <div className="w-14 h-14 md:w-20 md:h-20 bg-emerald-600/10 border border-emerald-500/20 rounded-[1.2rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl text-emerald-400 group-hover/counter:bg-emerald-600 group-hover/counter:text-white transition-all shadow-inner">
                           +
                         </div>
                      </button>
                      <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[2rem] flex items-center justify-between group/stats">
                         <div className="text-left">
                            <p className="text-[8px] md:text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Stage Progress</p>
                            <p className="text-3xl md:text-5xl font-black text-white">{activeStageIdx + 1}<span className="text-xl md:text-2xl text-white/20">/{WORSHIP_STAGES.length}</span></p>
                         </div>
                         <div className="w-14 h-14 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-[1.2rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl shadow-inner">
                            ✅
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button for Dhikr on Mobile */}
      <button 
        onClick={incrementDhikr}
        className="fixed bottom-28 right-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex md:hidden items-center justify-center text-3xl font-black z-[100] active:scale-90 transition-transform ring-4 ring-emerald-500/20 animate-in fade-in slide-in-from-bottom-4"
      >
        +
      </button>
    </div>
  );
};

export default LaylatulQadrModule;
