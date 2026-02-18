
import React, { useState } from 'react';
import { generateNoorResponse } from '../services/geminiService';

const CheckInModule: React.FC = () => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({ prayers: [] as string[], mood: '' });
  const [guidance, setGuidance] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const togglePrayer = (p: string) => {
    setResponses(prev => ({
      ...prev,
      prayers: prev.prayers.includes(p) 
        ? prev.prayers.filter(x => x !== p) 
        : [...prev.prayers, p]
    }));
  };

  const getSpiritualAdvice = async () => {
    setIsLoading(true);
    setStep(2);
    try {
      const prompt = `I have completed these prayers today: ${responses.prayers.join(', ') || 'None yet'}. I am feeling ${responses.mood}. Please give me a daily dhikr, a Quranic reflection, a character development focus, and a practical spiritual challenge.`;
      
      const systemInstruction = `You are Noor in 'Daily Spiritual Check-in Mode'. 
      STRICT RULES:
      - NO MARKDOWN: Do not use hashes (#), asterisks (*), underscores (_), or backticks (\`).
      - NO BOLDING: Do not use any symbols for bolding text.
      - NO LIST BULLETS: Avoid using hyphens, dots, or numbers for lists. Use full sentences and clean paragraphs.
      - PLAIN TEXT ONLY: Your response must be clean, readable text that looks like a friendly letter.
      - STRUCTURE: Use clear paragraph breaks between sections.
      - EMPHASIS: Use CAPITAL LETTERS for section headers (e.g., DAILY DHIKR:).`;

      const result = await generateNoorResponse(prompt, systemInstruction);
      setGuidance(result || "May Allah grant you ease and increase you in guidance.");
    } catch (e) {
      console.error("Guidance Error:", e);
      setGuidance("I'm having trouble connecting to the wisdom base right now, but remember: Allah is with those who persevere. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-xl overflow-hidden border border-zinc-200 min-h-[500px] flex flex-col">
      <div className="bg-slate-900 p-8 text-white shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Daily Spiritual Check-in
        </h2>
        <p className="text-zinc-400 text-sm mt-1 font-medium">Nurturing your soul, one step at a time.</p>
      </div>

      <div className="p-8 md:p-10 flex-1 flex flex-col">
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-900">Which prayers did you complete today?</h3>
            <div className="grid grid-cols-1 gap-3">
              {prayers.map(p => (
                <button
                  key={p}
                  onClick={() => togglePrayer(p)}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    responses.prayers.includes(p) 
                    ? 'border-gold-primary bg-[#FBF9F4] text-slate-900 font-bold' 
                    : 'border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200'
                  }`}
                >
                  <span>{p}</span>
                  {responses.prayers.includes(p) && <svg className="w-6 h-6 text-gold-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setStep(1)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg mt-4"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <h3 className="text-xl font-black text-slate-900">How is your heart feeling?</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Peaceful', 'Anxious', 'Grateful', 'Struggling'].map(m => (
                <button
                  key={m}
                  onClick={() => setResponses(prev => ({...prev, mood: m}))}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    responses.mood === m 
                    ? 'border-gold-primary bg-[#FBF9F4] text-slate-900 font-bold' 
                    : 'border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(0)} className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</button>
              <button 
                disabled={!responses.mood}
                onClick={getSpiritualAdvice}
                className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-lg"
              >
                Get Guidance
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in zoom-in-95 h-full flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Consulting the wisdom...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-zinc-50 p-8 rounded-[2rem] border border-zinc-200 max-h-[400px] overflow-y-auto no-scrollbar shadow-inner">
                  {guidance}
                </div>
                <button 
                  onClick={() => setStep(0)} 
                  className="w-full bg-white border border-zinc-200 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-50 transition-all"
                >
                  Reset Check-in
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInModule;
