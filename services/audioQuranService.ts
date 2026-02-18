
/**
 * Service for fetching Quran Audio data from AlQuran Cloud.
 */

const BASE_URL = 'https://api.alquran.cloud/v1';

export interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

/**
 * Fetches a list of high-quality audio editions (reciters) from AlQuran Cloud.
 */
export const fetchReciters = async (): Promise<Reciter[]> => {
  try {
    const response = await fetch(`${BASE_URL}/edition?format=audio&language=ar&type=versebyverse`);
    if (!response.ok) throw new Error("Reciters API failed");
    const data = await response.json();
    
    // Filter to prioritize common/high-quality bitrates or specific reciters if needed
    // For now, return the full list
    return data.data;
  } catch (error) {
    console.warn("Audio editions fetch failed, returning essentials:", error);
    return [
      { identifier: "ar.alafasy", name: "مشاري راشد العفاسي", englishName: "Mishary Rashid Alafasy", format: "audio", type: "versebyverse" },
      { identifier: "ar.abdulbasitmurattal", name: "عبد الباسط عبد الصمد", englishName: "Abdul Basit Abdul Samad (Murattal)", format: "audio", type: "versebyverse" },
      { identifier: "ar.minshawy", name: "محمد صديق المنشاوي", englishName: "Mohamed Siddiq El-Minshawi", format: "audio", type: "versebyverse" }
    ];
  }
};

/**
 * Gets the audio URL for a specific ayah and edition.
 */
export const getAyahAudioUrl = (editionIdentifier: string, ayahNumber: number): string => {
  return `https://cdn.islamic.network/quran/audio/128/${editionIdentifier}/${ayahNumber}.mp3`;
};
