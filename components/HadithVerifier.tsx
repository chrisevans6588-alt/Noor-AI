
import React, { useState } from 'react';
import { verifyTraditionScholarly } from '../services/geminiService';
import ShareAction from './ShareAction';

const HadithVerifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const output = await verifyTraditionScholarly(input);
      setResult(output);
    } catch (err) {
      console.error(err);
      setResult("Scholarly systems are momentarily offline. Please refer to authentic collections directly.");
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setInput('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-950 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <span className="font-arabic text-8xl">مخطوطة</span>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-amber-400 rounded-full"></div>
             <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.4em]">Scholarly Verification Engine</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Hadith Verifier</h2>
          <p className="text-emerald-100/60 text-lg max-w-xl leading-relaxed">
            Submit a narration or text for deep-layered verification of its Isnad (chain), Matn (text), and historical Seerah context.
          </p>
        </div>
      </div>

      {!result && (
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-800">Paste tradition text</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Whoever builds a mosque for Allah...'"
              className="w-full min-h-[180px] p-8 bg-[#FBF9F4] border border-slate-200 rounded-[2rem] text-xl font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all resize-none shadow-inner"
            />
          </div>
          <button 
            onClick={handleVerify}
            disabled={!input.trim() || isLoading}
            className="w-full bg-emerald-800 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Repositories...
              </>
            ) : (
              <>
                Deep-Verify Tradition
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </>
            )}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
           <div className="bg-[#fdfcf8] border border-[#e5e1d3] rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
              
              <div className="relative p-10 md:p-16 space-y-12">
                 <header className="flex justify-between items-center border-b border-amber-200 pb-8">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-[0.4em]">Verification Result</span>
                      <h3 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter">Scholarly Audit</h3>
                    </div>
                    <div className="flex gap-2">
                       <ShareAction 
                        title="Hadith Verification" 
                        text={`Verification Result for: "${input.substring(0, 50)}..."\n\n${result}`} 
                       />
                       <button onClick={clear} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">×</button>
                    </div>
                 </header>

                 <div className="prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap leading-loose text-slate-700 text-lg md:text-2xl font-serif tracking-wide">
                      {result}
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em]">NOOR VERIFICATION ENGINE • AHLUS SUNNAH STANDARDS</p>
                 </div>
              </div>
           </div>
           
           <div className="flex justify-center">
              <button onClick={clear} className="text-[#8E8E8E] font-black uppercase text-[10px] tracking-widest hover:text-emerald-800">Verify Another Narration</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default HadithVerifier;
