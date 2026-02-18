
import { RadioStation } from '../types';
import { db, collection, query, where, getDocs, addDoc, deleteDoc, doc } from './firebaseClient';

const RADIO_API_URL = 'https://data-rosy.vercel.app/radio.json';
const CACHE_KEY = 'noor_radio_cache';
const CACHE_TIME_KEY = 'noor_radio_cache_time';
const FAVORITES_LOCAL_KEY = 'noor_radio_favorites_local';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Helper to get local favorites
 */
const getLocalFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
};

/**
 * Helper to save local favorites
 */
const saveLocalFavorites = (urls: string[]) => {
  localStorage.setItem(FAVORITES_LOCAL_KEY, JSON.stringify(urls));
};

export const fetchRadioStations = async (): Promise<RadioStation[]> => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
    const isExpired = !cacheTime || (Date.now() - parseInt(cacheTime) > SEVEN_DAYS_MS);

    if (cachedData && !isExpired) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(RADIO_API_URL);
    if (!response.ok) throw new Error("Radio API failed");
    
    const data = await response.json();
    let stations: RadioStation[] = [];
    
    // Normalize data structure based on theRosy API format
    if (data.radios) {
      stations = data.radios.map((r: any) => ({
        id: r.id || r.url,
        name: r.name,
        url: r.url,
        reciter: r.reciter || 'Unknown Reciter',
        country: r.country || 'International',
        bitrate: r.bitrate
      }));
    } else if (Array.isArray(data)) {
      stations = data.map((r: any) => ({
        id: r.id || r.url,
        name: r.name,
        url: r.url,
        reciter: r.reciter || 'Unknown Reciter',
        country: r.country || 'International',
        bitrate: r.bitrate
      }));
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(stations));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    
    return stations;
  } catch (error) {
    console.error("Radio fetch error:", error);
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) return JSON.parse(cachedData);
    
    // Minimal fallback if everything fails
    return [
      { id: 'saudi', name: "Izaat al-Quran (Saudi)", url: "https://n02.radiojar.com/8s9u5p3ncd0uv", reciter: 'Multiple', country: 'Saudi Arabia' },
      { id: 'cairo', name: "Quran Radio Cairo", url: "https://ertu-quran.radioca.st/quran", reciter: 'Multiple', country: 'Egypt' }
    ];
  }
};

export const fetchFavoriteStations = async (userId: string): Promise<string[]> => {
  const localFavs = getLocalFavorites();
  
  try {
    const q = query(
      collection(db, 'favorite_radio_stations'),
      where('user_id', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const remoteUrls = querySnapshot.docs.map(doc => doc.data().stream_url);
    
    // Merge remote and local for a seamless experience
    const merged = Array.from(new Set([...localFavs, ...remoteUrls]));
    saveLocalFavorites(merged);
    return merged;
  } catch (e: any) {
    // Suppress permission errors to avoid console noise for unauthenticated/restricted users
    if (e.code !== 'permission-denied' && e.code !== 'failed-precondition') {
        console.error("Exception fetching favorites:", e);
    }
    return localFavs;
  }
};

export const toggleFavoriteStation = async (userId: string, station: RadioStation, isFav: boolean) => {
  // Always update local storage first
  const localFavs = getLocalFavorites();
  let updatedLocal;
  if (isFav) {
    updatedLocal = localFavs.filter(url => url !== station.url);
  } else {
    updatedLocal = [...localFavs, station.url];
  }
  saveLocalFavorites(updatedLocal);

  try {
    if (isFav) {
      // Find the doc to delete
      const q = query(
        collection(db, 'favorite_radio_stations'),
        where('user_id', '==', userId),
        where('stream_url', '==', station.url)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (d) => {
        await deleteDoc(doc(db, 'favorite_radio_stations', d.id));
      });
    } else {
      await addDoc(collection(db, 'favorite_radio_stations'), {
        user_id: userId,
        station_name: station.name,
        stream_url: station.url
      });
    }
  } catch (err) {
    console.warn("Failed to sync favorite to Firestore. Local save persisted.", err);
  }
};
