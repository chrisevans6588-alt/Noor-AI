
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  fetchDuaLibrary, 
  getDailyDua, 
  searchDuas, 
  toggleFavorite, 
  getFavorites, 
  getRecommendedDuas,
  DUA_CATEGORIES,
  trackRecitation
} from '../services/duaLibraryService';
import { findDuaResearch } from '../services/geminiService';
import { DuaItem } from '../types';
import ShareAction from './ShareAction';
import { auth } from '../services/firebaseClient';

const DuaLibraryModule: React.FC = () => {
  const [library, setLibrary] = useState<DuaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDua, setSelectedDua] = useState<DuaItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isRecitationMode, setIsRecitationMode] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [user, setUser] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const authUser = auth.currentUser;
      setUser(authUser);
      
      const lib = await fetchDuaLibrary();
      setLibrary(lib);
      setFavorites(getFavorites());
      setIsLoading(false);
    };
    init();
  }, []);

  const dailyDua = useMemo(() => library.length > 0 ? getDailyDua(library) : null, [library]);
  const recommendations = useMemo(() => library.length > 0 ? getRecommendedDuas(library) : [], [library]);
  
  const filteredDuas = useMemo(() => {
    if (activeCategory) {
      return library.filter(d => d.category === activeCategory);
    }
    if (searchQuery) {
      return searchDuas(library, searchQuery);
    }
    return [];
  }, [library, activeCategory, searchQuery]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    const result = await findDuaResearch(searchQuery);
    if (result) {
      setSelectedDua(result);
    } else {
      alert("No authentic match found for this specific need. Try different keywords.");
    }
    setIsAiSearching(false);
  };

  const handleToggleFav = async (duaId: string) => {
    const nextIsFav = await toggleFavorite(user?.uid, duaId);
    setFavorites(getFavorites());
  };

  const handleRecited = (duaId: string) => {
    if (user) trackRecitation(user.uid, duaId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Dua text copied to clipboard.");
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <div className="w-12 h-12 border-4 border-[#E9E5D9] border-t-[#A68B5B] rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8E8E8E]">Syncing The Treasury...</p>
    </div>
  );

  if (isRecitationMode && selectedDua) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <button onClick={() => setIsRecitationMode(false)} className="absolute top-10 right-10 p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 active:scale-90 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="max-w-4xl w-full text-center space-y-16">
          <div className="space-y-4">
             <span className="text-[10px] font-black uppercase text-[#A68B5B] tracking-[0.6em]">RECITATION MODE</span>
             <h2 className="text-3xl font-black text-slate-800">{selectedDua.title}</h2>
          </div>
          <div className="space-y-8">
            <p className="font-arabic text-6xl md:text-8xl leading-[1.8] text-[#121212]" dir="rtl">{selectedDua.arabic}</p>
          </div>
          <div className="pt-20">
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Focus on the heart. Breathe. Recite.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      {/* Search Header */}
      <header className="space-y-8 text-center md:text-left">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-3">
             <div className="flex items-center gap-3 justify-center lg:justify-start">
               <div className="w-2 h-6 bg-[#A68B5B] rounded-full gold-beam"></div>
               <span className="text-[11px] font-black uppercase text-[#A68B5B] tracking-[0.4em]">Sacred Supplications</span>
             </div>
             <h2 className="text-4xl md:text-7xl font-black text-[#121212] tracking-tightest leading-none">Dua Hub</h2>
             <p className="text-[#8E8E8E] font-medium text-sm md:text-xl italic opacity-70">A production-grade treasury of authentic Prophetic prayers.</p>
          </div>
          <div className="w-full lg:max-w-md space-y-3 px-2 md:px-0">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search by topic, emotion, or keyword..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); setSelectedDua(null); }}
                className="w-full px-10 py-6 rounded-[2.5rem] border border-[#E9E5D9] bg-white text-[#121212] outline-none focus:border-[#A68B5B] shadow-xl transition-all font-bold placeholder:text-[#E9E5D9] ring-1 ring-inset ring-white/60"
              />
              <svg className="w-6 h-6 absolute right-8 top-1/2 -translate-y-1/2 text-[#A68B5B] opacity-30 group-focus-within:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button 
                onClick={handleAiSearch}
                disabled={isAiSearching}
                className="w-full py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3 transition-all hover:bg-emerald-900 active:scale-95 disabled:opacity-50"
              >
                {isAiSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '🔍 Research Specific Need via AI'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Manager */}
      {selectedDua ? (
        <div className="animate-in zoom-in-95 duration-500">
           <div className="bg-white rounded-[3.5rem] border border-[#E9E5D9] shadow-sm p-6 md:p-20 relative overflow-hidden ring-1 ring-inset ring-white/60">
              <div className="absolute top-0 right-0 p-12 opacity-[0.01] font-arabic text-[30rem] pointer-events-none select-none">دعا</div>
              
              <button 
                onClick={() => setSelectedDua(null)}
                className="text-[#8E8E8E] font-black mb-12 flex items-center gap-2 text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
              >
                <span className="text-xl">←</span> Return to Treasury
              </button>

              <div className="max-w-4xl mx-auto space-y-16 relative z-10">
                 <div className="text-center space-y-6">
                    <div className="flex justify-center gap-3">
                       <span className="px-5 py-2 bg-[#FBF9F4] border border-[#E9E5D9] rounded-2xl text-[9px] font-black uppercase text-[#A68B5B] tracking-widest">{selectedDua.category}</span>
                       <span className={`px-5 py-2 border rounded-2xl text-[9px] font-black uppercase tracking-widest ${selectedDua.authenticity === 'Sahih' || selectedDua.authenticity === 'Quran' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {selectedDua.authenticity}
                       </span>
                    </div>
                    <h3 className="text-3xl md:text-6xl font-black text-[#121212] tracking-tighter leading-tight">{selectedDua.title}</h3>
                    <p className="text-lg md:text-2xl text-slate-500 font-medium italic opacity-80 leading-relaxed">"{selectedDua.whenToSay}"</p>
                 </div>

                 <div className="space-y-12">
                    <p className="font-arabic text-5xl md:text-8xl text-right leading-[1.8] md:leading-[1.6] text-[#121212] tracking-normal" dir="rtl">{selectedDua.arabic}</p>
                    
                    <div className="space-y-8 text-left border-l-2 border-[#E9E5D9] pl-8 md:pl-12">
                       <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-[#A68B5B] tracking-widest">Transliteration</span>
                          <p className="text-sm md:text-lg font-bold text-slate-400 uppercase leading-relaxed tracking-wider">{selectedDua.transliteration}</p>
                       </div>
                       <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-[#A68B5B] tracking-widest">The Meaning</span>
                          <p className="text-xl md:text-3xl font-medium text-[#3D3D3D] leading-relaxed italic">"{selectedDua.translation}"</p>
                       </div>
                       {selectedDua.meaningSummary && (
                          <div className="space-y-2">
                             <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Spiritual Context</span>
                             <p className="text-sm md:text-lg text-slate-600 font-medium leading-relaxed">{selectedDua.meaningSummary}</p>
                          </div>
                       )}
                       <div className="pt-4 flex flex-wrap gap-4 items-center">
                          <span className="text-[9px] font-black uppercase text-slate-300">Reference: {selectedDua.reference}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setIsRecitationMode(true)} className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col items-center gap-3 shadow-xl hover:scale-105 transition-all">
                       <span className="text-2xl">📖</span>
                       <span className="text-[9px] font-black uppercase tracking-widest">Recite Mode</span>
                    </button>
                    <button onClick={() => handleToggleFav(selectedDua.id)} className={`p-6 rounded-3xl flex flex-col items-center gap-3 border transition-all ${favorites.includes(selectedDua.id) ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'}`}>
                       <span className="text-2xl">{favorites.includes(selectedDua.id) ? '❤️' : '🤍'}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest">{favorites.includes(selectedDua.id) ? 'Saved' : 'Save'}</span>
                    </button>
                    <button onClick={() => copyToClipboard(`${selectedDua.arabic}\n\n${selectedDua.translation}`)} className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-3 text-slate-400 hover:border-emerald-200 hover:text-emerald-600 transition-all">
                       <span className="text-2xl">📋</span>
                       <span className="text-[9px] font-black uppercase tracking-widest">Copy Text</span>
                    </button>
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-3">
                       <ShareAction title={selectedDua.title} text={selectedDua.arabic} />
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Spread Barakah</span>
                    </div>
                 </div>

                 <button 
                  onClick={() => { handleRecited(selectedDua.id); setSelectedDua(null); }}
                  className="w-full bg-[#044E3B] text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                 >
                  Log Recitation & Close
                 </button>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured & Daily */}
          {!searchQuery && !activeCategory && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                {dailyDua && (
                  <button 
                    onClick={() => setSelectedDua(dailyDua)}
                    className="w-full bg-[#121212] text-white rounded-[3rem] p-10 md:p-16 text-left relative overflow-hidden group shadow-2xl transition-transform active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--accent-gold-glow),_transparent)] opacity-40"></div>
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-4">
                        <span className="px-5 py-2 bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] border border-white/10 text-amber-400">Highlighted Dua</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">{dailyDua.title}</h3>
                      <p className="font-arabic text-2xl md:text-4xl text-right opacity-80 leading-relaxed" dir="rtl">{dailyDua.arabic.substring(0, 80)}...</p>
                      <div className="flex justify-between items-center pt-8 border-t border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Prophetic Recommendation</span>
                        <span className="text-[10px] font-black uppercase bg-white/5 px-4 py-2 rounded-xl">Study Full Text →</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8E8E8E]">Recommendations</h3>
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {recommendations.map(d => (
                    <button 
                      key={d.id} 
                      onClick={() => setSelectedDua(d)}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 text-left hover:border-[#A68B5B] transition-all group shadow-sm active:scale-95"
                    >
                      <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest mb-1 block">{d.category}</span>
                      <h4 className="font-black text-slate-800 text-lg group-hover:text-[#A68B5B] transition-colors">{d.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 italic mt-1">"{d.translation}"</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          {!selectedDua && !searchQuery && !activeCategory && (
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8E8E8E]">By Divine Station</h3>
                <p className="text-[10px] font-black text-[#A68B5B] uppercase tracking-widest">{DUA_CATEGORIES.length} Categories</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                {DUA_CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className="aspect-square bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all hover:border-[#A68B5B] hover:shadow-xl group active:scale-95 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#FBF9F4] flex items-center justify-center text-3xl shadow-inner group-hover:bg-[#A68B5B]/5 group-hover:scale-110 transition-all duration-500">
                      {cat === 'Morning' ? '🌅' : cat === 'Evening' ? '🌙' : cat === 'Sleep' ? '🛌' : cat === 'Anxiety relief' ? '⚖️' : cat === 'Healing' ? '🧼' : '🤲'}
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase text-slate-800 tracking-widest text-center px-4">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search/Category List Results */}
          {(searchQuery || activeCategory) && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <header className="flex justify-between items-end border-b border-[#E9E5D9] pb-8 px-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#A68B5B] tracking-widest">{searchQuery ? 'Search Query' : 'Category View'}</span>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tightest">{searchQuery || activeCategory}</h3>
                  </div>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                    className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Clear Filter
                  </button>
               </header>

               {filteredDuas.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDuas.map(d => (
                      <button 
                        key={d.id} 
                        onClick={() => setSelectedDua(d)}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-left group hover:border-[#A68B5B] transition-all active:scale-[0.98] shadow-sm relative overflow-hidden h-full flex flex-col justify-between"
                      >
                         <div className="space-y-4">
                            <div className="flex justify-between items-start">
                               <span className="text-[9px] font-black uppercase text-[#A68B5B] tracking-widest">{d.category}</span>
                               {favorites.includes(d.id) && <span className="text-rose-500 text-lg">❤️</span>}
                            </div>
                            <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[#A68B5B] transition-colors">{d.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">"{d.translation}"</p>
                         </div>
                         <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-[8px] font-black uppercase text-slate-300">Ref: {d.reference.split(' ')[0]}</span>
                            <span className="text-[8px] font-black uppercase text-emerald-600">View Ritual →</span>
                         </div>
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="py-40 text-center space-y-8">
                    <div className="text-7xl opacity-10">🕊️</div>
                    <div className="space-y-4">
                       <h4 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Seeking Barakah...</h4>
                       <p className="text-slate-400 max-w-sm mx-auto font-medium">The specific Dua for this category or search isn't in your local cache yet.</p>
                       <button 
                        onClick={handleAiSearch}
                        disabled={isAiSearching || !searchQuery}
                        className="bg-emerald-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all mx-auto"
                       >
                         {isAiSearching ? 'Researching Repositories...' : 'Ask Noor to Find Authentic Match'}
                       </button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      )}

      {/* Analytics/Footer */}
      <footer className="text-center pt-20 border-t border-slate-100 space-y-6">
         <div className="flex justify-center items-center gap-10 opacity-30">
            <div className="text-center">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Authenticated</p>
               <p className="text-sm font-bold">Sahih Sources</p>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Encrypted</p>
               <p className="text-sm font-bold">Privacy First</p>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Offline</p>
               <p className="text-sm font-bold">Secure Cache</p>
            </div>
         </div>
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Noor Treasury • High Fidelity Duas</p>
      </footer>
    </div>
  );
};

export default DuaLibraryModule;
