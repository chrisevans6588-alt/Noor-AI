
/**
 * Generic Caching Service for Noor AI
 * Handles localStorage with expiration logic.
 */

export const CACHE_EXPIRY = {
  LONG: 30 * 24 * 60 * 60 * 1000, // 30 Days (Quran, Hadith, Azkar)
  MEDIUM: 24 * 60 * 60 * 1000,   // 1 Day
  SHORT: 6 * 60 * 60 * 1000,     // 6 Hours (Prayer Times)
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const setCache = <T>(key: string, data: T) => {
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCache = <T>(key: string, expiry: number): T | null => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    if (now - item.timestamp > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};
