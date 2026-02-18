
import { getRamadanDay } from './ramadanService';

/**
 * Checks if the given Hijri date falls within the last ten nights of Ramadan.
 * @param hijriDay The day of the Hijri month
 * @param hijriMonth The number of the Hijri month (9 for Ramadan)
 */
export const isLastTenNights = (hijriDay: number, hijriMonth: number) => {
  return hijriMonth === 9 && hijriDay >= 21 && hijriDay <= 30;
};

export const isOddNight = (hijriDay: number, hijriMonth: number) => {
  return hijriMonth === 9 && [21, 23, 25, 27, 29].includes(hijriDay);
};

export const MOTIVATIONS = [
  "Better than a thousand months. One deed tonight equals 83 years of worship.",
  "Angels are descending. They fill the earth tonight, seeking hearts that remember Allah.",
  "Peace until the dawn. Tonight is a night of tranquility and divine safety.",
  "Your slate can be wiped clean. Don't let the fatigue stop you from a lifetime of forgiveness.",
  "The Prophet ﷺ used to tighten his waist-belt and pray all night in these ten days."
];

export const WORSHIP_STAGES = [
  { id: 'opening', name: 'Opening Prayer', desc: 'Isha & Sunnah', icon: '🕌' },
  { id: 'taraweeh', name: 'Taraweeh', desc: 'Sacred Night Prayer', icon: '🌙' },
  { id: 'quran', name: 'Quran Recitation', desc: 'Reflecting on the Word', icon: '📖' },
  { id: 'tahajjud', name: 'Tahajjud', desc: 'Private Conversation', icon: '🕯️' },
  { id: 'dua', name: 'Deep Supplication', desc: 'Heartfelt Begging', icon: '🤲' },
  { id: 'suhoor', name: 'Final Istighfar', desc: 'Seeking Forgiveness', icon: '🍞' }
];

export const LQ_DUA = {
  title: "The Main Dua of the Night",
  arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
  transliteration: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni",
  translation: "O Allah, You are forgiving and You love forgiveness, so forgive me.",
  reference: "At-Tirmidhi (Taught by the Prophet ﷺ to Aisha RA)"
};

export interface ProtocolItem {
  type: 'prayer' | 'recitation' | 'dhikr';
  title: string;
  rakats?: number;
  instruction: string;
  benefit: string;
  arabicText?: string;
}

export const NIGHTLY_PROTOCOLS: Record<number, ProtocolItem[]> = {
  21: [
    { type: 'prayer', title: 'Angelic Forgiveness Prayer', rakats: 4, instruction: '2 cycles of 2 raka\' each. In each raka\', after Surah Fatiha, recite Surah Qadr once and Surah Ikhlas once. After completion, recite Salawat (Durood Sharif) 70 times.', benefit: 'Insha Allah, Angels will pray for forgiveness for that person.' },
    { type: 'prayer', title: 'Sin Pardoning Prayer', rakats: 2, instruction: 'In each raka\', after Surah Fatiha, recite Surah Qadr once and Surah Ikhlas 3 times. After completion, recite any Astaghfar 70 times.', benefit: 'Effective for forgiveness of sins.' },
    { type: 'recitation', title: 'Surah Qadr Cycle', instruction: 'Recite Surah Qadr 21 times.', benefit: 'Connection with the Power of the Night.' }
  ],
  23: [
    { type: 'prayer', title: 'Forgiveness Seekers Prayer', rakats: 4, instruction: '2 cycles of 2 raka\' each. In each raka\', after Surah Fatiha, recite Surah Qadr once and Surah Ikhlas 3 times.', benefit: 'Effective for the pardoning of sins.' },
    { type: 'prayer', title: 'Divine Pardon Prayer', rakats: 8, instruction: '4 sets of 2 raka\' each. In each raka\', after Surah Fatiha, recite Surah Qadr and Surah Ikhlas once. After completion, recite Kalima Tamjeed 70 times.', benefit: 'Insha Allah, Allah will forgive whoever performs this prayer.' },
    { type: 'recitation', title: 'Heart of the Quran', instruction: 'Recite Surah Ya-Seen once and Surah Rahman once.', benefit: 'Vast spiritual rewards and peace.' }
  ],
  25: [
    { type: 'prayer', title: 'Unlimited Sawab Prayer', rakats: 4, instruction: '2 sets of 2 raka\' each. After Surah Fatiha, recite Surah Qadr 1 time and Surah Ikhlas 5 times in each raka\'. After completion, recite the first Kalima (Tayyab) 100 times.', benefit: 'Insha Allah, Allah will grant unlimited good deeds (Sawab).' },
    { type: 'prayer', title: 'Cleansing Prayer', rakats: 4, instruction: '2 sets of 2 raka\' each. In each raka\', after Surah Fatiha, recite Surah Qadr 3 times and Surah Ikhlas 3 times. After completion, recite any Astaghfar 70 times.', benefit: 'Good for the pardoning of sins.' },
    { type: 'prayer', title: 'Grave Safety Prayer', rakats: 2, instruction: 'In each raka\', after Surah Fatiha, recite Surah Qadr once and Surah Ikhlas 15 times. After completion, recite the second Kalima (Shahadat) 70 times.', benefit: 'Freedom from the punishment of the grave.' },
    { type: 'recitation', title: 'Protection Verses', instruction: 'Recite Surah Dukhan. Also recite Surah Fath 7 times.', benefit: 'Freedom from grave punishment and fulfillment of desires.' }
  ],
  27: [
    { type: 'prayer', title: 'Ambassadors of Faith Prayer', rakats: 12, instruction: '3 sets of 4 raka\' each. In each raka\', after Surah Fatiha, recite Surah Qadr once and Surah Ikhlas 15 times. After completion, recite any Astaghfar 70 times.', benefit: 'Sawab equal to the worship of the Prophets (Ambiya Karam).' },
    { type: 'prayer', title: 'Complete Pardon Prayer', rakats: 2, instruction: 'In each raka\', after Surah Fatiha, recite Surah Qadr 3 times and Surah Ikhlas 27 times. Then, plead to Allah for forgiveness.', benefit: 'Insha Allah, the Almighty will forgive all previous sins.' },
    { type: 'prayer', title: 'Hardship Protection Prayer', rakats: 4, instruction: '2 sets of 2 raka\' each. In each raka\', after Surah Fatiha, recite Surah Takaasur once and Surah Ikhlas 3 times.', benefit: 'Saved from hardship at death and freedom from grave punishment.' },
    { type: 'prayer', title: 'Paradise Adornment Prayer', rakats: 2, instruction: 'In each raka\', after Surah Fatiha, recite Surah Ikhlas 7 times. After completion, recite 70 times: ASTAGHFIRUL LAA HAL AZEEMAL LAZEE LAA ILAAHA ILLA HUWAL HAIY YUL QAYYOOMU WA ATOOBU ILAIH.', benefit: 'Allah will pardon the person and their parents and command Angels to adorn Paradise for them.' },
    { type: 'prayer', title: 'Infinite Sawab Prayer', rakats: 2, instruction: 'In each raka\', after Surah Fatiha, recite Surah Alam Nashrah once, Surah Ikhlas 3 times. After completion, recite Surah Qadr 27 times.', benefit: 'Effective for unlimited Sawab of Ibadah.' },
    { type: 'prayer', title: 'Wishes Fulfillment Prayer', rakats: 4, instruction: '1 set of 4 raka\'. After Surah Fatiha, recite Surah Qadr 3 times and Surah Ikhlas 50 times. After completion, recite "Subhan Allahi Wal Hamdu Lillahi Wala Ilaaha Illallahu Wallahu Akbar" once in Sajdah.', benefit: 'Supplications for worldly or religious wishes will be fulfilled.' },
    { type: 'recitation', title: 'Sovereignty Recitation', instruction: 'Recite Surah Mulk 7 times.', benefit: 'Protection from punishment.' }
  ],
  29: [
    { type: 'prayer', title: 'Faith Completion Prayer', rakats: 4, instruction: '2 sets of 2 raka\' each. In every raka\', after Surah Fatiha, recite Surah Qadr once and Surah Ikhlas 3 times. After completion, recite Surah Alam Nashrah 70 times.', benefit: 'Effective for the completion of Imaan.' },
    { type: 'prayer', title: 'Final Forgiveness Prayer', rakats: 4, instruction: '2 sets of 2 raka\' each. In each raka\', after Surah Fatiha, recite Surah Qadr once and Surah Ikhlas 5 times. After completion, recite Salawat 100 times.', benefit: 'Effective for forgiveness of sins.' },
    { type: 'recitation', title: 'Rizq Abundance', instruction: 'Recite Surah Waqiah 7 times.', benefit: 'Beneficial for increase in Rizq.' }
  ]
};

export const RAMADAN_GENERAL_TIPS = [
  "Take advantage of this night from sunset till sunrise.",
  "Offer nawafil (prayers), recite QUR'AAN, do repent (Istaghfar), and pray for pardon.",
  "Recite many Salawat (Durood Sharif & Salaam) and make sincere benedictions (Duas).",
  "Special Tip: In any night of Ramadan, after Taraweeh, recite Surah Qadr seven times to be saved from troubles and afflictions."
];
