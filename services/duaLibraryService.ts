
import { DuaItem } from '../types';
import { supabase } from './supabaseClient';

const DUA_CACHE_KEY = 'noor_dua_library_v2'; // Bumped version to force refresh
const DUA_FAVORITES_KEY = 'noor_dua_favorites';

export const DUA_CATEGORIES = [
  'Morning', 'Evening', 'Sleep', 'Waking up', 'Prayer', 'Wudu', 
  'Forgiveness', 'Protection', 'Anxiety relief', 'Healing', 
  'Travel', 'Food', 'Family', 'Debt relief', 'Marriage', 
  'Guidance', 'Gratitude', 'Repentance', 'Distress', 'General', 'Knowledge'
];

const INITIAL_DUAS: DuaItem[] = [
  // --- MORNING & EVENING ---
  {
    id: 'morn-1',
    title: 'Sayyidul Istighfar (Master of Forgiveness)',
    whenToSay: 'Morning and Evening',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa Anta.",
    translation: "O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your slave, and I am faithful to my covenant and my promise to You as much as I can. I seek refuge with You from all the evil I have done. I acknowledge before You all the blessings You have bestowed upon me, and I confess to You all my sins. So I entreat You to forgive me, for no one can forgive sins except You.",
    reference: 'Sahih Al-Bukhari 6306',
    authenticity: 'Sahih',
    category: 'Morning',
    tags: ['forgiveness', 'morning', 'evening', 'paradise'],
    meaningSummary: 'Whoever says this during the day with firm faith and dies before evening will be from the people of Paradise.',
    usageFrequency: 0
  },
  {
    id: 'morn-2',
    title: 'Protection from Harm',
    whenToSay: '3 times Morning and Evening',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim.",
    translation: "In the Name of Allah with Whose Name there is protection against every kind of harm in the earth or in the heaven, and He is the All-Hearing and All-Knowing.",
    reference: 'Abu Dawud 5088',
    authenticity: 'Sahih',
    category: 'Protection',
    tags: ['morning', 'evening', 'safety'],
    meaningSummary: 'Nothing will harm the one who recites this.',
    usageFrequency: 0
  },
  
  // --- ANXIETY & DISTRESS ---
  {
    id: 'anx-1',
    title: 'Relief from Anxiety and Grief',
    whenToSay: 'When feeling overwhelmed',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal.",
    translation: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and being overpowered by men.",
    reference: 'Sahih Al-Bukhari 6369',
    authenticity: 'Sahih',
    category: 'Anxiety relief',
    tags: ['anxiety', 'depression', 'debt', 'protection'],
    meaningSummary: 'A comprehensive plea for mental and physical strength.',
    usageFrequency: 0
  },
  {
    id: 'distress-1',
    title: 'The Dua of Yunus (AS)',
    whenToSay: 'In deep distress',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimin.",
    translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    reference: 'Quran 21:87',
    authenticity: 'Quran',
    category: 'Distress',
    tags: ['distress', 'forgiveness', 'miracle'],
    meaningSummary: 'No Muslim supplicates with this for anything except that Allah responds to him.',
    usageFrequency: 0
  },

  // --- SLEEP & WAKING ---
  {
    id: 'sleep-1',
    title: 'Before Sleeping',
    whenToSay: 'Before bed',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: "Bismika Allahumma amutu wa ahya.",
    translation: "In Your Name, O Allah, I die and I live.",
    reference: 'Sahih Al-Bukhari 6324',
    authenticity: 'Sahih',
    category: 'Sleep',
    tags: ['sleep', 'protection'],
    usageFrequency: 0
  },
  {
    id: 'wake-1',
    title: 'Upon Waking Up',
    whenToSay: 'Immediately upon waking',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
    translation: "Praise is to Allah Who gives us life after He has caused us to die and unto Him is the resurrection.",
    reference: 'Sahih Al-Bukhari 6312',
    authenticity: 'Sahih',
    category: 'Waking up',
    tags: ['morning', 'gratitude'],
    usageFrequency: 0
  },

  // --- PRAYER & WUDU ---
  {
    id: 'wudu-1',
    title: 'After Wudu',
    whenToSay: 'After completing ablution',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ',
    transliteration: "Ash-hadu an la ilaha illallahu wahdahu la sharika lahu wa ash-hadu anna Muhammadan 'abduhu wa Rasuluh. Allahummaj-'alni minat-tawwabina waj-'alni minal-mutatahhirin.",
    translation: "I testify that there is no God but Allah alone, with no partner, and I testify that Muhammad is His slave and Messenger. O Allah, make me among those who repent and make me among those who purify themselves.",
    reference: 'At-Tirmidhi 55',
    authenticity: 'Sahih',
    category: 'Wudu',
    tags: ['purity', 'forgiveness'],
    meaningSummary: 'The eight gates of Paradise are opened for him.',
    usageFrequency: 0
  },
  {
    id: 'prayer-1',
    title: 'Between Two Prostrations',
    whenToSay: 'Sitting between Sujood',
    arabic: 'رَبِّ اغْفِرْ لِي رَبِّ اغْفِرْ لِي',
    transliteration: "Rabbigh-fir li, Rabbigh-fir li.",
    translation: "Lord forgive me, Lord forgive me.",
    reference: 'Abu Dawud 874',
    authenticity: 'Sahih',
    category: 'Prayer',
    tags: ['salah', 'forgiveness'],
    usageFrequency: 0
  },

  // --- DEBT & RIZQ ---
  {
    id: 'debt-1',
    title: 'Protection from Debt',
    whenToSay: 'When burdened by financial difficulty',
    arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    transliteration: "Allahummak-fini bihalalika 'an haramika, wa aghnini bifadlika 'amman siwaka.",
    translation: "O Allah, suffice me with what You have allowed instead of what You have forbidden, and make me independent of all others besides You.",
    reference: 'At-Tirmidhi 3563',
    authenticity: 'Hasan',
    category: 'Debt relief',
    tags: ['wealth', 'rizq', 'debt'],
    meaningSummary: 'Even if you had a mountain of debt, Allah would pay it off for you.',
    usageFrequency: 0
  },

  // --- FAMILY & MARRIAGE ---
  {
    id: 'fam-1',
    title: 'For Spouse and Children',
    whenToSay: 'Anytime',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama.",
    translation: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.",
    reference: 'Quran 25:74',
    authenticity: 'Quran',
    category: 'Family',
    tags: ['marriage', 'children', 'righteousness'],
    usageFrequency: 0
  },
  {
    id: 'parents-1',
    title: 'For Parents',
    whenToSay: 'Anytime',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: "Rabbir-hamhuma kama rabbayani saghira.",
    translation: "My Lord, have mercy upon them as they brought me up [when I was] small.",
    reference: 'Quran 17:24',
    authenticity: 'Quran',
    category: 'Family',
    tags: ['parents', 'mercy'],
    usageFrequency: 0
  },

  // --- TRAVEL & FOOD ---
  {
    id: 'travel-1',
    title: 'Starting a Journey',
    whenToSay: 'When mounting vehicle',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrinina wa inna ila Rabbina lamunqalibun.",
    translation: "Glory is to Him Who has subjected this to us, and we were not able to do it. And surely to our Lord we will return.",
    reference: 'Quran 43:13-14',
    authenticity: 'Quran',
    category: 'Travel',
    tags: ['travel', 'safety'],
    usageFrequency: 0
  },
  {
    id: 'food-1',
    title: 'After Eating',
    whenToSay: 'After finishing a meal',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.",
    translation: "Praise is to Allah Who has fed me this and provided it for me with no power nor might from myself.",
    reference: 'At-Tirmidhi 3458',
    authenticity: 'Sahih',
    category: 'Food',
    tags: ['food', 'gratitude'],
    meaningSummary: 'His past sins will be forgiven.',
    usageFrequency: 0
  },

  // --- KNOWLEDGE & GUIDANCE ---
  {
    id: 'know-1',
    title: 'Seeking Knowledge',
    whenToSay: 'Before studying',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: "Rabbi zidni 'ilma.",
    translation: "My Lord, increase me in knowledge.",
    reference: 'Quran 20:114',
    authenticity: 'Quran',
    category: 'Knowledge',
    tags: ['study', 'wisdom'],
    usageFrequency: 0
  },
  {
    id: 'guide-1',
    title: 'Dua for Guidance (Istikhara)',
    whenToSay: 'When making a decision',
    arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ...',
    transliteration: "Allahumma inni astakhiruka bi'ilmika wa astaqdiruka biqudratika...",
    translation: "O Allah, I seek Your counsel through Your knowledge and I seek Your assistance through Your power...",
    reference: 'Sahih Al-Bukhari 1166',
    authenticity: 'Sahih',
    category: 'Guidance',
    tags: ['decision', 'istikhara'],
    meaningSummary: 'Tap to read full Istikhara Dua',
    usageFrequency: 0
  },

  // --- HEALING & SICKNESS ---
  {
    id: 'heal-1',
    title: 'Visiting the Sick',
    whenToSay: '7 times when visiting sick',
    arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    transliteration: "As'alul-lahal-'Azima Rabbal-'Arshil-'Azimi an yashfiyaka.",
    translation: "I ask Allah the Almighty, Lord of the Mighty Throne, to heal you.",
    reference: 'At-Tirmidhi 2083',
    authenticity: 'Sahih',
    category: 'Healing',
    tags: ['sickness', 'health'],
    usageFrequency: 0
  },
  {
    id: 'heal-2',
    title: 'For Pain in Body',
    whenToSay: 'Place hand on pain',
    arabic: 'بِسْمِ اللَّهِ (3) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (7)',
    transliteration: "Bismillah (3x). A'udhu billahi wa qudratihi min sharri ma ajidu wa uhadhiru (7x).",
    translation: "In the Name of Allah. I seek refuge with Allah and His Power from the evil of what I feel and that which I am wary of.",
    reference: 'Sahih Muslim 2202',
    authenticity: 'Sahih',
    category: 'Healing',
    tags: ['pain', 'health'],
    usageFrequency: 0
  },

  // --- REPENTANCE ---
  {
    id: 'rep-1',
    title: 'General Repentance',
    whenToSay: 'Anytime',
    arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal-khasirin.",
    translation: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    reference: 'Quran 7:23',
    authenticity: 'Quran',
    category: 'Repentance',
    tags: ['tawbah', 'adam'],
    usageFrequency: 0
  },
  
  // --- GRATITUDE ---
  {
    id: 'grat-1',
    title: 'For Good News/General',
    whenToSay: 'Upon blessings',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ',
    transliteration: "Alhamdu lillahil-ladhi bini'matihi tatimmus-salihat.",
    translation: "All praise is due to Allah by Whose grace good deeds are completed.",
    reference: 'Ibn Majah 3803',
    authenticity: 'Sahih',
    category: 'Gratitude',
    tags: ['thanks', 'praise'],
    usageFrequency: 0
  }
];

export const fetchDuaLibrary = async (): Promise<DuaItem[]> => {
  try {
    const cached = localStorage.getItem(DUA_CACHE_KEY);
    if (cached) return JSON.parse(cached);
    localStorage.setItem(DUA_CACHE_KEY, JSON.stringify(INITIAL_DUAS));
    return INITIAL_DUAS;
  } catch (e) {
    return INITIAL_DUAS;
  }
};

export const getDailyDua = (allDuas: DuaItem[]): DuaItem => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % allDuas.length;
  return allDuas[index];
};

export const searchDuas = (allDuas: DuaItem[], query: string): DuaItem[] => {
  const q = query.toLowerCase();
  return allDuas.filter(d => 
    d.title.toLowerCase().includes(q) || 
    d.translation.toLowerCase().includes(q) || 
    d.tags.some(t => t.toLowerCase().includes(q)) ||
    d.category.toLowerCase().includes(q)
  );
};

export const toggleFavorite = async (userId: string | undefined, duaId: string): Promise<boolean> => {
  try {
    const favorites = JSON.parse(localStorage.getItem(DUA_FAVORITES_KEY) || '[]');
    const isFav = favorites.includes(duaId);
    let nextFavs = isFav ? favorites.filter((id: string) => id !== duaId) : [...favorites, duaId];
    localStorage.setItem(DUA_FAVORITES_KEY, JSON.stringify(nextFavs));
    return !isFav;
  } catch (e) {
    return false;
  }
};

export const getFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DUA_FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
};

export const getRecommendedDuas = (allDuas: DuaItem[]): DuaItem[] => {
  const hour = new Date().getHours();
  let recommended = allDuas.filter(d => {
    if (hour >= 4 && hour < 10) return d.category === 'Morning';
    if (hour >= 18 && hour < 23) return d.category === 'Evening' || d.category === 'Sleep';
    return d.category === 'General' || d.category === 'Forgiveness';
  });
  if (recommended.length === 0) return allDuas.slice(0, 3);
  return recommended.sort(() => 0.5 - Math.random()).slice(0, 3);
};

export const trackRecitation = async (userId: string | undefined, duaId: string) => {
  try {
    const stats = JSON.parse(localStorage.getItem('noor_dua_stats') || '{}');
    stats[duaId] = (stats[duaId] || 0) + 1;
    localStorage.setItem('noor_dua_stats', JSON.stringify(stats));
  } catch (e) {}
};
