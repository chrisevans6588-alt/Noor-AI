
import { NightPhase, NightStatus, NightActivityLog } from '../types';
import { db, collection, addDoc } from './firebaseClient';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Calculates the current status of the Night Companion based on time and optional prayer times.
 */
export const calculateNightStatus = (fajrTimeStr?: string, maghribTimeStr?: string): NightStatus => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMin;

  // Activation window: 10:30 PM (22:30) to Fajr
  const startActivation = 22 * 60 + 30;
  
  // Default Fajr if not provided (5:30 AM)
  let fajrVal = 5 * 60 + 30;
  if (fajrTimeStr) {
    const [fH, fM] = fajrTimeStr.split(':').map(Number);
    fajrVal = fH * 60 + fM;
  }

  // Check if active
  const isNightTime = currentTimeVal >= startActivation || currentTimeVal < fajrVal;
  
  // Phase Calculation
  let phase: NightPhase = 'early';
  if (currentTimeVal >= 0 && currentTimeVal < 2 * 60) {
    phase = 'mid';
  } else if (currentTimeVal >= 2 * 60 && currentTimeVal < fajrVal) {
    phase = 'last_third';
  }

  // Precise Last Third Calculation if possible
  let isLastThird = phase === 'last_third';
  if (fajrTimeStr && maghribTimeStr) {
    const [mH, mM] = maghribTimeStr.split(':').map(Number);
    const maghribVal = mH * 60 + mM;
    
    // Total night duration in minutes
    let nightDuration = (fajrVal + (24 * 60)) - maghribVal;
    if (nightDuration > 24 * 60) nightDuration -= 24 * 60;
    
    const lastThirdStart = fajrVal - (nightDuration / 3);
    const normalizedLastThirdStart = lastThirdStart < 0 ? lastThirdStart + 24 * 60 : lastThirdStart;
    
    if (currentTimeVal >= normalizedLastThirdStart || (currentTimeVal < fajrVal && normalizedLastThirdStart > startActivation)) {
      isLastThird = true;
      phase = 'last_third';
    }
  }

  // Time remaining to Fajr
  let diff = fajrVal - currentTimeVal;
  if (diff < 0) diff += 24 * 60;
  const remH = Math.floor(diff / 60);
  const remM = diff % 60;

  return {
    isActive: isNightTime,
    phase,
    isLastThird,
    timeToFajr: `${remH}h ${remM}m`
  };
};

export const logNightActivity = async (userId: string, action: NightActivityLog['action_type']) => {
  try {
    await addDoc(collection(db, 'night_activity_logs'), {
      user_id: userId,
      action_type: action,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.warn("Logging failed", e);
  }
};

export const getNightGreeting = (status: NightStatus, name: string = 'Seeker') => {
  if (status.isLastThird) return `A blessed time, ${name}. The King of Kings has descended to the lowest heaven. Ask Him.`;
  if (status.phase === 'mid') return `Stillness surrounds you, ${name}. A perfect moment for your heart to find rest in His words.`;
  return `Welcome to the Night Companion, ${name}. The world sleeps; let your spirit wake.`;
};

export const generateNightAction = async (status: NightStatus): Promise<{ action: string; dua: string; ayah: string; dhikr: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Current Night Phase: ${status.phase}. Is Peak Tahajjud: ${status.isLastThird}. 
  Instantly generate a micro-spiritual plan for a user waking up late at night.
  Include: 
  1. A specific short act of worship (action)
  2. A targeted Dua (dua)
  3. A calming Quranic verse reference (ayah)
  4. A simple Dhikr cycle (dhikr)
  
  Tone: Merciful, calm, brief. No markdown. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            dua: { type: Type.STRING },
            ayah: { type: Type.STRING },
            dhikr: { type: Type.STRING }
          },
          required: ["action", "dua", "ayah", "dhikr"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      action: "Pray 2 Rakats of Tahajjud with long prostrations.",
      dua: "Ya Hayyu Ya Qayyum, by Your mercy I seek help.",
      ayah: "Truly, in the remembrance of Allah do hearts find rest. (13:28)",
      dhikr: "SubhanAllah wa bihamdihi (100 times)"
    };
  }
};
