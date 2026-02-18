
import React, { useState } from 'react';
import { getPropheticSolution } from '../services/geminiService';

const PropheticGuidance: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setIsLoading(true);
    setSolution(null);
    try {
      const result = await getPropheticSolution(problem);
      setSolution(result || "I apologize, but I could not find a specific guidance for this situation. Please try rephrasing or consulting a local scholar.");
    } catch (error) {
      console.error("Guidance Error:", error);
      setSolution("I encountered an error connecting to the Prophetic wisdom base. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Intro Header */}
      <div className="bg-rose-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-rose-900/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">What Would Prophet Muhammad ﷺ Do?</h2>
          <p className="text-rose-100 text-lg max-w-2xl leading-relaxed">
            Get authentic Islamic solutions to your personal challenges based on the mercy and wisdom of the Prophetic teachings.
          </p>
        </div>
      </div>

      {/* Input Area */}
      {!solution && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Describe your challenge...</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., 'I am struggling with debt and feeling hopeless'..."
              className="w-full min-h-[150px] p-6 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all resize-none text-lg"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !problem.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50 flex items-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Consulting Sunnah...
                  </>
                ) : (
                  <>
                    Seek Guidance
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Response Area */}
      {isLoading && !solution && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-rose-100 rounded-full"></div>
             <div className="w-20 h-20 border-4 border-rose-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-rose-900 font-bold text-xl animate-pulse">Retrieving Wisdom from the Sunnah...</p>
        </div>
      )}

      {solution && (
        <div className="space-y-6 animate-in zoom-in-95">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-500">YOUR PROPHETIC GUIDANCE</h3>
            <button 
              onClick={() => { setSolution(null); setProblem(''); }}
              className="text-rose-600 font-bold hover:underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z" /></svg>
              New Search
            </button>
          </div>
          
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="prose prose-rose max-w-none prose-lg">
              <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                {solution}
              </div>
            </div>
          </div>

          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <p className="text-sm text-rose-800 italic text-center">
              "Allah does not burden a soul beyond what it can bear." — Quran 2:286
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropheticGuidance;
