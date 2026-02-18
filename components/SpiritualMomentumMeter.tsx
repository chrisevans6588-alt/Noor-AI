
import React, { useEffect, useState } from 'react';
import { RamadanMomentum } from '../types';

interface Props {
  momentum: RamadanMomentum;
}

const SpiritualMomentumMeter: React.FC<Props> = ({ momentum }) => {
  const [fillHeight, setFillHeight] = useState(0);

  useEffect(() => {
    // Animation effect on mount or update
    setTimeout(() => setFillHeight(momentum.currentLevel), 100);
  }, [momentum.currentLevel]);

  return (
    <div className="relative group">
      {/* Container */}
      <div className="w-16 h-48 bg-slate-950/50 rounded-full border-2 border-white/10 relative overflow-hidden backdrop-blur-sm shadow-2xl">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        {/* Liquid Fill */}
        <div 
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-emerald-600 via-emerald-400 to-amber-300 transition-all duration-1000 ease-out"
          style={{ height: `${fillHeight}%` }}
        >
          {/* Bubbles Effect */}
          <div className="absolute top-0 left-0 w-full h-2 bg-white/50 blur-sm animate-pulse"></div>
        </div>

        {/* Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Glow Effect based on level */}
      <div 
        className="absolute inset-0 rounded-full blur-[20px] transition-opacity duration-1000 -z-10"
        style={{ 
          background: momentum.currentLevel > 80 ? 'rgba(251, 191, 36, 0.4)' : 'rgba(16, 185, 129, 0.2)',
          opacity: momentum.currentLevel / 100 
        }}
      ></div>

      {/* Tooltip / Status */}
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/10 p-3 rounded-xl shadow-xl z-20">
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Spiritual Momentum</p>
        <p className="text-xl font-black text-white">{Math.round(momentum.currentLevel)}%</p>
        <p className="text-[9px] text-emerald-400 mt-1">Multiplier: {momentum.multiplier}x</p>
      </div>

      {/* Unlock Indicator */}
      {momentum.currentLevel >= 100 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs shadow-lg animate-bounce z-10">
          🔓
        </div>
      )}
    </div>
  );
};

export default SpiritualMomentumMeter;
