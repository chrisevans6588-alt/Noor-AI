
import React, { useState, useEffect } from 'react';
import { DhikrEntry } from '../types';

const PRESETS = [
  { arabic: 'سُبْحَانَ ٱللَّٰهِ', trans: 'SubhanAllah', target: 33 },
  { arabic: 'ٱلْحَمْدُ لِلَّٰهِ', trans: 'Alhamdulillah', target: 33 },
  { arabic: 'ٱللَّٰهُ أَكْبَرُ', trans: 'Allahu Akbar', target: 34 },
];

const DhikrCounter: React.FC = () => {
  const [active, setActive] = useState(PRESETS[0]);
  const [count, setCount] = useState(0);
  const [isPressing, setIsPressing] = useState(false);

  const handleIncrement = () => {
    setIsPressing(true);
    setCount(c => c + 1);
    setTimeout(() => setIsPressing(false), 100);
  };

  const handleReset = () => setCount(0);

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-10">
      <div className="flex gap-4">
        {PRESETS.map(p => (
          <button 
            key={p.trans} 
            onClick={() => { setActive(p); handleReset(); }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active.trans === p.trans ? 'bg-emerald-600 text-white' : 'glass-panel text-slate-500'}`}
          >
            {p.trans}
          </button>
        ))}
      </div>

      <div className="relative group">
        <div className={`absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
        <button 
          onClick={handleIncrement}
          className={`relative w-80 h-80 rounded-full glass-panel border-white/10 flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 ${isPressing ? 'scale-105 border-emerald-500/50' : ''}`}
        >
          <span className="text-8xl font-black text-white tracking-tighter">{count}</span>
          <p className="text-emerald-400 font-arabic text-2xl mt-4">{active.arabic}</p>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-6">TAP TO COUNT</span>
        </button>
      </div>

      <div className="flex gap-6 w-full max-w-sm">
        <button onClick={handleReset} className="flex-1 py-4 glass-panel rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Session</button>
        <div className="flex-1 py-4 glass-panel border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1">Target</span>
          <span className="text-xl font-black text-white">{active.target}</span>
        </div>
      </div>
    </div>
  );
};

export default DhikrCounter;
