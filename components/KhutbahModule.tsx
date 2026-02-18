
import React, { useState } from 'react';
import { generateKhutbah } from '../services/geminiService';
import { KhutbahResult } from '../types';
import { useCredit } from '../services/subscriptionService';
import { auth } from '../services/firebaseClient';
import SubscriptionWall from './SubscriptionWall';

const SUGGESTED_TOPICS = [
  "Gratitude in Times of Trial",
  "The Importance of Akhlaq (Character)",
  "Youth and Spiritual Purpose",
  "Protecting the Environment in Islam",
  "Family Bonds and Patient Love",
  "Mental Health and Islamic Resilience",
  "Preparing for Ramadan",
  "Legacy of the Prophet ﷺ"
];

const KhutbahModule: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('General community');
  const [duration, setDuration] = useState('20 minutes');
  const [tone, setTone] = useState('Balanced');
  const [region, setRegion] = useState('Western context');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<KhutbahResult | null>(null);
  const [isSpeakerMode, setIsSpeakerMode] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    const user = auth.currentUser;
    if (!user) return;

    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) {
      setShowPaywall(true);
      return;
    }

    setIsLoading(true);
    const khutbah = await generateKhutbah({ topic, audience, duration, tone, region });
    setResult(khutbah);
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 pb-20">
      {showPaywall && <SubscriptionWall featureName="Khutbah Studio" onSuccess={() => { setShowPaywall(false); window.location.reload(); }} onCancel={() => setShowPaywall(false)} />}
      {/* Left Panel: Configuration */}
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🕌</div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Khutbah Studio</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Intelligent Preparation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Primary Topic</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic or select below..."
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTED_TOPICS.slice(0, 4).map(t => (
                  <button 
                    key={t}
                    onClick={() => setTopic(t)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 rounded-lg text-[10px] font-bold transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Target Audience</label>
                <select 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm"
                >
                  <option>General community</option>
                  <option>Youth</option>
                  <option>University students</option>
                  <option>Families</option>
                  <option>Reverts</option>
                  <option>Academic audience</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Duration</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm"
                >
                  <option>10 minutes</option>
                  <option>20 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Khutbah...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 v2M7 7h10" /></svg>
                  Generate Authentic Text
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
          <div className="text-xl">🎓</div>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            Noor's Khutbah Studio uses a multi-layered reasoning engine to synthesize authentic classical texts with contemporary relevance. Transitions are rhetorically bridged for maximum impact.
          </p>
        </div>
      </div>

      {/* Right Panel: Content Preview */}
      <div className="lg:w-2/3">
        {isLoading ? (
          <div className="h-full min-h-[600px] bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6 text-center p-12">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-100 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">📜</div>
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-800">Compiling the Sermon</h4>
              <p className="text-slate-400 font-medium">Selecting authentic narrations and crafting the rhetorical bridges...</p>
            </div>
          </div>
        ) : result ? (
          <div className="bg-[#fdfcf8] rounded-[3rem] border border-[#e5e1d3] shadow-2xl overflow-hidden min-h-screen relative animate-in zoom-in-95">
            {/* Parchment Texture Overlay */}
            <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
            
            <div className="relative p-12 md:p-16 space-y-16">
              {/* Header */}
              <div className="text-center border-b border-[#e5e1d3] pb-10 flex flex-col items-center">
                <div className="w-16 h-1 bg-amber-400 rounded-full mb-6"></div>
                <h3 className="text-4xl font-black text-slate-800 mb-2">Friday Khutbah Reflection</h3>
                <p className="text-amber-700 font-bold uppercase tracking-[0.2em] text-[10px]">Topic: {result.metadata.topic}</p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                   <span className="px-3 py-1 bg-white border border-[#e5e1d3] rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">Audience: {result.metadata.audience}</span>
                   <span className="px-3 py-1 bg-white border border-[#e5e1d3] rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">Mode: {result.metadata.tone}</span>
                   
                   <button 
                    onClick={() => setIsSpeakerMode(!isSpeakerMode)}
                    className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${isSpeakerMode ? 'bg-amber-600 border-amber-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-amber-400'}`}
                   >
                     {isSpeakerMode ? 'Speaker View: ON' : 'Speaker View: OFF'}
                     <div className={`w-1.5 h-1.5 rounded-full ${isSpeakerMode ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></div>
                   </button>
                </div>
              </div>

              {/* Part 1: First Khutbah */}
              <section className="space-y-10">
                {isSpeakerMode && result.part1.presenterNote && (
                  <div className="bg-amber-50/50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-left-4">
                    <span className="text-xl">🎙️</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Speaker Tip: Opening</p>
                      <p className="text-sm font-medium text-amber-800 italic leading-relaxed">{result.part1.presenterNote}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 justify-center">
                  <div className="h-px flex-1 bg-amber-200"></div>
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] text-amber-600">Al-Khutbah Al-Ula</h4>
                  <div className="h-px flex-1 bg-amber-200"></div>
                </div>

                <div className="space-y-6 text-center bg-white/40 p-10 rounded-[2rem] border border-[#e5e1d3]">
                   <p className="font-arabic text-3xl leading-loose text-slate-800" dir="rtl">{result.part1.khutbatulHaajahArabic}</p>
                   <p className="text-sm italic text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">"{result.part1.khutbatulHaajahTranslation}"</p>
                </div>

                <div className="space-y-8">
                  <div className="prose prose-slate max-w-none">
                     <p className="text-xl font-medium text-slate-700 leading-relaxed italic border-l-4 border-amber-400 pl-8">
                       {result.part1.intro}
                     </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {result.part1.quranAyat.map((ayah, i) => (
                      <div key={i} className="bg-white/50 p-8 rounded-3xl border border-[#e5e1d3] space-y-6">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest">Al-Quranul Karim</span>
                           <span className="h-px flex-1 bg-amber-100"></span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ayah.reference}</span>
                         </div>
                         <p className="font-arabic text-3xl text-right leading-[2]" dir="rtl">{ayah.arabic}</p>
                         <p className="text-slate-600 font-medium italic border-l-2 border-amber-200 pl-4 leading-relaxed">"{ayah.translation}"</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {result.part1.hadiths.map((hadith, i) => (
                      <div key={i} className="bg-[#f7f5eb] p-8 rounded-3xl border border-[#e5e1d3] space-y-6">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">As-Sunnah An-Nabawiyyah</span>
                           <span className="h-px flex-1 bg-emerald-100"></span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{hadith.reference}</span>
                         </div>
                         <p className="font-arabic text-2xl text-right leading-[2] text-slate-700" dir="rtl">{hadith.arabic}</p>
                         <p className="text-slate-600 font-medium italic border-l-2 border-emerald-200 pl-4 leading-relaxed">"{hadith.translation}"</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600">The Scholarly Lesson</h5>
                      <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{result.part1.explanation}</p>
                    </div>
                    
                    <div className="bg-emerald-50/20 border-l-4 border-emerald-200 p-8 rounded-r-[2rem] space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Living the Wisdom</h5>
                      <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{result.part1.application}</p>
                    </div>
                  </div>

                  {/* Explicit Oratorical Bridge */}
                  <div className="py-12 border-y border-[#e5e1d3] relative group">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fdfcf8] px-4 text-[10px] font-black uppercase text-amber-600 tracking-[0.4em]">The Bridge</span>
                    <p className="text-2xl font-black text-center text-slate-800 leading-snug max-w-2xl mx-auto italic">
                      "{result.part1.transition}"
                    </p>
                  </div>
                </div>
              </section>

              {/* Part 2: Second Khutbah */}
              <section className="space-y-10">
                {isSpeakerMode && result.part2.presenterNote && (
                  <div className="bg-amber-50/50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-left-4">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Speaker Tip: Resolution</p>
                      <p className="text-sm font-medium text-amber-800 italic leading-relaxed">{result.part2.presenterNote}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 justify-center">
                  <div className="h-px flex-1 bg-amber-200"></div>
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] text-amber-600">Al-Khutbah Al-Thaniyah</h4>
                  <div className="h-px flex-1 bg-amber-200"></div>
                </div>

                <div className="space-y-8">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg leading-relaxed text-slate-700">
                      {result.part2.recap}
                    </p>
                  </div>

                  <div className="bg-slate-800 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 font-arabic text-8xl transition-transform group-hover:scale-110">عمل</div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6">Practical Call to Action</h5>
                    <p className="text-xl font-bold mb-8 leading-relaxed">"{result.part2.callToAction}"</p>
                    <div className="space-y-4">
                      {result.part2.practicalSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                           <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-black shrink-0">{i+1}</div>
                           <p className="font-bold leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Congregational Duas Section */}
                  <div className="bg-[#f0f4f0] p-10 rounded-[3rem] border border-[#d8e5d8] space-y-10 shadow-inner">
                    <div className="text-center">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 mb-2 block">Congregational Supplications</span>
                       <h4 className="text-2xl font-black text-slate-800">For the Community</h4>
                    </div>

                    <div className="space-y-12">
                      {result.congregationalDuas.map((dua, i) => (
                        <div key={i} className="space-y-4 text-center">
                           <p className="text-[10px] font-black uppercase text-emerald-600/60 tracking-widest">{dua.context}</p>
                           <p className="font-arabic text-3xl leading-loose text-emerald-950" dir="rtl">{dua.arabic}</p>
                           <p className="text-xs font-bold text-slate-400 uppercase italic px-10">{dua.transliteration}</p>
                           <p className="text-sm font-medium text-slate-600 italic">"{dua.translation}"</p>
                           {i < result.congregationalDuas.length - 1 && <div className="w-8 h-px bg-emerald-200 mx-auto mt-8"></div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 text-center bg-white/40 p-10 rounded-[2rem] border border-[#e5e1d3]">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closing Supplications</p>
                      <p className="font-arabic text-3xl leading-loose text-slate-800" dir="rtl">{result.part2.closingDuaArabic}</p>
                    </div>
                    <div className="pt-8 border-t border-[#e5e1d3] space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Salawat</p>
                      <p className="font-arabic text-2xl leading-loose text-slate-800" dir="rtl">{result.part2.closingSalawat}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="text-center pt-10 border-t border-[#e5e1d3]">
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">Noor Khateeb AI • Allah Knows Best</p>
              </div>
            </div>

            {/* Float Actions */}
            <div className="absolute top-8 right-8 flex gap-2">
               <button 
                onClick={() => window.print()}
                className="p-3 bg-white/80 backdrop-blur shadow-sm rounded-full border border-[#e5e1d3] hover:bg-white transition-all text-slate-600"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
               </button>
               <button 
                onClick={() => {
                   const text = JSON.stringify(result, null, 2);
                   navigator.clipboard.writeText(text);
                   alert("Full Khutbah raw data copied to clipboard.");
                }}
                className="p-3 bg-white/80 backdrop-blur shadow-sm rounded-full border border-[#e5e1d3] hover:bg-white transition-all text-slate-600"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[600px] bg-white/40 backdrop-blur rounded-[3rem] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="text-8xl opacity-10 font-arabic select-none">خطبة</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-300">Ready to Draft</h4>
              <p className="text-slate-400 max-w-sm font-medium">Configure your topic and parameters to generate a professionally structured Friday sermon with speaker tips and bridge transitions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KhutbahModule;
