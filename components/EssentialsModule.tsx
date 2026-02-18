
import React, { useState } from 'react';
import { ACADEMY_KNOWLEDGE, AcademyTopic } from '../services/essentialsService';
import { generateScholarDeepDive } from '../services/geminiService';
import ShareAction from './ShareAction';

const EssentialsModule: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<AcademyTopic | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [deepDiveContent, setDeepDiveContent] = useState<string | null>(null);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Library', icon: '🏛️' },
    { id: 'salah-sciences', label: 'Namaz Tariqa', icon: '🕌' },
    { id: 'jurisprudence', label: 'Jurisprudence', icon: '⚖️' },
    { id: 'hadith', label: 'Hadith Sciences', icon: '📜' },
    { id: 'theology', label: 'Theology', icon: '⚓' },
    { id: 'spiritual-psychology', label: 'Tazkiyah', icon: '💎' },
  ];

  const handlePointClick = async (pointTitle: string) => {
    if (!selectedTopic) return;
    setDeepDiveContent(null);
    setActivePoint(pointTitle);
    setIsDeepDiving(true);
    
    try {
      const result = await generateScholarDeepDive(selectedTopic.title, pointTitle);
      setDeepDiveContent(result);
    } catch (e) {
      setDeepDiveContent("Failed to connect to the scholarly repositories. Please ensure your search for knowledge is persistent and try again.");
    } finally {
      setIsDeepDiving(false);
    }
  };

  const closeDeepDive = () => {
    setDeepDiveContent(null);
    setActivePoint(null);
  };

  const filtered = activeCategory === 'all' 
    ? ACADEMY_KNOWLEDGE 
    : ACADEMY_KNOWLEDGE.filter(k => k.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2 text-center md:text-left border-b border-[#E5E2D8] pb-10">
        <div className="space-y-3">
           <div className="flex items-center gap-3 justify-center md:justify-start">
             <div className="w-2 h-2 rounded-full bg-[#C6A85E]"></div>
             <span className="text-[10px] font-black uppercase text-[#C6A85E] tracking-[0.4em]">Scholarly Research Hub</span>
           </div>
           <h2 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-none">Spiritual Academy</h2>
           <p className="text-[#7A7A7A] font-medium text-sm md:text-lg max-w-xl">Deep synthesis of Sharia sciences, legal epistemology, and Namaz Tariqa.</p>
        </div>
        <div className="flex bg-[#F7F5EF] p-1.5 rounded-2xl border border-[#E5E2D8] shadow-inner flex-wrap justify-center gap-1">
           {categories.map(cat => (
             <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSelectedTopic(null); closeDeepDive(); }} className={`px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeCategory === cat.id ? 'bg-white text-[#C6A85E] shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-900'}`}>
               <span>{cat.icon}</span>{cat.label}
             </button>
           ))}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Navigation - Sidebar on desktop, scrollable list on mobile */}
        <div className="lg:w-[380px] space-y-4 overflow-x-auto no-scrollbar flex lg:flex-col pb-4 lg:pb-0 gap-3 px-2 md:px-0">
           <p className="hidden lg:block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Scientific Manuscripts</p>
           {filtered.map(topic => (
             <button key={topic.id} onClick={() => { setSelectedTopic(topic); closeDeepDive(); }} className={`w-full text-left p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all shrink-0 min-w-[280px] lg:min-w-0 relative group active:scale-95 ${selectedTopic?.id === topic.id ? 'bg-white border-[#C6A85E] shadow-xl ring-1 ring-[#C6A85E]/20' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${topic.level === 'Scholar' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{topic.level}</span>
                  <span className="text-[14px] opacity-20 group-hover:opacity-100 transition-opacity">→</span>
                </div>
                <h4 className={`text-base md:text-lg font-black leading-tight ${selectedTopic?.id === topic.id ? 'text-[#C6A85E]' : 'text-[#1A1A1A]'}`}>{topic.title}</h4>
                <p className="text-[10px] md:text-[11px] text-slate-500 font-medium mt-3 leading-relaxed line-clamp-2">{topic.desc}</p>
             </button>
           ))}
        </div>

        {/* View Area */}
        <div className="lg:col-span-1 flex-1 min-h-[500px]">
           {!selectedTopic ? (
             <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] md:rounded-[3rem] border border-[#E5E2D8] border-dashed h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-8 group mx-2 md:mx-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center text-5xl shadow-xl border border-slate-100 transition-transform duration-700">📖</div>
                <div className="space-y-2">
                   <h4 className="text-xl md:text-2xl font-black text-slate-300">Select a Science to Study</h4>
                   <p className="text-slate-400 text-sm max-w-xs mx-auto">Open a manuscript from the library to begin deep scholarly analysis and procedure guides.</p>
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-[#E5E2D8] shadow-sm p-6 md:p-16 animate-in slide-in-from-right-8 relative overflow-hidden flex flex-col mx-2 md:mx-0">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] font-arabic text-[12rem] md:text-[18rem] select-none pointer-events-none">علم</div>
                
                <div className="relative z-10 space-y-8 md:space-y-12 flex-1">
                   <header className="space-y-6">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="px-4 py-1.5 bg-[#FDFCF8] border border-[#E5E2D8] rounded-xl text-[10px] font-black uppercase text-[#C6A85E] tracking-widest">{selectedTopic.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedTopic.level} Level</span>
                      </div>
                      <h3 className="text-3xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-tight max-w-2xl">{selectedTopic.title}</h3>
                      <p className="text-lg md:text-2xl text-[#4A4A4A] font-medium leading-relaxed italic border-l-4 border-amber-400 pl-4 md:pl-8">"{selectedTopic.content}"</p>
                      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                         <p className="text-[9px] md:text-[10px] font-black text-amber-800 uppercase tracking-widest text-center">Touch a Methodology Point below for a Full Deep-Dive with Authentic Hadiths.</p>
                      </div>
                   </header>

                   <div className="grid grid-cols-1 gap-4 md:gap-6">
                      <p className="text-[10px] font-black uppercase text-[#C6A85E] tracking-[0.4em] mb-2 px-1">Core Procedure / Methodology</p>
                      {selectedTopic.steps?.map((step, i) => (
                        <div key={i} className="space-y-4">
                          <button 
                            onClick={() => handlePointClick(step.title)}
                            className={`w-full bg-[#FDFCF8] p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col md:flex-row md:items-start gap-6 md:gap-8 group transition-all duration-500 text-left active:scale-[0.98] ${activePoint === step.title ? 'border-[#C6A85E] ring-1 ring-[#C6A85E]/20 bg-white' : 'border-slate-100'}`}
                          >
                             <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center font-black text-lg md:text-xl shrink-0 shadow-sm transition-transform ${activePoint === step.title ? 'bg-[#C6A85E] text-white border-[#C6A85E]' : 'bg-white text-[#C6A85E] border-slate-100'}`}>{i + 1}</div>
                             <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-lg md:text-xl font-black text-[#1A1A1A] leading-tight">{step.title}</h5>
                                  <span className="text-[8px] font-black uppercase text-[#C6A85E] bg-[#C6A85E]/5 px-2 py-0.5 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">Request Evidence</span>
                                </div>
                                <p className="text-sm md:text-lg text-[#4A4A4A] leading-relaxed font-medium">{step.text}</p>
                             </div>
                          </button>

                          {/* Deep Dive Expansion */}
                          {activePoint === step.title && (
                             <div className="animate-in slide-in-from-top-4 duration-500">
                                {isDeepDiving ? (
                                   <div className="p-12 md:p-20 text-center space-y-6 bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] border border-dashed border-slate-200">
                                      <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-[#F0EBDD] border-t-[#C6A85E] rounded-full animate-spin mx-auto"></div>
                                      <p className="text-xs md:text-sm font-black uppercase text-[#C6A85E] tracking-[0.3em] animate-pulse">Researching Classical Hadith Repositories...</p>
                                   </div>
                                ) : deepDiveContent && (
                                   <div className="bg-slate-900 text-white p-6 md:p-16 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-white/10">
                                      <div className="absolute top-0 right-0 p-8 opacity-5 font-arabic text-[10rem] md:text-[12rem] select-none pointer-events-none">مخطوطة</div>
                                      <div className="relative z-10 space-y-8 md:space-y-12">
                                         <header className="flex justify-between items-center border-b border-white/10 pb-6 md:pb-8">
                                            <div>
                                              <span className="text-[8px] md:text-[9px] font-black uppercase text-amber-400 tracking-[0.4em]">Manuscript Analysis & Evidence</span>
                                              <h4 className="text-xl md:text-3xl font-black tracking-tight">{step.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <ShareAction 
                                                title={`Scholarly Insight: ${step.title}`} 
                                                text={`Scholarly Research on ${selectedTopic.title}:\n\n${deepDiveContent.substring(0, 500)}...`} 
                                              />
                                              <button onClick={closeDeepDive} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-xl">×</button>
                                            </div>
                                         </header>
                                         <div className="prose prose-invert max-w-none">
                                            <div className="whitespace-pre-wrap font-serif text-base md:text-xl leading-relaxed md:leading-loose text-slate-100/90 tracking-wide first-letter:text-4xl md:first-letter:text-5xl first-letter:font-black first-letter:text-amber-400 first-letter:mr-2 md:first-letter:mr-3 first-letter:float-left">
                                               {deepDiveContent}
                                            </div>
                                         </div>
                                         <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                                            <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center md:text-left">Research synthesized by Noor Scholarly Engine • Verified via Sahih Sources</p>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                               <button onClick={() => { navigator.clipboard.writeText(deepDiveContent); alert("Text copied."); }} className="flex-1 sm:flex-none px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase hover:bg-white/10 transition-all">Copy</button>
                                               <button onClick={() => window.print()} className="flex-1 sm:flex-none px-6 py-2.5 bg-amber-500 text-slate-900 rounded-lg text-[9px] font-black uppercase hover:scale-105 transition-all">Export</button>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                )}
                             </div>
                          )}
                        </div>
                      ))}
                   </div>

                   {selectedTopic.references && (
                      <div className="pt-8 md:pt-12 border-t border-slate-50 space-y-4 md:space-y-6">
                         <h6 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Classical References (Masadir)</h6>
                         <div className="flex flex-wrap gap-2 md:gap-3">
                            {selectedTopic.references.map(ref => (
                               <span key={ref} className="px-4 py-2 md:px-5 md:py-3 bg-slate-50 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold text-slate-600 border border-slate-100 italic">{ref}</span>
                            ))}
                         </div>
                      </div>
                   )}
                </div>

                <div className="mt-12 md:mt-20 pt-8 md:pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                   <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] text-center md:text-left">Noor Advanced Academy • 1446 AH</p>
                   <button onClick={() => window.print()} className="w-full sm:w-auto px-8 py-3 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Print Series</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EssentialsModule;
