
/**
 * Service to fetch and manage authenticated Dua and Dhikr data.
 * This library acts as the core repository for Noor's supplication intelligence.
 */
import { DuaItem } from '../types';

const INTERNAL_DUA_LIBRARY: DuaItem[] = [
  // --- 1. Daily Adhkar (Morning & Evening) ---
  {
    id: 'morning_1',
    title: 'Morning Praise and Affirmation',
    whenToSay: 'After Fajr prayer.',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Asbahna wa asbahal-mulku lillahi, wal-hamdu lillahi, la ilaha illallahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadir",
    translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped but Allah alone, without partner.",
    reference: 'Sahih Muslim 4/2088',
    authenticity: 'Sahih',
    category: 'Daily Adhkar',
    // Added missing tags
    tags: ['morning', 'adhkar'],
    virtue: "Acknowledging Allah's supreme authority at the start of the day brings barakah and clarity.",
    howToSay: 'Once every morning.',
    context: 'Part of the essential morning routine taught by the Prophet ﷺ.'
  },
  {
    id: 'evening_1',
    title: 'Evening Praise and Affirmation',
    whenToSay: 'After Asr or Maghrib prayer.',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: "Amsayna wa amsal-mulku lillahi, wal-hamdu lillahi, la ilaha illallahu wahdahu la sharika lahu",
    translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah.",
    reference: 'Sahih Muslim 2723',
    authenticity: 'Sahih',
    category: 'Daily Adhkar',
    // Added missing tags
    tags: ['evening', 'adhkar'],
    virtue: 'Declaring tawhid at the end of the day secures one\'s faith before sleep.',
    howToSay: 'Once every evening.',
    context: 'Parallel to the morning invocation.'
  },

  // --- 2. Protection ---
  {
    id: 'protection_1',
    title: 'Protection from All Harm',
    whenToSay: 'Three times in the morning and evening.',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim",
    translation: "In the Name of Allah, Who with His Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    reference: 'Abu Dawud 4/323',
    authenticity: 'Sahih',
    category: 'Protection',
    // Added missing tags
    tags: ['protection'],
    virtue: 'Whoever recites it three times will not be afflicted by any sudden calamity.',
    howToSay: 'Three times every morning and evening.',
    context: 'A comprehensive shield for the believer.'
  },
  {
    id: 'protection_evil_eye',
    title: 'Protection of Children',
    whenToSay: 'When fearing for the safety of children or family.',
    arabic: 'أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    transliteration: "U'idhu-ka bi-kalimatillahi-t-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah",
    translation: "I seek refuge for you in the perfect words of Allah from every devil and every poisonous pest and from every evil eye.",
    reference: 'Sahih Bukhari 3371',
    authenticity: 'Sahih',
    category: 'Protection',
    // Added missing tags
    tags: ['protection', 'children'],
    virtue: 'The Prophet ﷺ used this for Hasan and Husain (ra).',
    howToSay: 'Recite while intending protection for the child.',
    context: 'Classic Prophetic remedy for the evil eye.'
  },

  // --- 3. Health & Healing ---
  {
    id: 'healing_pain',
    title: 'Relief from Physical Pain',
    whenToSay: 'When feeling pain in any part of the body.',
    arabic: 'بِسْمِ اللَّهِ (٣) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (٧)',
    transliteration: "Bismillah (3x), A'udhu billahi wa qudratihi min sharri ma ajidu wa uhadhiru (7x)",
    translation: "In the Name of Allah. I seek refuge in Allah and His Power from the evil of what I find and of what I fear.",
    reference: 'Sahih Muslim 4/1728',
    authenticity: 'Sahih',
    category: 'Health & Healing',
    // Added missing tags
    tags: ['healing', 'pain'],
    virtue: 'Direct Prophetic instruction for self-healing.',
    howToSay: 'Place hand on the painful area, say Bismillah 3 times, then the second part 7 times.',
    context: 'Taught by the Prophet ﷺ to a companion suffering from long-term pain.'
  },
  {
    id: 'healing_sick',
    title: 'Visiting the Sick',
    whenToSay: 'When visiting a patient.',
    arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    transliteration: "As'alul-lahal-'Azima Rabbal-'Arshil-'Azimi an yashfiyaka",
    translation: "I ask Allah the Almighty, Lord of the Mighty Throne, to heal you.",
    reference: 'At-Tirmidhi 2083',
    authenticity: 'Sahih',
    category: 'Health & Healing',
    // Added missing tags
    tags: ['healing', 'sick'],
    virtue: 'If the time of death has not arrived, Allah will surely heal them.',
    howToSay: 'Seven times beside the sick person.',
    context: 'Empowering the patient with faith in Allah\'s healing.'
  },

  // --- 4. Travel ---
  {
    id: 'travel_start',
    title: 'Setting Out on a Journey',
    whenToSay: 'When starting a journey and mounting the vehicle.',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrineen, wa inna ila Rabbina lamunqaliboon",
    translation: "Glory is to Him Who has provided this for us, though we could never have subdued it by ourselves. And surely, unto our Lord we are returning.",
    reference: 'Sahih Muslim 2/998',
    authenticity: 'Sahih',
    category: 'Travel',
    // Added missing tags
    tags: ['travel'],
    virtue: 'Mindfulness of Allah\'s blessings and our ultimate destination.',
    howToSay: 'Once upon starting the journey.',
    context: 'Establishment of gratitude before travel.'
  },
  {
    id: 'travel_return',
    title: 'Returning from Travel',
    whenToSay: 'Upon returning home or reaching one\'s city.',
    arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
    transliteration: "A'ibuna, ta'ibuna, 'abiduna, li-Rabbina hamidun",
    translation: "We return, repenting, worshipping, and praising our Lord.",
    reference: 'Sahih Muslim 2/990',
    authenticity: 'Sahih',
    category: 'Travel',
    // Added missing tags
    tags: ['travel'],
    virtue: 'Reflecting on the successful return granted by Allah.',
    howToSay: 'Repeat while entering the home city.',
    context: 'Closing the journey with worship.'
  },

  // --- 5. Home & Daily Life ---
  {
    id: 'home_enter',
    title: 'Entering the Home',
    whenToSay: 'When crossing the threshold of your house.',
    arabic: 'بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna",
    translation: "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we rely.",
    reference: 'Abu Dawud 4/325',
    authenticity: 'Hasan',
    category: 'Home & Daily Life',
    // Added missing tags
    tags: ['home', 'entering'],
    virtue: 'Prevents Shaytan from entering or staying the night in the house.',
    howToSay: 'Once, then offer greetings (Salam) to those inside.',
    context: 'Brings peace and protection to the household.'
  },
  {
    id: 'home_exit',
    title: 'Leaving the Home',
    whenToSay: 'When stepping out of the house.',
    arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
    transliteration: "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah",
    translation: "In the Name of Allah, I have placed my trust in Allah, and there is no might or power except with Allah.",
    reference: 'Abu Dawud 4/325',
    authenticity: 'Sahih',
    category: 'Home & Daily Life',
    // Added missing tags
    tags: ['home', 'leaving'],
    virtue: 'One is guided, provided for, and protected. Shaytan turns away from them.',
    howToSay: 'Recite every time you leave.',
    context: 'A powerful declaration of reliance (Tawakkul).'
  },

  // --- 6. Food & Drink ---
  {
    id: 'food_start',
    title: 'Before Eating',
    whenToSay: 'Before the first bite.',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: "Bismillah",
    translation: "In the Name of Allah.",
    reference: 'Abu Dawud 3/347',
    authenticity: 'Sahih',
    category: 'Food & Drink',
    // Added missing tags
    tags: ['food', 'eating'],
    virtue: 'Invites blessing into the food and prevents Shaytan from sharing the meal.',
    howToSay: 'Once before starting.',
    context: 'If forgotten, say "Bismillahi fi awwalihi wa akhirihi" (In the Name of Allah at the beginning and the end).'
  },
  {
    id: 'food_end',
    title: 'After Eating',
    whenToSay: 'When finished with the meal.',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيِّهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha, wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation: "Praise is to Allah Who has fed me this and provided it for me without any might or power from myself.",
    reference: 'At-Tirmidhi 3458',
    authenticity: 'Sahih',
    category: 'Food & Drink',
    // Added missing tags
    tags: ['food', 'eating'],
    virtue: "All of one's previous minor sins are forgiven.",
    howToSay: 'Once after eating.',
    context: 'A prayer of immense gratitude.'
  },

  // --- 7. Sleep ---
  {
    id: 'sleep_before',
    title: 'Before Sleeping',
    whenToSay: 'When lying down in bed.',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: "Bismika Allahumma amootu wa ahya",
    translation: "In Your Name, O Allah, I die and I live.",
    reference: 'Sahih Bukhari 6324',
    authenticity: 'Sahih',
    category: 'Sleep',
    // Added missing tags
    tags: ['sleep'],
    virtue: 'Places the soul in the protection of Allah during its temporary "death" (sleep).',
    howToSay: 'Recite once as the final words.',
    context: 'The Sunnah includes sleeping on the right side.'
  },
  {
    id: 'sleep_wake',
    title: 'Upon Waking Up',
    whenToSay: 'Immediately after opening eyes.',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushoor",
    translation: "Praise is to Allah Who gives us life after He has caused us to die and unto Him is the resurrection.",
    reference: 'Sahih Bukhari 6312',
    authenticity: 'Sahih',
    category: 'Sleep',
    // Added missing tags
    tags: ['sleep', 'wake'],
    virtue: 'Acknowledging the gift of a new day and life.',
    howToSay: 'Once upon waking.',
    context: 'Sets a spiritual tone for the entire day.'
  },

  // --- 8. Distress & Difficulty ---
  {
    id: 'distress_1',
    title: 'Dua for Anxiety and Grief',
    whenToSay: 'When feeling overwhelmed or stressed.',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ...',
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal...",
    translation: "O Allah, I seek refuge in You from worry and grief. I seek refuge in You from helplessness and laziness...",
    reference: 'Sahih Bukhari 6369',
    authenticity: 'Sahih',
    category: 'Distress & Difficulty',
    // Added missing tags
    tags: ['distress', 'anxiety'],
    virtue: 'Comprehensive protection from mental and spiritual paralysis.',
    howToSay: 'Say once or repeatedly in times of worry.',
    context: 'The Prophet ﷺ made this dua frequently.'
  },
  {
    id: 'distress_yunus',
    title: 'Dua of Prophet Yunus (AS)',
    whenToSay: 'In any deep distress or impossible situation.',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimeen",
    translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    reference: 'Quran 21:87',
    authenticity: 'Quran',
    category: 'Distress & Difficulty',
    // Added missing tags
    tags: ['distress', 'yunus'],
    virtue: 'The Prophet ﷺ said no Muslim ever makes this dua except that Allah answers it.',
    howToSay: 'Repeat often during hardship.',
    context: 'Prophet Yunus (AS) said this in the belly of the whale.'
  },

  // --- 9. Special Occasions (Ramadan/Iftar) ---
  {
    id: 'iftar_1',
    title: 'Dua for Breaking Fast (Iftar)',
    whenToSay: 'At the exact moment of breaking the fast.',
    arabic: 'ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: "Dhahaba-zama'u, wab-tallatil-'urooqu, wa thabatal-ajru in-sha-Allah",
    translation: "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
    reference: 'Abu Dawud 2/306',
    authenticity: 'Sahih',
    category: 'Special Occasions',
    // Added missing tags
    tags: ['ramadan', 'iftar'],
    virtue: 'Expresses physical relief and spiritual hope simultaneously.',
    howToSay: 'Once, after the first sip of water or date.',
    context: 'The most authentic narration for breaking fast.'
  },

  // --- 10. Seeking Forgiveness ---
  {
    id: 'sayyidul_istighfar',
    title: 'The Master of Forgiveness',
    whenToSay: 'Morning and Evening.',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ...',
    transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka...",
    translation: "O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your slave...",
    reference: 'Sahih Bukhari 6306',
    authenticity: 'Sahih',
    category: 'Seeking Forgiveness',
    // Added missing tags
    tags: ['forgiveness', 'istighfar'],
    virtue: 'Guarantees Paradise if said with conviction and death follows.',
    howToSay: 'Once in the morning and once in the evening.',
    context: 'The peak of all istighfar.'
  }
];

export const fetchAllDuas = async (): Promise<DuaItem[]> => {
  return INTERNAL_DUA_LIBRARY;
};

export const getDuasBySituation = (situation: string): DuaItem[] => {
  const lowerSitu = situation.toLowerCase();
  return INTERNAL_DUA_LIBRARY.filter(d => 
    d.category.toLowerCase().includes(lowerSitu) || 
    d.title.toLowerCase().includes(lowerSitu) ||
    (d.context && d.context.toLowerCase().includes(lowerSitu))
  );
};
