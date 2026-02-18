
import React, { useState, useEffect } from 'react';
import { generateDeenJourneyPlan } from '../services/geminiService';
import { UserProfile, DeenJourneyPlan, JourneyPhase, JourneyWeek, JourneyAction } from '../types';

const LIFE_STAGES = ['Youth', 'Student', 'Professional', 'Parent', 'Revert', 'Advanced'];
const KNOWLEDGE_LEVELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced'];
const STRUGGLES = ['Inconsistent prayer', 'Low motivation', 'Doubts', 'Anxiety', 'Bad habits', 'Time management', 'Relationship issues', 'Parenting stress'];
const GOALS = ['Strengthen Salah', 'Memorize Quran', 'Improve character', 'Build discipline', 'Prepare for marriage', 'Raise righteous children', 'Leadership & impact', 'Ramadan transformation'];

const DeenJourneyModule: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [journey, setJourney] = useState<DeenJourneyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: Start, 1: Life Stage, 2: Knowledge, 3: Struggles, 4: Goals
  
  // Local onboarding state
  const [draftProfile, setDraftProfile] = useState<UserProfile>({
    lifeStage: 'Youth',
    knowledgeLevel: 'Beginner',
    struggles: [],
    goals: [],
    onboarded: false
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('noor_user_profile');
    const savedJourney = localStorage.getItem('noor_deen_journey');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedJourney) setJourney(JSON.parse(savedJourney));
  }, []);

  const handleStartJourney = async () => {
    setIsLoading(true);
    const planResult = await generateDeenJourneyPlan(draftProfile);
    if (planResult) {
      const newJourney: DeenJourneyPlan = {
        id: Date.now().toString(),
        startDate: new Date().toISOString(),
        currentDay: 1,
        phases: planResult.phases.map((p: any, idx: number) => ({
          ...p,
          status: idx === 0 ? 'active' : 'locked'
        })),
        growthScore: 0,
        streak: 0
      };
      const finalProfile = { ...draftProfile, onboarded: true };
      setProfile(finalProfile);
      setJourney(newJourney);
      localStorage.setItem('noor_user_profile', JSON.stringify(finalProfile));
      localStorage.setItem('noor_deen_journey', JSON.stringify(newJourney));
    }
    setIsLoading(false);
  };

  const toggleAction = (phaseIdx: number, weekIdx: number, actionId: string) => {
    if (!journey) return;
    const newJourney = { ...journey };
    const phase = newJourney.phases[phaseIdx];
    const week = phase.weeks[weekIdx];
    const action = week.actions.find(a => a.id === actionId);
    if (action) {
      action.completed = !action.completed;
      newJourney.growthScore += action.completed ? 5 : -5;
    }
    setJourney(newJourney);
    localStorage.setItem('noor_deen_journey', JSON.stringify(newJourney));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-emerald-100 rounded-full"></div>
          <div className="w-32 h-32 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🌟</div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-slate-800">Architecting Your Spiritual Path</h3>
          <p className="text-slate-400 font-medium">Noor is calculating your 90-day transformation strategy...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.onboarded) {
    return (
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 p-10 opacity-5 font-arabic text-[15rem] pointer-events-none">بداية</div>
        
        <div className="relative z-10 space-y-12">
          {onboardingStep === 0 && (
            <div className="text-center space-y-8 py-10">
              <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-emerald-500/30">🌿</div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter">Your Personalized Deen Journey™</h2>
                <p className="text-indigo-200/60 text-lg max-w-lg mx-auto">Every soul has a unique path to Allah. Let Noor build an adaptive roadmap for your spiritual evolution.</p>
              </div>
              <button 
                onClick={() => setOnboardingStep(1)}
                className="bg-white text-emerald-950 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Begin Assessment
              </button>
            </div>
          )}

          {onboardingStep === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-10">
               <h3 className="text-3xl font-black">Which stage of life describes you?</h3>
               <div className="grid grid-cols-2 gap-4">
                 {LIFE_STAGES.map(s => (
                   <button 
                    key={s} 
                    onClick={() => { setDraftProfile({...draftProfile, lifeStage: s as any}); setOnboardingStep(2); }}
                    className="p-6 rounded-3xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-emerald-500 transition-all text-left font-bold text-xl"
                   >
                     {s}
                   </button>
                 ))}
               </div>
               <button onClick={() => setOnboardingStep(0)} className="text-white/40 font-bold hover:text-white transition-colors">Back</button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-10">
               <h3 className="text-3xl font-black">Your current Islamic knowledge level?</h3>
               <div className="grid grid-cols-2 gap-4">
                 {KNOWLEDGE_LEVELS.map(s => (
                   <button 
                    key={s} 
                    onClick={() => { setDraftProfile({...draftProfile, knowledgeLevel: s as any}); setOnboardingStep(3); }}
                    className="p-6 rounded-3xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-emerald-500 transition-all text-left font-bold text-xl"
                   >
                     {s}
                   </button>
                 ))}
               </div>
               <button onClick={() => setOnboardingStep(1)} className="text-white/40 font-bold hover:text-white transition-colors">Back</button>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-10">
               <div className="space-y-2">
                 <h3 className="text-3xl font-black">What are you currently struggling with?</h3>
                 <p className="text-white/40">Select all that apply.</p>
               </div>
               <div className="flex flex-wrap gap-3">
                 {STRUGGLES.map(s => (
                   <button 
                    key={s} 
                    onClick={() => {
                      const current = draftProfile.struggles;
                      const updated = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
                      setDraftProfile({...draftProfile, struggles: updated});
                    }}
                    className={`px-6 py-4 rounded-2xl border-2 transition-all font-bold ${draftProfile.struggles.includes(s) ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/5 bg-white/5 text-white/40'}`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
               <div className="flex justify-between items-center pt-8">
                <button onClick={() => setOnboardingStep(2)} className="text-white/40 font-bold hover:text-white transition-colors">Back</button>
                <button onClick={() => setOnboardingStep(4)} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">Continue</button>
               </div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-10">
               <div className="space-y-2">
                 <h3 className="text-3xl font-black">What are your primary goals?</h3>
                 <p className="text-white/40">These will define your milestones.</p>
               </div>
               <div className="flex flex-wrap gap-3">
                 {GOALS.map(s => (
                   <button 
                    key={s} 
                    onClick={() => {
                      const current = draftProfile.goals;
                      const updated = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
                      setDraftProfile({...draftProfile, goals: updated});
                    }}
                    className={`px-6 py-4 rounded-2xl border-2 transition-all font-bold ${draftProfile.goals.includes(s) ? 'border-amber-500 bg-amber-500/20 text-white' : 'border-white/5 bg-white/5 text-white/40'}`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
               <div className="flex justify-between items-center pt-8">
                <button onClick={() => setOnboardingStep(3)} className="text-white/40 font-bold hover:text-white transition-colors">Back</button>
                <button 
                  onClick={handleStartJourney}
                  disabled={draftProfile.goals.length === 0}
                  className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-all disabled:opacity-30"
                >
                  Create My Journey
                </button>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN JOURNEY VIEW
  const currentPhase = journey?.phases.find(p => p.status === 'active') || journey?.phases[0];
  const activePhaseIdx = journey?.phases.findIndex(p => p.status === 'active') ?? 0;
  // For demo: current week is based on currentDay / 7
  const currentWeekIdx = Math.min(3, Math.floor(((journey?.currentDay || 1) - 1) % 30 / 7));
  const currentWeek = currentPhase?.weeks[currentWeekIdx];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Journey Header */}
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-transparent opacity-50"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-600 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">Phase {currentPhase?.phaseNumber}: {currentPhase?.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Day {journey?.currentDay} of 90</span>
              </div>
              <div>
                <h2 className="text-4xl font-black mb-2 leading-tight">Week {currentWeek?.weekNumber}: {currentWeek?.theme}</h2>
                <p className="text-emerald-100/60 font-medium italic text-lg leading-relaxed max-w-lg">"{currentWeek?.focus}"</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl shadow-lg">💎</div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Spiritual Growth Score</p>
                   <p className="text-2xl font-black text-emerald-400">{journey?.growthScore} <span className="text-xs uppercase text-white/20">Iman Points</span></p>
                </div>
              </div>
            </div>
            
            {/* Completion Ring */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="552" strokeDashoffset={552 - (552 * (journey?.currentDay || 0) / 90)} className="text-emerald-500" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-black">{Math.round(((journey?.currentDay || 0) / 90) * 100)}%</span>
                 <span className="text-[10px] font-black uppercase text-white/30">Progress</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-6 opacity-5 font-arabic text-6xl group-hover:scale-110 transition-transform">اية</div>
           <div>
             <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-6 block">Weekly Divine Counsel</span>
             <p className="font-arabic text-2xl text-right leading-loose text-slate-800" dir="rtl">{currentWeek?.recommendedAyah.arabic}</p>
             <p className="text-slate-500 text-sm italic mt-4 leading-relaxed">"{currentWeek?.recommendedAyah.translation}"</p>
           </div>
           <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-6">
              <span className="text-[9px] font-black uppercase text-slate-400">{currentWeek?.recommendedAyah.reference}</span>
              <button className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Explore Tafsir</button>
           </div>
        </div>
      </header>

      {/* Daily Actions & Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex justify-between items-end px-2">
             <h3 className="text-2xl font-black text-slate-800">Daily Transformation Quota</h3>
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
           </div>
           
           <div className="space-y-4">
             {currentWeek?.actions.map((action) => (
               <button 
                key={action.id}
                onClick={() => toggleAction(activePhaseIdx, currentWeekIdx, action.id)}
                className={`w-full p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between text-left group ${action.completed ? 'bg-emerald-50 border-emerald-500 shadow-inner' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'}`}
               >
                 <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${action.completed ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50'}`}>
                      {action.category === 'worship' ? '🕌' : action.category === 'character' ? '💎' : action.category === 'knowledge' ? '📖' : '🌱'}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold transition-all ${action.completed ? 'text-emerald-900 line-through opacity-50' : 'text-slate-800'}`}>{action.text}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{action.category}</p>
                    </div>
                 </div>
                 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${action.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-100 group-hover:border-emerald-300'}`}>
                    {action.completed && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </div>
               </button>
             ))}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-2xl font-black text-slate-800 px-2">Deep Reflection</h3>
           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border border-white/5 h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
              <div className="relative z-10 flex flex-col h-full justify-between space-y-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Weekly Prompt</span>
                  <h4 className="text-2xl font-black leading-tight italic">"{currentWeek?.reflectionPrompt}"</h4>
                </div>
                
                <textarea 
                  placeholder="Record your thoughts here..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[200px] outline-none focus:bg-white/10 transition-all text-emerald-50 placeholder:text-white/10 resize-none shadow-inner"
                />

                <button className="w-full bg-emerald-600 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all">Submit Journal</button>
              </div>
           </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <section className="space-y-8">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-black text-slate-800">Your 90-Day Roadmap</h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Current</div>
             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-200" /> Locked</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {journey?.phases.map((phase, idx) => (
             <div 
              key={phase.phaseNumber} 
              className={`p-10 rounded-[3rem] border transition-all relative overflow-hidden group ${phase.status === 'active' ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/5' : 'bg-slate-50 border-slate-100 opacity-60'}`}
             >
                <div className={`absolute top-0 right-0 p-8 font-black text-6xl opacity-5 ${phase.status === 'active' ? 'text-emerald-600' : 'text-slate-300'}`}>{phase.phaseNumber}</div>
                <div className="relative z-10 space-y-8">
                  <div>
                    <h4 className={`text-2xl font-black ${phase.status === 'active' ? 'text-slate-800' : 'text-slate-400'}`}>{phase.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Days {(idx * 30) + 1} - {(idx + 1) * 30}</p>
                  </div>

                  <div className="space-y-3">
                    {phase.weeks.map(w => (
                      <div key={w.weekNumber} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${phase.status === 'active' ? (w.weekNumber <= (journey?.currentDay || 1) / 7 + 1 ? 'bg-emerald-500' : 'bg-emerald-100') : 'bg-slate-200'}`} />
                        <span className={`text-xs font-bold ${phase.status === 'active' ? 'text-slate-600' : 'text-slate-400'}`}>Week {w.weekNumber}: {w.theme}</span>
                      </div>
                    ))}
                  </div>

                  {phase.status === 'locked' && (
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      Complete Foundation
                    </div>
                  )}
                  
                  {phase.status === 'active' && (
                    <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-emerald-600 h-full rounded-full w-1/3" />
                    </div>
                  )}
                </div>
             </div>
           ))}
        </div>
      </section>

      <div className="p-8 bg-emerald-950 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
         <div className="relative z-10 flex items-center gap-8 text-center md:text-left">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl animate-pulse">🎯</div>
            <div className="space-y-1">
               <h4 className="text-2xl font-black">Daily Muhasabah</h4>
               <p className="text-emerald-100/40 text-sm max-w-sm">"Take account of yourselves before you are taken into account." — Umar ibn Al-Khattab (ra)</p>
            </div>
         </div>
         <button 
          onClick={() => { if(confirm("Reset journey?")) { localStorage.removeItem('noor_user_profile'); localStorage.removeItem('noor_deen_journey'); window.location.reload(); }}}
          className="relative z-10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/30 border border-white/10 hover:text-rose-400 hover:border-rose-400 transition-all"
         >
           Reset Deen Journey
         </button>
      </div>
    </div>
  );
};

export default DeenJourneyModule;
