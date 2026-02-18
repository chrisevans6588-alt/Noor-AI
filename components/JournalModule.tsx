
import React, { useState, useEffect } from 'react';
import { generateJournalAnalysis } from '../services/geminiService';
import { JournalEntry, JournalAnalysis } from '../types';
import { useCredit } from '../services/subscriptionService';
import { auth } from '../services/firebaseClient';
import SubscriptionWall from './SubscriptionWall';

const PROMPTS = [
  "What did you struggle with today?", 
  "Where did you feel closest to Allah?", 
  "What are you grateful for today?", 
  "What tested your patience?",
  "A habit you want to transform?"
];

const JournalModule: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');
  const [currentText, setCurrentText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('noor_journal_entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      if (parsed.length > 0) setSelectedEntry(parsed[0]);
    }
  }, []);

  const handleSaveAndAnalyze = async () => {
    if (!currentText.trim() || currentText.length < 10) return;
    
    const user = auth.currentUser;
    if (!user) return;

    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) {
        setShowPaywall(true);
        return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysis = await generateJournalAnalysis(currentText);
      const newEntry: JournalEntry = { 
        id: Date.now().toString(), 
        date: new Date().toISOString(), 
        prompt: currentPrompt, 
        text: currentText, 
        analysis 
      };
      
      const updated = [newEntry, ...entries];
      setEntries(updated);
      localStorage.setItem('noor_journal_entries', JSON.stringify(updated));
      setSelectedEntry(newEntry);
      setCurrentText('');
      setActiveTab('history');
    } catch (e) {
      console.error("Journal Analysis Error:", e);
      const newEntry: JournalEntry = { id: Date.now().toString(), date: new Date().toISOString(), prompt: currentPrompt, text: currentText };
      const updated = [newEntry, ...entries];
      setEntries(updated);
      localStorage.setItem('noor_journal_entries', JSON.stringify(updated));
      setSelectedEntry(newEntry);
      setCurrentText('');
      setActiveTab('history');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Delete this reflection?")) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('noor_journal_entries', JSON.stringify(updated));
    if (selectedEntry?.id === id) {
      setSelectedEntry(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-24 px-1">
      {showPaywall && <SubscriptionWall featureName="Journal AI Analysis" onSuccess={() => { setShowPaywall(false); window.location.reload(); }} onCancel={() => setShowPaywall(false)} />}
      <header className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-[#E9E5D9] pb-8 px-2">
        <div className="text-center lg:text-left space-y-1">
           <h2 className="text-3xl md:text-5xl font-black text-[#121212] tracking-tightest">Journal AI</h2>
           <p className="text-[#8E8E8E] font-medium text-xs italic">Self-reflection via Prophetic mindfulness.</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-[#E9E5D9] shadow-sm overflow-x-auto no-scrollbar">
           {[
             { id: 'write', label: 'NEW ENTRY', icon: '✍️' },
             { id: 'history', label: 'THE ARCHIVE', icon: '🏛️' }
           ].map(tab => (
             <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#121212] text-white shadow-md' : 'text-[#8E8E8E] active:bg-slate-50'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </header>

      {activeTab === 'write' ? (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-[#E9E5D9] rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 relative overflow-hidden group shadow-sm">
            <div className="relative z-10 space-y-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black uppercase text-[#A68B5B]">Prompt</span>
                   <button onClick={() => setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])} className="text-[9px] font-black text-[#8E8E8E] active:text-[#121212]">Shuffle</button>
                </div>
                <h3 className="text-2xl md:text-5xl font-black tracking-tighter text-[#121212] italic leading-tight">"{currentPrompt}"</h3>
              </div>

              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Write with sincerity..."
                className="w-full min-h-[300px] md:min-h-[400px] bg-[#FBF9F4] border border-[#E9E5D9] rounded-[1.8rem] p-6 md:p-12 text-lg md:text-3xl leading-relaxed text-[#121212] outline-none shadow-inner font-serif"
              />

              <button 
                onClick={handleSaveAndAnalyze} 
                disabled={isAnalyzing || currentText.trim().length < 10} 
                className="w-full bg-[#044E3B] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 transition-all"
              >
                {isAnalyzing ? 'Noor is Reflecting...' : 'Save & Perform Muhasabah'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-[#121212]">Recent Reflections</h3>
                 <span className="text-[9px] font-black text-[#8E8E8E]">{entries.length} Entries</span>
              </div>
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-4 lg:pb-10 lg:max-h-[800px]">
                {entries.length > 0 ? entries.map(entry => (
                  <button 
                    key={entry.id} 
                    onClick={() => setSelectedEntry(entry)} 
                    className={`w-[260px] lg:w-full shrink-0 text-left p-6 rounded-2xl border transition-all flex flex-col gap-2 relative shadow-sm active:scale-95 ${selectedEntry?.id === entry.id ? 'bg-white border-[#A68B5B] ring-2 ring-[#A68B5B]/5' : 'bg-white border-[#E9E5D9] opacity-70'}`}
                  >
                    <span className="text-[8px] font-black uppercase text-[#8E8E8E]">{new Date(entry.date).toLocaleDateString()}</span>
                    <h4 className="font-black text-sm md:text-base leading-tight truncate w-full">"{entry.text}"</h4>
                    <div className="flex gap-1">
                       {entry.analysis?.themes.slice(0, 1).map((t, i) => (
                         <span key={i} className="text-[7px] font-black uppercase bg-[#FBF9F4] px-1.5 py-0.5 rounded border border-[#E9E5D9] text-[#8E8E8E]">#{t}</span>
                       ))}
                    </div>
                  </button>
                )) : (
                  <div className="py-20 text-center opacity-20 w-full">
                     <p className="font-black uppercase text-[9px] tracking-widest">Archive is empty.</p>
                  </div>
                )}
              </div>
           </div>

           <div className="lg:col-span-8">
            {selectedEntry ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-400">
                <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border border-[#E9E5D9] shadow-sm p-6 md:p-16 space-y-10 relative overflow-hidden">
                  <div className="flex justify-between items-start border-b border-[#E9E5D9]/50 pb-6 relative z-10">
                    <div>
                      <span className="text-[8px] font-black uppercase text-[#A68B5B] mb-1 block">{new Date(selectedEntry.date).toLocaleDateString()} • {selectedEntry.prompt}</span>
                      <h3 className="text-xl md:text-4xl font-black text-[#121212] tracking-tighter">Muhasabah Results</h3>
                    </div>
                    <button onClick={() => deleteEntry(selectedEntry.id)} className="p-2 text-rose-300 active:text-rose-600 active:scale-90">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <p className="text-lg md:text-3xl text-[#3D3D3D] font-medium leading-relaxed italic font-serif relative z-10">
                    "{selectedEntry.text}"
                  </p>

                  {selectedEntry.analysis ? (
                    <div className="space-y-8 pt-8 border-t border-[#E9E5D9]/50 relative z-10">
                       <div className="flex flex-wrap gap-1.5">
                          {selectedEntry.analysis.themes.map((theme, i) => (
                            <span key={i} className="px-3 py-1 bg-[#FBF9F4] border border-[#E9E5D9] text-[#121212] rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">#{theme}</span>
                          ))}
                       </div>

                       <div className="bg-[#FBF9F4] p-6 md:p-12 rounded-[2rem] border border-[#E9E5D9] space-y-4">
                          <h5 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-[#121212]">Heart's Insight</h5>
                          <p className="text-sm md:text-2xl text-[#3D3D3D] font-medium leading-relaxed">{selectedEntry.analysis.insight}</p>
                       </div>

                       <div className="bg-[#121212] p-6 md:p-12 rounded-[2rem] text-white shadow-xl space-y-3">
                          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400">Path to Elevation</span>
                          <h5 className="text-xl md:text-4xl font-black tracking-tight leading-tight italic">"{selectedEntry.analysis.spiritualAction}"</h5>
                       </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-[2rem] text-center space-y-4">
                       <p className="text-slate-400 text-xs font-medium">No analysis performed.</p>
                       <button 
                        onClick={async () => {
                           const user = auth.currentUser;
                           if(!user) return;
                           const hasCredit = await useCredit(user.uid);
                           if (!hasCredit) { setShowPaywall(true); return; }

                           setIsAnalyzing(true);
                           const analysis = await generateJournalAnalysis(selectedEntry.text);
                           const updated = entries.map(e => e.id === selectedEntry.id ? { ...e, analysis } : e);
                           setEntries(updated);
                           localStorage.setItem('noor_journal_entries', JSON.stringify(updated));
                           setSelectedEntry({ ...selectedEntry, analysis });
                           setIsAnalyzing(false);
                        }}
                        className="bg-[#121212] text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95"
                       >
                         {isAnalyzing ? '...' : 'Analyze Now'}
                       </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center opacity-20">
                 <p className="text-xl font-black uppercase tracking-widest">Select a reflection</p>
              </div>
            )}
           </div>
        </div>
      )}
    </div>
  );
};

export default JournalModule;
