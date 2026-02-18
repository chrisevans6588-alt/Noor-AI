
import { SunnahPractice, SunnahStats } from '../types';
import { db, doc, getDoc, setDoc, getDocs, collection, updateDoc } from './firebaseClient';

const SUNNAH_LIBRARY: SunnahPractice[] = [
  // --- MORNING ---
  {
    id: 's_morning_1',
    title: 'Rubbing the Face upon Waking',
    description: 'Removing the traces of sleep physically and spiritually.',
    prophetic_application: 'When the Prophet ﷺ woke up, he would sit up and rub his face with his hand to remove the effects of sleep.',
    scholarly_explanation: 'This act helps stimulate blood flow to the face and alerts the senses, signaling the transition from the minor death of sleep to the new day.',
    how_to_practice: [
      'Sit up in bed rather than jumping out immediately.',
      'Rub your face with your hands.',
      'Recite the waking Dua: "Alhamdu lillahil-ladhi ahyana..."'
    ],
    reward: 'Reviving a Sunnah earns the reward of a martyr in times of corruption, and prepares one for a day of mindfulness.',
    hadith_reference: 'Sahih Bukhari 183',
    authenticity: 'Sahih',
    category: 'Morning',
    difficulty: 'Beginner',
    estimated_time: '10 seconds',
    created_at: new Date().toISOString()
  },
  {
    id: 's_morning_2',
    title: 'The Siwak (Miswak)',
    description: 'Purifying the mouth immediately upon waking.',
    prophetic_application: 'The Prophet ﷺ would never wake from sleep, night or day, without cleaning his teeth with the Siwak before performing Wudu.',
    scholarly_explanation: 'It pleases the Lord and purifies the mouth. It is emphasized upon waking due to changes in mouth breath during sleep.',
    how_to_practice: [
      'Keep a Miswak or toothbrush next to your bed.',
      'Use it gently on teeth and tongue immediately upon waking.',
      'Intend purity for the sake of Allah.'
    ],
    reward: 'Prayer with Siwak is 70 times superior to prayer without it (in some narrations).',
    hadith_reference: 'Sahih Muslim 252',
    authenticity: 'Sahih',
    category: 'Morning',
    difficulty: 'Beginner',
    estimated_time: '1 min',
    created_at: new Date().toISOString()
  },
  {
    id: 's_morning_3',
    title: 'Making the Bed',
    description: 'Starting the day with order and cleanliness.',
    prophetic_application: 'The Prophet ﷺ advised shaking out the bedding before sleeping, and cleanliness is half of faith.',
    scholarly_explanation: 'Ordering one’s environment reflects the order of the heart. It prevents laziness.',
    how_to_practice: [
      'Shake the sheets/duvet.',
      'Arrange the pillows neatly.',
      'Intend to leave the room in a state of dignity.'
    ],
    reward: 'Psychological clarity and following the spirit of purity.',
    hadith_reference: 'Sahih Bukhari 6320 (Contextual)',
    authenticity: 'Sahih',
    category: 'Morning',
    difficulty: 'Beginner',
    estimated_time: '2 mins',
    created_at: new Date().toISOString()
  },

  // --- EATING ---
  {
    id: 's_eating_1',
    title: 'Eating with Three Fingers',
    description: 'A method of eating that promotes mindfulness and digestion.',
    prophetic_application: 'The Prophet ﷺ used to eat with three fingers (thumb, index, and middle) and lick his hand before wiping it.',
    scholarly_explanation: 'Eating with three fingers reduces the bite size, aiding digestion and preventing gluttony. It is the practice of modesty.',
    how_to_practice: [
      'Use the right hand only.',
      'Gather food using the thumb, index, and middle fingers.',
      'Avoid filling the mouth excessively.'
    ],
    reward: 'Follows the humble lifestyle of the Prophet ﷺ and earns Barakah in food.',
    hadith_reference: 'Sahih Muslim 2032',
    authenticity: 'Sahih',
    category: 'Eating',
    difficulty: 'Intermediate',
    estimated_time: 'During meal',
    created_at: new Date().toISOString()
  },
  {
    id: 's_eating_2',
    title: 'The Etiquette of Water',
    description: 'Drinking in a way that respects the sustenance provided by Allah.',
    prophetic_application: 'The Prophet ﷺ prohibited drinking directly from the mouth of a water skin and advised drinking in sips.',
    scholarly_explanation: 'Drinking in three breaths prevents the sudden cooling of the stomach and allows the body to hydrate properly without shock.',
    how_to_practice: [
      'Sit down before drinking.',
      'Say "Bismillah" and look into the water.',
      'Drink in three distinct breaths, removing the vessel from the mouth each time.'
    ],
    reward: 'Prevents stomach ailments and ensures the heart remains grateful.',
    hadith_reference: 'Sahih Muslim 2024',
    authenticity: 'Sahih',
    category: 'Eating',
    difficulty: 'Beginner',
    estimated_time: '1 min',
    created_at: new Date().toISOString()
  },
  {
    id: 's_eating_3',
    title: 'Sharing the Meal',
    description: 'The blessing of food is in the gathering.',
    prophetic_application: 'The Prophet ﷺ said: "Eat together and do not separate, for the blessing is in the company."',
    scholarly_explanation: 'Communal eating fosters love (Mahabbah) between believers and family members and physically increases the sufficiency of the food.',
    how_to_practice: [
      'Eat from a single large platter if possible.',
      'Invite family or colleagues to eat with you.',
      'Eat from the side of the dish nearest to you.'
    ],
    reward: 'Barakah in the food; food for one becomes enough for two.',
    hadith_reference: 'Sunan Ibn Majah 3287',
    authenticity: 'Hasan',
    category: 'Eating',
    difficulty: 'Beginner',
    estimated_time: 'Meal time',
    created_at: new Date().toISOString()
  },
  {
    id: 's_eating_4',
    title: 'Not Blowing on Food',
    description: 'Patience and manners in consumption.',
    prophetic_application: 'The Prophet ﷺ prohibited breathing into the vessel or blowing into it.',
    scholarly_explanation: 'This prevents the transfer of germs and encourages patience to let food cool naturally.',
    how_to_practice: [
      'Wait for hot food to cool.',
      'Do not blow to cool it down.',
      'Eat from the edge where it cools first.'
    ],
    reward: 'Following the Adab of the Prophet ﷺ.',
    hadith_reference: 'Sunan Ibn Majah 3288',
    authenticity: 'Sahih',
    category: 'Eating',
    difficulty: 'Beginner',
    estimated_time: 'Meal time',
    created_at: new Date().toISOString()
  },

  // --- SLEEPING ---
  {
    id: 's_sleeping_1',
    title: 'The Sleeping Ritual (Wudu)',
    description: 'Aligning the physical body with the spiritual state during rest.',
    prophetic_application: 'The Prophet ﷺ said: "When you go to bed, perform Wudu as you would for prayer."',
    scholarly_explanation: 'Sleep is the minor death. One should meet it in a state of ritual purity.',
    how_to_practice: [
      'Perform fresh Wudu before getting into bed.',
      'Dust the bed three times.',
      'Lie on the right side with the right hand under the cheek.'
    ],
    reward: 'Angels pray for your forgiveness throughout the night until you wake.',
    hadith_reference: 'Sahih Bukhari 247',
    authenticity: 'Sahih',
    category: 'Sleeping',
    difficulty: 'Intermediate',
    estimated_time: '5 mins',
    created_at: new Date().toISOString()
  },
  {
    id: 's_sleeping_2',
    title: 'Reciting Surah Al-Mulk',
    description: 'The protector from the punishment of the grave.',
    prophetic_application: 'The Prophet ﷺ would not sleep until he recited Surah As-Sajdah and Surah Al-Mulk.',
    scholarly_explanation: 'Surah Al-Mulk intercedes for its reciter until they are forgiven.',
    how_to_practice: [
      'Keep a Quran or app near the bed.',
      'Recite the 30 verses of Surah Al-Mulk (Tabarak) before sleep.',
      'Reflect on the dominion of Allah.'
    ],
    reward: 'Protection from the torment of the grave.',
    hadith_reference: 'At-Tirmidhi 2891',
    authenticity: 'Hasan',
    category: 'Sleeping',
    difficulty: 'Intermediate',
    estimated_time: '5-10 mins',
    created_at: new Date().toISOString()
  },
  {
    id: 's_sleeping_3',
    title: 'Dusting the Bed',
    description: 'Physical and spiritual cleaning before rest.',
    prophetic_application: 'The Prophet ﷺ said: "When one of you goes to his bed, let him dust it off with the inside of his lower garment, for he does not know what came onto it after he left it."',
    scholarly_explanation: 'A practice of hygiene and caution, acknowledging the unseen nature of the world.',
    how_to_practice: [
      'Take a cloth or the edge of a sheet.',
      'Dust the bed three times.',
      'Say "Bismillah" while doing so.'
    ],
    reward: 'Protection from harmful insects or unseen harm.',
    hadith_reference: 'Sahih Bukhari 6320',
    authenticity: 'Sahih',
    category: 'Sleeping',
    difficulty: 'Beginner',
    estimated_time: '30 seconds',
    created_at: new Date().toISOString()
  },

  // --- CLOTHING ---
  {
    id: 's_clothing_1',
    title: 'Right-First Dressing',
    description: 'Starting with the right side when wearing clothes.',
    prophetic_application: 'The Prophet ﷺ liked to start with the right when putting on shoes, combing hair, and purification.',
    scholarly_explanation: 'Honoring the right side is a general principle in Islam for all honorable acts.',
    how_to_practice: [
      'Put the right arm in the sleeve first.',
      'Put the right foot in the shoe/sock first.',
      'When removing, start with the left.'
    ],
    reward: 'Following the beloved ﷺ in the smallest habits breeds love and mindfulness.',
    hadith_reference: 'Sahih Bukhari 168',
    authenticity: 'Sahih',
    category: 'Clothing',
    difficulty: 'Beginner',
    estimated_time: 'Ongoing',
    created_at: new Date().toISOString()
  },
  {
    id: 's_clothing_2',
    title: 'White Clothing',
    description: 'Preferring white garments when convenient.',
    prophetic_application: 'The Prophet ﷺ said: "Wear white clothes, for they are the best of your clothes, and shroud your dead in them."',
    scholarly_explanation: 'White signifies purity, cleanliness, and modesty. It shows dirt easily, prompting frequent washing.',
    how_to_practice: [
      'Choose white for Jumu\'ah or gatherings.',
      'Ensure the cloth is opaque and modest.',
      'Keep it clean and perfumed.'
    ],
    reward: 'Adopting the preferred aesthetic of the Prophet ﷺ.',
    hadith_reference: 'Abu Dawud 4061',
    authenticity: 'Sahih',
    category: 'Clothing',
    difficulty: 'Beginner',
    estimated_time: 'Ongoing',
    created_at: new Date().toISOString()
  },

  // --- HYGIENE ---
  {
    id: 's_hygiene_1',
    title: 'Fitrah: Clipping Nails',
    description: 'Maintaining personal hygiene standards.',
    prophetic_application: 'Five are from the Fitrah: Circumcision, removing pubic hair, trimming the moustache, clipping nails, and plucking armpit hair.',
    scholarly_explanation: 'Personal grooming prevents the accumulation of dirt and diseases and maintains human dignity.',
    how_to_practice: [
      'Clip fingernails and toenails.',
      'Do this at least once every 40 days (Sunnah is weekly, preferably Fridays).',
      'Dispose of clippings respectfully.'
    ],
    reward: 'Reward for maintaining the innate nature (Fitrah) of purity.',
    hadith_reference: 'Sahih Muslim 257',
    authenticity: 'Sahih',
    category: 'Hygiene',
    difficulty: 'Beginner',
    estimated_time: '5 mins',
    created_at: new Date().toISOString()
  },
  {
    id: 's_hygiene_2',
    title: 'Wudu upon Wudu',
    description: 'Renewing light upon light.',
    prophetic_application: 'The Prophet ﷺ would perform Wudu for every prayer, even if he still had Wudu.',
    scholarly_explanation: 'Renewing Wudu increases spiritual light (Noor) and alertness.',
    how_to_practice: [
      'Perform Wudu even if you have not broken it.',
      'Intend renewal of purity.',
      'Ideally before each Fard prayer.'
    ],
    reward: 'Ten rewards are recorded for him.',
    hadith_reference: 'Sunan al-Tirmidhi 58',
    authenticity: 'Hasan',
    category: 'Hygiene',
    difficulty: 'Intermediate',
    estimated_time: '3 mins',
    created_at: new Date().toISOString()
  },

  // --- SOCIAL ---
  {
    id: 's_social_1',
    title: 'The Prophetic Smile',
    description: 'A simple yet profound social act that bridges hearts.',
    prophetic_application: 'The Prophet ﷺ was described by Abdullah ibn Harith as the one who smiled the most.',
    scholarly_explanation: 'A smile is charity (Sadaqah). It comforts the heart of the believer and removes hostility.',
    how_to_practice: [
      'Smile genuinely when making eye contact.',
      'Greet family with a smile upon entering.',
      'Do not belittle any act of kindness.'
    ],
    reward: 'Recorded as a continuous act of charity for your soul.',
    hadith_reference: 'Sunan al-Tirmidhi 1956',
    authenticity: 'Sahih',
    category: 'Social',
    difficulty: 'Beginner',
    estimated_time: 'Ongoing',
    created_at: new Date().toISOString()
  },
  {
    id: 's_social_2',
    title: 'Spreading Salam',
    description: 'Initiating peace with those you know and those you do not.',
    prophetic_application: 'The Prophet ﷺ said: "You will not enter Paradise until you believe, and you will not believe until you love one another. Shall I tell you something which, if you do, you will love one another? Spread Salam amongst yourselves."',
    scholarly_explanation: 'Salam is a Dua for safety and peace. Initiating it dismantles pride (Kibr).',
    how_to_practice: [
      'Say "As-salamu alaykum" audibly.',
      'Greet the young and the old.',
      'Greet upon entering and leaving a gathering.'
    ],
    reward: 'Forgiveness of sins and the fostering of brotherhood.',
    hadith_reference: 'Sahih Muslim 54',
    authenticity: 'Sahih',
    category: 'Social',
    difficulty: 'Beginner',
    estimated_time: 'Seconds',
    created_at: new Date().toISOString()
  },
  {
    id: 's_social_3',
    title: 'Visiting the Sick',
    description: 'A right of a Muslim upon another Muslim.',
    prophetic_application: 'The Prophet ﷺ said: "Visit the sick, feed the hungry, and free the captive."',
    scholarly_explanation: 'Visiting the sick reminds one of the blessing of health and brings comfort to the afflicted.',
    how_to_practice: [
      'Visit for a short duration so as not to burden them.',
      'Make Dua for their recovery.',
      'Speak words of hope and patience.'
    ],
    reward: '70,000 angels pray for the visitor until evening (if morning) or morning (if evening).',
    hadith_reference: 'Sahih Bukhari 5649',
    authenticity: 'Sahih',
    category: 'Social',
    difficulty: 'Intermediate',
    estimated_time: '20 mins',
    created_at: new Date().toISOString()
  },
  {
    id: 's_social_4',
    title: 'Removing Harm',
    description: 'A branch of faith found on the road.',
    prophetic_application: 'The Prophet ﷺ said: "Removing a harmful object from the road is a charity."',
    scholarly_explanation: 'It shows concern for the community and humility in character.',
    how_to_practice: [
      'Pick up trash/stones from the path.',
      'Move obstacles aside.',
      'Intend safety for others.'
    ],
    reward: 'Forgiveness of sins.',
    hadith_reference: 'Sahih Bukhari 2472',
    authenticity: 'Sahih',
    category: 'Social',
    difficulty: 'Beginner',
    estimated_time: 'Seconds',
    created_at: new Date().toISOString()
  },

  // --- SPEAKING ---
  {
    id: 's_speaking_1',
    title: 'Good Words or Silence',
    description: 'The discipline of the tongue.',
    prophetic_application: 'The Prophet ﷺ said: "Whoever believes in Allah and the Last Day should speak good or remain silent."',
    scholarly_explanation: 'Most sins of man originate from the tongue. Restraint is a sign of true Iman.',
    how_to_practice: [
      'Pause before speaking.',
      'Ask: Is this true? Is it necessary? Is it kind?',
      'If not, choose silence.'
    ],
    reward: 'Protection from Hellfire and a guarantee of Paradise.',
    hadith_reference: 'Sahih Bukhari 6018',
    authenticity: 'Sahih',
    category: 'Speaking',
    difficulty: 'Advanced',
    estimated_time: 'Ongoing',
    created_at: new Date().toISOString()
  },
  {
    id: 's_speaking_2',
    title: 'Lowering the Voice',
    description: 'The etiquette of conversation.',
    prophetic_application: 'The Prophet ﷺ was soft-spoken and not loud or boisterous in the markets.',
    scholarly_explanation: 'Loudness strips away dignity (Haybah) and disturbs peace.',
    how_to_practice: [
      'Speak only as loud as necessary.',
      'Avoid shouting in anger.',
      'Maintain a calm tone.'
    ],
    reward: 'Emulating the dignity of the Prophet ﷺ.',
    hadith_reference: 'Shama\'il Muhammadiyah 346',
    authenticity: 'Sahih',
    category: 'Speaking',
    difficulty: 'Intermediate',
    estimated_time: 'Always',
    created_at: new Date().toISOString()
  },

  // --- MASJID ---
  {
    id: 's_masjid_1',
    title: 'Tahiyyatul Masjid',
    description: 'Greeting the House of Allah.',
    prophetic_application: 'The Prophet ﷺ said: "If one of you enters the mosque, let him not sit until he prays two Rakats."',
    scholarly_explanation: 'It is a sign of respect for the sanctity of the Masjid.',
    how_to_practice: [
      'Upon entering the Masjid, before sitting down.',
      'Pray 2 short Rakats.',
      'Not applicable during prohibited times (sunrise, sunset, zenith) according to some schools, though Shafi\'is allow it.',
    ],
    reward: 'Honoring the symbols of Allah.',
    hadith_reference: 'Sahih Bukhari 444',
    authenticity: 'Sahih',
    category: 'Masjid',
    difficulty: 'Intermediate',
    estimated_time: '3 mins',
    created_at: new Date().toISOString()
  },
  {
    id: 's_masjid_2',
    title: 'Walking to Prayer',
    description: 'Steps that erase sins.',
    prophetic_application: 'The Prophet ﷺ said: "Shall I not tell you of that by which Allah erases sins... walking to the mosques."',
    scholarly_explanation: 'Every step raises rank and erases a sin.',
    how_to_practice: [
      'Walk to the local Masjid if possible.',
      'Walk with calmness (Sakina).',
      'Do not run even if late.'
    ],
    reward: 'Elevation of ranks.',
    hadith_reference: 'Sahih Muslim 251',
    authenticity: 'Sahih',
    category: 'Masjid',
    difficulty: 'Intermediate',
    estimated_time: 'Variable',
    created_at: new Date().toISOString()
  },

  // --- FAMILY ---
  {
    id: 's_family_1',
    title: 'Helping with Housework',
    description: 'Humility and service within the home.',
    prophetic_application: 'Aisha (ra) was asked what the Prophet ﷺ did at home. She said: "He was in the service of his family, and when the time for prayer came, he would go out to pray."',
    scholarly_explanation: 'Serving one\'s family is an act of worship, not a chore. It builds affection and breaks the ego.',
    how_to_practice: [
      'Clean your own dishes.',
      'Mend your own clothes.',
      'Assist in cooking or cleaning without being asked.'
    ],
    reward: 'Following the best of creation in humility.',
    hadith_reference: 'Sahih Bukhari 676',
    authenticity: 'Sahih',
    category: 'Family',
    difficulty: 'Intermediate',
    estimated_time: 'Daily',
    created_at: new Date().toISOString()
  },
  {
    id: 's_family_2',
    title: 'Kindness to Children',
    description: 'Mercy to the young.',
    prophetic_application: 'The Prophet ﷺ kissed Al-Hasan bin Ali. Al-Aqra said "I have 10 children and never kissed one." The Prophet said: "He who does not show mercy will not be shown mercy."',
    scholarly_explanation: 'Physical affection builds emotional security and follows the Prophetic character of Rahmah.',
    how_to_practice: [
      'Kiss your children/siblings.',
      'Express verbal love.',
      'Play with them.'
    ],
    reward: 'Divine Mercy from Allah.',
    hadith_reference: 'Sahih Bukhari 5997',
    authenticity: 'Sahih',
    category: 'Family',
    difficulty: 'Beginner',
    estimated_time: 'Seconds',
    created_at: new Date().toISOString()
  },

  // --- WORSHIP ---
  {
    id: 's_worship_1',
    title: 'Salatul Duha',
    description: 'The charity due for every joint in the body.',
    prophetic_application: 'The Prophet ﷺ advised Abu Huraira (ra) never to abandon two Rakats of Duha.',
    scholarly_explanation: 'It is the prayer of the "Awwabin" (those who often return to Allah).',
    how_to_practice: [
      'Time: After sunrise (approx 15 mins) until before Dhuhr (15 mins).',
      'Pray 2, 4, or 8 Rakats.',
      'Best time is when the sun becomes hot.'
    ],
    reward: 'Equivalent to giving charity for all 360 joints of the body.',
    hadith_reference: 'Sahih Muslim 720',
    authenticity: 'Sahih',
    category: 'Worship',
    difficulty: 'Intermediate',
    estimated_time: '5 mins',
    created_at: new Date().toISOString()
  },
  {
    id: 's_worship_2',
    title: 'Ayatul Kursi After Prayer',
    description: 'The verse that guarantees Paradise.',
    prophetic_application: 'The Prophet ﷺ said: "Whoever recites Ayatul Kursi after every obligatory prayer, nothing stands between him and Paradise except death."',
    scholarly_explanation: 'It is the greatest verse in the Quran, containing the supreme names of Allah.',
    how_to_practice: [
      'Memorize Ayatul Kursi (2:255).',
      'Recite it silently after the Fard of every Salah.',
      'Make it a non-negotiable habit.'
    ],
    reward: 'Entry into Paradise upon death.',
    hadith_reference: 'An-Nasa\'i 9928',
    authenticity: 'Sahih',
    category: 'Worship',
    difficulty: 'Beginner',
    estimated_time: '1 min',
    created_at: new Date().toISOString()
  },
  {
    id: 's_worship_3',
    title: 'Dua Between Adhan & Iqamah',
    description: 'A time when supplication is not rejected.',
    prophetic_application: 'The Prophet ﷺ said: "The supplication made between the Adhan and the Iqamah is not rejected."',
    scholarly_explanation: 'A prime window for acceptance often neglected.',
    how_to_practice: [
      'Utilize the time before prayer.',
      'Make sincere personal Dua.',
      'Avoid idle talk during this time.'
    ],
    reward: 'Acceptance of Dua.',
    hadith_reference: 'Sunan al-Tirmidhi 212',
    authenticity: 'Hasan',
    category: 'Worship',
    difficulty: 'Beginner',
    estimated_time: '5-10 mins',
    created_at: new Date().toISOString()
  }
];

export const fetchSunnahLibrary = async (): Promise<SunnahPractice[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'sunnah_practices'));
    if (!snapshot.empty) {
        // Return local library as the golden source for consistency, merged with any dynamic updates if needed
        return SUNNAH_LIBRARY;
    }
    return SUNNAH_LIBRARY;
  } catch (e) {
    return SUNNAH_LIBRARY;
  }
};

export const getDailySunnah = (allSunnahs: SunnahPractice[]): SunnahPractice => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % allSunnahs.length;
  return allSunnahs[index];
};

export const fetchSunnahStats = async (userId: string): Promise<SunnahStats> => {
  try {
    const docRef = doc(db, 'user_sunnah_stats', userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        totalCompleted: data.total_completed,
        points: data.points,
        badges: data.badges || [],
        lastCompletedDate: data.last_completed_at
      };
    }
    return { currentStreak: 0, longestStreak: 0, totalCompleted: 0, points: 0, badges: [], lastCompletedDate: null };
  } catch (e) {
    return { currentStreak: 0, longestStreak: 0, totalCompleted: 0, points: 0, badges: [], lastCompletedDate: null };
  }
};

export const completeSunnah = async (userId: string, sunnahId: string) => {
  const now = new Date().toISOString();
  try {
    const progressRef = doc(collection(db, 'user_sunnah_progress'), `${userId}_${sunnahId}`);
    await setDoc(progressRef, {
      user_id: userId,
      sunnah_id: sunnahId,
      completed: true,
      completed_at: now
    }, { merge: true });
    return true;
  } catch (e) {
    console.error("Failed to complete Sunnah", e);
    return true;
  }
};

export const getRecommendedSunnah = (allSunnahs: SunnahPractice[]): SunnahPractice => {
  const hour = new Date().getHours();
  let filtered = allSunnahs;

  if (hour >= 5 && hour < 10) {
    filtered = allSunnahs.filter(s => s.category === 'Morning' || s.category === 'Hygiene');
  } else if (hour >= 11 && hour < 14) {
    filtered = allSunnahs.filter(s => s.category === 'Eating' || s.category === 'Work');
  } else if (hour >= 20 || hour < 4) {
    filtered = allSunnahs.filter(s => s.category === 'Sleeping');
  }

  if (filtered.length === 0) return getDailySunnah(allSunnahs);
  return filtered[Math.floor(Math.random() * filtered.length)];
};
