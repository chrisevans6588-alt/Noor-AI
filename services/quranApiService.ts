
/**
 * Service for interacting with AlQuran.cloud and QuranEnc APIs.
 * Integrated with CacheService for 30-day persistence of sacred text.
 */
import { getCache, setCache, CACHE_EXPIRY } from './cacheService';

const BASE_URL = 'https://api.alquran.cloud/v1';
const TAFSIR_BASE_URL = 'https://quranenc.com/api/v1/translation';

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  arabicText?: string;
  surah?: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
  };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs?: Ayah[];
}

/**
 * Fetches Surah list with 30-day cache.
 */
export const fetchSurahList = async (): Promise<Surah[]> => {
  const cacheKey = 'quran_surah_list';
  const cached = getCache<Surah[]>(cacheKey, CACHE_EXPIRY.LONG);
  if (cached) return cached;

  try {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    setCache(cacheKey, data.data);
    return data.data;
  } catch (e) {
    return [];
  }
};

/**
 * Fetches specific Surah details with translations and 30-day cache.
 */
export const fetchSurahDetail = async (surahNumber: number, edition: string = 'en.sahih'): Promise<Surah> => {
  const cacheKey = `quran_surah_detail_${surahNumber}_${edition}`;
  const cached = getCache<Surah>(cacheKey, CACHE_EXPIRY.LONG);
  if (cached) return cached;

  const [arabicRes, transRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}/quran-uthmani`),
    fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`)
  ]);
  
  const arabicData = await arabicRes.json();
  const transData = await transRes.json();
  
  const surah = transData.data;
  const arabicAyahs = arabicData.data.ayahs;
  
  if (surah.ayahs && arabicAyahs) {
    surah.ayahs = surah.ayahs.map((ayah: Ayah, index: number) => ({
      ...ayah,
      arabicText: arabicAyahs[index].text
    }));
  }
  
  setCache(cacheKey, surah);
  return surah;
};

/**
 * Fetches Ayah-specific Tafsir from QuranEnc with 30-day cache.
 */
export const fetchAyahTafsir = async (ayahNumber: number, edition: string = 'english_saheeh'): Promise<string | null> => {
  const cacheKey = `tafsir_${ayahNumber}_${edition}`;
  const cached = getCache<string>(cacheKey, CACHE_EXPIRY.LONG);
  if (cached) return cached;

  try {
    // AlQuran Cloud provides a consistent mapping for tafsir too
    const response = await fetch(`${BASE_URL}/ayah/${ayahNumber}/en.ibnkathir`);
    if (!response.ok) return null;
    const data = await response.json();
    const result = data.data.text;
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Tafsir fetch error:", error);
    return null;
  }
};

export const getDailyAyahNumber = (): number => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 6236) + 1;
};

export const fetchAyahByNumber = async (ayahNumber: number, edition: string = 'en.sahih'): Promise<Ayah> => {
  const response = await fetch(`${BASE_URL}/ayah/${ayahNumber}/${edition}`);
  const data = await response.json();
  
  const arabicRes = await fetch(`${BASE_URL}/ayah/${ayahNumber}/quran-uthmani`);
  const arabicData = await arabicRes.json();
  
  return {
    ...data.data,
    arabicText: arabicData.data.text
  };
};

export const fetchRandomAyah = async (edition: string = 'en.sahih'): Promise<Ayah> => {
  const randomAyahNum = Math.floor(Math.random() * 6236) + 1;
  return fetchAyahByNumber(randomAyahNum, edition);
};
