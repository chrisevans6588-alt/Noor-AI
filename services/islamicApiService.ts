
/**
 * Service for interacting with Islamicapi.com and Aladhan API.
 * Integrated with CacheService for performance and offline support.
 */
import { getCache, setCache, CACHE_EXPIRY } from './cacheService';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: string;
  timezone: string;
  location: string;
  method: string;
}

export interface CalendarDay {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    gregorian: { day: string; month: { number: number; en: string }; year: string };
    hijri: { day: string; month: { number: number; en: string; ar: string }; year: string; holidays: string[] };
  };
}

/**
 * Fetches prayer times by coordinates with a 6-hour cache.
 */
export const fetchPrayerTimes = async (lat: number, lng: number, method: number = 2): Promise<PrayerData | null> => {
  const cacheKey = `prayer_times_${lat.toFixed(2)}_${lng.toFixed(2)}_${method}`;
  const cached = getCache<PrayerData>(cacheKey, CACHE_EXPIRY.SHORT);
  if (cached) return cached;

  try {
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`Aladhan API Error: ${response.status}`);

    const data = await response.json();
    const t = data.data.timings;
    
    const result = {
      timings: t,
      date: data.data.date.readable,
      timezone: data.data.meta.timezone,
      location: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      method: data.data.meta.method.name
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Prayer time fetch failed:', error);
    return null;
  }
};

/**
 * Fetches prayer times by city and country.
 */
export const fetchPrayerTimesByCity = async (city: string, country: string, method: number = 2): Promise<PrayerData | null> => {
  const cacheKey = `prayer_times_city_${city}_${country}_${method}`;
  const cached = getCache<PrayerData>(cacheKey, CACHE_EXPIRY.SHORT);
  if (cached) return cached;

  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City lookup failed");
    const data = await response.json();
    const t = data.data.timings;
    
    const result = {
      timings: t,
      date: data.data.date.readable,
      timezone: data.data.meta.timezone,
      location: `${city}, ${country}`,
      method: data.data.meta.method.name
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Manual city lookup error:", error);
    return null;
  }
};

export const fetchMonthlyCalendar = async (lat: number, lng: number, month: number, year: number): Promise<CalendarDay[]> => {
  const cacheKey = `calendar_${lat.toFixed(2)}_${lng.toFixed(2)}_${month}_${year}`;
  const cached = getCache<CalendarDay[]>(cacheKey, CACHE_EXPIRY.MEDIUM);
  if (cached) return cached;

  try {
    const url = `https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=2&month=${month}&year=${year}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch calendar");
    const data = await response.json();
    setCache(cacheKey, data.data);
    return data.data;
  } catch (error) {
    console.error("Monthly calendar fetch error:", error);
    return [];
  }
};
