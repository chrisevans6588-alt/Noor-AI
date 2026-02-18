
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Dashboard from './components/Dashboard';
import CheckInModule from './components/CheckInModule';
import LearningModule from './components/LearningModule';
import ToolsModule from './components/ToolsModule';
import AudioPlayerModule from './components/AudioPlayerModule';
import RamadanModule from './components/RamadanModule';
import UserPanel from './components/UserPanel';
import DreamsModule from './components/DreamsModule';
import KhutbahModule from './components/KhutbahModule';
import JournalModule from './components/JournalModule';
import HifdhModule from './components/HifdhModule';
import DeenJourneyModule from './components/DeenJourneyModule';
import SadaqahModule from './components/SadaqahModule';
import RecoveryModule from './components/RecoveryModule';
import DebtReliefModule from './components/DebtReliefModule';
import DuaLibraryModule from './components/DuaLibraryModule';
import HadithModule from './components/HadithModule';
import ImageGeneratorModule from './components/ImageGeneratorModule';
import CalendarModule from './components/CalendarModule';
import LaylatulQadrModule from './components/LaylatulQadrModule';
import EssentialsModule from './components/EssentialsModule';
import SunnahModule from './components/SunnahModule';
import PresenceMode from './components/PresenceMode';
import Navigation from './components/Navigation';
import RadioModule from './components/RadioModule';
import GoalPlannerModule from './components/GoalPlannerModule';
import MoodSupportModule from './components/MoodSupportModule';
import LifeGuidanceModule from './components/LifeGuidanceModule';
import NightCompanionModule from './components/NightCompanionModule';
import AdhanSettingsModule from './components/AdhanSettingsModule';
import SubscriptionWall from './components/SubscriptionWall';
import PremiumGuard from './components/PremiumGuard';
import FeatureTutorial from './components/FeatureTutorial'; 
import Login from './components/Login';
import EmailVerification from './components/EmailVerification';
import LandingPage from './components/LandingPage';
import AdaptiveOnboarding from './components/AdaptiveOnboarding';
import RamadanThemeWrapper from './components/RamadanThemeWrapper'; 
import AppTour from './components/AppTour';
import { AppState, ProactiveAlert, AdhanSettings, UserSubscription } from './types';
import { auth, onAuthStateChanged } from './services/firebaseClient';
import { isLastTenNights } from './services/laylatulQadrService';
import { fetchPrayerTimes } from './services/islamicApiService';
import { calculateNightStatus } from './services/nightCompanionService';
import { loadAdhanSettings } from './services/adhanService';
import { loadSubscription } from './services/subscriptionService';
import { checkIsRamadan } from './services/ramadanService'; 
import { TUTORIAL_CONTENT } from './services/tutorialData'; 
import { syncUserToFirestore } from './services/userService';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppState>(AppState.Dashboard);
  const [activeAlert, setActiveAlert] = useState<ProactiveAlert | null>(null);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeToolId, setActiveToolId] = useState<'prophetic' | 'qibla' | 'dhikr' | 'ethical' | 'hadith-verify'>('prophetic');
  
  const [isRamadanActive, setIsRamadanActive] = useState(false);
  const [isSacredNightsActive, setIsSacredNightsActive] = useState(false);
  const [currentHijriDay, setCurrentHijriDay] = useState<number | null>(null);
  const [isNightAutoOffered, setIsNightAutoOffered] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAppTour, setShowAppTour] = useState(false);
  
  const [adhanSettings, setAdhanSettings] = useState<AdhanSettings | null>(null);
  const [lastPrayerHandled, setLastPrayerHandled] = useState<string | null>(null);
  const prayerDataRef = useRef<any>(null);

  const [showLanding, setShowLanding] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          syncUserToFirestore(currentUser);
          loadAdhanSettings(currentUser.uid).then(setAdhanSettings);
          loadSubscription(currentUser.uid).then(setSubscription);
          const onboarded = localStorage.getItem('noor_adaptive_onboarded') === 'true';
          setHasOnboarded(onboarded);
          
          // Check for App Tour status for new users
          const tourCompleted = localStorage.getItem('noor_app_tour_completed') === 'true';
          if (onboarded && !tourCompleted) {
            setShowAppTour(true);
          }
        }
      }
      setUser(auth.currentUser);
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Global Prayer Time Checker & Season Detection
  useEffect(() => {
    // Check for Ramadan status immediately (handles local override)
    const forceMode = checkIsRamadan();
    setIsRamadanActive(forceMode);
    
    // If forced, assume we are in last ten nights for testing features
    if (forceMode) setIsSacredNightsActive(true);

    if (user && user.emailVerified) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
          const prayerData = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
          if (prayerData) {
            prayerDataRef.current = prayerData;
            try {
              const hRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&method=2`);
              const hData = await hRes.json();
              const hDay = parseInt(hData.data.date.hijri.day);
              const hMonth = hData.data.date.hijri.month.number;
              setCurrentHijriDay(hDay);
              
              const isRamadan = hMonth === 9 || forceMode; 
              setIsRamadanActive(isRamadan);
              
              const isActive = isLastTenNights(hDay, hMonth) || (forceMode && true);
              setIsSacredNightsActive(isActive);
              
              const nightStatus = calculateNightStatus(prayerData.timings.Fajr, prayerData.timings.Maghrib);
              if (nightStatus.isActive && !isNightAutoOffered) {
                 // Proactive Night Mode suggestion logic here if needed
              }
            } catch (e) {
              console.error("Hijri sync error", e);
            }
          }
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    await auth.signOut();
    setUser(null);
    setShowLanding(true);
  };

  const navigateTo = (tab: AppState, toolId?: any) => {
    setCurrentTab(tab);
    if (toolId) setActiveToolId(toolId);
  };

  const handleTourComplete = () => {
    setShowAppTour(false);
    localStorage.setItem('noor_app_tour_completed', 'true');
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-void">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-white/5 border-t-gold-primary rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center font-arabic text-gold-primary animate-pulse">ن</div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;
    return <Login />;
  }

  if (!user.emailVerified) return <EmailVerification user={user} onSignOut={handleSignOut} />;
  
  if (!hasOnboarded) return <AdaptiveOnboarding onComplete={() => {
    setHasOnboarded(true);
    // After onboarding, show tour if not done
    const tourCompleted = localStorage.getItem('noor_app_tour_completed') === 'true';
    if (!tourCompleted) setShowAppTour(true);
  }} />;

  const isChatTab = currentTab === AppState.Chat;
  const isNightMode = currentTab === AppState.LaylatulQadr || currentTab === AppState.NightCompanion;
  const hasTutorial = TUTORIAL_CONTENT[currentTab] !== undefined;

  if (currentTab === AppState.Presence) return <PresenceMode onExit={() => setCurrentTab(AppState.Dashboard)} />;
  if (currentTab === AppState.NightCompanion) return (
    <PremiumGuard featureName="Night Mode" onExit={() => setCurrentTab(AppState.Dashboard)}>
      <NightCompanionModule onExit={() => setCurrentTab(AppState.Dashboard)} />
    </PremiumGuard>
  );

  return (
    <RamadanThemeWrapper isActive={isRamadanActive}>
      <div className={`flex h-full w-full overflow-hidden ${isRamadanActive ? 'bg-transparent' : 'bg-void'} text-white relative font-sans selection:bg-gold-primary selection:text-black`}>
        
        {/* Cinematic Background Layer - Modern Void */}
        {!isRamadanActive && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-void">
             {/* Subtle ambient light - replacing green with zinc/gold */}
             <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] animate-pulse-slow"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-[100px]"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]"></div>
          </div>
        )}

        {showAppTour && <AppTour onComplete={handleTourComplete} onSkip={handleTourComplete} />}

        {hasTutorial && !showTutorial && !isNightMode && (
          <button 
            onClick={() => setShowTutorial(true)}
            className="fixed top-14 right-6 z-[120] w-8 h-8 glass-panel rounded-full flex items-center justify-center text-gold-primary font-bold active:scale-95 transition-transform"
            title="Feature Help"
          >
            ?
          </button>
        )}

        {showTutorial && <FeatureTutorial currentTab={currentTab} onClose={() => setShowTutorial(false)} />}

        {!isNightMode && (
          <Sidebar 
            currentTab={currentTab} 
            onTabChange={setCurrentTab} 
            onSignOut={handleSignOut} 
            isSacredNightsActive={isSacredNightsActive} 
            subscription={subscription} 
            onShowTour={() => setShowAppTour(true)}
          />
        )}
        
        <main className={`relative z-10 flex-1 flex flex-col h-full overflow-y-auto no-scrollbar ${isChatTab ? 'p-0' : 'px-4 md:px-8 pt-safe pb-safe'}`}>
          {!isChatTab && !isNightMode && (
            <header className="mb-8 flex items-center justify-between animate-fade-in">
              <div className="space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isRamadanActive ? 'text-amber-400' : 'text-gold-primary'}`}>
                  {isRamadanActive ? 'Ramadan Mode Active' : 'Sanctuary'}
                </p>
                <h1 className="text-3xl font-black text-white capitalize tracking-tight">{currentTab.replace('-', ' ')}</h1>
              </div>
              <button onClick={() => setCurrentTab(AppState.Profile)} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                 <span className="font-bold text-gold-primary">{(user.email || 'U').charAt(0).toUpperCase()}</span>
              </button>
            </header>
          )}
          
          <div className={`animate-slide-up ${isChatTab ? 'h-full' : ''}`}>
            {(() => {
              switch (currentTab) {
                case AppState.Dashboard: return <Dashboard onNavigate={navigateTo} />;
                case AppState.Ramadan: return <RamadanModule onNavigate={navigateTo} />;
                case AppState.LaylatulQadr: return <LaylatulQadrModule hijriDayOverride={currentHijriDay} />;
                case AppState.Chat: return <ChatWindow userEmail={user?.email} onReset={() => window.location.reload()} />;
                case AppState.Journal: return <PremiumGuard featureName="Journal AI" onExit={() => setCurrentTab(AppState.Dashboard)}><JournalModule /></PremiumGuard>;
                case AppState.Hifdh: return <HifdhModule />;
                case AppState.DeenJourney: return <PremiumGuard featureName="Deen Journey" onExit={() => setCurrentTab(AppState.Dashboard)}><DeenJourneyModule /></PremiumGuard>;
                case AppState.Sadaqah: return <PremiumGuard featureName="Sadaqah Ledger" onExit={() => setCurrentTab(AppState.Dashboard)}><SadaqahModule /></PremiumGuard>;
                case AppState.Recovery: return <PremiumGuard featureName="Recovery Guide" onExit={() => setCurrentTab(AppState.Dashboard)}><RecoveryModule /></PremiumGuard>;
                case AppState.DebtRelief: return <PremiumGuard featureName="Debt Relief AI" onExit={() => setCurrentTab(AppState.Dashboard)}><DebtReliefModule /></PremiumGuard>;
                case AppState.Audio: return <AudioPlayerModule />;
                case AppState.Radio: return <RadioModule />;
                case AppState.Khutbah: return <PremiumGuard featureName="Khutbah Studio" onExit={() => setCurrentTab(AppState.Dashboard)}><KhutbahModule /></PremiumGuard>;
                case AppState.Dreams: return <PremiumGuard featureName="Dreams AI" onExit={() => setCurrentTab(AppState.Dashboard)}><DreamsModule /></PremiumGuard>;
                case AppState.CheckIn: return <CheckInModule />;
                case AppState.Learning: return <LearningModule />;
                case AppState.Hadith: return <HadithModule />;
                case AppState.DuaLibrary: return <DuaLibraryModule />;
                case AppState.ImageGen: return <PremiumGuard featureName="Vision AI" onExit={() => setCurrentTab(AppState.Dashboard)}><ImageGeneratorModule /></PremiumGuard>;
                case AppState.Calendar: return <CalendarModule />;
                case AppState.Academy: return <PremiumGuard featureName="Academy" onExit={() => setCurrentTab(AppState.Dashboard)}><EssentialsModule /></PremiumGuard>;
                case AppState.Sunnah: return <PremiumGuard featureName="Sunnah Companion" onExit={() => setCurrentTab(AppState.Dashboard)}><SunnahModule /></PremiumGuard>;
                case AppState.Goals: return <PremiumGuard featureName="Goal Architect" onExit={() => setCurrentTab(AppState.Dashboard)}><GoalPlannerModule /></PremiumGuard>;
                case AppState.MoodSupport: return <PremiumGuard featureName="Sanctuary" onExit={() => setCurrentTab(AppState.Dashboard)}><MoodSupportModule /></PremiumGuard>;
                case AppState.LifeGuidance: return <PremiumGuard featureName="Life Guidance" onExit={() => setCurrentTab(AppState.Dashboard)}><LifeGuidanceModule /></PremiumGuard>;
                case AppState.AdhanSettings: return <AdhanSettingsModule />;
                case AppState.Subscription: return <SubscriptionWall onSuccess={() => window.location.reload()} onCancel={() => setCurrentTab(AppState.Dashboard)} />;
                case AppState.Tools: return <PremiumGuard featureName="Spiritual Toolkit" onExit={() => setCurrentTab(AppState.Dashboard)}><ToolsModule initialTool={activeToolId} /></PremiumGuard>;
                case AppState.Profile: return <UserPanel onSignOut={handleSignOut} onSubscribe={() => setCurrentTab(AppState.Subscription)} />;
                default: return <Dashboard onNavigate={navigateTo} />;
              }
            })()}
          </div>
          
          <Navigation currentTab={currentTab} onTabChange={setCurrentTab} onSignOut={handleSignOut} isSacredNightsActive={isSacredNightsActive} subscription={subscription} />
        </main>
      </div>
    </RamadanThemeWrapper>
  );
};

export default App;
