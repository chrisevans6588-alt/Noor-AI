
import React, { useState, useEffect, useMemo } from 'react';
import { fetchSurahDetail, fetchSurahList, Surah, Ayah } from '../services/quranApiService';
import { getAyahAudioUrl } from '../services/audioQuranService';
import { updateAyahProgress, fetchHifdhProgress, getHifdhMotivation } from '../services/hifdhService';
import { AyahProgress, AyahStatus, HifdhSettings } from '../types';

const HifdhModule: React.FC = () => {
  const [view, setView] = useState<'home' | 'engine' | 'stats' | 'settings'>('home');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [activeAyahIdx, setActiveAyahIdx] = useState(0);
  const [mode, setMode] = useState<'listen' | 'repeat' | 'hide' | 'test'>('listen');
  const [hiddenWordsCount, setHiddenWordsCount] = useState(0);
  const [progress, setProgress] = useState<AyahProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSurahList().then(setSurahs);
    setProgress(fetchHifdhProgress());
    const savedStreak = localStorage.getItem('noor_hifdh_streak');
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.number.toString() === searchTerm
    );
  }, [surahs, searchTerm]);

  const handleSelectSurah = async (num: number) => {
    setIsLoading(true);
    const detail = await fetchSurahDetail(num);
    setSelectedSurah(detail);
    setActiveAyahIdx(0);
    setView('engine');
    setIsLoading(false);
  };

  const handleStatusUpdate = (status: AyahStatus) => {
    if (!selectedSurah || !selectedSurah.ayahs) return;
    const ayah = selectedSurah.ayahs[activeAyahIdx];
    updateAyahProgress(selectedSurah.number, ayah.numberInSurah, status);
    setProgress(fetchHifdhProgress());
    
    // Auto-advance
    if (activeAyahIdx < selectedSurah.ayahs.length - 1) {
      setActiveAyahIdx(activeAyahIdx + 1);
      setHiddenWordsCount(0);
    } else {
      alert("Surah session complete! MashAllah.");
      setView('home');
    }
  };

  const toggleAudio = () => {
    if (!selectedSurah || !selectedSurah.ayahs) return;
    const ayah = selectedSurah.ayahs[activeAyahIdx];
    if (!audioRef.current) {
      audioRef.current = new Audio(getAyahAudioUrl('ar.alafasy', ayah.number));
    } else {
      audioRef.current.src = getAyahAudioUrl('ar.alafasy', ayah.number);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
    audioRef.current.onended = () => setIsPlaying(false);
  };

  const renderHiddenAyah = (text: string) => {
    const words = text.split(' ');
    if (hiddenWordsCount === 0) return text;
    return words.map((w, i) => i < hiddenWordsCount ? '....' : w).join(' ');
  };

  if (isLoading) return (
    <div className="py-40 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-[#E9E5D9] border-t-[#044E3B] rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase text-[#8E8E8E] tracking-widest">Opening the Scrolls...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      {view === 'home' && (
        <div className="space-y-12">
          <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 md:p-12 rounded-[3rem] border border-[#E9E5D9] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-arabic text-[12rem] pointer-events-none">حفظ</div>
            <div className="relative z-10 space-y-4 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-2 h-6 bg-[#044E3B] rounded-full"></div>
                <span className="text-[10px] font-black uppercase text-[#044E3B] tracking-[0.4em]">Memory Architect</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-[#121212] tracking-tightest">Hifdh Hub AI</h2>
              <p className="text-[#8E8E8E] max-w-md font-medium text-sm md:text-lg italic">"{getHifdhMotivation(streak)}"</p>
            </div>
            <div className="bg-[#FBF9F4] p-6 rounded-[2rem] border border-[#E9E5D9] text-center shrink-0">
               <p className="text-[9px] font-black uppercase text-[#8E8E8E] tracking-widest mb-1">Active Streak</p>
               <p className="text-4xl font-black text-[#121212]">{streak} <span className="text-sm text-[#A68B5B]">Days</span></p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-[#121212]">Begin Memorization</h3>
                   <div className="relative w-full md:w-64">
                     <input 
                       type="text" 
                       placeholder="Search Surah..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2 bg-white border border-[#E9E5D9] rounded-xl text-xs font-bold focus:border-[#A68B5B] outline-none"
                     />
                     <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto no-scrollbar pr-2 custom-scroll">
                  {filteredSurahs.map(s => (
                    <button 
                      key={s.number} 
                      onClick={() => handleSelectSurah(s.number)}
                      className="bg-white p-6 rounded-[2rem] border border-[#E9E5D9] hover:border-[#A68B5B] transition-all text-left flex items-center justify-between group shadow-sm active:scale-95"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-[#FBF9F4] border border-[#E9E5D9] flex items-center justify-center font-black text-[#A68B5B] text-xs">{s.number}</span>
                        <div>
                          <h4 className="font-black text-slate-800 leading-none">{s.englishName}</h4>
                          <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">{s.numberOfAyahs} Ayahs</p>
                        </div>
                      </div>
                      <span className="font-arabic text-xl text-[#044E3B] opacity-40 group-hover:opacity-100 transition-opacity">{s.name}</span>
                    </button>
                  ))}
                  {filteredSurahs.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-300 font-bold italic">No Surahs found matching "{searchTerm}"</div>
                  )}
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#121212] px-2">Retention Analytics</h3>
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#E9E5D9] shadow-sm space-y-8">
                   <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-[#8E8E8E] tracking-widest">Mastered Ayahs</p>
                      <div className="flex items-end gap-2">
                         <span className="text-4xl font-black text-emerald-600">{progress.filter(p => p.status === 'Mastered').length}</span>
                         <span className="text-xs font-bold text-slate-400 mb-2">/ 6236</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-emerald-500 h-full" style={{ width: `${(progress.filter(p => p.status === 'Mastered').length / 6236) * 100}%` }}></div>
                      </div>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-slate-50">
                      <p className="text-[9px] font-black uppercase text-[#8E8E8E] tracking-widest">Recent Activity</p>
                      <div className="space-y-2">
                         {progress.slice(-3).reverse().map((p, i) => (
                           <div key={i} className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-600">Surah {p.surahNumber}, Ayah {p.ayahNumber}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase ${p.status === 'Mastered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{p.status}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {view === 'engine' && selectedSurah && selectedSurah.ayahs && (
        <div className="fixed inset-0 z-[100] bg-[#FBF9F4] flex flex-col animate-in fade-in duration-500">
           <header className="h-20 border-b border-[#E9E5D9] bg-white px-8 flex items-center justify-between">
              <button onClick={() => setView('home')} className="text-[10px] font-black uppercase text-[#8E8E8E] flex items-center gap-2">
                 <span className="text-xl">←</span> End Session
              </button>
              <div className="text-center">
                 <h3 className="font-black text-slate-800 leading-none">{selectedSurah.englishName}</h3>
                 <p className="text-[8px] font-black text-[#A68B5B] uppercase tracking-widest mt-1">Ayah {selectedSurah.ayahs[activeAyahIdx].numberInSurah} of {selectedSurah.numberOfAyahs}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-white text-xs font-black">
                 {Math.round(((activeAyahIdx + 1) / selectedSurah.numberOfAyahs) * 100)}%
              </div>
           </header>

           <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 md:p-12 space-y-12">
              <div className="max-w-4xl w-full space-y-16 text-center">
                 <div className="space-y-8">
                    <p className="font-arabic text-4xl md:text-7xl leading-[2.5] md:leading-[2.2] text-[#121212] tracking-normal" dir="rtl">
                      {mode === 'hide' ? renderHiddenAyah(selectedSurah.ayahs[activeAyahIdx].arabicText || '') : selectedSurah.ayahs[activeAyahIdx].arabicText}
                    </p>
                    <p className="text-[#8E8E8E] text-lg md:text-2xl font-medium italic opacity-60">
                       "{selectedSurah.ayahs[activeAyahIdx].text}"
                    </p>
                 </div>

                 <div className="flex flex-wrap justify-center gap-4">
                    {[
                      { id: 'listen', label: 'Listen', icon: '🔊' },
                      { id: 'hide', label: 'Conceal', icon: '🙈' },
                      { id: 'repeat', label: 'Repeat', icon: '🔄' },
                      { id: 'test', label: 'Verify', icon: '🎯' }
                    ].map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => { setMode(m.id as any); setHiddenWordsCount(0); }}
                        className={`px-8 py-4 rounded-2xl border-2 transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest ${mode === m.id ? 'bg-[#121212] border-[#121212] text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                         <span>{m.icon}</span> {m.label}
                      </button>
                    ))}
                 </div>
              </div>
           </main>

           <footer className="bg-white border-t border-[#E9E5D9] p-6 md:p-8">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                 {mode === 'hide' ? (
                   <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto">
                      <button onClick={() => setHiddenWordsCount(Math.max(0, hiddenWordsCount - 1))} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold shadow-sm">-</button>
                      <div className="px-4 text-center">
                         <p className="text-[8px] font-black uppercase text-slate-400">Words Hidden</p>
                         <p className="text-xl font-black text-slate-800">{hiddenWordsCount}</p>
                      </div>
                      <button onClick={() => setHiddenWordsCount(hiddenWordsCount + 1)} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold shadow-sm">+</button>
                   </div>
                 ) : (
                   <button onClick={toggleAudio} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isPlaying ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
                      {isPlaying ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                   </button>
                 )}

                 <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => handleStatusUpdate('Needs Revision')} className="flex-1 md:flex-none px-6 py-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all">Struggling</button>
                    <button onClick={() => handleStatusUpdate('Memorized')} className="flex-1 md:flex-none px-10 py-4 bg-[#121212] text-white rounded-2xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all shadow-xl">Mark Memorized</button>
                    <button onClick={() => handleStatusUpdate('Mastered')} className="flex-1 md:flex-none px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all shadow-lg">Mastered</button>
                 </div>
              </div>
           </footer>
        </div>
      )}
    </div>
  );
};

export default HifdhModule;
