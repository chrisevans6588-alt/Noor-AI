
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchRadioStations, fetchFavoriteStations, toggleFavoriteStation } from '../services/radioService';
import { generateNoorResponse } from '../services/geminiService';
import { RadioStation } from '../types';
import { auth } from '../services/firebaseClient';

const RadioModule: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const authUser = auth.currentUser;
        setUser(authUser);
        
        const [data, favs] = await Promise.all([
          fetchRadioStations(),
          authUser ? fetchFavoriteStations(authUser.uid) : Promise.resolve([])
        ]);
        
        setStations(data);
        setFavorites(favs);
        
      } catch (err) {
        setError("Unable to load radio stations. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };
    init();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleStationPlay = (station: RadioStation) => {
    if (activeStation?.id === station.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
    } else {
      setError(null);
      retryCountRef.current = 0;
      setActiveStation(station);
      setIsPlaying(true);
      setIsBuffering(true);
      
      if (audioRef.current) {
        audioRef.current.pause();
        if (station.url) {
            audioRef.current.src = station.url;
            audioRef.current.load();
            audioRef.current.play().catch(err => {
              // AbortError is common when switching quickly, ignore it. 
              // Only log if it's a real loading error.
              if (err.name !== 'AbortError') {
                  console.error("Playback error:", err);
                  setError("Stream unavailable. Try another station.");
                  setIsPlaying(false);
                  setIsBuffering(false);
              }
            });
        } else {
            setError("Invalid station URL.");
            setIsPlaying(false);
            setIsBuffering(false);
        }
      }
    }
  };

  const toggleFav = async (station: RadioStation) => {
    if (!user) return;
    const isFav = favorites.includes(station.url);
    try {
      await toggleFavoriteStation(user.uid, station, isFav);
      setFavorites(prev => isFav ? prev.filter(url => url !== station.url) : [...prev, station.url]);
    } catch (err) {
      console.error("Favorite toggle failed");
    }
  };

  const handleSuggestReciter = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const prompt = `Based on the current time (${new Date().toLocaleTimeString()}), suggest one style of Quran recitation or a specific reciter from this list: ${stations.slice(0, 10).map(s => s.reciter).join(', ')}. Provide a 2-sentence spiritual reasoning. No markdown.`;
      const response = await generateNoorResponse(prompt);
      setAiSuggestion(response);
    } catch (err) {
      setAiSuggestion("The Prophet ﷺ said: 'Beautify the Quran with your voices.' Follow your heart's peace.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  if (isLoading) return (
    <div className="py-40 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-[#065F46] rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Syncing Celestial Frequencies...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-40 animate-in fade-in duration-700">
      <audio 
        ref={audioRef} 
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          if (retryCountRef.current < 3 && activeStation?.url) {
            retryCountRef.current++;
            // Small delay before retry
            setTimeout(() => {
                audioRef.current?.load();
                audioRef.current?.play().catch(() => {});
            }, 1000);
          } else {
            setError("Stream unavailable. Try another station.");
            setIsPlaying(false);
            setIsBuffering(false);
          }
        }}
      />

      <header className="flex flex-col lg:flex-row justify-between items-center gap-8 px-2">
        <div className="text-center lg:text-left space-y-1">
           <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full gold-beam"></div>
              <span className="text-[11px] font-black uppercase text-emerald-700 tracking-[0.4em]">Live Sanctuary Radio</span>
           </div>
           <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tightest leading-none">Quran Radio</h2>
           <p className="text-slate-500 font-medium text-sm md:text-xl italic opacity-70">Experience the Noble Word in real-time streams from around the globe.</p>
        </div>

        <div className="flex flex-col items-center gap-4">
           <button 
             onClick={handleSuggestReciter}
             disabled={isAiLoading}
             className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
             {isAiLoading ? '...' : '✨ Suggest a Reciter'}
           </button>
           {aiSuggestion && (
             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-[10px] font-medium text-emerald-800 animate-in slide-in-from-top-2 max-w-xs text-center">
               {aiSuggestion}
             </div>
           )}
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] text-rose-700 flex items-center justify-center gap-4 animate-in shake duration-500">
           <span className="text-2xl">⚠️</span>
           <p className="font-bold text-sm uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* Station Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {stations.map(station => {
          const isCurrent = activeStation?.id === station.id;
          const isFav = favorites.includes(station.url);
          
          return (
            <div 
              key={station.id}
              className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between group h-full relative overflow-hidden ${isCurrent ? 'bg-emerald-950 border-emerald-800 text-white shadow-2xl' : 'bg-white border-slate-100 text-slate-800 hover:border-emerald-200 shadow-sm'}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] font-arabic text-8xl pointer-events-none group-hover:scale-110 transition-transform">سماح</div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`}>{station.country}</span>
                      <h3 className={`text-xl font-black leading-tight ${isCurrent ? 'text-white' : 'text-slate-900'}`}>{station.name}</h3>
                   </div>
                   <button 
                    onClick={() => toggleFav(station)}
                    className={`p-3 rounded-full transition-all ${isFav ? 'text-rose-500' : 'text-slate-300 hover:text-rose-300'}`}
                   >
                     <svg className="w-5 h-5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                   </button>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isCurrent ? 'bg-white/10' : 'bg-slate-50'}`}>🎙️</div>
                   <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>{station.reciter}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-current border-opacity-5 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-3">
                    {isCurrent && isBuffering && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>}
                    <span className="text-[8px] font-black uppercase opacity-40">{station.bitrate || '128k'} HQ Stream</span>
                 </div>
                 <button 
                  onClick={() => handleStationPlay(station)}
                  className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg active:scale-95 transition-all ${isCurrent && isPlaying ? 'bg-white text-emerald-950' : isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-emerald-700'}`}
                 >
                   {isCurrent && isBuffering ? 'Buffering...' : (isCurrent && isPlaying ? 'Pause' : 'Play Now')}
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Player Bar */}
      {activeStation && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-[100] animate-in slide-in-from-bottom-10">
           <div className="bg-slate-900/90 backdrop-blur-2xl text-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-2xl border border-white/10 flex items-center justify-between gap-6 overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: isPlaying ? '100%' : '0%', opacity: isBuffering ? 0.3 : 1 }}></div>
              
              <div className="flex items-center gap-4 flex-1 min-w-0">
                 <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-emerald-600 flex items-center justify-center text-2xl shrink-0 shadow-inner group relative ${isPlaying && !isBuffering ? 'animate-pulse' : ''}`}>
                    🔊
                 </div>
                 <div className="truncate">
                    <h4 className="font-black text-sm md:text-base truncate leading-tight">{activeStation.name}</h4>
                    <p className="text-[8px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-widest truncate">{activeStation.reciter}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4 md:gap-8">
                 <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={volume} 
                      onChange={handleVolumeChange}
                      className="w-24 h-1.5 bg-white/10 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                    />
                 </div>

                 <button 
                  onClick={() => handleStationPlay(activeStation)}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${isPlaying ? 'bg-white text-slate-950' : 'bg-emerald-500 text-white'}`}
                 >
                   {isBuffering ? (
                     <div className="w-6 h-6 border-4 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin"></div>
                   ) : isPlaying ? (
                     <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                   ) : (
                     <svg className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}
      
      <footer className="text-center space-y-6 pt-20 border-t border-slate-100">
         <div className="flex justify-center items-center gap-10 opacity-30">
            <div className="text-center">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Live</p>
               <p className="text-sm font-bold">Real-time Stream</p>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">Encrypted</p>
               <p className="text-sm font-bold">Privacy Secure</p>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1">HQ</p>
               <p className="text-sm font-bold">Lossless Audio</p>
            </div>
         </div>
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Noor Broadcaster • Global Quran Network</p>
      </footer>
    </div>
  );
};

export default RadioModule;
