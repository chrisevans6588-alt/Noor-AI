
/**
 * Service for interacting with Public Hadith API.
 * Integrated with CacheService for 30-day persistence.
 */
import { getCache, setCache, CACHE_EXPIRY } from './cacheService';

const BASE_URL = 'https://api.hadith.gading.dev/books';

export interface HadithBook {
  name: string;
  id: string;
  available: number;
}

export interface HadithItem {
  number: number;
  arab: string;
  id: string;
  contents: string;
}

export interface HadithDetail {
  name: string;
  id: string;
  available: number;
  hadith: HadithItem;
}

export const fetchHadithBooks = async (): Promise<HadithBook[]> => {
  const cacheKey = 'hadith_books';
  const cached = getCache<HadithBook[]>(cacheKey, CACHE_EXPIRY.LONG);
  if (cached) return cached;

  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    setCache(cacheKey, data.data);
    return data.data;
  } catch (e) {
    return [];
  }
};

export const fetchHadithRange = async (bookId: string, start: number, end: number): Promise<HadithItem[]> => {
  const cacheKey = `hadith_range_${bookId}_${start}_${end}`;
  const cached = getCache<HadithItem[]>(cacheKey, CACHE_EXPIRY.LONG);
  if (cached) return cached;

  try {
    const response = await fetch(`${BASE_URL}/${bookId}?range=${start}-${end}`);
    const data = await response.json();
    setCache(cacheKey, data.data.hadiths);
    return data.data.hadiths;
  } catch (e) {
    return [];
  }
};
