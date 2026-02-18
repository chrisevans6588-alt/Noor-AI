
import React, { useState, useRef, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import ShareAction from './ShareAction';
import { useCredit } from '../services/subscriptionService';
import { auth } from '../services/firebaseClient';
import SubscriptionWall from './SubscriptionWall';

const RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16"];
const STYLES = [
  { id: 'sacred', name: 'Sacred Light', prompt: 'Ethereal glowing sacred light, soft focus, holy atmosphere, high detail' },
  { id: 'geometric', name: 'Infinite Patterns', prompt: 'Intricate Islamic geometric patterns, fractal mathematics, symmetrical beauty' },
  { id: 'architecture', name: 'Grand Mosque', prompt: 'Majestic Islamic architecture, intricate stone carving, grand scale, cinematic lighting' },
  { id: 'manuscript', name: 'Illuminated Page', prompt: 'Classical manuscript texture, illuminated calligraphy motifs, animated parchment, gold leaf borders' },
  { id: 'nature', name: 'Jannah Gardens', prompt: 'Peaceful paradisiacal gardens, flowing crystal rivers, blooming flowers, celestial atmosphere' },
];

const INSPIRATIONS = [
  "A majestic mosque with a turquoise dome under a full moon in the Sahara desert.",
  "Intricate Islamic geometric patterns in gold and deep emerald silk textures.",
  "A peaceful courtyard in Cordoba with blooming jasmine and flowing water fountains.",
  "Sacred light reflecting off a marble Mihrab in an ancient masjid.",
];

const ImageGeneratorModule: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'generate' | 'gallery'>('generate');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('noor_vision_gallery');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load gallery history");
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('noor_vision_gallery', JSON.stringify(history));
    }
  }, [history]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSourceImage({
          data: base64String.split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const user = auth.currentUser;
    if (!user) return;

    // Check Credits first
    const hasCredit = await useCredit(user.uid);
    if (!hasCredit) {
      setShowPaywall(true);
      return;
    }

    // Fixed: Use casting to avoid type errors with global aistudio object provided by environment
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
        // Proceeding assuming success as per race condition rules
      }
    }

    // Basic client-side moderation check
    const prohibitedWords = ['offensive', 'nudity', 'hate', 'haram', 'blood', 'violence'];
    if (prohibitedWords.some(word => prompt.toLowerCase().includes(word))) {
      alert("Please ensure your prompt adheres to the Sacred Vision guidelines (Uplifting and Islamic themes only).");
      return;
    }

    setIsGenerating(true);
    setResultImage(null);
    setErrorMessage(null);
    
    let finalPrompt = prompt;
    if (selectedStyle) {
      const styleObj = STYLES.find(s => s.id === selectedStyle);
      if (styleObj) finalPrompt = `${prompt}. Style: ${styleObj.prompt}`;
    }

    try {
      const imageUrl = await generateImage(finalPrompt, aspectRatio, sourceImage || undefined);
      if (imageUrl) {
        setResultImage(imageUrl);
        setHistory(prev => {
          const newHistory = [imageUrl, ...prev].slice(0, 24);
          return newHistory;
        });
      }
    } catch (error: any) {
      console.error("Art generation failed:", error);
      
      if (error.message?.includes("Requested entity was not found")) {
        setErrorMessage("Vision AI requires a valid API key. Please click the button below to select one.");
        // Fixed: Use casting to avoid type errors with global aistudio object
        const aistudio = (window as any).aistudio;
        if (aistudio) {
          aistudio.openSelectKey();
        }
      } else {
        setErrorMessage("The Vision Engine encountered an issue. This may be due to safety filters or network congestion. Please try a different prompt.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGenerator = () => {
    setPrompt('');
    setSourceImage(null);
    setResultImage(null);
    setSelectedStyle(null);
    setErrorMessage(null);
  };

  const clearGallery = () => {
    if (confirm("Permanently delete your gallery history?")) {
      setHistory([]);
      localStorage.removeItem('noor_vision_gallery');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-1000">
      {showPaywall && <SubscriptionWall featureName="Sacred Vision AI" onSuccess={() => { setShowPaywall(false); window.location.reload(); }} onCancel={() => setShowPaywall(false)} />}
      
      {/* Art Studio Header */}
      <header className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute -bottom-10 -right-10 opacity-10 font-arabic text-[20rem] select-none pointer-events-none">فن</div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
               <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
               <span className="text-amber-400 font-black uppercase tracking-[0.4em] text-xs">SACRED VISIONS • HQ MODES</span>
            </div>
            <h2 className="text-6xl font-black tracking-tighter leading-none">Art Studio</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">Synthesize sacred visions through advanced intelligence. Restricted to Islamic architecture, calligraphy, and spiritual landscapes.</p>
            
            <div className="flex bg-white/5 p-1 rounded-2xl w-fit mx-auto lg:mx-0 border border-white/10">
               <button onClick={() => setActiveView('generate')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'generate' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Create</button>
               <button onClick={() => setActiveView('gallery')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'gallery' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>My Gallery</button>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col gap-4 min-w-[280px]">
             <div className="bg-emerald-900/20 backdrop-blur-xl border border-emerald-500/30 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase text-emerald-400">Content Policy</span>
                   <span className="text-[10px] font-black uppercase text-emerald-400">Enforced</span>
                </div>
                <p className="text-[10px] text-emerald-100/60 font-medium">Noor strictly filters for Islamic-relevant content. Offensive or immodest generations are automatically restricted.</p>
             </div>
          </div>
        </div>
      </header>

      {activeView === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-10">
              <div className="space-y-6">
                 <h3 className="text-2xl font-black text-slate-800">Sacred Instruction</h3>
                 <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe an Islamic vision (e.g., 'Illuminated geometric star at sunset')..."
                  className="w-full h-44 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-xl text-slate-800 placeholder:text-slate-400 outline-none focus:border-amber-500 transition-all resize-none font-medium shadow-inner"
                 />
                 <div className="flex flex-wrap gap-2">
                    {INSPIRATIONS.map(ins => (
                      <button key={ins} onClick={() => setPrompt(ins)} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors">#{ins.split(' ')[2]}</button>
                    ))}
                 </div>
              </div>

              {/* ... Rest of UI controls ... */}
              <div className="space-y-6">
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Islamic Aesthetics</h4>
                 <div className="grid grid-cols-2 gap-3">
                    {STYLES.map(style => (
                      <button 
                        key={style.id} 
                        onClick={() => setSelectedStyle(style.id === selectedStyle ? null : style.id)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left group ${selectedStyle === style.id ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                      >
                         <p className={`font-black text-xs uppercase tracking-widest transition-colors ${selectedStyle === style.id ? 'text-amber-800' : 'text-slate-400 group-hover:text-slate-600'}`}>{style.name}</p>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Canvas Ratio</h4>
                 <div className="flex gap-2">
                    {RATIOS.map(r => (
                      <button 
                        key={r} 
                        onClick={() => setAspectRatio(r)}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black border-2 transition-all ${aspectRatio === r ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {r}
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-amber-500 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 transition-all group"
              >
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                    Invoking...
                  </>
                ) : (
                  <>
                    Generate Vision
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="bg-slate-50 border border-slate-200 rounded-[3.5rem] p-4 min-h-[700px] flex flex-col relative overflow-hidden group shadow-inner">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-20"></div>
               
               {isGenerating ? (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in zoom-in-95 duration-500 relative z-10">
                    <div className="relative">
                       <div className="w-48 h-48 border-4 border-white/50 rounded-full animate-pulse shadow-[0_0_50px_rgba(251,191,36,0.2)]"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center text-6xl">🕌</div>
                    </div>
                    <div className="text-center space-y-4 max-w-sm">
                       <h4 className="text-3xl font-black text-slate-800">Manifesting Vision</h4>
                       <p className="text-slate-500 font-medium leading-relaxed italic">Noor is synthesizing sacred patterns and divine proportions based on your request.</p>
                    </div>
                 </div>
               ) : errorMessage ? (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10 p-12 text-center animate-in fade-in duration-500 relative z-10">
                    <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-4xl text-rose-600">⚠️</div>
                    <div className="space-y-4 max-w-sm">
                       <h4 className="text-2xl font-black text-slate-800">Connection Interrupted</h4>
                       <p className="text-slate-500 font-medium leading-relaxed">{errorMessage}</p>
                    </div>
                    {errorMessage.includes("API key") && (
                      <button 
                        onClick={() => (window as any).aistudio.openSelectKey()} 
                        className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        Select Paid API Key
                      </button>
                    )}
                    <button onClick={resetGenerator} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">Clear and Reset</button>
                 </div>
               ) : resultImage ? (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-1000 relative z-10 p-6">
                    <div className="relative w-full max-h-[800px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group/img bg-slate-900/5">
                       <img src={resultImage} className="w-full h-full object-contain" alt="Generated vision" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity p-12 flex items-end">
                          <p className="text-white text-lg font-medium italic border-l-4 border-amber-500 pl-6">"{prompt}"</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                       <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = resultImage;
                          link.download = `SacredVision-${Date.now()}.png`;
                          link.click();
                        }}
                        className="bg-white border border-slate-200 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         Save vision
                       </button>
                       <ShareAction 
                        variant="full"
                        title="Sacred Vision Art" 
                        text={`I generated this sacred Islamic art with Noor AI: "${prompt}"`} 
                        image={resultImage}
                       />
                       <button 
                        onClick={resetGenerator}
                        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all"
                       >
                         Start Anew
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10 opacity-30 group-hover:opacity-50 transition-opacity duration-1000 relative z-10">
                    <div className="w-32 h-32 rounded-[3rem] border-4 border-slate-300 border-dashed flex items-center justify-center text-7xl font-arabic">فن</div>
                    <div className="text-center space-y-2">
                       <h4 className="text-3xl font-black text-slate-800">Divine Potential</h4>
                       <p className="text-slate-500 font-medium max-w-sm">Provide an Islamic prompt on the left to synthesize a sacred vision.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
           {/* Gallery logic stays same */}
           <div className="flex items-center justify-between border-b border-slate-200 pb-8 px-4">
              <div>
                 <h3 className="text-3xl font-black text-slate-800">Sacred Gallery</h3>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Artifacts of your spiritual imagination</p>
              </div>
              <div className="flex items-center gap-4">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400">{history.length} Pieces</p>
                 {history.length > 0 && (
                   <button onClick={clearGallery} className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:underline">Clear History</button>
                 )}
              </div>
           </div>
           
           {history.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {history.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setResultImage(img); setActiveView('generate'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="aspect-square rounded-[2rem] overflow-hidden border-2 border-transparent hover:border-amber-500 hover:shadow-2xl transition-all group relative"
                  >
                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Gallery item" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-white font-black text-[9px] uppercase tracking-widest bg-slate-900/60 px-3 py-1 rounded-full">View Artifact</span>
                    </div>
                  </button>
                ))}
              </div>
           ) : (
              <div className="py-40 text-center space-y-6">
                 <div className="text-8xl grayscale opacity-20">🎨</div>
                 <h4 className="text-2xl font-black text-slate-300">Your gallery is empty.</h4>
                 <button onClick={() => setActiveView('generate')} className="text-amber-600 font-bold uppercase tracking-widest text-[10px] hover:underline underline-offset-4">Create your first vision</button>
              </div>
           )}
        </div>
      )}

      <footer className="text-center pt-20 border-t border-slate-200 space-y-4">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Noor Vision • Enlightened Creativity</p>
         <p className="text-xs text-slate-400 italic max-w-lg mx-auto">"Allah is Beautiful and He loves beauty." — Prophet Muhammad ﷺ</p>
      </footer>
    </div>
  );
};

export default ImageGeneratorModule;
