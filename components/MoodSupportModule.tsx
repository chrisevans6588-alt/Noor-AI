
import React, { useState } from 'react';
import { generateMoodSupport } from '../services/geminiService';
import { MoodSupportResult } from '../types';
import ShareAction from './ShareAction';

const EMOTIONS = [
  { id: 'anxious', label: 'Anxious', icon: '🍃' },
  { id: 'sad', label: 'Sad', icon: '🌧️' },
  { id: 'grateful', label: 'Grateful', icon: '✨' },
  { id: 'stressed', label: 'Stressed', icon: '⚖️' },
  { id: 'lonely', label: 'Lonely', icon: '👤' },
  { id: 'searching', label: 'Searching', icon: '🧭' },
];

const MoodSupportModule: React.FC = () => {
  const [support, setSupport] = useState<MoodSupportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmotionClick = async (emotion: string) => {
    setIsLoading(true);
    try {
      const result = await generateMoodSupport(emotion);
      setSupport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#FBF9F4] border border-[#E9E5D9] rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-sm">🕊️</div>
        <h2 className="text-4xl md:text-6xl font-black text-[#121212] tracking-tightest">Sanctuary of the Heart</h2>
        <p className="text-[#8E8E8E] max-w-lg mx-auto font-medium text-lg italic">"Verily, in the remembrance of Allah do hearts find rest."</p>
      </header>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-[#E9E5D9] shadow-xl space-y-10">
        <div className="space-y-6">
           <h3 className="text-center text-[10px] font-black uppercase text-[#A68B5B] tracking-[0.4em]">How is your heart feeling right now?</h3>
           <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {EMOTIONS.map(e => (
                <button 
                  key={e.id}
                  onClick={() => handleEmotionClick(e.label)}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-[#E9E5D9] bg-[#FBF9F4] hover:bg-white hover:border-[#A68B5B] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="text-3xl">{e.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#121212]">{e.label}</span>
                </button>
              ))}
           </div>
        </div>

        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-6">
             <div className="w-12 h-12 border-4 border-slate-100 border-t-[#A68B5B] rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase text-[#8E8E8E] tracking-widest animate-pulse">Invoking Peace...</p>
          </div>
        )}

        {support && !isLoading && (
          <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
             <div className="bg-[#FDFCF8] p-8 md:p-12 rounded-[2.5rem] border border-[#E9E5D9] space-y-6 text-center">
                <span className="text-[9px] font-black uppercase text-[#A68B5B] tracking-widest">Spiritual Counsel</span>
                <p className="text-xl md:text-3xl text-[#121212] font-medium leading-relaxed italic whitespace-pre-wrap">"{support.advice}"</p>
             </div>

             <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase text-[#A68B5B] tracking-[0.4em] border-b border-[#E9E5D9] pb-4">Divine Words of Solace</h4>
                {support.verses.map((v, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-[#E9E5D9] shadow-sm space-y-6 text-right">
                     <p className="font-arabic text-3xl md:text-5xl leading-[1.8] text-[#121212]" dir="rtl">{v.arabic}</p>
                     <div className="text-left space-y-3">
                        <p className="text-xs font-black text-[#A68B5B] uppercase tracking-widest">{v.transliteration}</p>
                        <p className="text-lg md:text-2xl font-medium text-[#3D3D3D] italic">"{v.translation}"</p>
                        <p className="text-[9px] font-black uppercase text-[#8E8E8E]">— {v.reference}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase text-[#A68B5B] tracking-[0.4em] border-b border-[#E9E5D9] pb-4">Prophetic Supplications</h4>
                {support.duas.map((d, i) => (
                  <div key={i} className="bg-emerald-50/30 p-8 rounded-[2rem] border border-emerald-100 shadow-sm space-y-6">
                     <h5 className="text-xl font-black text-[#121212]">{d.title}</h5>
                     <p className="font-arabic text-3xl text-right leading-[1.8] text-[#121212]" dir="rtl">{d.arabic}</p>
                     <div className="space-y-3">
                        <p className="text-xs font-black text-[#044E3B] uppercase tracking-widest">{d.transliteration}</p>
                        <p className="text-lg md:text-2xl font-medium text-[#3D3D3D] italic">"{d.translation}"</p>
                        <p className="text-[9px] font-black uppercase text-[#8E8E8E]">— {d.reference}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="p-8 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-[9px] font-black text-rose-800 uppercase tracking-widest mb-2">Notice of Spiritual Wellbeing</p>
                <p className="text-xs text-rose-700 leading-relaxed font-medium">These suggestions are provided for spiritual comfort and elevation. They are not a substitute for professional clinical mental health counseling or medical intervention. If you are in immediate distress or crisis, please contact your local mental health emergency services or a qualified professional.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodSupportModule;
