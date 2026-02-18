
import React, { useState } from 'react';
import { generateEthicalScenario, evaluateEthicalDilemma, generateNoorResponse } from '../services/geminiService';

const MAQASID_PILLARS = [
  { name: 'Faith', icon: '☪️', desc: 'Protection of Deen (Religion)' },
  { name: 'Life', icon: '🌱', desc: 'Protection of Nafs (Human Life)' },
  { name: 'Intellect', icon: '🧠', desc: 'Protection of Aql (Reason)' },
  { name: 'Lineage', icon: '👪', desc: 'Protection of Nasl (Family)' },
  { name: 'Property', icon: '💰', desc: 'Protection of Mal (Wealth)' },
];

const EthicalToolsModule: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'scenarios' | 'custom'>('scenarios');
  const [scenario, setScenario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const [customDilemma, setCustomDilemma] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const loadScenario = async () => {
    setIsLoading(true);
    setScenario('');
    setEvaluation('');
    try {
      const result = await generateEthicalScenario();
      setScenario(result || '');
    } catch (e) {
      setScenario('Failed to generate scenario. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateChoice = async (choice: string) => {
    setIsLoading(true);
    try {
      const prompt = `I am facing this scenario: ${scenario}. I am considering this path: ${choice}. Evaluate this using Maslaha (Public Interest) and Maqasid al-Shariah. Be clear on which objectives it protects or harms.`;
      const result = await generateNoorResponse(prompt, "You are Noor, an ethical guide. Focus on the Maqasid al-Shariah framework.");
      setEvaluation(result || 'No evaluation available.');
    } catch (e) {
      setEvaluation('Evaluation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDilemma.trim()) return;
    setIsLoading(true);
    setEvaluation('');
    try {
      const result = await evaluateEthicalDilemma(customDilemma);
      setEvaluation(result || 'No analysis available.');
    } catch (e) {
      setEvaluation('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-3xl w-full max-w-sm mx-auto shadow-inner">
        <button 
          onClick={() => { setActiveMode('scenarios'); setEvaluation(''); setScenario(''); }}
          className={`flex-1 py-3 px-6 rounded-[1.5rem] font-bold text-sm transition-all ${activeMode === 'scenarios' ? 'bg-white text-indigo-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Scenario Practice
        </button>
        <button 
          onClick={() => { setActiveMode('custom'); setEvaluation(''); setCustomDilemma(''); }}
          className={`flex-1 py-3 px-6 rounded-[1.5rem] font-bold text-sm transition-all ${activeMode === 'custom' ? 'bg-white text-indigo-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Custom Case Analysis
        </button>
      </div>

      {/* Framework Explanation Card */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
           <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.94-7 10-3.87-1.06-7-5.33-7-10v-4.7l7-3.12z"/></svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Maqasid al-Shariah Framework</h2>
          <p className="text-indigo-200 mb-8 max-w-2xl leading-relaxed text-lg">
            "Objectives of the Shariah." A holistic system that prioritizes human well-being by protecting five core interests.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {MAQASID_PILLARS.map(p => (
              <button 
                key={p.name}
                onClick={() => setSelectedPillar(p.name === selectedPillar ? null : p.name)}
                className={`p-4 rounded-2xl border transition-all text-center relative ${
                  selectedPillar === p.name 
                  ? 'bg-white text-indigo-900 border-white shadow-lg scale-105' 
                  : 'bg-indigo-800/50 backdrop-blur-sm border-indigo-700 text-indigo-100 hover:bg-indigo-700/50'
                }`}
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{p.name}</p>
                {selectedPillar === p.name && (
                  <p className="text-[9px] font-medium leading-tight mt-2 animate-in fade-in slide-in-from-top-1">{p.desc}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeMode === 'scenarios' ? (
        /* SCENARIO PRACTICE MODE */
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
          {!scenario && !isLoading ? (
            <div className="text-center py-12 border-4 border-dashed border-slate-100 rounded-[2rem]">
              <div className="text-5xl mb-6">💡</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Sharpen Your Ethical Judgment</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Noor will generate a realistic ethical dilemma for you to navigate using Islamic principles.
              </p>
              <button 
                onClick={loadScenario}
                className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 mx-auto text-lg"
              >
                Generate New Scenario
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-indigo-600 font-bold text-xl animate-pulse">Consulting the Sages of Ethics...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
               <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-slate-800 font-medium whitespace-pre-wrap leading-relaxed shadow-inner">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">The Challenge</span>
                    <button onClick={loadScenario} className="text-xs text-slate-400 hover:text-indigo-600 font-bold">New Scenario</button>
                 </div>
                 {scenario}
               </div>

               {!evaluation && (
                 <div className="space-y-4">
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">How would you respond?</p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {[
                       { id: 'A', label: 'Pragmatic Choice', desc: 'Focus on immediate utility.' },
                       { id: 'B', label: 'Principled Choice', desc: 'Prioritize strict compliance.' },
                       { id: 'C', label: 'Wisdom Choice', desc: 'Seek a balanced path.' }
                     ].map(opt => (
                       <button 
                        key={opt.id}
                        onClick={() => handleEvaluateChoice(`Path ${opt.id}: ${opt.label}`)} 
                        className="text-left p-6 rounded-2xl border-2 border-slate-50 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 transition-all shadow-sm group"
                       >
                         <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-3">{opt.id}</span>
                         <p className="font-bold text-slate-700 block">{opt.label}</p>
                         <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                       </button>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>
      ) : (
        /* CUSTOM CASE ANALYSIS MODE */
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">🖋️</div>
             <div>
               <h3 className="text-2xl font-bold text-slate-800">Your Ethical Consultation</h3>
               <p className="text-slate-500 text-sm">Describe a situation you are personally facing for a deep analysis.</p>
             </div>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-6">
            <textarea
              value={customDilemma}
              onChange={(e) => setCustomDilemma(e.target.value)}
              placeholder="e.g., 'My company is asking me to exaggerate product benefits to a client. I need the commission for my family, but I feel it is dishonest...'"
              className="w-full min-h-[200px] p-8 rounded-[2rem] border border-slate-200 bg-slate-50/30 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-lg leading-relaxed shadow-inner"
            />
            <button 
              type="submit"
              disabled={isLoading || !customDilemma.trim()}
              className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? 'Analyzing using Maqasid...' : 'Submit Case for Analysis'}
              {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            </button>
          </form>
        </div>
      )}

      {/* Evaluation/Analysis Output Area */}
      {evaluation && (
        <div className="bg-slate-900 rounded-[2.5rem] text-white overflow-hidden shadow-2xl animate-in zoom-in-95 border-t-8 border-indigo-500">
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">ن</div>
                <div>
                  <h4 className="text-xl font-bold">Noor's Ethical Analysis</h4>
                  <p className="text-xs text-indigo-400 uppercase tracking-[0.2em] font-bold">Comprehensive Insight</p>
                </div>
              </div>
              <button 
                onClick={() => { setEvaluation(''); setScenario(''); setCustomDilemma(''); if(activeMode === 'scenarios') loadScenario(); }}
                className="text-xs font-bold text-indigo-400 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl transition-all border border-white/10"
              >
                Reset Module
              </button>
            </div>
            
            <div className="prose prose-invert prose-indigo max-w-none">
              <div className="whitespace-pre-wrap leading-loose text-indigo-100/90 font-medium">
                {evaluation}
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <p className="text-sm text-indigo-400 italic">"Wealth and children are but adornment of the worldly life. But the enduring good deeds are better to your Lord..." — Quran 18:46</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EthicalToolsModule;
