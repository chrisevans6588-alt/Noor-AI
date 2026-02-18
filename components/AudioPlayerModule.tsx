
import React, { useState, useEffect, useRef } from 'react';
import { fetchReciters, getAyahAudioUrl, Reciter } from '../services/audioQuranService';
import { fetchSurahList, fetchSurahDetail, Surah, Ayah } from '../services/quranApiService';

const AudioPlayerModule: React.FC = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [surahDetails, setSurahDetails] = useState<Ayah[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVersesLoading, setIsVersesLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    Promise.all([fetchReciters(), fetchSurahList()]).then(([r, s]) => {
      setReciters(r); setSurahs(s); setSelectedReciter(r.find(x => x.identifier === 'ar.alafasy') || r[0]); setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedSurah) {
      setIsVersesLoading(true);
      fetchSurahDetail(selectedSurah.number).then(d => { setSurahDetails(d.ayahs || []); setActiveAyahIndex(0); setIsVersesLoading(false); });
    }
  }, [selectedSurah]);

  useEffect(() => {
    if (audioRef.current && selectedReciter && selectedSurah && activeAyahIndex !== null && surahDetails[activeAyahIndex]) {
      const current = surahDetails[activeAyahIndex];
      audioRef.current.src = getAyahAudioUrl(selectedReciter.identifier, current.number);
      if (isPlaying) audioRef.current.play();
      const el = document.getElementById(`audio-ayah-${current.numberInSurah}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeAyahIndex, selectedReciter, selectedSurah]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (activeAyahIndex === null) setActiveAyahIndex(0);
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleAyahEnded = () => {
    if (activeAyahIndex !== null && activeAyahIndex < surahDetails.length - 1) setActiveAyahIndex(activeAyahIndex + 1);
    else { setIsPlaying(false); setActiveAyahIndex(0); }
  };

  if (isLoading) return <div className="py-40 text-center animate-spin">⌛</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Reciters scrollable on mobile */}
        <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-[300px] lg:h-[600px] flex flex-col">
          <div className="p-5 bg-emerald-900 text-white font-bold text-sm">Reciters</div>
          <div className="flex-1 overflow-y-auto scroll-container p-3 space-y-1">
            {reciters.slice(0, 30).map(r => (
              <button key={r.identifier} onClick={() => setSelectedReciter(r)} className={`w-full text-left p-3 rounded-xl transition-all text-xs border ${selectedReciter?.identifier === r.identifier ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'border-transparent text-slate-500'}`}>
                {r.englishName}
              </button>
            ))}
          </div>
        </div>

        {/* Surahs scrollable on mobile */}
        <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-[300px] lg:h-[600px] flex flex-col">
          <div className="p-5 bg-slate-50 font-bold text-sm text-slate-800 border-b border-slate-100">Surahs</div>
          <div className="flex-1 overflow-y-auto scroll-container p-3 space-y-1">
            {surahs.map(s => (
              <button key={s.number} onClick={() => setSelectedSurah(s)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${selectedSurah?.number === s.number ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-transparent text-slate-700'}`}>
                <span className="text-xs font-bold">{s.number}. {s.englishName}</span>
                <span className="font-arabic text-lg opacity-80">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Follow Along Section */}
        <div className="lg:col-span-6 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px] lg:h-[600px]">
          <div className="p-5 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-800">Recitation Follow-Along</div>
          <div className="flex-1 overflow-y-auto scroll-container p-6 space-y-8 no-scrollbar">
            {isVersesLoading ? <div className="py-20 text-center animate-pulse">Syncing...</div> : surahDetails.map((a, i) => (
              <div key={a.number} id={`audio-ayah-${a.numberInSurah}`} className={`text-center space-y-4 transition-opacity ${activeAyahIndex === i ? 'opacity-100' : 'opacity-30'}`}>
                <p className="font-arabic text-2xl md:text-4xl leading-loose" dir="rtl">{a.arabicText}</p>
                <p className="text-xs md:text-sm italic text-slate-500">"{a.text}"</p>
              </div>
            ))}
            {!selectedSurah && <div className="h-full flex items-center justify-center opacity-20 text-center font-bold">Select a surah to begin</div>}
          </div>
        </div>
      </div>

      {selectedSurah && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-[100] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 shadow-2xl border border-white/10 backdrop-blur-xl">
            <audio ref={audioRef} onEnded={handleAyahEnded} />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-lg md:rounded-2xl flex items-center justify-center font-black shrink-0">{selectedSurah.number}</div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-sm md:text-base truncate">{selectedSurah.englishName}</h4>
                  <p className="text-[8px] md:text-[9px] text-emerald-400 font-bold uppercase truncate">Ayah {activeAyahIndex !== null ? surahDetails[activeAyahIndex]?.numberInSurah : '1'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveAyahIndex(Math.max(0, (activeAyahIndex || 0) - 1))} className="p-2 opacity-50 active:opacity-100"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                <button onClick={togglePlay} className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                  {isPlaying ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                </button>
                <button onClick={() => setActiveAyahIndex(Math.min(surahDetails.length - 1, (activeAyahIndex || 0) + 1))} className="p-2 opacity-50 active:opacity-100"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayerModule;
