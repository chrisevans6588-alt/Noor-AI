
import React, { useState, useEffect, useRef } from 'react';
import { fetchPrayerTimes } from '../services/islamicApiService';

interface Props {
  children: React.ReactNode;
  isActive: boolean;
}

const RamadanThemeWrapper: React.FC<Props> = ({ children, isActive }) => {
  const [isNight, setIsNight] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.2);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Time detection for visual theme
  useEffect(() => {
    if (!isActive) return;

    const checkTime = async () => {
      // Get location or default
      const coords = { lat: 21.4225, lng: 39.8262 }; 
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => 
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
        );
        coords.lat = position.coords.latitude;
        coords.lng = position.coords.longitude;
      } catch (e) {}

      const data = await fetchPrayerTimes(coords.lat, coords.lng);
      if (data) {
        const now = new Date();
        const maghrib = new Date();
        const [h, m] = data.timings.Maghrib.split(':').map(Number);
        maghrib.setHours(h, m, 0);
        
        const fajr = new Date();
        const [fh, fm] = data.timings.Fajr.split(':').map(Number);
        fajr.setHours(fh, fm, 0);
        
        // If now is after Maghrib AND before Fajr next day (simplified logic)
        setIsNight(now >= maghrib || now < fajr);
      }
    };
    checkTime();
  }, [isActive]);

  // Audio Logic
  useEffect(() => {
    if (!isActive) return;
    
    // Define a valid ambient source or leave empty to prevent errors.
    // Current valid source not available, disabling auto-load to fix console error.
    const AMBIENT_SOURCE = ''; 

    if (audioEnabled && AMBIENT_SOURCE) {
      if (!audioRef.current) {
        audioRef.current = new Audio(AMBIENT_SOURCE);
        audioRef.current.loop = true;
        // Add error listener to catch load failures gracefully
        audioRef.current.onerror = () => {
            console.debug("Ambient audio failed to load or source is restricted.");
            setAudioEnabled(false);
        };
      }
      audioRef.current.volume = audioVolume;
      audioRef.current.play().catch(() => {
          // Silent catch for autoplay blocks or interruptions
          setAudioEnabled(false);
      });
    } else {
      audioRef.current?.pause();
    }
    return () => { audioRef.current?.pause(); };
  }, [isActive, audioEnabled, audioVolume]);

  if (!isActive) return <>{children}</>;

  return (
    <div className={`relative min-h-screen transition-colors duration-1000 ${isNight ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-200'}`}>
      {/* Atmospheric Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${isNight ? 'from-slate-950 via-[#0B1026] to-[#1a1005]' : 'from-slate-900 via-emerald-950 to-slate-900'} transition-all duration-1000`}></div>
        
        {/* Stars / Particles (CSS only for performance) */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" style={{ animationDuration: '4s' }}></div>
        
        {/* Lantern Glows */}
        <div className={`absolute top-0 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse ${isNight ? 'opacity-60' : 'opacity-20'}`}></div>
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Ambient Controls - Hidden if no source */}
      {/* 
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2">
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md transition-all ${audioEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-black/20 text-white/40'}`}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
      </div> 
      */}

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default RamadanThemeWrapper;
