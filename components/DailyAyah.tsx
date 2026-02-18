
import React, { useState, useEffect } from 'react';
import { fetchAyahByNumber, getDailyAyahNumber, fetchAyahTafsir, Ayah } from '../services/quranApiService';
import { generateNoorResponse } from '../services/geminiService';
import { getAyahAudioUrl } from '../services/audioQuranService';
import ShareAction from './ShareAction';
import { loadSubscription, useCredit } from '../services/subscriptionService';
import { supabase } from '../services/supabaseClient';
import SubscriptionWall from './SubscriptionWall';

const stripMarkdown = (text: string) => {
  return text.replace(/[#*`_~\[\]\(\)]/g, '');
};

const DailyAyah: React.FC = () => {
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [reflection, setReflection] = useState<string>('');
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [showTafsir, setShowTafsir] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadDailyVerse = async () => {
      setIsLoading(true);
      try {
        const ayahNum = getDailyAyahNumber();
        const data = await fetchAyahByNumber(ayahNum);
        setAyah(data);

        // Check cache for reflection to avoid API Rate Limits (429)
        const todayKey = new Date().toDateString();
        const cacheKey = `noor_daily_reflection_${ayahNum}_${todayKey}`;
        const cachedReflection = localStorage.getItem(cacheKey);

        if (cachedReflection) {
          setReflection(cachedReflection);
        } else {
          try {
            const prompt = `Provide a short, heart-softening spiritual reflection for this Quranic verse: ${data.text}. Keep it simple, warm, and practical. PLAIN TEXT ONLY.`;
            const aiReflection = await generateNoorResponse(prompt, "You are Noor, a compassionate spiritual companion. STRICT RULE: NO MARKDOWN.");
            if (aiReflection) {
              setReflection(aiReflection);
              localStorage.setItem(cacheKey, aiReflection);
            } else {
              throw new Error("Empty response from AI");
            }
          } catch (aiError) {
            console.warn("AI Reflection unavailable (Quota/Network):", aiError);
            // Fallback reflection to ensure UI doesn't break
            setReflection("Reflect deeply on this verse. In the remembrance of Allah do hearts find rest. Let these words wash over your soul today.");
          }
        }
      } catch (err) {
        console.error("Failed to load daily ayah:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDailyVerse();
  }, []);

  const handleTafsirToggle = async () => {
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sub = await loadSubscription(user.id);
    if (sub.tier !== 'premium' && sub.creditsRemaining <= 0) {
      setShowPaywall(true);
      return;
    }

    if (tafsir) {
      setShowTafsir(true);
      return;
    }

    if (ayah) {
      if (sub.tier === 'free') {
        const success = await useCredit(user.id);
        if (!success) {
          setShowPaywall(true);
          return;
        }
      }

      setIsLoadingTafsir(true);
      const text = await fetchAyahTafsir(ayah.number);
      if (text) setTafsir(stripMarkdown(text));
      setIsLoadingTafsir(false);
      setShowTafsir(true);
    }
  };

  const toggleAudio = () => {
    if (!ayah) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(getAyahAudioUrl('ar.alafasy', ayah.number));
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  if (isLoading || !ayah) return null;

  return (
    <div className="w-full bg-white rounded-[3rem] border border-[#E9E5D9] shadow-sm overflow-hidden relative group animate-in fade-in duration-1000">
      {showPaywall && <SubscriptionWall featureName="Classical Tafsir" onSuccess={() => { setShowPaywall(false); handleTafsirToggle(); }} onCancel={() => setShowPaywall(false)} />}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] font-arabic text-[15rem] pointer-events-none select-none">اية</div>
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#A68B5B] opacity-10"></div>
      <div className="p-8 md:p-16 space-y-12 relative z-10">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-2 h-6 bg-[#A68B5B] rounded-full gold-beam"></div>
             <span className="text-[11px] font-black uppercase text-[#A68B5B] tracking-[0.5em]">Daily Revelation</span>
          </div>
          <div className="flex gap-3">
             <button onClick={toggleAudio} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPlaying ? 'bg-[#A68B5B] text-white shadow-xl' : 'bg-[#FBF9F4] text-[#8E8E8E] hover:text-[#A68B5B] border border-[#E9E5D9]'}`}>
                {isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
             </button>
             <button onClick={handleTafsirToggle} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border relative ${showTafsir ? 'bg-[#121212] text-white shadow-xl border-[#121212]' : 'bg-[#FBF9F4] text-[#8E8E8E] hover:text-[#121212] border-[#E9E5D9]'}`}>
                {isLoadingTafsir ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <span className="font-bold">📖</span>}
                <div className="absolute -top-1 -right-1">
                   <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/></svg>
                </div>
             </button>
             <ShareAction title="Daily Ayah" text={`${ayah.arabicText}\n\n"${ayah.text}"`} />
          </div>
        </header>

        <div className="space-y-10 text-center">
          <p className="font-arabic text-5xl md:text-7xl leading-[2] text-[#121212]" dir="rtl">{ayah.arabicText}</p>
          <div className="max-w-4xl mx-auto space-y-6">
             <p className="text-[#3D3D3D] text-xl md:text-3xl font-medium tracking-tight leading-relaxed italic opacity-80">"{ayah.text}"</p>
             <p className="text-[10px] font-black uppercase text-[#A68B5B] tracking-[0.2em]">{ayah.surah?.englishName} • {ayah.numberInSurah}</p>
          </div>
        </div>

        {showTafsir && tafsir && (
          <div className="pt-12 border-t border-[#E9E5D9]/50 space-y-8 animate-in slide-in-from-top-6 duration-700">
             <h4 className="font-black text-sm text-[#121212] uppercase tracking-[0.3em]">Classical Commentary</h4>
             <div className="bg-[#FBF9F4] p-10 rounded-[2.5rem] border border-[#E9E5D9] text-lg text-[#3D3D3D] font-medium leading-[1.8] whitespace-pre-wrap font-serif">{tafsir}</div>
          </div>
        )}

        <div className="pt-12 border-t border-[#E9E5D9]/50 space-y-8">
           <h4 className="font-black text-sm text-[#121212] uppercase tracking-[0.3em]">Noor's Reflection</h4>
           <div className="bg-[#FFFFFF] p-10 rounded-[2.5rem] border border-[#E9E5D9] text-xl text-[#3D3D3D] font-medium leading-[1.8] whitespace-pre-wrap border-l-[6px] border-l-[#044E3B]">{reflection}</div>
        </div>
      </div>
    </div>
  );
};

export default DailyAyah;
