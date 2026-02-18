
import React, { useState, useEffect } from 'react';
import DhikrCounter from './DhikrCounter';
import PropheticGuidance from './PropheticGuidance';
import QiblaFinder from './QiblaFinder';
import EthicalToolsModule from './EthicalToolsModule';
import HadithVerifier from './HadithVerifier';

interface ToolsModuleProps {
  initialTool?: 'prophetic' | 'qibla' | 'dhikr' | 'ethical' | 'hadith-verify';
}

const ToolsModule: React.FC<ToolsModuleProps> = ({ initialTool }) => {
  const [active, setActive] = useState<'prophetic' | 'qibla' | 'dhikr' | 'ethical' | 'hadith-verify'>(initialTool || 'prophetic');

  useEffect(() => {
    if (initialTool) {
      setActive(initialTool);
    }
  }, [initialTool]);

  const tools = [
    { id: 'prophetic', label: 'Prophetic Advice', icon: '✨', color: 'from-amber-400 to-orange-600', desc: 'Seerah-based solutions' },
    { id: 'hadith-verify', label: 'Hadith Verifier', icon: '📜', color: 'from-emerald-600 to-emerald-900', desc: 'Scholarly Verification' },
    { id: 'qibla', label: 'Qibla Finder', icon: '🧭', color: 'from-emerald-400 to-teal-600', desc: 'Compass & Coordinates' },
    { id: 'dhikr', label: 'Tasbih Counter', icon: '📿', color: 'from-rose-400 to-pink-600', desc: 'Daily Remembrance' },
    { id: 'ethical', label: 'Ethical Scenarios', icon: '⚖️', color: 'from-indigo-400 to-blue-600', desc: 'Maqasid Practice' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#F0EBDD] pb-10">
        <div>
          <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Toolkit</h2>
          <p className="text-[#7A7A7A] font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Essential Utilities For The Seeker</p>
        </div>
        <div className="flex bg-[#F7F5EF] p-1.5 rounded-2xl border border-[#E5E2D8] shadow-inner shrink-0 overflow-x-auto no-scrollbar max-w-full">
          {tools.map(t => (
            <button 
              key={t.id} 
              onClick={() => setActive(t.id as any)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active === t.id ? 'bg-white text-[#C6A85E] shadow-sm' : 'text-[#7A7A7A] hover:text-[#1A1A1A]'}`}
            >
              {t.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {tools.map(tool => (
          <button 
            key={tool.id}
            onClick={() => setActive(tool.id as any)}
            className={`bg-white p-5 md:p-6 rounded-[2rem] border-2 flex flex-col items-center md:items-start gap-4 md:gap-5 transition-all text-center md:text-left group ${active === tool.id ? 'border-[#C6A85E] shadow-xl' : 'border-slate-50 opacity-60 hover:opacity-100'}`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl shadow-lg border border-white/20 shrink-0 transition-transform group-hover:scale-110`}>
              {tool.icon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">{tool.label}</span>
              <p className="text-[9px] font-bold text-[#7A7A7A] uppercase mt-0.5 hidden md:block">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E5E2D8] rounded-[3.5rem] p-6 md:p-10 min-h-[600px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] font-arabic text-[15rem] pointer-events-none">عدة</div>
        <div className="relative z-10">
          {active === 'prophetic' && <PropheticGuidance />}
          {active === 'hadith-verify' && <HadithVerifier />}
          {active === 'qibla' && <QiblaFinder />}
          {active === 'dhikr' && <DhikrCounter />}
          {active === 'ethical' && <EthicalToolsModule />}
        </div>
      </div>
    </div>
  );
};

export default ToolsModule;
