
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppState {
  Dashboard = 'dashboard',
  Chat = 'chat',
  CheckIn = 'checkin',
  Learning = 'learning',
  Hadith = 'hadith',
  Tools = 'tools',
  Audio = 'audio',
  Ramadan = 'ramadan',
  Profile = 'profile',
  Dreams = 'dreams',
  Khutbah = 'khutbah',
  Journal = 'journal',
  Hifdh = 'hifdh',
  DeenJourney = 'deen-journey',
  Sadaqah = 'sadaqah',
  Recovery = 'recovery',
  DebtRelief = 'debt-relief',
  DuaLibrary = 'dua-library',
  ImageGen = 'image-gen',
  Calendar = 'calendar',
  LaylatulQadr = 'laylatul-qadr',
  Academy = 'academy',
  Sunnah = 'sunnah',
  Presence = 'presence',
  Radio = 'radio',
  Goals = 'goals',
  MoodSupport = 'mood-support',
  LifeGuidance = 'life-guidance',
  NightCompanion = 'night-companion',
  AdhanSettings = 'adhan-settings',
  Subscription = 'subscription'
}

export type SubscriptionTier = 'free' | 'premium';

export interface UserSubscription {
  tier: SubscriptionTier;
  creditsRemaining: number;
  lastRenewalDate: string;
  isYearly: boolean;
  region: 'IN' | 'GLOBAL';
}

export interface UserPersona {
  archetype: string;
  intensityScore: number; 
  depthScore: number; 
  visualPreference: 'minimal' | 'rich';
  // New Spiritual Attributes
  reflectionDepth: number; // 0-100
  knowledgeInclination: number; // 0-100
  emotionalSensitivity: number; // 0-100
  patienceTempo: 'rushed' | 'balanced' | 'patient';
  audioPreference: 'quran' | 'nasheed' | 'silent';
}

export interface AdhanSettings {
  userId: string;
  latitude: number | null;
  longitude: number | null;
  method: number;
  adhanSound: string;
  notificationsEnabled: boolean;
  mutePrayers: string[];
  volumeLevel: number;
  notificationLeadTime: number;
  autoPlayAdhan: boolean;
  overrideSilentMode: boolean;
  softFajrEnabled: boolean;
}

export interface AdhanVoice {
  id: string;
  name: string;
  muezzin: string;
  url: string;
}

export type NightPhase = 'early' | 'mid' | 'last_third';

export interface NightActivityLog {
  id?: string;
  user_id: string;
  action_type: 'visit' | 'prayer' | 'dhikr' | 'quran' | 'dua_ai';
  timestamp: string;
  duration?: number;
}

export interface NightStatus {
  isActive: boolean;
  phase: NightPhase;
  timeToFajr: string;
  isLastThird: boolean;
}

export type GuidanceIntent = 
  | 'emotional_distress' 
  | 'moral_decision' 
  | 'relationship_issue' 
  | 'worship_question' 
  | 'temptation' 
  | 'confusion' 
  | 'repentance' 
  | 'motivation' 
  | 'life_decision'
  | 'general';

export interface LifeGuidanceResponse {
  guidance: string;
  explanation: string;
  evidence: { text: string; reference: string };
  actionSteps: string[];
  avoid: string[];
  recommendedDua: { arabic: string; translation: string };
  isUrgent: boolean;
}

export interface SpiritualGoal {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  unit: string; 
  category: 'Quran' | 'Dhikr' | 'Sunnah' | 'Character';
  deadline?: string;
  isCompleted: boolean;
}

export interface DuaItem {
  id: string;
  title: string;
  whenToSay: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  authenticity: 'Sahih' | 'Hasan' | 'Da\'if' | 'Scholarly difference' | 'Quran';
  category: string;
  tags: string[];
  meaningSummary?: string;
  virtue?: string;
  howToSay?: string;
  context?: string;
  audioUrl?: string;
  usageFrequency?: number;
  isFavorite?: boolean;
}

export type AyahStatus = 'Learning' | 'Memorized' | 'Needs Revision' | 'Mastered';

export interface AyahProgress {
  surahNumber: number;
  ayahNumber: number;
  status: AyahStatus;
  lastReviewed: string;
  nextReviewDate: string;
  interval: number;
  accuracyScore: number;
  repetitionCount: number;
}

export interface HifdhSettings {
  goal: string;
  timePerDay: number;
  level: 'beginner' | 'intermediate' | 'previously_memorized';
  style: 'page' | 'verse';
  intensity: 'light' | 'balanced' | 'intensive';
  dailyTarget: number;
}

export interface HifdhTask {
  id: string;
  type: 'new' | 'review';
  surahName: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  strength: 'strong' | 'needs_revision' | 'at_risk';
  interval: number;
  lastReviewed: string;
  nextReviewDate: string;
}

export interface HifdhPlan {
  id: string;
  userId: string;
  settings: HifdhSettings;
  tasks: HifdhTask[];
  createdAt: string;
}

// --- Ramadan Mode Architect ---
export interface RamadanDayConfig {
  hijriDay: number;
  isRamadan: boolean;
  phase: 'mercy' | 'forgiveness' | 'refuge'; // 1st 10, 2nd 10, 3rd 10
}

export interface RamadanDailyStat {
  date: string; // ISO date YYYY-MM-DD
  fasting: boolean;
  taraweeh: boolean;
  quranPages: number; // User input
  challengeCompleted: boolean;
}

export interface RamadanChallenge {
  day: number;
  title: string;
  description: string;
  category: 'Sunnah' | 'Nawafil' | 'Dhikr' | 'Character';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QiyamSchedule {
  timeRemaining: string; // e.g., "2h 15m"
  phase: 'Night' | 'Last Third' | 'Suhoor';
  suggestedActs: { time: string; act: string; benefit: string }[];
}

export interface TaraweehInsight {
  juz: number;
  summary: string;
  keyThemes: string[];
  actionPoints: string[];
}

export interface RamadanMomentum {
  currentLevel: number; // 0-100
  lastUpdate: string;
  streak: number;
  multiplier: number;
  isVaultUnlocked: boolean;
}

export interface RamadanReflection {
  id: string;
  day: number;
  prompt: string;
  userResponse?: string;
  completedAt?: string;
}

export interface RamadanVaultItem {
  id: string;
  title: string;
  type: 'audio' | 'text' | 'wallpaper';
  content: string;
  isLocked: boolean;
}

export interface Quest {
  id: string;
  ramadanDay: number;
  title: string;
  description: string;
  type: 'action' | 'reflection' | 'knowledge';
  xpReward: number;
}

export interface QiyamPlan {
  id: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  startTime: string;
  endTime: string;
  sections: any[];
}

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  xpReward: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isUser: boolean;
  avatarColor: string;
}

export interface DreamReflectionResult {
  type: string;
  meanings: string;
  spiritualAdvice: string;
}

export interface DreamJournalEntry {
  id: string;
  text: string;
  date: string;
  result: DreamReflectionResult;
}

export interface KhutbahResult {
  metadata: any;
  part1: any;
  part2: any;
  congregationalDuas: any[];
}

export interface JournalAnalysis {
  insight: string;
  themes: string[];
  spiritualAction: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  prompt: string;
  text: string;
  analysis?: JournalAnalysis;
}

export interface UserProfile {
  lifeStage: string;
  knowledgeLevel: string;
  struggles: string[];
  goals: string[];
  onboarded: boolean;
}

export interface JourneyAction {
  id: string;
  text: string;
  category: 'worship' | 'character' | 'knowledge' | 'growth';
  completed: boolean;
}

export interface JourneyWeek {
  weekNumber: number;
  theme: string;
  focus: string;
  recommendedAyah: { arabic: string; translation: string; reference: string };
  actions: JourneyAction[];
  reflectionPrompt: string;
}

export interface JourneyPhase {
  phaseNumber: number;
  name: string;
  weeks: JourneyWeek[];
  status: 'locked' | 'active' | 'completed';
}

export interface DeenJourneyPlan {
  id: string;
  startDate: string;
  currentDay: number;
  phases: JourneyPhase[];
  growthScore: number;
  streak: number;
}

export type SadaqahCategory = 'money' | 'kindness' | 'food' | 'forgiveness' | 'service' | 'fasting' | 'hidden';

export interface SadaqahEntry {
  id: string;
  category: SadaqahCategory;
  amount?: number;
  description: string;
  timestamp: string;
  isPrivacyMode: boolean;
}

export interface SadaqahReflection {
  ayah: any;
  sincerityReminder: string;
  dua: any;
}

export interface RecoveryContext {
  feeling: string;
  frequency: string;
  need: string;
}

export interface RecoveryPlan {
  mercyAyah: any;
  reflection: string;
  checklist: string[];
  resetPlan: Record<string, string>;
}

export type DebtEmotion = 'Overwhelmed' | 'Ashamed' | 'Afraid' | 'Hopeless' | 'Calm' | 'Motivated';

export interface DebtGuidance {
  comfortAyah: any;
  duaFocus: any;
}

export interface DebtStats {
  totalDebt: number;
  repaidAmount: number;
  istighfarCount: number;
  duaStreak: number;
  lastActive: string;
}

export interface RadioStation {
  id: number | string;
  name: string;
  url: string;
  reciter?: string;
  country?: string;
  bitrate?: string;
}

export interface MoodSupportResult {
  emotion: string;
  verses: any[];
  duas: any[];
  azkar: any[];
  advice: string;
}

export interface ProactiveAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  action?: { label: string; tab: AppState };
}

export type SunnahCategory = 'Morning' | 'Sleeping' | 'Eating' | 'Speaking' | 'Clothing' | 'Hygiene' | 'Social' | 'Masjid' | 'Travel' | 'Family' | 'Work' | 'Worship';
export type SunnahDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SunnahPractice {
  id: string;
  title: string;
  description: string;
  prophetic_application: string;
  scholarly_explanation: string;
  how_to_practice: string[];
  reward: string;
  hadith_reference: string;
  authenticity: string;
  category: SunnahCategory;
  difficulty: SunnahDifficulty;
  estimated_time: string;
  created_at: string;
}

export interface SunnahStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  points: number;
  badges: string[];
  lastCompletedDate: string | null;
}

export interface UserSunnahProgress {
  user_id: string;
  sunnah_id: string;
  completed: boolean;
  completed_at: string;
}

export interface DhikrEntry {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  targetCount: number;
}

// Productivity Types
export interface Category {
  id: string;
  name: string;
  color?: string;
  featured?: boolean;
  isFeatured?: boolean;
  parentId?: string | null;
  order?: number;
  createdAt?: any;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  dueDate?: string | Date;
  categoryId?: string;
  uid?: string;
  order?: number;
  createdAt?: any;
}

export interface Meeting {
  id: string;
  name: string;
  start_time: Date | any;
  end_time: Date | any;
  meeting_link?: string;
  event_link?: string;
  google_calendar?: string;
  notes?: string;
  isCompleted?: boolean;
  external_id?: string | null;
  attendees?: string;
  isStarred?: boolean;
  color?: string;
  syncStatus?: string;
}

export interface StatusOption {
  id: string;
  label: string;
  color: string;
}

export interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  createdAt: any;
  isRead?: boolean;
}
