
import React, { useState, useEffect, useRef } from 'react';
import { calculateNightStatus, getNightGreeting, generateNightAction, logNightActivity } from '../services/nightCompanionService';
import { fetchPrayerTimes } from '../services/islamicApiService';
import { NightStatus, NightPhase } from '../types';
import { GoogleGenAI } from "@google/genai";
import DhikrCounter from './DhikrCounter';
import { auth } from '../services/firebaseClient';

const NightCompanionModule: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [status, setStatus] = useState<NightStatus | null>(null);
  const [isCalmMode, setIsCalmMode] = useState(false);
  const [suggestedAction, setSuggestedAction] = useState<any>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('Seeker');
  
  const [chatInput, setChatInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authUser = auth.currentUser;
      setUser(authUser);
      
      const pers = localStorage.getItem('noor_user_personalization');
      if (pers) setUserName(JSON.parse(pers).name || 'Seeker');

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const prayerData = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
        if (prayerData) {
          const s = calculateNightStatus(prayerData.timings.Fajr, prayerData.timings.Maghrib);
          setStatus(s);
          if (authUser) logNightActivity(authUser.uid, 'visit');
        }
      }, () => {
        setStatus(calculateNightStatus());
      });
    };
    init();

    const interval = setInterval(() => {
      setStatus(prev => prev ? calculateNightStatus() : null);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatToDo = async () => {
    if (!status || isLoadingAction) return;
    setIsLoadingAction(true);
    const action = await generateNightAction(status);
    setSuggestedAction(action);
    setIsLoadingAction(false);
    if (user) logNightActivity(user.uid, 'prayer');
  };

  const handleNightConsult = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setAiResponse(null);
    
    // Standard initialization using imported SDK
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: chatInput,
        config: {
          systemInstruction: "You are the Noor Night Guardian. Your voice is exceptionally soft, merciful, and calm. You speak to souls who are awake when others sleep. Focus on Allah's endless forgiveness, the beauty of the last third of the night, and providing hope. Never judge. Keep responses relatively short and poetic. No markdown."
        }
      });
      setAiResponse(result.text || "Even in the silence, He hears you. Say 'Ya Latif' and know His kindness is near.");
      if (user) logNightActivity(user.uid, 'dua_ai');
    } catch (e) {
      setAiResponse("Breathe slowly, dear soul. Even in the silence, He hears you. Say 'Ya Latif' and know His kindness is near.");
    } finally {
      setIsAiLoading(false);
      setChatInput('');
    }
  };

  if (!status) return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-white/5 border-t-amber-400 rounded-full animate-spin"></div>
      <p className="text-white/40 font-black uppercase text-[10px] tracking-widest">Entering the Night...</p>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[150] transition-all duration-1000 overflow-y-auto no-scrollbar flex flex-col bg-slate-950 text-slate-100`}>
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 transition-colors duration-[5000ms] ${status.isLastThird ? 'bg-amber-500/10' : 'bg-blue-500/5'}`}></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 bg-indigo-500/5"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10 px-6 pt-16 pb-32 space-y-12">
        <header className="flex justify-between items-center animate-in fade-in duration-1000">
           <div className="space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full border border-white/10 ${status.isLastThird ? 'text-amber-400 border-amber-400/20' : 'text-slate-400'}`}>
                {status.isLastThird ? 'Peak Tahajjud Window' : 'The Night Watch'}
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tightest">{getNightGreeting(status, userName)}</h2>
           </div>
           <button onClick={onExit} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </header>

        {!isCalmMode ? (
          <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Time until Fajr', value: status.timeToFajr, icon: '🌄' },
                 { label: 'Night Phase', value: status.phase.replace('_', ' '), icon: '🌙' },
                 { label: 'Tahajjud Status', value: status.isLastThird ? 'Active' : 'Awaiting', icon: '✨' },
                 { label: 'Vigil Count', value: '1446 AH', icon: '📜' }
               ].map(stat => (
                 <div key={stat.label} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 group hover:bg-white/10 transition-all">
                    <span className="text-xl opacity-40 group-hover:scale-110 transition-transform">{stat.icon}</span>
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                    <p className="text-lg font-black tracking-tighter capitalize">{stat.value}</p>
                 </div>
               ))}
            </div>

            {/* AI Suggestion Button */}
            <button 
              onClick={handleWhatToDo}
              disabled={isLoadingAction}
              className="w-full p-8 md:p-12 rounded-[3rem] bg-white text-slate-900 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl relative overflow-hidden group active:scale-[0.98] transition-all"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-amber-50 to-transparent opacity-50"></div>
               <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-transform">
                  {isLoadingAction ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '🕯️'}
               </div>
               <div className="relative z-10">
                  <h3 className="text-2xl md:text-4xl font-black tracking-tighter">What should I do right now?</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm md:text-base">Noor will architect a micro-worship plan for this specific moment.</p>
               </div>
            </button>

            {/* Generated Plan */}
            {suggestedAction && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                    <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest">Act of Worship</span>
                    <p className="text-xl md:text-2xl font-bold leading-tight">{suggestedAction.action}</p>
                    <div className="h-px w-full bg-white/5"></div>
                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Dhikr Cycle</span>
                    <p className="text-base font-medium italic text-slate-300">"{suggestedAction.dhikr}"</p>
                 </div>
                 <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Nightly Dua</span>
                    <p className="text-base md:text-lg font-medium leading-relaxed italic text-indigo-100">"{suggestedAction.dua}"</p>
                    <div className="h-px w-full bg-white/5"></div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Verse of Stillness</span>
                    <p className="text-sm font-medium text-slate-400">{suggestedAction.ayah}</p>
                 </div>
              </div>
            )}

            {/* Night Assistant */}
            <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[3.5rem] space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.02] font-arabic text-8xl transition-transform group-hover:scale-105 duration-1000">صبر</div>
               <div className="space-y-2">
                  <h4 className="text-xl md:text-3xl font-black tracking-tight">The Guardian's Counsel</h4>
                  <p className="text-slate-500 text-sm md:text-base font-medium">Whisper your thoughts to Noor. Our Night AI listens with mercy.</p>
               </div>
               
               {aiResponse && (
                 <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] animate-in slide-in-from-left-4 duration-500">
                    <p className="text-lg md:text-2xl font-medium leading-relaxed italic text-slate-100 whitespace-pre-wrap">{aiResponse}</p>
                 </div>
               )}

               <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNightConsult()}
                    placeholder="I feel distant... I cannot sleep... I seek mercy..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pr-16 outline-none focus:bg-white/10 transition-all font-medium placeholder:text-slate-700"
                  />
                  <button 
                    onClick={handleNightConsult}
                    disabled={isAiLoading || !chatInput.trim()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-20"
                  >
                    {isAiLoading ? <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div> : '→'}
                  </button>
               </div>
            </div>

            {/* Quick Dhikr Section */}
            <div className="space-y-6">
              <h4 className="text-center text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Tactile Remembrance</h4>
              <div className="max-w-md mx-auto h-[400px] scale-90 md:scale-100">
                 <DhikrCounter />
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={() => setIsCalmMode(true)}
                className="px-10 py-4 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Enter Silent Reflection Mode
              </button>
            </div>
          </div>
        ) : (
          /* CALM MODE VIEW */
          <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] space-y-20 animate-in zoom-in-95 duration-1000">
             <div className="text-center space-y-12 max-w-2xl">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.8em] animate-pulse">DIVINE PRESENCE</span>
                <p className="font-arabic text-5xl md:text-7xl leading-loose" dir="rtl">اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ</p>
                <p className="text-xl md:text-3xl font-medium italic text-slate-400">"Allah is the Light of the heavens and the earth."</p>
             </div>

             {/* Breathing Dhikr Circle */}
             <button 
              onClick={() => { if(window.navigator.vibrate) window.navigator.vibrate(5); }}
              className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-white/5 relative flex items-center justify-center group"
             >
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" style={{ animationDuration: '4s' }}></div>
                <div className="absolute inset-8 rounded-full border border-white/20 animate-pulse opacity-20" style={{ animationDuration: '3s' }}></div>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-white transition-colors">SUBHANALLAH</span>
             </button>

             <button 
               onClick={() => setIsCalmMode(false)}
               className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
             >
               Exit Reflection
             </button>
          </div>
        )}

        <footer className="text-center pt-20 border-t border-white/5 space-y-4">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em]">Noor Night Companion • 1446 AH</p>
           <p className="text-xs text-slate-700 italic">"The prayer at night is better than the whole world and what it contains."</p>
        </footer>
      </div>

      {/* Floating Action Button for Emergency Mercy (Only on Mobile) */}
      <button 
        onClick={() => { setChatInput("I feel overwhelmed tonight. Please comfort me."); handleNightConsult(); }}
        className="fixed bottom-10 right-6 md:hidden w-16 h-16 rounded-full bg-amber-500 text-slate-950 shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-[160]"
      >
        🕊️
      </button>
    </div>
  );
};

export default NightCompanionModule;
