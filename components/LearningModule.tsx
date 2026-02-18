
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fetchSurahList, fetchSurahDetail, fetchAyahTafsir, Surah, Ayah } from '../services/quranApiService';
import { fetchReciters, getAyahAudioUrl, Reciter } from '../services/audioQuranService';
import ShareAction from './ShareAction';
import { useCredit } from '../services/subscriptionService';
import { auth } from '../services/firebaseClient';
import SubscriptionWall from './SubscriptionWall';

// Exact Uthmani Bismillah string used for the header
const BISMILLAH_HEADER = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const stripMarkdown = (text: string) => {
  return text.replace(/[#*`_~\[\]\(\)]/g, '');
};

const normalizeSearchText = (text: string) => {
  return text.toLowerCase().replace(/[-'\s]/g, '');
};

const LearningModule: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>('ar.alafasy');
  
  // Audio State
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [activeTafsir, setActiveTafsir] = useState<{ [key: number]: string }>({});
  const [loadingTafsir, setLoadingTafsir] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'surah' | 'juz'>('surah');
  const [showTranslations, setShowTranslations] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([fetchSurahList(), fetchReciters()])
      .then(([list, recList]) => {
        if (list.length === 0) throw new Error("Unable to load content — please check your connection.");
        setSurahs(list); 
        setReciters(recList); 
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleSurahClick = async (num: number) => {
    setIsLoading(true); 
    setError(null);
    try {
      const detail = await fetchSurahDetail(num);
      setSelectedSurah(detail); 
      setActiveTafsir({}); 
    } catch (e) {
      setError("Unable to load Surah details. Please try again.");
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlayAyah = (gn: number) => {
    // If clicking the same ayah
    if (playingAyah === gn && audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play();
        setIsAudioPlaying(true);
      }
      return;
    }

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Start new audio
    const audio = new Audio(getAyahAudioUrl(selectedReciter, gn));
    audioRef.current = audio;
    setPlayingAyah(gn);
    setIsAudioPlaying(true);

    audio.play().catch(e => {
      console.error("Audio playback failed", e);
      setPlayingAyah(null);
      setIsAudioPlaying(false);
    }); 
    
    audio.onended = () => {
      setPlayingAyah(null);
      setIsAudioPlaying(false);
    };
  };

  const handleTafsir = async (gn: number) => {
    if (activeTafsir[gn]) { 
      const next = { ...activeTafsir }; 
      delete next[gn]; 
      setActiveTafsir(next); 
      return; 
    }

    const user = auth.currentUser;
    if (!user) return;

    // Check Credit
    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) {
      setShowPaywall(true);
      return;
    }

    setLoadingTafsir(gn); 
    const text = await fetchAyahTafsir(gn);
    if (text) {
      setActiveTafsir(prev => ({ ...prev, [gn]: stripMarkdown(text) }));
    } else {
      alert("Tafsir unavailable for this Ayah.");
    }
    setLoadingTafsir(null);
  };

  const getDisplayArabic = (ayah: Ayah) => {
    if (!selectedSurah || !ayah.arabicText) return "";
    
    // Do not strip Bismillah for Surah Fatiha (1) or Tawbah (9)
    if (selectedSurah.number === 1 || selectedSurah.number === 9) {
      return ayah.arabicText;
    }

    // For other Surahs, specifically strip the Bismillah string from Ayah 1
    if (ayah.numberInSurah === 1) {
      let text = ayah.arabicText;
      
      // Known variations of Bismillah in different API encodings
      const variations = [
        "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", // Common Uthmani
        "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", // Alternative Uthmani
        "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", // Simple
        "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"   // Basic
      ];

      // 1. Try exact match removal
      for (const b of variations) {
        if (text.startsWith(b)) {
          return text.replace(b, '').trim();
        }
      }

      // 2. Regex fallback for complex diacritics/spacing
      // Matches start of string -> Bismi ... Raheem -> any spaces
      const regex = /^[\s\u2000-\u206F]*بِسْمِ[\s\S]*?ٱلرَّحِيمِ[\s\u2000-\u206F]*/u;
      if (regex.test(text)) {
         return text.replace(regex, '').trim();
      }
      
      // 3. Fallback: If it starts with 'Ba-Sin-Meem', assume it's Bismillah and cut the first ~39-45 chars if the verse is long enough
      // This is a safety net if encoding is very weird
      if (text.length > 50 && text.startsWith('بِسْمِ')) {
         // Find the first occurrence of Raheem and slice after it
         const endOfBismillah = text.indexOf('ٱلرَّحِيمِ');
         if (endOfBismillah > -1 && endOfBismillah < 50) {
            return text.substring(endOfBismillah + 'ٱلرَّحِيمِ'.length).trim();
         }
      }

      return text;
    }

    return ayah.arabicText;
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return surahs;
    const query = normalizeSearchText(search);
    return surahs.filter(s => {
      const numMatch = s.number.toString() === search;
      const engNameMatch = normalizeSearchText(s.englishName).includes(query);
      const engTransMatch = normalizeSearchText(s.englishNameTranslation).includes(query);
      const arabNameMatch = s.name.includes(search);
      return numMatch || engNameMatch || engTransMatch || arabNameMatch;
    });
  }, [surahs, search]);

  const juzList = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

  if (isLoading && !surahs.length) return (
    <div className="py-40 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-white/10 border-t-emerald-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Unfolding Al-Quran Al-Hakeem...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32 px-1">
      {showPaywall && <SubscriptionWall featureName="Quran Tafsir (Commentary)" onSuccess={() => { setShowPaywall(false); window.location.reload(); }} onCancel={() => setShowPaywall(false)} />}
      
      {!selectedSurah && (
        <div className="space-y-8">
           <header className="flex flex-col lg:flex-row justify-between items-center gap-8 px-2">
              <div className="text-center lg:text-left space-y-1">
                 <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-1.5 h-5 bg-emerald-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em]">The Noble Word</span>
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black text-white tracking-tightest">Al-Quran Al-Hakeem</h2>
                 <p className="text-slate-400 font-medium text-sm md:text-xl italic opacity-70">Study the Wise Quran with scholarly depth.</p>
              </div>
              
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
                 <button onClick={() => setViewMode('surah')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'surah' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>Surah</button>
                 <button onClick={() => setViewMode('juz')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'juz' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>Juz</button>
              </div>
           </header>

           <div className="max-w-xl mx-auto relative group px-2">
             <input 
              type="text" 
              placeholder="Search by name, number, meaning, or Arabic..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full px-10 py-6 rounded-[2.5rem] border border-white/10 bg-white/5 text-white focus:border-gold-primary outline-none shadow-xl transition-all font-bold placeholder:text-slate-500" 
             />
             <svg className="w-6 h-6 absolute right-8 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>

           {viewMode === 'surah' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filtered.map(s => (
                  <button 
                    key={s.number} 
                    onClick={() => handleSurahClick(s.number)} 
                    className="glass-card p-6 md:p-10 rounded-[2.5rem] border border-white/10 hover:border-gold-primary/30 active:scale-[0.98] transition-all text-left flex justify-between items-center group shadow-sm hover:shadow-xl relative overflow-hidden bg-white/5"
                  >
                    <div className="absolute -bottom-1 -right-1 opacity-[0.05] font-arabic text-6xl group-hover:scale-110 transition-transform text-white">{s.name}</div>
                    <div className="flex items-center gap-6 relative z-10">
                      <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-gold-primary text-sm border border-white/10 shadow-inner shrink-0">{s.number}</span>
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl md:text-2xl text-white tracking-tight leading-none group-hover:text-gold-primary transition-colors">{s.englishName}</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{s.englishNameTranslation}</p>
                      </div>
                    </div>
                    <span className="font-arabic text-3xl text-emerald-500 opacity-80 relative z-10 group-hover:opacity-100 transition-opacity">{s.name}</span>
                  </button>
                ))}
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {juzList.map(j => (
                  <button 
                    key={j} 
                    className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-sm flex flex-col items-center gap-2 group hover:border-gold-primary/50 transition-all active:scale-95"
                  >
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Part</span>
                    <span className="text-4xl font-black text-white">{j}</span>
                    <p className="text-[9px] font-black uppercase text-gold-primary opacity-0 group-hover:opacity-100 transition-all">Select Juz</p>
                  </button>
                ))}
             </div>
           )}
        </div>
      )}

      {selectedSurah && (
        <div className="animate-in slide-in-from-right-10 duration-700">
           <div className="sticky top-0 z-[60] bg-[#020405]/95 backdrop-blur-xl border-b border-white/10 py-4 px-4 flex items-center justify-between shadow-sm -mx-1">
              <button onClick={() => setSelectedSurah(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-gold-primary active:scale-95 transition-transform hover:text-white">
                Library
              </button>
              <div className="text-center">
                 <h4 className="text-xs font-black tracking-tight leading-none text-white">{selectedSurah.englishName}</h4>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{selectedSurah.name}</p>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => setShowTranslations(!showTranslations)} className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${showTranslations ? 'bg-white border-white text-black' : 'bg-transparent border-white/20 text-slate-400'}`}>
                    <span className="text-[10px] font-black">EN</span>
                 </button>
                 <select value={selectedReciter} onChange={e => setSelectedReciter(e.target.value)} className="bg-black/50 border border-white/20 text-white px-2 py-1.5 rounded-lg text-[8px] font-bold outline-none max-w-[80px]">
                    {reciters.slice(0, 10).map(r => <option key={r.identifier} value={r.identifier}>{r.englishName.split(' ').pop()}</option>)}
                 </select>
              </div>
           </div>

           <div className="bg-white/5 rounded-[3rem] p-6 md:p-20 border border-white/10 shadow-sm relative overflow-hidden min-h-screen">
              {/* Separate Bismillah Header - Only if not Surah 1 or 9 */}
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <div className="text-center pb-12 mb-12 border-b border-white/5">
                   <p className="font-arabic text-3xl md:text-5xl text-gold-primary/90 leading-relaxed">{BISMILLAH_HEADER}</p>
                </div>
              )}

              <div className="max-w-4xl mx-auto space-y-32 relative z-10">
                {selectedSurah.ayahs?.map((a, i) => (
                  <div key={a.number} className="space-y-12 text-center group">
                    <div className="space-y-12">
                      <p className="font-arabic text-2xl md:text-4xl leading-[2.2] md:leading-[2.4] text-white tracking-normal drop-shadow-sm" dir="rtl">
                        {getDisplayArabic(a)}
                      </p>
                      {showTranslations && (
                        <div className="max-w-3xl mx-auto space-y-6">
                           <p className="text-slate-300 text-lg md:text-xl font-medium tracking-tight leading-relaxed italic opacity-90">
                             "{a.text}"
                           </p>
                           <p className="text-[10px] font-black uppercase text-gold-primary tracking-[0.2em]">
                             {selectedSurah.englishName} • {a.numberInSurah}
                           </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-4">
                       <button 
                        onClick={() => handlePlayAyah(a.number)} 
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${playingAyah === a.number ? 'bg-gold-primary text-black shadow-xl' : 'bg-white/10 text-slate-400 hover:text-white border border-white/10'}`}
                       >
                         {playingAyah === a.number && isAudioPlaying ? (
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                         ) : (
                           <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                         )}
                       </button>

                       <button 
                        onClick={() => handleTafsir(a.number)} 
                        className={`px-10 py-3.5 md:py-4 rounded-2xl flex items-center gap-3 border transition-all ${activeTafsir[a.number] ? 'bg-white text-black shadow-xl border-white' : 'bg-white/5 border-white/10 text-slate-300 hover:border-gold-primary/50 active:scale-95 shadow-sm'}`}
                       >
                         {loadingTafsir === a.number ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <span className="font-bold text-[10px] uppercase tracking-widest">Read Commentary</span>}
                       </button>

                       <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                          <ShareAction 
                            title={`${selectedSurah.englishName} : ${a.numberInSurah}`}
                            text={`${a.arabicText}\n\n"${a.text}"`}
                          />
                       </div>
                    </div>

                    {activeTafsir[a.number] && (
                      <div className="bg-black/30 p-10 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 text-left space-y-10 animate-in slide-in-from-top-6 duration-700 shadow-inner">
                         <div className="text-base md:text-2xl leading-[1.8] text-slate-200 font-medium whitespace-pre-wrap font-serif">
                            {activeTafsir[a.number]}
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LearningModule;
