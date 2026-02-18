
import { AppState } from '../types';

export interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

export const TUTORIAL_CONTENT: Partial<Record<AppState, TutorialStep[]>> = {
  [AppState.Dashboard]: [
    { title: "Your Spiritual Hub", description: "This is your central command center. View prayer times, daily wisdom, and quick access to all modules.", icon: "🏠" },
    { title: "Prayer Halo", description: "The circular halo shows the progress of the current prayer time. Tap it to configure Adhan settings.", icon: "⭕" },
    { title: "Quick Actions", description: "Scroll down to access specific engines like the Hifdh Hub, Sunnah analysis, or AI Chat.", icon: "⚡" }
  ],
  [AppState.Chat]: [
    { title: "Ask Noor", description: "Noor is your AI spiritual companion. Ask about fiqh, history, or personal advice.", icon: "🤖" },
    { title: "Contextual Memory", description: "Noor remembers your conversation context. You can ask follow-up questions easily.", icon: "🧠" },
    { title: "Credits (Free Plan)", description: "Free users have a daily message limit. Upgrade to Premium for unlimited deep conversations.", icon: "💎" }
  ],
  [AppState.Learning]: [
    { title: "Quran Academy", description: "Read the Quran with translations and listen to world-class reciters.", icon: "📖" },
    { title: "Tafsir Access", description: "Tap the book icon next to any verse to read scholarly Tafsir (Interpretation).", icon: "📜" },
    { title: "Audio Controls", description: "Select your preferred reciter from the top menu. Tap the play button on any verse to listen.", icon: "🔊" }
  ],
  [AppState.Hifdh]: [
    { title: "Memorization Engine", description: "Track your Quran memorization progress with precision.", icon: "🧠" },
    { title: "Hide Mode", description: "Use the 'Conceal' tool to hide random words in a verse and test your memory.", icon: "🙈" },
    { title: "Status Tracking", description: "Mark verses as 'Struggling', 'Memorized', or 'Mastered' to update your retention analytics.", icon: "📊" }
  ],
  [AppState.Sunnah]: [
    { title: "Prophetic Habits", description: "Learn and integrate daily habits of the Prophet ﷺ.", icon: "🌿" },
    { title: "AI Insight", description: "Use the 'Consult' bar to ask how the Sunnah applies to modern topics like 'Business' or 'Fitness'.", icon: "✨" },
    { title: "Verification", description: "Use the 'Scholar Deep-Verify' button to check the authenticity and context of traditions.", icon: "✅" }
  ],
  [AppState.DuaLibrary]: [
    { title: "Dua Treasury", description: "A collection of authentic supplications for every emotion and occasion.", icon: "🤲" },
    { title: "AI Search", description: "Can't find what you need? Use the AI Research button to find a Sahih Dua for your specific situation.", icon: "🔍" },
    { title: "Recitation Mode", description: "Tap 'Recite Mode' for a distraction-free view to help you focus during supplication.", icon: "🌙" }
  ],
  [AppState.ImageGen]: [
    { title: "Sacred Vision AI", description: "Generate Islamic-themed art, architecture, and calligraphy patterns.", icon: "🎨" },
    { title: "Style Selection", description: "Choose a style like 'Sacred Light' or 'Geometric' to guide the AI.", icon: "🖌️" },
    { title: "Premium Feature", description: "This high-performance engine requires a Premium subscription or an API Key.", icon: "💎" }
  ],
  [AppState.Khutbah]: [
    { title: "Khutbah Studio", description: "Generate structured Friday sermons with authentic references.", icon: "🎙️" },
    { title: "Customization", description: "Set the topic, tone, and audience to get a tailored script.", icon: "🎛️" },
    { title: "Speaker Mode", description: "Toggle 'Speaker View' for a clean, readable format designed for the minbar.", icon: "👁️" }
  ],
  [AppState.AdhanSettings]: [
    { title: "Sanctuary Audio", description: "Configure how Noor calls you to prayer.", icon: "🔊" },
    { title: "Voices", description: "Choose from Makkah, Madinah, or Soft voices for your Adhan.", icon: "🎵" },
    { title: "Mute Specifics", description: "You can mute specific prayer times (like Dhuhr if you are at work) while keeping others active.", icon: "🔇" }
  ],
  [AppState.NightCompanion]: [
    { title: "The Night Watch", description: "A companion for Tahajjud and late-night worship.", icon: "🌌" },
    { title: "Worship Plan", description: "Tap the center button to get a micro-worship plan for the current moment.", icon: "📝" },
    { title: "Calm Mode", description: "Enter 'Silent Reflection' for a breathing and dhikr visualizer.", icon: "🧘" }
  ]
};
