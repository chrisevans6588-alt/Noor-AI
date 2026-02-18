
import { AyahProgress, AyahStatus, HifdhPlan, HifdhSettings, HifdhTask } from '../types';
import { getCache, setCache, CACHE_EXPIRY } from './cacheService';

const HIFDH_PROGRESS_KEY = 'noor_hifdh_progress_v1';
const HIFDH_PLAN_KEY = 'noor_hifdh_plan_v1';

const SRA_INTERVALS = [1, 3, 7, 14, 30, 90];

export const fetchHifdhProgress = (): AyahProgress[] => {
  return JSON.parse(localStorage.getItem(HIFDH_PROGRESS_KEY) || '[]');
};

export const updateAyahProgress = (
  surah: number, 
  ayah: number, 
  status: AyahStatus, 
  accuracy: number = 100
) => {
  const allProgress = fetchHifdhProgress();
  const existingIdx = allProgress.findIndex(p => p.surahNumber === surah && p.ayahNumber === ayah);
  
  let current = existingIdx > -1 ? allProgress[existingIdx] : {
    surahNumber: surah,
    ayahNumber: ayah,
    status: 'Learning' as AyahStatus,
    lastReviewed: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),
    interval: 0,
    accuracyScore: 0,
    repetitionCount: 0
  };

  // SRA Logic
  let nextInterval = current.interval;
  if (status === 'Mastered') {
    const currentIdx = SRA_INTERVALS.indexOf(current.interval);
    nextInterval = SRA_INTERVALS[Math.min(SRA_INTERVALS.length - 1, currentIdx + 1)];
  } else if (status === 'Needs Revision') {
    nextInterval = 1;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);

  const updated: AyahProgress = {
    ...current,
    status,
    accuracyScore: accuracy,
    lastReviewed: new Date().toISOString(),
    nextReviewDate: nextDate.toISOString(),
    interval: nextInterval,
    repetitionCount: current.repetitionCount + 1
  };

  if (existingIdx > -1) {
    allProgress[existingIdx] = updated;
  } else {
    allProgress.push(updated);
  }

  localStorage.setItem(HIFDH_PROGRESS_KEY, JSON.stringify(allProgress));
  return updated;
};

export const getRevisionDue = () => {
  const all = fetchHifdhProgress();
  const now = new Date();
  return all.filter(p => new Date(p.nextReviewDate) <= now && p.status !== 'Mastered');
};

export const calculateHifdhPoints = (progress: AyahProgress[]) => {
  return progress.reduce((acc, curr) => {
    if (curr.status === 'Memorized') return acc + 10;
    if (curr.status === 'Mastered') return acc + 25;
    return acc;
  }, 0);
};

export const getHifdhMotivation = (streak: number) => {
  const quotes = [
    "The best among you are those who learn the Quran and teach it.",
    "The Quran will be an intercessor for its companions on the Day of Resurrection.",
    "Keep going, even one ayah a day is a mountain of light in your grave.",
    "Angels lower their wings for the seeker of sacred knowledge."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};
