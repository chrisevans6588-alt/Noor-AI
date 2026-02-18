
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const TEACHINGS = [
  {
    text: "The best of you are those who learn the Quran and teach it.",
    source: "Sahih Al-Bukhari 5027"
  },
  {
    text: "Verily, I have been sent to perfect good character.",
    source: "Al-Adab Al-Mufrad 273"
  },
  {
    text: "Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your busyness, and your life before your death.",
    source: "Shu'ab al-Iman 9575"
  },
  {
    text: "He who follows a path in quest of knowledge, Allah will make the path of Jannah easy to him.",
    source: "Sahih Muslim 2699"
  }
];

const FEATURES = [
  {
    title: "Noor AI Companion",
    desc: "Context-aware spiritual guidance based on authentic sources.",
    icon: "🤖"
  },
  {
    title: "Sacred Archives",
    desc: "Scholarly verified Quran, Hadith, and Duas at your fingertips.",
    icon: "📜"
  },
  {
    title: "Sunnah Engine",
    desc: "Build habits rooted in the Prophetic methodology.",
    icon: "🌿"
  },
  {
    title: "Private Sanctuary",
    desc: "Your spiritual data is encrypted and yours alone.",
    icon: "🔒"
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [teachingIndex, setTeachingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTeachingIndex((prev) => (prev + 1) % TEACHINGS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-y-auto no-scrollbar relative">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl font-arabic text-gold-primary">
              ن
            </div>
            <span className="font-bold tracking-widest uppercase text-sm">Noor</span>
          </div>
          <button 
            onClick={onEnter}
            className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
          >
            Login
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center text-center space-y-12 mb-24 animate-in fade-in zoom-in-95 duration-1000">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gold-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-pulse"></span>
              Spiritual Intelligence
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
              Divine Vault
            </h1>
            <p className="text-lg md:text-2xl text-zinc-400 font-medium max-w-xl mx-auto leading-relaxed">
              Your intelligent companion for the spiritual journey. Authenticated knowledge meets modern clarity.
            </p>
          </div>

          <button 
            onClick={onEnter}
            className="group relative px-12 py-5 bg-[#D4AF37] text-black rounded-[2rem] font-black uppercase tracking-widest overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              Enter Sanctuary
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </main>

        {/* Prophetic Teachings Slider */}
        <section className="mb-24 relative animate-in slide-in-from-bottom-10 duration-1000 delay-300">
          <div className="absolute inset-0 bg-gold-primary/5 blur-[100px] rounded-full"></div>
          <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[3rem] text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em] mb-6 block">Prophetic Light</span>
            <div className="h-32 flex flex-col justify-center">
              <p className="text-xl md:text-2xl font-serif leading-relaxed italic transition-all duration-500 opacity-90 text-white">
                "{TEACHINGS[teachingIndex].text}"
              </p>
            </div>
            <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mt-6">
              — {TEACHINGS[teachingIndex].source}
            </p>
            
            <div className="flex justify-center gap-2 mt-8">
              {TEACHINGS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === teachingIndex ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/10'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-10 duration-1000 delay-500">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        <footer className="mt-24 text-center text-zinc-600 text-xs font-medium uppercase tracking-widest">
          Secure • Private • Ethical
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
