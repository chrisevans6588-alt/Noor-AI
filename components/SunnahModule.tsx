
import React, { useState, useEffect, useMemo } from 'react';
import { fetchSunnahLibrary, getDailySunnah, completeSunnah, fetchSunnahStats } from '../services/sunnahService';
import { generateSunnahInsight, verifyTraditionScholarly, getSunnahIntegrationTips } from '../services/geminiService';
import { searchHadithLive } from '../services/sunnahApiService';
import { SunnahPractice, SunnahCategory, SunnahStats, SunnahDifficulty } from '../types';
import { auth, db, getDocs, collection, query, where } from '../services/firebaseClient';
import { useCredit } from '../services/subscriptionService';
import SubscriptionWall from './SubscriptionWall';

const CATEGORIES: { id: SunnahCategory; icon: string }[] = [
  { id: 'Morning', icon: '🌅' },
  { id: 'Sleeping', icon: '🌙' },
  { id: 'Eating', icon: '🍽️' },
  { id: 'Speaking', icon: '🗣️' },
  { id: 'Clothing', icon: '👕' },
  { id: 'Hygiene', icon: '🧼' },
  { id: 'Social', icon: '🤝' },
  { id: 'Masjid', icon: '🕌' },
  { id: 'Travel', icon: '🚗' },
  { id: 'Family', icon: '🏠' },
  { id: 'Work', icon: '💼' },
  { id: 'Worship', icon: '🤲' },
];

const DIFFICULTY_LEVELS: SunnahDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

const SunnahModule: React.FC = () => {
  const [library, setLibrary] = useState<SunnahPractice[]>([]);
  const [stats, setStats] = useState<SunnahStats | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'categories' | 'streak' | 'search' | 'live'>('daily');
  const [selectedSunnah, setSelectedSunnah] = useState<SunnahPractice | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<SunnahDifficulty | 'All'>('All');
  const [aiTopic, setAiTopic] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [coachTips, setCoachTips] = useState<string | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const [liveQuery, setLiveQuery] = useState('');
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const authUser = auth.currentUser;
        setUser(authUser);
        
        const lib = await fetchSunnahLibrary();
        setLibrary(lib);
        
        if (authUser) {
          const s = await fetchSunnahStats(authUser.uid);
          setStats(s);
          
          const daily = getDailySunnah(lib);
          try {
            const q = query(
                collection(db, 'user_sunnah_progress'),
                where('user_id', '==', authUser.uid),
                where('sunnah_id', '==', daily.id),
                where('completed', '==', true)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) setCompletedToday(true);
          } catch (e: any) {
            // Suppress permission errors
          }
        }
      } catch (err) {
        console.error("Sunnah Module Init Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const todaySunnah = useMemo(() => getDailySunnah(library), [library]);

  const filteredLibrary = useMemo(() => {
    return library.filter(s => difficultyFilter === 'All' || s.difficulty === difficultyFilter);
  }, [library, difficultyFilter]);

  const handleComplete = async (sunnah: SunnahPractice) => {
    if (!user) return;
    const success = await completeSunnah(user.uid, sunnah.id);
    if (success) {
      if (sunnah.id === todaySunnah.id) setCompletedToday(true);
      const newStats = await fetchSunnahStats(user.uid);
      setStats(newStats);
    }
  };

  const handleAiRequest = async () => {
    if (!aiTopic.trim() || !user) return;
    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) { setShowPaywall(true); return; }

    setIsAiLoading(true);
    const insight = await generateSunnahInsight(aiTopic);
    if (insight) {
      setSelectedSunnah({
        ...insight,
        id: `ai-${Date.now()}`,
        difficulty: 'Intermediate',
        estimated_time: 'Variable',
        created_at: new Date().toISOString()
      });
      setAiTopic('');
      setCoachTips(null);
    }
    setIsAiLoading(false);
  };

  const handleScholarlyVerify = async () => {
    if (!selectedSunnah || !user) return;
    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) { setShowPaywall(true); return; }

    setIsVerifying(true);
    setVerificationResult(null);
    const result = await verifyTraditionScholarly(`${selectedSunnah.title}: ${selectedSunnah.description}. Reference: ${selectedSunnah.hadith_reference}`);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const handleCoachConsult = async () => {
    if (!selectedSunnah || !user) return;
    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) { setShowPaywall(true); return; }

    setIsCoachLoading(true);
    setCoachTips(null);
    const result = await getSunnahIntegrationTips(selectedSunnah.title);
    setCoachTips(result);
    setIsCoachLoading(false);
  };

  const handleLiveSearch = async () => {
    if (!liveQuery.trim()) return;
    setIsLiveLoading(true);
    const results = await searchHadithLive(liveQuery);
    setLiveResults(results);
    setIsLiveLoading(false);
  };

  const handleResultInsight = async (h: any) => {
    if (!user) return;
    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) { setShowPaywall(true); return; }

    const text = h.hadith?.find((p: any) => p.lang === 'en')?.body || h.hadith?.[0]?.body;
    if (!text) return;
    setIsLiveLoading(true);
    const insight = await generateSunnahInsight(text);
    if (insight) {
      setSelectedSunnah({
        ...insight,
        id: `search-ai-${Date.now()}`,
        difficulty: 'Intermediate',
        estimated_time: 'Variable',
        created_at: new Date().toISOString()
      });
      setCoachTips(null);
    }
    setIsLiveLoading(false);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="w-10 h-10 border-4 border-white/10 border-t-gold-primary rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">Syncing Prophetic Archives...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-24">
      {showPaywall && <SubscriptionWall featureName="AI Sunnah Engine" onSuccess={() => { setShowPaywall(false); window.location.reload(); }} onCancel={() => setShowPaywall(false)} />}
      {/* Dark Living Header */}
      <header className="flex flex-col lg:flex-row justify-between items-center gap-8 pb-8 px-2">
        <div className="text-center lg:text-left space-y-2">
           <h2 className="text-4xl md:text-6xl font-black text-white tracking-tightest leading-none drop-shadow-lg">The Prophetic Mind</h2>
           <p className="text-white/60 font-medium text-sm md:text-base italic max-w-lg">Synthesized wisdom from the Sahih collections.</p>
        </div>

        <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-lg overflow-x-auto no-scrollbar max-w-full">
           {[
             { id: 'daily', label: 'DAILY', icon: '📅' },
             { id: 'categories', label: 'LIBRARY', icon: '🏛️' },
             { id: 'live', label: 'SEARCH', icon: '🔍' },
             { id: 'streak', label: 'GROWTH', icon: '📈' },
           ].map(tab => (
             <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSelectedSunnah(null); setVerificationResult(null); setCoachTips(null); }}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap active-press ${activeTab === tab.id ? 'bg-gold-primary text-black shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </header>

      {selectedSunnah ? (
        <div className="animate-in zoom-in-95 duration-500 px-2">
           <div className="glass-panel rounded-[3rem] p-6 md:p-16 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/5 to-transparent opacity-50 pointer-events-none"></div>
              
              <button onClick={() => { setSelectedSunnah(null); setVerificationResult(null); setCoachTips(null); }} className="text-white/40 hover:text-white font-black mb-8 flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors">
                <span className="text-xl">←</span> Return to Archives
              </button>

              <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                 {/* ... (Existing sunnah display UI) ... */}
                 <div className="text-center space-y-6">
                    <div className="flex justify-center gap-3">
                      <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gold-primary">{selectedSunnah.category}</span>
                      <span className="px-4 py-1.5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/60">
                        {selectedSunnah.difficulty}
                      </span>
                    </div>
                    <h3 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight">{selectedSunnah.title}</h3>
                    <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed italic max-w-2xl mx-auto">"{selectedSunnah.description}"</p>
                 </div>

                 <div className="bg-obsidian/50 rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-5 font-arabic text-9xl">سنة</div>
                    <div className="relative z-10 space-y-10">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-gold-primary tracking-[0.4em]">Prophetic Embodiment</h4>
                          <p className="text-xl md:text-3xl font-medium leading-relaxed italic border-l-4 border-gold-primary/50 pl-8 font-serif text-slate-200">
                             {selectedSunnah.prophetic_application}
                          </p>
                       </div>
                       
                       <div className="space-y-4 pt-8 border-t border-white/10">
                          <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em] text-center">Implementation Tools</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button 
                                onClick={handleScholarlyVerify}
                                disabled={isVerifying}
                                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                              >
                                  {isVerifying ? <div className="w-5 h-5 border-2 border-gold-primary border-t-transparent rounded-full animate-spin"></div> : <span className="text-[10px] font-black uppercase tracking-widest text-gold-primary group-hover:text-white">Scholar Deep-Verify</span>}
                              </button>
                              <button 
                                onClick={handleCoachConsult}
                                disabled={isCoachLoading}
                                className="w-full bg-zinc-800 border border-white/10 hover:bg-zinc-700 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                              >
                                  {isCoachLoading ? <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div> : <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Ask Hifdh Coach</span>}
                              </button>
                          </div>
                       </div>
                    </div>
                 </div>

                 {(verificationResult || coachTips) && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                       {verificationResult && (
                          <div className="bg-amber-900/20 p-8 rounded-[2.5rem] border border-amber-500/30 shadow-sm">
                             <h5 className="text-[9px] font-black uppercase text-amber-500 tracking-widest mb-3">Scholar Verification</h5>
                             <p className="text-amber-100 font-serif text-lg leading-relaxed whitespace-pre-wrap">{verificationResult}</p>
                          </div>
                       )}
                       {coachTips && (
                          <div className="bg-zinc-800 p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                             <h5 className="text-[9px] font-black uppercase text-white tracking-widest mb-3">Habit Strategy</h5>
                             <p className="text-zinc-300 font-medium text-lg leading-relaxed whitespace-pre-wrap">{coachTips}</p>
                          </div>
                       )}
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 space-y-8">
                       <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Practical Steps</h4>
                       <div className="space-y-6">
                          {selectedSunnah.how_to_practice.map((step, i) => (
                            <div key={i} className="flex gap-5 items-start">
                               <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-sm">{i+1}</div>
                               <p className="text-white/90 font-bold leading-relaxed text-base pt-1">{step}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="bg-gold-primary text-black p-10 rounded-[2.5rem] shadow-xl space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">💎</div>
                          <h4 className="text-[10px] font-black uppercase text-black/60 tracking-[0.3em]">Divine Benefit</h4>
                          <p className="text-2xl md:text-3xl font-black leading-tight tracking-tight">{selectedSunnah.reward}</p>
                       </div>
                       <div className="glass-panel border border-white/10 p-8 rounded-[2.5rem] space-y-2 text-center">
                          <h4 className="text-[9px] font-black uppercase text-white/40 tracking-widest">Source Reference</h4>
                          <p className="text-sm md:text-base font-serif text-white/80 italic">"{selectedSunnah.hadith_reference}"</p>
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={() => handleComplete(selectedSunnah)}
                  className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl active-press transition-all"
                 >
                  Mark Practice Accomplished (+10)
                 </button>
              </div>
           </div>
        </div>
      ) : (
        <div className="px-2 space-y-12">
          {activeTab === 'daily' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="glass-card rounded-[3rem] p-8 md:p-24 border border-white/10 text-center relative overflow-hidden group">
                 {/* Breathing Glow Effect */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-gold-primary/10 opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
                 <div className="absolute w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '4s' }}></div>
                 
                 <div className="relative z-10 space-y-10">
                    <div className="space-y-4">
                       <span className="text-[10px] font-black uppercase text-gold-primary tracking-[0.6em] bg-black/40 backdrop-blur px-4 py-2 rounded-full border border-gold-primary/20">Daily Guidance</span>
                       <h3 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-tight">{todaySunnah.title}</h3>
                       <p className="text-white/60 text-lg md:text-3xl font-medium max-w-2xl mx-auto italic leading-relaxed">"{todaySunnah.description}"</p>
                    </div>
                    <button onClick={() => setSelectedSunnah(todaySunnah)} className="bg-gold-primary text-black px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">Study Practice</button>
                 </div>
              </div>
              
              <div className="glass-panel rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group shadow-2xl">
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-2xl md:text-4xl font-black tracking-tight">Synthesize Methodology</h3>
                       <p className="text-white/40 text-sm md:text-lg font-medium mt-2">Ask Noor's Mind for the Sunnah perspective on any modern topic.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <input 
                        type="text" 
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g. 'Business Ethics', 'Digital Detox', 'Fitness'..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-lg font-bold outline-none focus:bg-white/10 transition-all placeholder:text-white/20"
                       />
                       <button 
                        onClick={handleAiRequest}
                        disabled={isAiLoading || !aiTopic.trim()}
                        className="bg-white text-black px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl active-press transition-all disabled:opacity-20"
                       >
                         {isAiLoading ? '...' : 'Consult'}
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               {/* Categories logic */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h3 className="text-3xl font-black text-white tracking-tight">Practice Repository</h3>
                  <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-sm overflow-x-auto no-scrollbar">
                     {['All', ...DIFFICULTY_LEVELS].map(d => (
                       <button
                         key={d}
                         onClick={() => setDifficultyFilter(d as any)}
                         className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${difficultyFilter === d ? 'bg-gold-primary text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                       >
                         {d}
                       </button>
                     ))}
                  </div>
               </div>

               {difficultyFilter === 'All' && (
                 <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id} 
                        className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:border-gold-primary/50 transition-all active-press group bg-zinc-900/50"
                      >
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner group-hover:bg-gold-primary/10 transition-colors">
                            {cat.icon}
                          </div>
                          <span className="text-[9px] font-black uppercase text-white tracking-widest">{cat.id}</span>
                      </button>
                    ))}
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLibrary.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => setSelectedSunnah(s)}
                      className="glass-card p-8 rounded-[3rem] border border-white/10 text-left group hover:border-gold-primary/50 hover:shadow-2xl transition-all active-press relative overflow-hidden flex flex-col justify-between min-h-[280px] bg-zinc-900/50"
                    >
                       <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity font-serif text-8xl pointer-events-none text-white">S</div>
                       <div className="space-y-4 relative z-10">
                          <div className="flex justify-between items-start">
                             <span className="text-[8px] font-black uppercase text-gold-primary tracking-widest bg-gold-primary/5 px-3 py-1 rounded-full">{s.category}</span>
                             <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${s.difficulty === 'Beginner' ? 'bg-white/5 text-white/60 border-white/20' : 'bg-white/5 text-white/40 border-white/10'}`}>{s.difficulty}</span>
                          </div>
                          <h4 className="text-2xl font-black text-white leading-tight group-hover:text-gold-primary transition-colors">{s.title}</h4>
                          <p className="text-sm text-white/50 line-clamp-3 italic leading-relaxed">"{s.description}"</p>
                       </div>
                       <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                          <span className="text-[8px] font-black uppercase text-white/30">Ref: {s.hadith_reference.split(' ')[0]}</span>
                          <span className="text-[8px] font-black uppercase text-black bg-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">Open</span>
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'live' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="glass-panel p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-lg">
                   <div className="space-y-6">
                      <div className="text-center">
                         <h3 className="text-3xl font-black text-white">Global Archive Search</h3>
                         <p className="text-white/40 text-sm font-medium mt-2">Connect to international Hadith servers.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                         <input 
                           type="text" 
                           value={liveQuery}
                           onChange={(e) => setLiveQuery(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleLiveSearch()}
                           placeholder="Search keywords (e.g. 'patience')..."
                           className="flex-1 p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-gold-primary/50 transition-all font-bold text-lg shadow-inner placeholder:text-white/20"
                         />
                         <button 
                           onClick={handleLiveSearch}
                           disabled={isLiveLoading || !liveQuery.trim()}
                           className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs active-press disabled:opacity-30 shadow-xl"
                         >
                           {isLiveLoading ? '...' : 'Search'}
                         </button>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   {isLiveLoading ? (
                     <div className="py-32 text-center animate-pulse">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Querying Repositories...</p>
                     </div>
                   ) : liveResults.map((h, i) => (
                     <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-sm border-l-4 border-l-gold-primary group relative overflow-hidden hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                           <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">
                             {h.collection} • No. {h.hadithNumber}
                           </span>
                           <button 
                            onClick={() => handleResultInsight(h)}
                            className="text-[9px] font-black uppercase text-gold-primary bg-gold-primary/10 px-4 py-2 rounded-xl active-press transition-all opacity-0 group-hover:opacity-100"
                           >
                             Invoke Insight
                           </button>
                        </div>
                        {h.hadith?.map((part: any, idx: number) => (
                           <div key={idx} className={`${idx > 0 ? 'mt-6 pt-6 border-t border-white/10' : ''}`}>
                              <div dangerouslySetInnerHTML={{ __html: part.body }} className={`font-medium ${part.lang === 'ar' ? 'font-arabic text-3xl leading-loose text-right text-white/90' : 'text-white/70 text-lg italic leading-relaxed'}`} />
                           </div>
                        ))}
                     </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'streak' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
               <div className="bg-zinc-900 rounded-[3rem] p-10 md:p-20 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/10 to-transparent opacity-30"></div>
                  <div className="relative z-10 space-y-8 text-center">
                     <div>
                        <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.6em] animate-pulse">Active Momentum</span>
                        <h3 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none mt-4 text-white">{stats?.currentStreak || 0}</h3>
                        <p className="text-sm font-bold uppercase tracking-widest text-gold-primary">Consecutive Days</p>
                     </div>
                     <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto pt-10 border-t border-white/10">
                        <div className="bg-white/5 rounded-3xl p-6">
                           <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-2">Record</p>
                           <p className="text-3xl font-black">{stats?.longestStreak || 0}</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-6">
                           <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-2">Points</p>
                           <p className="text-3xl font-black">{stats?.points || 0}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SunnahModule;
