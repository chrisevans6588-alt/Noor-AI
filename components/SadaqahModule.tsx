
import React, { useState, useEffect } from 'react';
import { generateSadaqahReflection } from '../services/geminiService';
import { SadaqahEntry, SadaqahCategory, SadaqahReflection } from '../types';

const CATEGORIES: { id: SadaqahCategory; label: string; icon: string; desc: string }[] = [
  { id: 'money', label: 'Wealth', icon: '💰', desc: 'Financial aid' },
  { id: 'kindness', label: 'Kindness', icon: '✨', desc: 'Social good' },
  { id: 'food', label: 'Food', icon: '🍞', desc: 'Nourishment' },
  { id: 'forgiveness', label: 'Pardon', icon: '🤝', desc: 'Letting go' },
  { id: 'service', label: 'Service', icon: '👐', desc: 'Physical help' },
  { id: 'fasting', label: 'Fasting', icon: '🌙', desc: 'Spiritual' },
  { id: 'hidden', label: 'Secret', icon: '🤫', desc: 'Anonymous' },
];

const SadaqahModule: React.FC = () => {
  const [entries, setEntries] = useState<SadaqahEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<SadaqahCategory>('money');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState<SadaqahReflection | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('noor_sadaqah_entries');
    if (saved) setEntries(JSON.parse(saved));
    
    const savedPrivacy = localStorage.getItem('noor_sadaqah_privacy');
    if (savedPrivacy) setIsPrivacyMode(JSON.parse(savedPrivacy));
  }, []);

  const handleLog = async () => {
    if (!description.trim()) return;
    setIsLoading(true);

    const newEntry: SadaqahEntry = {
      id: Date.now().toString(),
      category: activeCategory,
      amount: activeCategory === 'money' ? parseFloat(amount) : undefined,
      description,
      timestamp: new Date().toISOString(),
      isPrivacyMode
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('noor_sadaqah_entries', JSON.stringify(updated));

    try {
      const aiReflection = await generateSadaqahReflection(activeCategory, description);
      setReflection(aiReflection);
    } catch (e) {
      console.error("Reflection failed", e);
    } finally {
      setIsLoading(false);
      setAmount('');
      setDescription('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const togglePrivacy = () => {
    const newVal = !isPrivacyMode;
    setIsPrivacyMode(newVal);
    localStorage.setItem('noor_sadaqah_privacy', JSON.stringify(newVal));
  };

  const getTotalMonetary = () => {
    return entries.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Remove this entry from your path logs?")) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('noor_sadaqah_entries', JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 px-4">
      <header className="bg-emerald-950 rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-arabic text-[15rem] select-none pointer-events-none group-hover:scale-105 transition-transform duration-1000">صدقة</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
               <span className="text-amber-400 font-black uppercase tracking-[0.4em] text-[10px]">Silent Path Tracker</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tightest leading-none">Your Sacred Ledger</h2>
              <p className="text-emerald-100/40 text-sm md:text-lg font-medium max-w-sm italic">"Give and it will be given to you."</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-10 shrink-0 shadow-inner">
             <div className="text-center group/stat">
                <p className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mb-1 group-hover:text-white transition-colors">Hidden Deeds</p>
                <p className="text-3xl md:text-4xl font-black">{entries.length}</p>
             </div>
             <div className="w-px h-12 bg-white/10"></div>
             <div className="text-center group/stat">
                <p className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mb-1 group-hover:text-white transition-colors">Total Given</p>
                <p className="text-3xl md:text-4xl font-black tabular-nums">{isPrivacyMode ? '••••' : `$${getTotalMonetary().toLocaleString()}`}</p>
             </div>
          </div>
        </div>
      </header>

      {/* Action Input Area */}
      <div className="bg-white rounded-[3.5rem] p-6 md:p-12 shadow-sm border border-[#E9E5D9] space-y-12 relative overflow-hidden ring-1 ring-inset ring-white/60">
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Mode of Good</h3>
            <span className="text-[10px] font-black text-[#A68B5B] bg-[#A68B5B]/5 px-3 py-1 rounded-full uppercase">Divine Provision</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all group relative ${activeCategory === cat.id ? 'bg-emerald-950 text-white shadow-xl scale-105 ring-4 ring-emerald-950/10' : 'bg-[#FBF9F4] text-slate-400 hover:bg-white hover:border-emerald-200 border border-transparent'}`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest block">{cat.label}</span>
                  <span className={`text-[7px] font-bold uppercase opacity-40 block mt-0.5 ${activeCategory === cat.id ? 'text-emerald-400' : ''}`}>{cat.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
             {activeCategory === 'money' && (
               <div className="relative md:w-44 group">
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-emerald-600 transition-colors">$</span>
                 <input 
                   type="number" 
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   placeholder="0.00"
                   className="w-full pl-12 pr-6 py-6 bg-[#FBF9F4] border border-[#E9E5D9] rounded-[1.8rem] font-black outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-2xl shadow-inner tabular-nums"
                 />
               </div>
             )}
             <div className="flex-1 relative group">
               <input 
                 type="text" 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder={activeCategory === 'money' ? "Who did this help? (Optional description)" : "Describe this private act of worship..."}
                 className="w-full px-8 py-6 bg-[#FBF9F4] border border-[#E9E5D9] rounded-[1.8rem] font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-lg md:text-xl placeholder:text-slate-300 shadow-inner"
               />
               <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">✨</div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <button 
              onClick={togglePrivacy}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-700 transition-all active:scale-95 group"
            >
              <div className={`w-12 h-6 rounded-full relative transition-colors p-1 ${isPrivacyMode ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isPrivacyMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
              <span className={isPrivacyMode ? 'text-emerald-700' : ''}>Confidential Privacy Mode</span>
            </button>

            <button 
              onClick={handleLog}
              disabled={isLoading || !description.trim()}
              className="w-full sm:w-auto bg-emerald-950 text-white px-14 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging Deed...
                </>
              ) : (
                <>
                  Seal Entry
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Reflection Result */}
        {reflection && (
          <div className="mt-12 p-8 md:p-16 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-12 animate-in zoom-in-95 relative overflow-hidden shadow-inner">
             <div className="absolute top-0 right-0 p-10 opacity-[0.08] font-arabic text-8xl md:text-[12rem] select-none pointer-events-none">بركة</div>
             <button onClick={() => setReflection(null)} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-400 hover:text-emerald-900 shadow-sm transition-all active:scale-90">×</button>
             
             <div className="space-y-6 text-center max-w-2xl mx-auto">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.5em] block">Divine Revelation</span>
                <p className="font-arabic text-3xl md:text-5xl leading-[1.8] text-slate-900" dir="rtl">{reflection.ayah.arabic}</p>
                <div className="space-y-2">
                   <p className="text-emerald-900 text-lg md:text-xl font-bold italic leading-relaxed">"{reflection.ayah.translation}"</p>
                   <span className="text-[9px] font-black uppercase text-emerald-600/50 tracking-widest">— {reflection.ayah.reference}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-4">On Sincerity (Ikhlas)</h4>
                   <p className="text-emerald-900 font-medium text-lg leading-relaxed">{reflection.sincerityReminder}</p>
                </div>
                <div className="bg-white/80 backdrop-blur p-8 rounded-[2.5rem] border border-emerald-100/50 shadow-sm space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">🤲</div>
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">A Dua for Your Path</span>
                   </div>
                   <div className="space-y-4">
                      <p className="font-arabic text-2xl text-right leading-loose text-slate-800" dir="rtl">{reflection.dua.arabic}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">{reflection.dua.transliteration}</p>
                      <p className="text-base font-bold text-emerald-900 italic">"{reflection.dua.translation}"</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* History Grid */}
      <div className="space-y-8">
        <div className="flex justify-between items-center px-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sacred History</h3>
           <div className="flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recent Actions</span>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.length > 0 ? entries.map((entry, idx) => (
            <div 
              key={entry.id} 
              className="bg-white p-8 rounded-[3rem] border border-[#E9E5D9] shadow-sm flex items-center gap-8 group hover:border-emerald-500 transition-all animate-in slide-in-from-bottom-4 relative overflow-hidden"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                 {CATEGORIES.find(c => c.id === entry.category)?.icon}
              </div>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FBF9F4] rounded-[1.8rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl shrink-0 group-hover:bg-emerald-50 transition-colors border border-transparent group-hover:border-emerald-100 shadow-inner">
                {CATEGORIES.find(c => c.id === entry.category)?.icon}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#A68B5B]">{entry.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-300">{new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                   </div>
                   <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-600 transition-all p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
                <h4 className="font-black text-slate-900 text-xl md:text-2xl leading-tight truncate">{entry.description}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                   {entry.amount ? (
                     <span className="text-sm font-black text-emerald-600 tracking-tight">{isPrivacyMode ? '•••' : `$${entry.amount.toLocaleString()}`}</span>
                   ) : (
                     <span className="text-[9px] font-black uppercase text-emerald-400">Spiritual Offering</span>
                   )}
                   <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <span className="text-[9px] font-black text-[#A68B5B] uppercase tracking-widest">Locked</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A68B5B] animate-pulse"></div>
                   </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center space-y-6 opacity-20 group">
               <div className="text-8xl grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110">💎</div>
               <p className="font-black uppercase text-sm tracking-[0.4em] text-slate-900">The Ledger is Empty</p>
               <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto italic">"Every good deed is a charity." — Prophetic wisdom</p>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center space-y-6 pt-20 border-t border-[#E9E5D9]">
         <div className="flex justify-center items-center gap-12 opacity-30 group">
            <div className="text-center group-hover:scale-105 transition-transform">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Status</p>
               <p className="text-sm font-black text-slate-900">Encrypted</p>
            </div>
            <div className="text-center group-hover:scale-105 transition-transform">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Method</p>
               <p className="text-sm font-black text-slate-900">Private</p>
            </div>
            <div className="text-center group-hover:scale-105 transition-transform">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Intent</p>
               <p className="text-sm font-black text-slate-900">Lillah</p>
            </div>
         </div>
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">"Wealth is not diminished by Sadaqah."</p>
         <p className="text-[10px] text-slate-400 font-medium italic max-w-lg mx-auto leading-relaxed">Your privacy is our priority. All entries are stored locally on your device or synced securely with your private account. Noor does not share your acts of worship with third parties.</p>
      </footer>
    </div>
  );
};

export default SadaqahModule;
