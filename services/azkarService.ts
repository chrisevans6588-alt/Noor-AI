
import { DuaItem } from '../types';
import { getCache, setCache, CACHE_EXPIRY } from './cacheService';

const AZKAR_REPO_URL = 'https://raw.githubusercontent.com/nawafalqari/azkar-api/main/azkar.json';

/**
 * Essential Prophetic Supplications - Local Archive
 * Acts as a fail-safe repository.
 */
const ESSENTIAL_ADHKAR: DuaItem[] = [
  {
    id: 'f-morning-1',
    title: 'Morning Praise',
    whenToSay: 'After Fajr.',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: "Asbahna wa asbahal-mulku lillahi...",
    translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty...",
    reference: 'Sahih Muslim 4/2088',
    authenticity: 'Sahih',
    category: 'Daily Adhkar',
    tags: ['morning', 'adhkar'],
    howToSay: 'Once every morning.'
  }
];

export const fetchAzkar = async (): Promise<DuaItem[]> => {
  const cacheKey = 'azkar_library';
  const cached = getCache<DuaItem[]>(cacheKey, CACHE_EXPIRY.LONG);
  if (cached) return cached;

  try {
    const response = await fetch(AZKAR_REPO_URL);
    if (!response.ok) return ESSENTIAL_ADHKAR;
    
    const data = await response.json();
    const allDuas: DuaItem[] = [];

    Object.keys(data).forEach(category => {
      data[category].forEach((item: any, index: number) => {
        allDuas.push({
          id: `zikr-${category}-${index}`,
          title: item.category || category,
          whenToSay: item.description || 'Recommended timing',
          arabic: item.content,
          transliteration: '',
          translation: '',
          reference: item.reference,
          authenticity: 'Sahih',
          category: category,
          tags: [category.toLowerCase()],
          howToSay: item.count ? `Repeat ${item.count} times.` : ''
        });
      });
    });

    const merged = [...ESSENTIAL_ADHKAR, ...allDuas];
    setCache(cacheKey, merged);
    return merged;
  } catch (error) {
    return ESSENTIAL_ADHKAR;
  }
};
