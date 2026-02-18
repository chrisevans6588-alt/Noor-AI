
import { AdhanSettings, AdhanVoice } from '../types';
import { db, doc, getDoc, setDoc } from './firebaseClient';
import { fetchPrayerTimes } from './islamicApiService';

export const ADHAN_VOICES: AdhanVoice[] = [
  { id: 'azan-makkah', name: 'Al-Haram Makkah', muezzin: 'Sheikh Ali Mulla', url: 'https://www.al-hamdoulillah.com/adhan/mp3/adhan-makkah.mp3' },
  { id: 'azan-madinah', name: 'Al-Masjid an-Nabawi', muezzin: 'Madinah Style', url: 'https://www.al-hamdoulillah.com/adhan/mp3/adhan-madina.mp3' },
  { id: 'azan-aqsa', name: 'Al-Aqsa', muezzin: 'Jerusalem Style', url: 'https://www.al-hamdoulillah.com/adhan/mp3/adhan-al-aqsa.mp3' },
  { id: 'azan-egypt', name: 'Cairo Style', muezzin: 'Egyptian Classic', url: 'https://www.al-hamdoulillah.com/adhan/mp3/adhan-egypt.mp3' },
  { id: 'azan-soft', name: 'Soft Morning', muezzin: 'Soothing Voice', url: 'https://www.al-hamdoulillah.com/adhan/mp3/adhan-fajr.mp3' },
];

export const CALCULATION_METHODS = [
  { id: 1, name: 'Egyptian General Authority' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm Al-Qura University, Makkah' },
  { id: 5, name: 'Univ. of Islamic Sciences, Karachi' },
  { id: 12, name: 'Union des Organisations Islamiques de France' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
];

const SETTINGS_KEY = 'noor_adhan_settings';

export const getDefaultSettings = (userId: string = 'guest'): AdhanSettings => ({
  userId,
  latitude: null,
  longitude: null,
  method: 2,
  adhanSound: 'azan-makkah',
  notificationsEnabled: true,
  mutePrayers: [],
  volumeLevel: 0.8,
  notificationLeadTime: 10,
  autoPlayAdhan: true,
  overrideSilentMode: false,
  softFajrEnabled: true
});

export const loadAdhanSettings = async (userId: string): Promise<AdhanSettings> => {
  try {
    const docRef = doc(db, 'adhan_settings', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId: userId,
        latitude: data.location_lat,
        longitude: data.location_lng,
        method: data.calculation_method,
        adhanSound: data.adhan_sound,
        notificationsEnabled: data.notifications_enabled,
        mutePrayers: data.mute_prayers || [],
        volumeLevel: data.volume_level,
        notificationLeadTime: data.notification_lead_time || 10,
        autoPlayAdhan: data.auto_play_adhan ?? true,
        overrideSilentMode: data.override_silent_mode ?? false,
        softFajrEnabled: data.soft_fajr_enabled ?? true
      };
    }
  } catch (e) {
    // Fail silently to local settings
  }

  const local = localStorage.getItem(SETTINGS_KEY);
  return local ? JSON.parse(local) : getDefaultSettings(userId);
};

export const saveAdhanSettings = async (settings: AdhanSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  if (settings.userId !== 'guest') {
    try {
      const docRef = doc(db, 'adhan_settings', settings.userId);
      await setDoc(docRef, {
        location_lat: settings.latitude,
        location_lng: settings.longitude,
        calculation_method: settings.method,
        adhan_sound: settings.adhanSound,
        notifications_enabled: settings.notificationsEnabled,
        mute_prayers: settings.mutePrayers,
        volume_level: settings.volumeLevel,
        notification_lead_time: settings.notificationLeadTime,
        auto_play_adhan: settings.autoPlayAdhan,
        override_silent_mode: settings.overrideSilentMode,
        soft_fajr_enabled: settings.softFajrEnabled
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore sync pending.");
    }
  }
};

export const checkPrayerTime = (timings: any, currentTime: Date): string | null => {
  const currentStr = currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  for (const [prayer, time] of Object.entries(timings)) {
    if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayer)) {
      if (time === currentStr) return prayer;
    }
  }
  return null;
};

export const checkLeadTime = (timings: any, currentTime: Date, leadMinutes: number): string | null => {
  const futureTime = new Date(currentTime.getTime() + leadMinutes * 60000);
  const futureStr = futureTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  for (const [prayer, time] of Object.entries(timings)) {
    if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayer)) {
      if (time === futureStr) return prayer;
    }
  }
  return null;
};
