
import React, { useState, useEffect } from 'react';
import { generateDebtGuidance } from '../services/geminiService';
import { DebtEmotion, DebtGuidance, DebtStats } from '../types';

const EMOTIONS: DebtEmotion[] = ['Overwhelmed', 'Ashamed', 'Afraid', 'Hopeless', 'Calm', 'Motivated'];

const DebtReliefModule: React.FC = () => {
  const [step, setStep] = useState(0); 
  const [sanctuaryTab, setSanctuaryTab] = useState<'guidance' | 'guided' | 'plan'>('guidance');
  const [emotion, setEmotion] = useState<DebtEmotion>('Calm');
  const [guidance, setGuidance] = useState<DebtGuidance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DebtStats>({ totalDebt: 0, repaidAmount: 0, istighfarCount: 0, duaStreak: 0, lastActive: new Date().toISOString() });

  useEffect(() => {
    const saved = localStorage.getItem('noor_debt_stats');
    if (saved) setStats(JSON.parse(saved));
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    setStep(2);
    const result = await generateDebtGuidance(emotion);
    setGuidance(result);
    setIsLoading(false);
    setStep(3);
    const newStats = { ...stats, lastActive: new Date().toISOString() };
    setStats(newStats);
    localStorage.setItem('noor_debt_stats', JSON.stringify(newStats));
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[750px] relative rounded-[3.5rem] overflow-hidden bg-white shadow-2xl border border-[#E5E2D8] animate-in fade-in duration-1000">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCF8] via-white to-[#FDFCF8]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-[#C6A85E]/30 via-[#C6A85E]/5 to-transparent opacity-40"></div>

      <div className="relative z-10 p-8 md:p-14 flex flex-col h-full min-h-[750px] text-[#1A1A1A]">
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-in zoom-in-95">
             <div className="w-24 h-24 bg-[#FDFCF8] border border-[#C6A85E]/30 text-[#C6A85E] rounded-3xl flex items-center justify-center text-4xl shadow-sm relative">
               💰
             </div>
             <div className="space-y-4 max-w-2xl">
                <h2 className="text-5xl font-black tracking-tighter text-[#1A1A1A]">Allah is Ar-Razzaq</h2>
                <p className="text-[#4A4A4A] text-lg font-medium leading-relaxed italic">
                  "And whoever fears Allah - He will make for him a way out, and will provide for him from where he does not expect."
                </p>
             </div>
             <button onClick={() => setStep(1)} className="bg-[#C6A85E] text-white px-14 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-[#C6A85E]/20 hover:scale-105 transition-all">I Am Struggling With Debt</button>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center space-y-12 animate-in slide-in-from-right-10">
            <h3 className="text-4xl font-black text-[#1A1A1A]">How is your debt affecting your heart?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EMOTIONS.map(e => (
                <button key={e} onClick={() => setEmotion(e)} className={`p-8 rounded-[2rem] border-2 transition-all text-left group shadow-sm ${emotion === e ? 'bg-[#FDFCF8] border-[#C6A85E] shadow-md' : 'bg-white border-[#E5E2D8] text-[#7A7A7A] hover:border-[#C6A85E]/50'}`}>
                  <span className="font-black text-xl text-[#1A1A1A]">{e}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-8 border-t border-[#F0EBDD]">
               <button onClick={() => setStep(0)} className="text-[#7A7A7A] font-bold">Cancel</button>
               <button onClick={handleStart} className="bg-[#1A1A1A] text-white px-12 py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl">Enter Sanctuary</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
             <div className="w-16 h-16 border-4 border-[#F0EBDD] border-t-[#C6A85E] rounded-full animate-spin"></div>
             <p className="text-xl font-black text-[#1A1A1A] animate-pulse uppercase tracking-[0.2em]">Invoking Barakah...</p>
          </div>
        )}

        {step === 3 && guidance && (
          <div className="flex-1 flex flex-col space-y-10 animate-in slide-in-from-bottom-10">
            <div className="flex bg-[#F7F5EF] p-1.5 rounded-2xl w-fit mx-auto border border-[#E5E2D8]">
              {[{ id: 'guidance', label: 'Insight', icon: '✨' }, { id: 'guided', label: 'Dua', icon: '🤲' }, { id: 'plan', label: 'Plan', icon: '📅' }].map(tab => (
                <button key={tab.id} onClick={() => setSanctuaryTab(tab.id as any)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${sanctuaryTab === tab.id ? 'bg-[#C6A85E] text-white shadow-lg' : 'text-[#7A7A7A] hover:text-[#1A1A1A]'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              {sanctuaryTab === 'guidance' && (
                <div className="space-y-10">
                  <div className="bg-white border border-[#E5E2D8] p-10 rounded-[3rem] shadow-sm text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-arabic text-8xl text-[#C6A85E]">رزق</div>
                      <p className="font-arabic text-4xl leading-[1.8] text-[#1A1A1A]" dir="rtl">{guidance.comfortAyah.arabic}</p>
                      <p className="text-xl text-[#4A4A4A] font-semibold italic mt-6">"{guidance.comfortAyah.translation}"</p>
                      <span className="text-[10px] font-black uppercase text-[#7A7A7A] mt-4 block">— {guidance.comfortAyah.reference}</span>
                  </div>
                  
                  <div className="bg-[#FDFCF8] border-l-4 border-[#C6A85E] p-10 rounded-r-[2.5rem] shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C6A85E] mb-6">Prophetic Remedy</h4>
                      <p className="font-arabic text-3xl text-right mb-8 leading-loose text-[#1A1A1A]" dir="rtl">{guidance.duaFocus.arabic}</p>
                      <p className="text-sm font-black text-[#1A1A1A] tracking-wider italic">"{guidance.duaFocus.translation}"</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[{ l: "Istighfar", v: stats.istighfarCount }, { l: "Repaid", v: `$${stats.repaidAmount}` }, { l: "State", v: emotion }, { l: "Dua Streak", v: stats.duaStreak }].map(s => (
                       <div key={s.l} className="bg-white p-8 rounded-3xl border border-[#E5E2D8] text-center shadow-sm">
                          <p className="text-[9px] font-black uppercase text-[#7A7A7A] tracking-widest mb-2">{s.l}</p>
                          <p className="text-2xl font-black text-[#1A1A1A]">{s.v}</p>
                       </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Other tabs follow same Sacred Light pattern... */}
            </div>
            
            <footer className="text-center pt-8 border-t border-[#F0EBDD]">
               <button onClick={() => setStep(0)} className="text-[#7A7A7A] hover:text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest">Exit Sanctuary</button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtReliefModule;
