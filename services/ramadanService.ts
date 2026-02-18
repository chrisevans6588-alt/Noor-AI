import { RamadanDayConfig, RamadanChallenge, RamadanDailyStat, RamadanMomentum, QiyamSchedule } from '../types';
import { db, doc, getDoc, setDoc, getDocs, query, collection, where, limit, updateDoc } from './firebaseClient';
import { fetchPrayerTimes } from './islamicApiService';

// --- 30-DAY CHALLENGE REPOSITORY ---
const RAMADAN_CHALLENGES: RamadanChallenge[] = [
  { day: 1, title: "The Intention", description: "Make a sincere Niyyah for the month. Write down 3 spiritual goals.", category: 'Character', difficulty: 'Easy' },
  { day: 2, title: "Sunnah of Dates", description: "Break your fast with dates and water, following the Prophet ﷺ.", category: 'Sunnah', difficulty: 'Easy' },
  { day: 3, title: "Extra Sujood", description: "Prolong your Sujood in one prayer today. Ask for your deepest need.", category: 'Nawafil', difficulty: 'Easy' },
  { day: 4, title: "Feed a Fasting Person", description: "Share your Iftar or provide food/water to someone else.", category: 'Character', difficulty: 'Medium' },
  { day: 5, title: "Digital Detox", description: "Avoid social media for 1 hour before Maghrib. Use it for Dhikr.", category: 'Character', difficulty: 'Medium' },
  { day: 6, title: "Qiyam Al-Layl", description: "Pray 2 extra Rakats after Isha (or before Fajr) specifically for Qiyam.", category: 'Nawafil', difficulty: 'Medium' },
  { day: 7, title: "SubhanAllah x100", description: "Recite 'SubhanAllah wa bihamdihi' 100 times. Sins fall like leaves.", category: 'Dhikr', difficulty: 'Easy' },
  { day: 8, title: "Smile Sunnah", description: "Smile at 3 people today. It is charity.", category: 'Sunnah', difficulty: 'Easy' },
  { day: 9, title: "Forgive Someone", description: "Let go of a grudge you are holding. Clean your heart.", category: 'Character', difficulty: 'Hard' },
  { day: 10, title: "Dua for Parents", description: "Make a specific, heartfelt Dua for your parents (alive or passed).", category: 'Sunnah', difficulty: 'Easy' },
  { day: 11, title: "Surah Mulk", description: "Recite Surah Mulk before sleeping to protect from the grave.", category: 'Sunnah', difficulty: 'Medium' },
  { day: 12, title: "Mid-Day Dhikr", description: "Recite 'La hawla wa la quwwata illa billah' 50 times during the day.", category: 'Dhikr', difficulty: 'Easy' },
  { day: 13, title: "Give Secret Sadaqah", description: "Give a small amount of charity without telling anyone.", category: 'Character', difficulty: 'Medium' },
  { day: 14, title: "Duha Prayer", description: "Pray 2 Rakats of Duha prayer (after sunrise, before Dhuhr).", category: 'Nawafil', difficulty: 'Medium' },
  { day: 15, title: "Halfway Check", description: "Review your goals from Day 1. Renew your intention.", category: 'Character', difficulty: 'Easy' },
  { day: 16, title: "Miswak/Toothbrush", description: "Purify your mouth before every prayer today (Sunnah).", category: 'Sunnah', difficulty: 'Easy' },
  { day: 17, title: "Ayatul Kursi", description: "Recite Ayatul Kursi after every Fard prayer today.", category: 'Dhikr', difficulty: 'Medium' },
  { day: 18, title: "Silence the Tongue", description: "Avoid complaining or backbiting completely today.", category: 'Character', difficulty: 'Hard' },
  { day: 19, title: "Salawat x100", description: "Send blessings on the Prophet ﷺ 100 times today.", category: 'Dhikr', difficulty: 'Easy' },
  { day: 20, title: "Prepare for Last 10", description: "Plan your schedule for the last ten nights. Intend Itikaf (even short).", category: 'Nawafil', difficulty: 'Easy' },
  { day: 21, title: "The Night Search", description: "Treat tonight as Laylatul Qadr. Pray extra.", category: 'Nawafil', difficulty: 'Hard' },
  { day: 22, title: "Istighfar Focus", description: "Recite 'Astaghfirullah' 300 times throughout the day.", category: 'Dhikr', difficulty: 'Medium' },
  { day: 23, title: "Specific Dua", description: "Use the Dua: 'Allahumma innaka afuwwun...' repeatedly tonight.", category: 'Dhikr', difficulty: 'Easy' },
  { day: 24, title: "Read Tafsir", description: "Read the meaning/explanation of one Surah you recite often.", category: 'Nawafil', difficulty: 'Medium' },
  { day: 25, title: "Night Vigil", description: "Stay awake after Fajr until sunrise doing Dhikr.", category: 'Nawafil', difficulty: 'Hard' },
  { day: 26, title: "Charity of Words", description: "Send a message of appreciation to a friend or relative.", category: 'Character', difficulty: 'Easy' },
  { day: 27, title: "Peak Worship", description: "Give your maximum effort tonight in prayer and dua.", category: 'Nawafil', difficulty: 'Hard' },
  { day: 28, title: "Zakat al-Fitr", description: "Ensure your Zakat al-Fitr is paid or planned.", category: 'Sunnah', difficulty: 'Easy' },
  { day: 29, title: "Gratitude Journal", description: "List 10 blessings Allah gave you this month.", category: 'Character', difficulty: 'Easy' },
  { day: 30, title: "Eid Prep", description: "Make ghusl and wear your best clothes for Eid tomorrow.", category: 'Sunnah', difficulty: 'Easy' },
];

/**
 * Helper to check if it is currently Ramadan based on local storage override or date estimation.
 */
export const checkIsRamadan = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('noor_force_ramadan') === 'true';
  }
  return false;
};

/**
 * Helper to get the current Ramadan day.
 */
export const getRamadanDay = (): number => {
  if (typeof window !== 'undefined' && localStorage.getItem('noor_force_ramadan') === 'true') {
    return 27; // Default to 27th night if forced mode is on
  }
  return 1;
};

/**
 * Checks Islamic Calendar API to determine Ramadan status.
 * If API fails, falls back to date estimation.
 */
export const getRamadanStatus = async (lat: number, lng: number): Promise<RamadanDayConfig> => {
  // Use ALADHAN Calendar API
  try {
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    
    // Using Aladhan Timing API which includes Hijri Date
    const url = `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lng}&method=2`;
    const response = await fetch(url);
    const data = await response.json();
    
    const hijriMonth = parseInt(data.data.date.hijri.month.number);
    const hijriDay = parseInt(data.data.date.hijri.day);
    
    // Ramadan is the 9th month
    const isRamadan = hijriMonth === 9;
    // Manual override for testing if needed
    const forceMode = localStorage.getItem('noor_force_ramadan') === 'true';

    let phase: 'mercy' | 'forgiveness' | 'refuge' = 'mercy';
    if (hijriDay > 10 && hijriDay <= 20) phase = 'forgiveness';
    if (hijriDay > 20) phase = 'refuge';

    return {
      hijriDay: forceMode ? 15 : hijriDay,
      isRamadan: forceMode ? true : isRamadan,
      phase
    };
  } catch (e) {
    console.error("Calendar Sync Failed, using manual override check");
    const forceMode = localStorage.getItem('noor_force_ramadan') === 'true';
    return {
      hijriDay: 1,
      isRamadan: forceMode,
      phase: 'mercy'
    };
  }
};

export const getDailyChallenge = (day: number): RamadanChallenge => {
  // Normalize day to 1-30 range
  const normalizedDay = Math.max(1, Math.min(30, day));
  return RAMADAN_CHALLENGES.find(c => c.day === normalizedDay) || RAMADAN_CHALLENGES[0];
};

// --- QIYAM CALCULATOR ---

export const calculateQiyamSchedule = (fajrTime: string, maghribTime: string): QiyamSchedule => {
  const now = new Date();
  
  // Parse Times
  const [fH, fM] = fajrTime.split(':').map(Number);
  const [mH, mM] = maghribTime.split(':').map(Number);
  
  const fajrDate = new Date();
  fajrDate.setHours(fH, fM, 0);
  
  // Adjust Fajr date if it's tomorrow relative to now (if now is late night)
  if (now.getHours() > fH) {
    fajrDate.setDate(now.getDate() + 1);
  }
  
  const diffMs = fajrDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  // Convert negative diff (if now is after Fajr)
  if (diffMins < 0) {
    return {
      timeRemaining: "Daytime",
      phase: 'Night',
      suggestedActs: [{ time: "Day", act: "Rest & Dhikr", benefit: "Preparation for tonight" }]
    };
  }

  const hoursLeft = Math.floor(diffMins / 60);
  const minsLeft = diffMins % 60;
  
  // Calculate Night Thirds logic
  // Total Night Duration approx (Maghrib yesterday to Fajr today)
  // Simplifying: Just check time remaining for immediate action
  
  let phase: 'Night' | 'Last Third' | 'Suhoor' = 'Night';
  const suggestedActs = [];

  if (diffMins <= 90) {
    phase = 'Suhoor';
    suggestedActs.push({ time: "Now", act: "Eat Suhoor", benefit: "Barakah in the meal" });
    suggestedActs.push({ time: "Last 15m", act: "Istighfar", benefit: "Best time for forgiveness" });
    suggestedActs.push({ time: "Prayer", act: "Witr (if not prayed)", benefit: "Seal the night prayer" });
  } else if (diffMins <= 240) { // Last 4 hours
    phase = 'Last Third';
    suggestedActs.push({ time: "Now", act: "Tahajjud (2-8 Rakats)", benefit: "Allah descends to the lowest heaven" });
    suggestedActs.push({ time: "Recitation", act: "Quran (Long Surahs)", benefit: "The most heavy/rewarding recitation" });
    suggestedActs.push({ time: "Dua", act: "Sincere Supplication", benefit: "Arrows that do not miss" });
  } else {
    phase = 'Night';
    suggestedActs.push({ time: "Now", act: "Taraweeh / Isha", benefit: "Reward of praying half the night" });
    suggestedActs.push({ time: "Later", act: "Sleep with Intention", benefit: "Rest becomes worship" });
  }

  return {
    timeRemaining: `${hoursLeft}h ${minsLeft}m`,
    phase,
    suggestedActs
  };
};

// --- DAILY STATS ---

export const fetchDailyStats = async (userId: string, date: string): Promise<RamadanDailyStat> => {
  const dateKey = date.split('T')[0];
  const docId = `${userId}_${dateKey}`;
  
  try {
    const docRef = doc(db, 'ramadan_daily_stats', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as RamadanDailyStat;
  } catch(e) {}

  // Default
  return { date: dateKey, quranPages: 0, fasting: false, taraweeh: false, challengeCompleted: false };
};

export const updateDailyStat = async (userId: string, update: Partial<RamadanDailyStat>) => {
  const now = new Date().toISOString();
  const dateKey = now.split('T')[0];
  const docId = `${userId}_${dateKey}`;
  
  try {
    const docRef = doc(db, 'ramadan_daily_stats', docId);
    await setDoc(docRef, { ...update, date: dateKey }, { merge: true });
    // Also add momentum for activity
    await updateMomentum(userId, 10); 
  } catch (e) {
    console.warn("Offline stat update");
  }
};

// --- MOMENTUM SYSTEM ---

export const fetchMomentum = async (userId: string): Promise<RamadanMomentum> => {
  try {
    const docRef = doc(db, 'ramadan_momentum', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as RamadanMomentum;
    }
    const init: RamadanMomentum = { currentLevel: 0, lastUpdate: new Date().toISOString(), streak: 0, multiplier: 1, isVaultUnlocked: false };
    await setDoc(docRef, init);
    return init;
  } catch (e) {
    // Local fallback
    const local = localStorage.getItem('noor_ramadan_momentum');
    if (local) return JSON.parse(local);
    return { currentLevel: 0, lastUpdate: new Date().toISOString(), streak: 0, multiplier: 1, isVaultUnlocked: false };
  }
};

export const updateMomentum = async (userId: string, points: number) => {
  const current = await fetchMomentum(userId);
  const now = new Date();
  const last = new Date(current.lastUpdate);
  
  // Daily Streak Logic
  const diffHours = (now.getTime() - last.getTime()) / (1000 * 3600);
  let streak = current.streak;
  let multiplier = current.multiplier;

  if (diffHours > 24 && diffHours < 48) {
    streak += 1;
    multiplier = Math.min(2.0, 1 + (streak * 0.1));
  } else if (diffHours >= 48) {
    streak = 0; // Reset streak if missed a day
    multiplier = 1;
  }

  // Calculate new level (Cap at 100)
  const addition = points * multiplier;
  let newLevel = Math.min(100, current.currentLevel + addition);
  
  // Decay logic: if inactive for 12 hours, lose slight momentum
  if (diffHours > 12) {
    newLevel = Math.max(0, newLevel - 5);
  }

  const isVaultUnlocked = newLevel >= 100 || current.isVaultUnlocked;

  const newData: RamadanMomentum = {
    currentLevel: newLevel,
    lastUpdate: now.toISOString(),
    streak,
    multiplier,
    isVaultUnlocked
  };

  try {
    await setDoc(doc(db, 'ramadan_momentum', userId), newData);
  } catch (e) {
    localStorage.setItem('noor_ramadan_momentum', JSON.stringify(newData));
  }
  return newData;
};