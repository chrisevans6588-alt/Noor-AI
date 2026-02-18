
import React, { useState, useEffect } from 'react';
import { fetchSunnahLibrary, getDailySunnah } from '../services/sunnahService';
import { SunnahPractice, AppState } from '../types';

interface Props {
  onNavigate: (tab: AppState) => void;
}

const SunnahDashboardWidget: React.FC<Props> = ({ onNavigate }) => {
  const [daily, setDaily] = useState<SunnahPractice | null>(null);

  useEffect(() => {
    fetchSunnahLibrary().then(lib => {
      setDaily(getDailySunnah(lib));
    });
  }, []);

  if (!daily) return null;

  return (
    <button 
      onClick={() => onNavigate(AppState.Sunnah)}
      className="w-full glass-card p-6 md:p-10 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative active:scale-[0.98] transition-all text-left"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] font-arabic text-8xl pointer-events-none group-hover:scale-110 transition-transform duration-1000">سنة</div>
      <div className="flex gap-8 items-center relative z-10">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] bg-[#044E3B]/5 text-[#044E3B] flex items-center justify-center text-3xl md:text-4xl shadow-inner border border-[#044E3B]/10 group-hover:bg-[#044E3B] group-hover:text-white transition-all duration-500">
          🌿
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase text-[#044E3B] tracking-[0.4em] opacity-60">Daily Sunnah</span>
          <h4 className="text-2xl md:text-4xl font-black text-[#121212] tracking-tighter leading-none group-hover:text-[#A68B5B] transition-colors">{daily.title}</h4>
          <p className="text-xs md:text-base text-[#8E8E8E] font-medium line-clamp-1 italic">"{daily.description}"</p>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-4">
         <span className="text-[10px] font-black uppercase text-[#8E8E8E] tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">Practice Now</span>
         <div className="w-10 h-10 rounded-full bg-[#FBF9F4] border border-[#E9E5D9] flex items-center justify-center text-[#8E8E8E] group-hover:bg-[#121212] group-hover:text-white group-hover:border-[#121212] transition-all shadow-sm">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
         </div>
      </div>
    </button>
  );
};

export default SunnahDashboardWidget;
