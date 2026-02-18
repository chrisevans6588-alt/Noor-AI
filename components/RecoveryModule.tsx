
import React, { useState, useEffect } from 'react';
import { generateRecoveryGuidance } from '../services/geminiService';
import { RecoveryContext, RecoveryPlan } from '../types';

const FEELINGS = ['Guilty', 'Ashamed', 'Afraid', 'Numb', 'Repeating'];
const FREQUENCIES = ['First time', 'Occasional', 'Ongoing struggle'];
const NEEDS = ['Immediate dua', 'Tawbah guide', '24h reset', 'Habit strategy'];

const RecoveryModule: React.FC = () => {
  const [step, setStep] = useState(0); 
  const [context, setContext] = useState<RecoveryContext>({
    feeling: 'Guilty',
    frequency: 'First time',
    need: 'Immediate dua'
  });
  const [guidance, setGuidance] = useState<RecoveryPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checklistState, setChecklistState] = useState<boolean[]>([]);
  const [recoveryStreak, setRecoveryStreak] = useState(0);

  useEffect(() => {
    const savedStreak = localStorage.getItem('noor_recovery_streak');
    if (savedStreak) setRecoveryStreak(parseInt(savedStreak));
    const lastSlip = localStorage.getItem('noor_last_slip_date');
    if (lastSlip) {
      const days = Math.floor((new Date().getTime() - new Date(lastSlip).getTime()) / (1000 * 3600 * 24));
      setRecoveryStreak(days);
    }
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    setStep(2);
    localStorage.setItem('noor_last_slip_date', new Date().toISOString());
    setRecoveryStreak(0);
    const result = await generateRecoveryGuidance(context);
    setGuidance(result);
    if (result) setChecklistState(new Array(result.checklist.length).fill(false));
    setIsLoading(false);
    setStep(3);
  };

  const toggleCheck = (idx: number) => {
    const next = [...checklistState];
    next[idx] = !next[idx];
    setChecklistState(next);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[750px] relative rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-[#E5E2D8] animate-in fade-in duration-1000">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCF8] via-white to-[#E6F4EC]/30"></div>
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-[#C6A85E] rounded-full"
            style={{ width: '1px', height: Math.random() * 20 + 10 + 'px', top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', animation: `rain-fall ${Math.random() * 2 + 2}s linear infinite` }}
          ></div>
        ))}
      </div>
      <style>{`@keyframes rain-fall { 0% { transform: translateY(-100px); } 100% { transform: translateY(800px); } }`}</style>

      <div className="relative z-10 p-10 md:p-16 flex flex-col h-full min-h-[750px]">
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in-95">
             <div className="w-28 h-28 bg-[#F7F5EF] rounded-full flex items-center justify-center border border-[#E5E2D8] shadow-sm relative group">
                <div className="absolute inset-0 bg-[#C6A85E]/5 rounded-full blur-2xl animate-pulse"></div>
                <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform">🕊️</span>
             </div>
             <div className="space-y-4 max-w-lg">
                <h2 className="text-5xl font-black text-[#1A1A1A] tracking-tighter">You Fell. But You Are Still Chosen.</h2>
                <p className="text-[#4A4A4A] font-medium text-lg leading-relaxed">Allah's mercy is bigger than your mistake. Let's rebuild your heart with sincerity.</p>
             </div>
             <button 
              onClick={() => setStep(1)}
              className="bg-[#1E8E5F] text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-[#1E8E5F]/20 transition-all flex items-center gap-3 group"
             >
               I Slipped.
               <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
             </button>
             <p className="text-[10px] text-[#7A7A7A] uppercase tracking-[0.4em] font-black">Confidential • Secure Sanctuary</p>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col space-y-10 animate-in slide-in-from-right-10">
            <h3 className="text-3xl font-black text-[#1A1A1A]">Let's reflect, briefly.</h3>
            
            <div className="space-y-8 overflow-y-auto no-scrollbar pr-2 pb-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C6A85E]">How do you feel right now?</label>
                <div className="flex flex-wrap gap-2">
                  {FEELINGS.map(f => (
                    <button 
                      key={f}
                      onClick={() => setContext({...context, feeling: f as any})}
                      className={`px-6 py-3 rounded-2xl font-bold border-2 transition-all shadow-sm ${context.feeling === f ? 'bg-[#FDFCF8] border-[#C6A85E] text-[#1A1A1A]' : 'bg-white border-[#E5E2D8] text-[#7A7A7A] hover:border-[#C6A85E]/50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3B6FF5]">Frequency of this challenge?</label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCIES.map(f => (
                    <button 
                      key={f}
                      onClick={() => setContext({...context, frequency: f as any})}
                      className={`px-6 py-3 rounded-2xl font-bold border-2 transition-all shadow-sm ${context.frequency === f ? 'bg-[#3B6FF5]/5 border-[#3B6FF5] text-[#1A1A1A]' : 'bg-white border-[#E5E2D8] text-[#7A7A7A] hover:border-[#3B6FF5]/50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1E8E5F]">What do you need most?</label>
                <div className="flex flex-wrap gap-2">
                  {NEEDS.map(n => (
                    <button 
                      key={n}
                      onClick={() => setContext({...context, need: n as any})}
                      className={`px-6 py-3 rounded-2xl font-bold border-2 transition-all shadow-sm ${context.need === n ? 'bg-[#E6F4EC] border-[#1E8E5F] text-[#1A1A1A]' : 'bg-white border-[#E5E2D8] text-[#7A7A7A] hover:border-[#1E8E5F]/50'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-[#F0EBDD] mt-auto">
               <button onClick={() => setStep(0)} className="text-[#7A7A7A] font-bold hover:text-[#1A1A1A] transition-colors">Cancel</button>
               <button onClick={handleStart} className="bg-[#C6A85E] text-white px-12 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#C6A85E]/20">Return to Allah</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
             <div className="w-16 h-16 border-4 border-[#F0EBDD] border-t-[#C6A85E] rounded-full animate-spin"></div>
             <p className="text-xl font-black text-[#1A1A1A] animate-pulse uppercase tracking-widest">Building your bridge of mercy...</p>
          </div>
        )}

        {step === 3 && guidance && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-10 pr-2">
            <header className="space-y-4 text-center">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1E8E5F]">Step 1: Reconnect with Hope</span>
               <div className="bg-white border border-[#E5E2D8] p-10 rounded-[3rem] shadow-sm space-y-6">
                  <p className="font-arabic text-3xl leading-[1.8] text-[#1A1A1A]" dir="rtl">{guidance.mercyAyah.arabic}</p>
                  <p className="text-lg text-[#4A4A4A] font-semibold italic">"{guidance.mercyAyah.translation}"</p>
                  <span className="text-[10px] font-black uppercase text-[#7A7A7A] tracking-widest">— {guidance.mercyAyah.reference}</span>
               </div>
               <p className="text-[#1A1A1A] leading-relaxed text-lg pt-4 font-medium italic">"{guidance.reflection}"</p>
            </header>

            <section className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#F0EBDD]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3B6FF5]">Step 2: Structured Tawbah</span>
                  <div className="h-px flex-1 bg-[#F0EBDD]"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guidance.checklist.map((item, i) => (
                    <button key={i} onClick={() => toggleCheck(i)} className={`flex items-start gap-4 p-6 rounded-3xl border-2 transition-all text-left shadow-sm ${checklistState[i] ? 'bg-[#E6F4EC] border-[#1E8E5F] text-[#1A1A1A]' : 'bg-white border-[#E5E2D8] text-[#4A4A4A]'}`}>
                      <div className={`w-6 h-6 rounded-lg border-2 mt-1 flex items-center justify-center shrink-0 ${checklistState[i] ? 'bg-[#1E8E5F] border-[#1E8E5F] text-white' : 'border-[#E5E2D8]'}`}>
                        {checklistState[i] && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="font-bold">{item}</span>
                    </button>
                  ))}
               </div>
            </section>

            <div className="bg-[#FDFCF8] p-10 rounded-[3rem] border border-[#E5E2D8] shadow-sm space-y-6">
              <span className="text-[10px] font-black uppercase text-[#C6A85E] tracking-[0.4em] block text-center">Spiritual Reset Strategy</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(guidance.resetPlan).map(([k, v]) => (
                  <div key={k} className="bg-white p-6 rounded-2xl border border-[#E5E2D8] shadow-sm text-center">
                    <p className="text-[8px] font-black uppercase text-[#7A7A7A] mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-xs font-bold text-[#1A1A1A]">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 flex flex-col items-center gap-6">
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#7A7A7A]">Steadfastness Track</p>
                  <p className="text-3xl font-black text-[#1E8E5F]">{recoveryStreak} Days <span className="text-xs uppercase text-[#7A7A7A]">Since Last Slip</span></p>
               </div>
               <button onClick={() => setStep(0)} className="w-full max-w-sm bg-[#1A1A1A] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">I am Ready to Restart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryModule;
