
export interface AcademyTopic {
  id: string;
  category: 'jurisprudence' | 'hadith' | 'spiritual-psychology' | 'theology' | 'salah-sciences';
  title: string;
  desc: string;
  content: string;
  level: 'Advanced' | 'Scholar';
  references?: string[];
  steps?: { title: string; text: string; subSteps?: string[] }[];
}

export const ACADEMY_KNOWLEDGE: AcademyTopic[] = [
  {
    id: 'prophetic-salah-tariqa',
    category: 'salah-sciences',
    title: 'Namaz Tariqa: The Prophetic Procedure',
    level: 'Scholar',
    desc: 'The complete physical and spiritual procedure of Salah as derived from Sahih Bukhari and Muslim.',
    content: 'The Prophet ﷺ said: "Pray as you have seen me praying." This module provides the technical blueprint for the perfect Salah, including the mandatory Arkan (Pillars) and Wajibat (Necessary acts).',
    references: ['Sahih Bukhari (Book of Adhan)', 'Sifat Salah al-Nabi by Al-Albani', 'Zaad al-Ma\'ad by Ibn al-Qayyim'],
    steps: [
      { title: 'The Stand & Opening', text: 'Facing the Qibla with Niyyah (Intention). Raising hands to ear-lobes or shoulders and reciting the Takbir al-Tahrimah. Hands are then placed on the chest or below the navel depending on Madhhab.' },
      { title: 'The Recitation (Qira\'ah)', text: 'Reciting the Thana (opening dua), then Ta\'awwudh and Basmalah. Recitation of Surah al-Fatiha is mandatory. In the first two Rakats of Fard, a second Surah is added.' },
      { title: 'The Bowing (Ruku)', text: 'Moving to Ruku with "Allahu Akbar". The back must be straight, hands on knees. Reciting "Subhana Rabbiyal Azeem" (at least 3x). Rising with "Sami Allahu liman Hamidah".' },
      { title: 'The Prostration (Sujud)', text: 'Descending with "Allahu Akbar", knees first or hands first. Seven limbs must touch the ground: forehead/nose, two palms, two knees, and toes. Reciting "Subhana Rabbiyal A\'la".' },
      { title: 'The Final Tashahhud', text: 'Sitting in the final cycle for the Tashahhud (At-tahiyyat). Index finger raised at the Shahadah. Followed by Salawat Ibrahimiyyah and a Masnoon Dua before the Taslim.' }
    ]
  },
  {
    id: 'sunnah-rawatib-scholar-edition',
    category: 'salah-sciences',
    title: 'Sunnah Rawatib: The 12 Daily Shields',
    level: 'Scholar',
    desc: 'A comprehensive scholarly breakdown of the specific voluntary rakats that protect and perfect the Fard obligations.',
    content: 'The Sunnah Rawatib are the voluntary prayers performed before and after the five daily Fard prayers. Their primary purpose is to compensate for deficiencies in one\'s Fard prayers and to establish a consistent spiritual fortress around the heart.',
    references: ['Sahih Muslim (728)', 'Sunan al-Tirmidhi (414)', 'Fath al-Bari by Ibn Hajar'],
    steps: [
      { title: 'The Supreme Virtue: The Eternal Mansion', text: 'Umm Habibah (ra) reported that the Prophet ﷺ said: "A house will be built in Paradise for every Muslim who prays twelve rakats in a day and night as voluntary prayers beyond the obligatory ones." This is the foundational promise for those who remain consistent.' },
      { title: 'Fajr: Two Rakats Before', text: 'These are the most important Sunnah Rawatib. The Prophet ﷺ said: "The two rakats of Fajr are better than this world and everything in it." They should be performed as light, brief cycles between the Adhan and Iqamah. It is Sunnah to recite Surah Al-Kafirun in the first and Surah Al-Ikhlas in the second.' },
      { title: 'Dhuhr: Six Rakats (4 Before, 2 After)', text: 'The four rakats before Dhuhr are performed as two sets of two. They are highly emphasized for opening the gates of heaven. The two rakats after the Fard complete the midday shield. Consistency in these six specifically is cited in many narrations as the core of the twelve.' },
      { title: 'Asr: The Optional Mercy (4 Before)', text: 'While not part of the core 12 Mu\'akkadah (emphasized) rakats, the Prophet ﷺ said: "May Allah have mercy on a person who prays four rakats before Asr." These are considered Sunnah Ghair Mu\'akkadah, offering a path to special divine mercy.' },
      { title: 'Maghrib: Two Rakats After', text: 'These two rakats are performed immediately after the three Fard cycles of Maghrib. It is highly recommended to perform these in one\'s home to bring light and barakah to the household. They should not be delayed past the time of twilight.' },
      { title: 'Isha: Two Rakats After', text: 'Performed after the four Fard cycles of Isha. These conclude the daily Rawatib cycle. Many scholars also emphasize that any prayer between Maghrib and Isha (Awabeen) and the Witr prayer after Isha further strengthen this nocturnal spiritual state.' },
      { title: 'Methodology: Performance at Home', text: 'The Prophet ﷺ advised: "Perform some of your prayers in your houses and do not make them like graves." While Fard prayers are mandated in the Masjid (for men), Sunnah Rawatib are superior when performed privately at home to avoid ostentation and bless the dwelling.' }
    ]
  },
  {
    id: 'five-fard-prayers',
    category: 'salah-sciences',
    title: 'The Five Fard (Obligatory) Prayers',
    level: 'Advanced',
    desc: 'Procedural details for Fajr, Dhuhr, Asr, Maghrib, and Isha.',
    content: 'An analysis of the daily obligations, including timing windows, Raka\'ah counts, and specific Prophetic nuances for each time of day.',
    steps: [
      { title: 'Fajr (2 Rakats Fard)', text: 'Performed at dawn. Preceded by 2 Rakats of Sunnah Mu\'akkadah which are superior to the world and all in it. Recitation is audible.' },
      { title: 'Dhuhr (4 Rakats Fard)', text: 'Performed after the sun passes the zenith. Accompanied by 4 Rakats Sunnah before and 2 after. Recitation is silent.' },
      { title: 'Asr (4 Rakats Fard)', text: 'The "Middle Prayer". Highly emphasized for protection. Recitation is silent. It is forbidden to pray after Asr until Maghrib.' },
      { title: 'Maghrib (3 Rakats Fard)', text: 'Performed immediately after sunset. Audible recitation in the first two Rakats. Followed by 2 Rakats Sunnah.' },
      { title: 'Isha (4 Rakats Fard)', text: 'Performed at night. Audible recitation in first two Rakats. Followed by 2 Rakats Sunnah and the Witr (Wajib/Sunnah Mu\'akkadah).' }
    ]
  },
  {
    id: 'tahajjud-deep-dive',
    category: 'salah-sciences',
    title: 'Salatul Tahajjud: The Night Vigil',
    level: 'Scholar',
    desc: 'The peak of spiritual intimacy performed in the final third of the night.',
    content: 'Tahajjud (Qiyam al-Layl) is performed after sleeping for a portion of the night. It is the practice of the righteous and the station where Duas are most readily answered.',
    references: ['Sahih Muslim (Book of Prayer of Travelers)', 'Ihya Ulum al-Din (Book of Night Worship)'],
    steps: [
      { title: 'The Optimal Time', text: 'The final third of the night is the most sacred, when Allah descends to the lowest heaven. However, it can be prayed anytime after Isha until Fajr.' },
      { title: 'The Methodology', text: 'Prayed in sets of 2 Rakats. The Prophet ﷺ typically prayed 8 Rakats followed by 3 Witr, totalling 11. Long standing, bowing, and prostration are recommended.' },
      { title: 'The Spiritual State', text: 'Requires seclusion and silence. It is a private conversation between the Creator and the servant without any ostentation.' }
    ]
  },
  {
    id: 'duha-ishraaq-guide',
    category: 'salah-sciences',
    title: 'Duha & Ishraaq: The Morning Sacrifice',
    level: 'Advanced',
    desc: 'The prayers of the "Awakening" (Awwabin) performed after sunrise.',
    content: 'Hadith: "In the morning, charity is due for every joint at your body... Two Rakats of Duha suffice for all of that." (Sahih Muslim).',
    steps: [
      { title: 'Salatul Ishraaq', text: 'Performed approx. 15-20 mins after sunrise. Hadith: "Whoever prays Fajr in congregation, then sits remembering Allah until sunrise, then prays 2 Rakats, has the reward of Hajj and Umrah (Complete, Complete, Complete)."' },
      { title: 'Salatul Duha (Chasht)', text: 'Can be prayed from sunrise until just before Dhuhr (Zawal). The best time is when the heat of the sun is felt. 2 to 8 Rakats are narrated.' }
    ]
  },
  {
    id: 'awabeen-guide',
    category: 'salah-sciences',
    title: 'Salatul Awabeen: The Repentant',
    level: 'Advanced',
    desc: 'Voluntary cycles performed between Maghrib and Isha.',
    content: 'A tradition among the Salaf (pious predecessors) to keep the heart alive between the two evening prayers. It is often cited as the "Prayer of the Repentant."',
    steps: [
      { title: 'The Procedure', text: 'Typically 6 Rakats (prayed in sets of 2) after the Sunnah of Maghrib. It occupies the time between sunset and the disappearance of the twilight.' },
      { title: 'The Virtue', text: 'Some narrations (with scholarly discussion on Isnad) suggest it is equivalent to 12 years of worship.' }
    ]
  },
  {
    id: 'special-needs-prayers',
    category: 'salah-sciences',
    title: 'Functional Prayers: Hajah, Istikhara, & Wudu',
    level: 'Scholar',
    desc: 'Prophetic solutions for specific life events and requirements.',
    content: 'The Sharia provides specific prayer formats for seeking guidance, asking for needs, or sanctifying the act of purification.',
    steps: [
      { title: 'Salatul Istikhara', text: 'For seeking guidance on a decision. 2 Rakats are prayed followed by the famous Istikhara Dua. One should then proceed with what is best, trusting Allah to facilitate the good.' },
      { title: 'Salatul Hajah', text: 'The Prayer of Need. Performed when one has a specific urgent requirement. Consists of 2 Rakats followed by specific praise of Allah and a plea for the need.' },
      { title: 'Tahiyyat al-Wudu', text: '2 Rakats immediately following ablution. Bilal (ra) was granted his high rank in Paradise partly due to his persistence in this specific prayer.' }
    ]
  },
  {
    id: 'salat-at-tasbih-scholar',
    category: 'salah-sciences',
    title: 'Salat at-Tasbih: The Great Glorification',
    level: 'Scholar',
    desc: 'The comprehensive 4-Raka\'ah procedure for the complete washing of sins.',
    content: 'The Prophet ﷺ said to his uncle Abbas (ra): "If you pray this, Allah will forgive your sins: first and last, old and new, unintentional and intentional, small and large, hidden and open." This special prayer consists of 4 Rakats where a specific Tasbih (Subhanallahi wal hamdu lillahi wala ilaha illallahu wallahu akbar) is recited 300 times in total.',
    references: ['Sunan Abu Dawud', 'Sunan al-Tirmidhi', 'Sunan Ibn Majah'],
    steps: [
      { title: 'Total Count and The Tasbih', text: 'The Tasbih is: SUBHANALLAHI WAL HAMDU LILLAHI WALA ILAHA ILLALLAHU WALLAHU AKBAR. You must recite this 75 times in each Rakat, totaling 300 across the 4 cycles. It is prayed as one 4-Raka\'ah set.' },
      { title: 'Standing Counts (Qiyam)', text: 'After reciting Surah al-Fatiha and another Surah, recite the Tasbih 15 times. Ensure you are standing still and focused before starting the count.' },
      { title: 'Bowing and Rising (Ruku and Qawmah)', text: 'In Ruku, after the usual glorification, recite the Tasbih 10 times. After rising to the standing position (Qawmah), recite it 10 times more.' },
      { title: 'Prostration and Sitting (Sujud and Jalsa)', text: 'In the first Sujud, recite it 10 times. Rising to the sitting position (Jalsa), recite it 10 times. In the second Sujud, recite it 10 times again.' },
      { title: 'Final Sitting Before Rising', text: 'After the second Sujud, sit briefly before standing up for the next Rakat (or before Tashahhud) and recite it 10 times. This completes 75 for the Rakat.' }
    ]
  },
  {
    id: 'aqidah-fundamentals',
    category: 'theology',
    title: 'Aqidah: The Architecture of Faith',
    level: 'Scholar',
    desc: 'The definitive creed of Ahlus Sunnah regarding the Nature of God and the Unseen.',
    content: 'Aqidah constitutes the root of the tree of Islam. Without a sound creed, deeds have no foundation. This module explores the orthodox belief system (Ahlus Sunnah wal Jama\'ah) as codified by Imam Al-Tahawi and others, focusing on the absolute Oneness of Allah and the reality of the Unseen.',
    references: ['Al-Aqidah Al-Tahawiyyah', 'Kitab at-Tawhid', 'Sharh al-Aqidah al-Wasitiyyah'],
    steps: [
      { title: 'Tawhid al-Rububiyyah', text: 'The belief in the Lordship of Allah. He alone is the Creator, Sustainer, and Sovereign of the universe. Nothing moves or exists without His permission.' },
      { title: 'Tawhid al-Uluhiyyah', text: 'The belief in the exclusive right of Allah to be worshipped. Directing any act of worship (prayer, sacrifice, vow) to other than Him is Shirk.' },
      { title: 'Al-Asma wa-Sifat', text: 'The Names and Attributes. We affirm what Allah affirmed for Himself without Tamthil (likening to creation), Takyif (asking "how"), Tahrif (distortion), or Ta\'til (denial).' },
      { title: 'Al-Qadr (Divine Decree)', text: 'The belief that Allah knows all things before they happen, wrote them in the Preserved Tablet (Al-Lawh Al-Mahfuz), willed them to exist, and created them.' },
      { title: 'Life After Death', text: 'Certainty in the Barzakh (life of the grave), the Resurrection, the Day of Judgment, the Mizan (Scale), the Sirat (Bridge), and the final abodes of Paradise and Hell.' }
    ]
  },
  {
    id: 'usul-al-fiqh-1',
    category: 'jurisprudence',
    title: 'Usul al-Fiqh: Epistemology of Law',
    level: 'Scholar',
    desc: 'The science of legal deduction (Istinbat) from primary sources.',
    content: 'Usul al-Fiqh is the study of the methodology of Islamic jurisprudence. It examines the authority of sources and the rules for deriving specific rulings from general evidences.',
    references: ['Al-Risala by Imam al-Shafi\'i', 'Al-Mustasfa by Imam al-Ghazali'],
    steps: [
      { title: 'The Hierarchy of Adillah', text: 'Distinguishing between Qat\'i (definitive) and Dhanni (speculative) evidences. The roles of Al-Kitab, Al-Sunnah, Al-Ijma\', and Al-Qiyas.' },
      { title: 'Semantic Analysis', text: 'Understanding Amr (command) vs Nahi (prohibition), and the distinction between \'Amm (general) and Khass (specific) linguistics.' },
      { title: 'Ijtihad & Taqlid', text: 'The conditions for a Mujtahid, the levels of Ijtihad, and the framework of valid Taqlid for the non-expert.' },
      { title: 'The Concept of Abrogation', text: 'Al-Naskh: The chronological replacement of legal rulings and the conditions for its validity in Sharia.' }
    ]
  },
  {
    id: 'hadith-sciences-1',
    category: 'hadith',
    title: 'Mustalah al-Hadith: Methodology',
    level: 'Scholar',
    desc: 'The technical classification of Prophetic narrations.',
    content: 'Mustalah al-Hadith provides the rigorous framework used by Muhaddithin to protect the integrity of the Prophetic legacy through Isnad (chain) and Matn (text) analysis.',
    references: ['Nukhbat al-Fikar by Ibn Hajar al-Asqalani', 'Muqaddimah Ibn al-Salah'],
    steps: [
      { title: 'Ilm al-Rijal', text: 'The science of Biographical Evaluation. Analyzing the character (\'Adalah) and memory (Dabt) of narrators across generations.' },
      { title: 'Continuity & Discontinuity', text: 'The distinction between Muttasil (connected), Mursal (disconnected), and Mu\'allaq chains and their impact on authenticity.' },
      { title: 'The Grading Spectrum', text: 'Technical criteria for Sahih (Authentic), Hasan (Good), and Da\'if (Weak), and the concept of Sahih li-Ghayrihi.' },
      { title: 'Hidden Defects (\'Ilal)', text: 'Identifying subtle flaws that only the most expert scholars can detect in seemingly perfect chains.' }
    ]
  },
  {
    id: 'maqasid-framework',
    category: 'jurisprudence',
    title: 'Maqasid al-Shariah & Legal Maxims',
    level: 'Advanced',
    desc: 'The higher objectives and governing principles of the Law.',
    content: 'The Sharia is not merely a set of rules but a goal-oriented system designed to preserve human welfare (Maslaha).',
    references: ['Al-Muwafaqat by Imam al-Shatibi', 'Izz al-Din ibn \'Abd al-Salam\'s Qawa\'id al-Ahkam'],
    steps: [
      { title: 'The Five Essentials (Daruriyyat)', text: 'The preservation of Deen (Faith), Nafs (Life), \'Aql (Intellect), Nasl (Lineage), and Mal (Wealth).' },
      { title: 'The Hierarchy of Interests', text: 'Balancing Daruriyyat (Necessities) against Hajiyyat (Needs) and Tahsiniyyat (Embellishments).' },
      { title: 'Al-Qawa\'id al-Fiqhiyyah', text: 'The five universal maxims, including "Hardship brings ease" and "Certainty is not overruled by doubt."' },
      { title: 'Sadd al-Dhara\'i', text: 'Blocking the means to evil—how law anticipates consequences before they manifest.' }
    ]
  },
  {
    id: 'tazkiyah-psychology',
    category: 'spiritual-psychology',
    title: 'Tazkiyah al-Nafs: Deep Psychology',
    level: 'Scholar',
    desc: 'Metaphysical anatomy and the science of the soul.',
    content: 'Moving beyond basic etiquette into the deep purification of the spiritual faculties and the states of the heart (Ahwal).',
    references: ['Ihya Ulum al-Din by Imam al-Ghazali', 'Madarij al-Salikin by Ibn al-Qayyim'],
    steps: [
      { title: 'Anatomy of the Soul', text: 'The dynamic between the Qalb (Heart), Ruh (Spirit), \'Aql (Intellect), and Nafs (Ego).' },
      { title: 'The Stages of the Nafs', text: 'From Nafs al-Ammarah (the commanding self) to Nafs al-Mutma\'innah (the soul at rest).' },
      { title: 'Stations of Certainty (Yaqin)', text: 'Analysis of Ilm al-Yaqin, \'Ayn al-Yaqin, and Haqq al-Yaqin.' },
      { title: 'Spiritual Maladies', text: 'The technical treatment of Riya (Ostentation), Kibr (Pride), and Hasad (Envy) using the "opposites" method.' }
    ]
  }
];
