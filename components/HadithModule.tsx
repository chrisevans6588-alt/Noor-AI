
import React, { useState, useEffect } from 'react';
import { fetchHadithBooks, fetchHadithRange, HadithBook, HadithItem } from '../services/hadithApiService';
import { GoogleGenAI, Type } from "@google/genai";
import ShareAction from './ShareAction';
import { loadSubscription, useCredit } from '../services/subscriptionService';
import SubscriptionWall from './SubscriptionWall';
import { auth } from '../services/firebaseClient';
import { UserSubscription } from '../types';

const HadithModule: React.FC = () => {
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHadithLoading, setIsHadithLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<Record<string, any>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingHadith, setPendingHadith] = useState<HadithItem | null>(null);
  
  // Subscription state for hiding english text
  const [sub, setSub] = useState<UserSubscription | null>(null);

  useEffect(() => {
    fetchHadithBooks().then(data => { setBooks(data); setIsLoading(false); });
    const checkSub = async () => {
      const user = auth.currentUser;
      if (user) {
        const s = await loadSubscription(user.uid);
        setSub(s);
      }
    };
    checkSub();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      setIsHadithLoading(true);
      fetchHadithRange(selectedBook.id, (page - 1) * 10 + 1, page * 10).then(data => { setHadiths(data); setIsHadithLoading(false); setExpandedId(null); });
    }
  }, [selectedBook, page]);

  const toggleInsight = async (h: HadithItem) => {
    if (expandedId === h.id) { setExpandedId(null); return; }
    
    const user = auth.currentUser;
    if (!user) return;
    
    // Strict premium check for Insight feature
    const success = await useCredit(user.uid);
    if (!success) {
      setPendingHadith(h);
      setShowPaywall(true);
      return;
    }

    setExpandedId(h.id);
    if (aiInsights[h.id]) return;

    setLoadingInsights(p => ({ ...p, [h.id]: true }));
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a brief, scholarly explanation and the historical context for Hadith No. ${h.number} from ${selectedBook?.name}: ${h.arab}. Cite key figures or relevant historical background. RULES: 1. NO MARKDOWN. 2. PLAIN TEXT ONLY. 3. FORMAT: Return a JSON object with 'translation' and 'explanation' fields.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { 
            type: Type.OBJECT, 
            properties: { 
              translation: { type: Type.STRING }, 
              explanation: { type: Type.STRING } 
            }, 
            required: ["translation", "explanation"] 
          }
        }
      });
      setAiInsights(p => ({ ...p, [h.id]: JSON.parse(r.text || "{}") }));
    } catch { 
      setAiInsights(p => ({ ...p, [h.id]: { translation: h.contents, explanation: "Scholarly insight currently unavailable. Please consult authentic commentaries." } })); 
    }
    finally { setLoadingInsights(p => ({ ...p, [h.id]: false })); }
  };

  const isRestricted = sub?.tier !== 'premium' && (sub?.creditsRemaining || 0) <= 0;

  if (isLoading) return <div className="py-40 text-center animate-pulse text-[10px] font-black text-slate-500 uppercase tracking-widest">Opening Archives...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {showPaywall && (
        <SubscriptionWall 
          featureName="Scholarly Hadith Insight" 
          onSuccess={() => { setShowPaywall(false); window.location.reload(); }} 
          onCancel={() => setShowPaywall(false)} 
        />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Collections List */}
        <div className="lg:w-1/4">
           <div className="glass-panel p-5 md:p-6 rounded-[2rem] border border-white/10 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-gold-primary tracking-widest mb-4">Collections</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                {books.map(b => (
                  <button key={b.id} onClick={() => { setSelectedBook(b); setPage(1); }} className={`p-4 rounded-xl transition-all border shrink-0 text-left min-w-[160px] lg:min-w-0 ${selectedBook?.id === b.id ? 'bg-white/10 border-gold-primary/30 text-white shadow-lg' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                    <span className="font-bold text-xs block truncate">{b.name}</span>
                    <p className={`text-[8px] uppercase mt-1 font-bold ${selectedBook?.id === b.id ? 'text-gold-primary' : 'text-slate-500'}`}>{b.available} Narrations</p>
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Hadith Display Area */}
        <div className="lg:w-3/4 space-y-6">
          {selectedBook ? (
            <>
              {/* Pagination Header */}
              <div className="flex items-center justify-between glass-panel p-5 rounded-[1.5rem] border border-white/10">
                <span className="text-[10px] font-black uppercase text-slate-400">{selectedBook.name} • Pg {page}</span>
                <div className="flex items-center gap-4">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-20 text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="font-black text-xs text-white">{page}</span>
                  <button onClick={() => setPage(p => p + 1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

              {isHadithLoading ? <div className="py-20 text-center animate-pulse text-slate-500 font-bold text-xs uppercase tracking-widest">Retrieving Narrations...</div> : (
                <div className="grid grid-cols-1 gap-4">
                  {hadiths.map(h => (
                    <div key={h.id} className={`glass-card rounded-[2rem] border transition-all p-6 md:p-10 ${expandedId === h.id ? 'border-gold-primary/30 bg-white/5' : 'border-white/5'}`}>
                       <div className="flex justify-between items-start mb-6">
                          <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">No. {h.number}</span>
                          <div className="flex gap-2">
                             <div className="text-slate-400 hover:text-white transition-colors">
                               <ShareAction 
                                 title={`Hadith ${h.number}`} 
                                 text={`${h.arab}\n\nShared from ${selectedBook.name}`} 
                               />
                             </div>
                             <button onClick={() => toggleInsight(h)} className="text-[9px] font-black uppercase text-gold-primary bg-gold-primary/10 border border-gold-primary/20 px-4 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-2 hover:bg-gold-primary/20">
                               {expandedId === h.id ? 'Hide' : 'Insight'}
                               {!expandedId && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/></svg>}
                             </button>
                          </div>
                       </div>
                       
                       <p className="font-arabic text-2xl md:text-3xl text-right leading-loose mb-6 text-white" dir="rtl">{h.arab}</p>
                       
                       {/* Restricted English Translation for Free Users */}
                       <div className="relative">
                         <div className={`transition-all duration-500 ${isRestricted ? 'blur-md select-none opacity-50' : 'opacity-100'}`}>
                            <p className="text-slate-400 italic text-lg leading-relaxed">
                              {h.contents}
                            </p>
                         </div>
                         {isRestricted && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              <button onClick={() => setShowPaywall(true)} className="bg-slate-900 border border-white/20 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 active:scale-95 transition-transform hover:bg-black">
                                 <span className="text-lg">🔒</span>
                                 <span className="text-[10px] font-black uppercase tracking-widest">Unlock Translation</span>
                              </button>
                           </div>
                         )}
                       </div>
                       
                       {expandedId === h.id && (
                         <div className="mt-8 pt-8 border-t border-white/10 space-y-6 animate-in slide-in-from-top-4 duration-300">
                           {loadingInsights[h.id] ? <div className="py-10 text-center animate-pulse text-xs font-bold text-slate-500 uppercase tracking-widest">Consulting Commentary...</div> : aiInsights[h.id] && (
                             <div className="space-y-6">
                               <div className="bg-black/20 p-6 rounded-2xl border border-white/5 italic text-sm md:text-base leading-relaxed text-slate-300">"{aiInsights[h.id].translation}"</div>
                               <div className="space-y-3">
                                 <div className="flex justify-between items-center">
                                   <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Scholarly Explanation & Context</span>
                                   <div className="text-slate-400 hover:text-white transition-colors">
                                     <ShareAction 
                                       variant="minimal"
                                       title="Hadith Insight" 
                                       text={`Insight on Hadith No. ${h.number} (${selectedBook.name}):\n\n"${aiInsights[h.id].translation}"\n\nExplanation: ${aiInsights[h.id].explanation}`} 
                                     />
                                   </div>
                                 </div>
                                 <p className="text-sm md:text-base leading-relaxed text-slate-200 font-medium whitespace-pre-wrap">{aiInsights[h.id].explanation}</p>
                               </div>
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-40 text-center opacity-10 font-arabic text-9xl select-none text-white pointer-events-none">حديث</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HadithModule;
