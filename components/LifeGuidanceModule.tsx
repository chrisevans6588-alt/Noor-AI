
import React, { useState, useEffect, useRef } from 'react';
import { getSituationalGuidance } from '../services/lifeGuidanceService';
import { LifeGuidanceResponse } from '../types';
import { useCredit } from '../services/subscriptionService';
import { auth } from '../services/firebaseClient';
import SubscriptionWall from './SubscriptionWall';

const QUICK_SITUATIONS = [
  { label: "I’m angry", icon: "🔥", color: "bg-rose-50 text-rose-700 border-rose-100" },
  { label: "I feel guilty", icon: "😔", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { label: "I’m confused", icon: "🤔", color: "bg-amber-50 text-amber-700 border-amber-100" },
  { label: "I argued with someone", icon: "🗣️", color: "bg-slate-50 text-slate-700 border-slate-100" },
  { label: "I sinned", icon: "⚖️", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { label: "I feel lost", icon: "🧭", color: "bg-blue-50 text-blue-700 border-blue-100" }
];

const LifeGuidanceModule: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ situation: string; result: LifeGuidanceResponse }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeResult, setActiveResult] = useState<LifeGuidanceResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('noor_life_guidance_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const handleRequest = async (situation: string) => {
    const trimmedInput = situation.trim();
    if (!trimmedInput || isLoading) return;

    const user = auth.currentUser;
    if (!user) return;

    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) {
      setShowPaywall(true);
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    setActiveResult(null);

    try {
      // Small timeout safety to clear loader if network is extremely slow
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 20000)
      );

      const result = await Promise.race([
        getSituationalGuidance(trimmedInput, history.slice(0, 3).map(h => h.situation)),
        timeoutPromise
      ]) as LifeGuidanceResponse;
      
      setActiveResult(result);
      
      const newEntry = { situation: trimmedInput, result };
      const newHistory = [newEntry, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('noor_life_guidance_history', JSON.stringify(newHistory));
      
      setInput('');
      
      // Focus the new result
      setTimeout(() => {
        const resultEl = document.getElementById('guidance-result');
        if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error: any) {
      console.error("UI Guidance Error:", error);
      setErrorMessage(error.message === "Request timed out" 
        ? "The scrolls are taking too long to open. Please check your connection and try again." 
        : "I'm having trouble connecting to the fountain of wisdom. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32 px-4">
      {showPaywall && <SubscriptionWall featureName="Life Guidance" onSuccess={() => { setShowPaywall(false); window.location.reload(); }} onCancel={() => setShowPaywall(false)} />}
      <header className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-3xl mx-auto shadow-xl shadow-emerald-600/20 text-white">✨</div>
        <div>
           <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tightest">Life Guidance AI</h2>
           <p className="text-slate-500 font-medium text-sm md:text-lg italic opacity-80">Immediate spiritual clarity for your current path.</p>
        </div>
      </header>

      {/* Input Area */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest text-center">What is in your heart right now?</h3>
          <div className="relative group">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 'I'm struggling with a decision at work' or 'I feel disconnected from my prayer'..."
              className="w-full h-32 md:h-40 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-lg md:text-xl text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:border-emerald-500 transition-all resize-none shadow-inner"
            />
            <button 
              onClick={() => handleRequest(input)}
              disabled={isLoading || !input.trim()}
              className="absolute bottom-4 right-4 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 disabled:opacity-30 transition-all"
            >
              {isLoading ? 'Consulting...' : 'Seek Clarity'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_SITUATIONS.map(s => (
            <button 
              key={s.label}
              onClick={() => handleRequest(s.label)}
              disabled={isLoading}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-left group active:scale-95 disabled:opacity-50 ${s.color}`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="text-[10px] font-bold leading-tight uppercase tracking-wide">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-4 animate-in shake duration-500">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📡</span>
            <p className="text-rose-700 text-xs font-bold uppercase tracking-widest">{errorMessage}</p>
          </div>
          <button 
            onClick={() => handleRequest(input || "Give me general guidance.")} 
            className="px-6 py-2 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-transform"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6">
           <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl">📜</div>
           </div>
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Consulting the Scrolls of Mercy...</p>
        </div>
      )}

      {/* Result Display */}
      {activeResult && !isLoading && (
        <div id="guidance-result" className={`space-y-8 animate-in slide-in-from-bottom-10 duration-700 ${activeResult.isUrgent ? 'border-t-8 border-rose-500 pt-8' : ''}`}>
           {activeResult.isUrgent && (
             <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-start gap-4">
                <span className="text-2xl">🕊️</span>
                <div>
                   <h4 className="font-black text-rose-800 text-sm uppercase tracking-widest">Presence of Mercy</h4>
                   <p className="text-rose-700 text-sm font-medium leading-relaxed italic">"Breathe. Allah is closer to you than your jugular vein. You are in a safe place."</p>
                </div>
             </div>
           )}

           <div className="bg-emerald-950 text-white p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-12 opacity-5 font-arabic text-[15rem] select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">هدى</div>
              <div className="relative z-10 space-y-12">
                 <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.4em]">Direct Counsel</span>
                    <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter italic border-l-4 border-emerald-500 pl-8">
                       "{activeResult.guidance}"
                    </h3>
                    <p className="text-emerald-100/60 text-base md:text-xl font-medium leading-relaxed max-w-3xl">{activeResult.explanation}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Divine Proof</h4>
                       <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4 shadow-inner">
                          <p className="text-lg md:text-xl font-medium italic text-emerald-50 leading-relaxed font-serif">"{activeResult.evidence.text}"</p>
                          <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">— {activeResult.evidence.reference}</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Practical Steps</h4>
                       <div className="space-y-3">
                          {activeResult.actionSteps.map((step, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group/step hover:bg-white/10 transition-colors">
                               <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-black shrink-0">{i+1}</div>
                               <p className="text-sm md:text-base font-bold">{step}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/10">
                    <div className="md:col-span-2 space-y-4">
                       <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Prophetic Supplication</span>
                       <div className="bg-white/10 p-8 rounded-[2rem] border border-white/5 space-y-4">
                          <p className="font-arabic text-3xl md:text-4xl text-right leading-loose" dir="rtl">{activeResult.recommendedDua.arabic}</p>
                          <p className="text-sm italic text-white/60">"{activeResult.recommendedDua.translation}"</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Path to Avoid</span>
                       <div className="bg-rose-950/20 p-6 rounded-[2rem] border border-rose-500/10 space-y-2">
                          {activeResult.avoid.map((item, i) => (
                            <p key={i} className="text-rose-200 text-sm font-bold flex items-center gap-3">
                               <span className="text-rose-500 font-black">×</span> {item}
                            </p>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* History Log */}
      {history.length > 0 && !activeResult && !isLoading && (
        <div className="space-y-6 pt-10">
           <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Spiritual Path Log</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {history.map((h, i) => (
               <button 
                key={i} 
                onClick={() => setActiveResult(h.result)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all text-left animate-in fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
               >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg group-hover:bg-emerald-50 transition-colors">📖</div>
                    <div>
                       <h4 className="font-bold text-slate-800 text-sm truncate max-w-[150px] md:max-w-[250px]">{h.situation}</h4>
                       <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Historical Wisdom</p>
                    </div>
                 </div>
                 <svg className="w-4 h-4 text-slate-200 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
               </button>
             ))}
           </div>
           <div className="text-center">
             <button onClick={() => { if (confirm("Clear your path logs?")) { localStorage.removeItem('noor_life_guidance_history'); setHistory([]); } }} className="text-[9px] font-black uppercase text-slate-300 hover:text-rose-400 transition-colors">Purge History</button>
           </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => handleRequest("Give me immediate general guidance for this moment.")}
        disabled={isLoading}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 px-8 py-5 bg-slate-900 text-white rounded-full font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all z-[100] border-2 border-emerald-500/20 flex items-center gap-3 group disabled:opacity-30"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse group-hover:scale-125 transition-transform"></div>
        What should I do now?
      </button>
    </div>
  );
};

export default LifeGuidanceModule;
