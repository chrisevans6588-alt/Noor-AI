
import React, { useState } from 'react';
import { AppState, UserSubscription } from '../types';
import { DashboardIcon, ChatIcon, CheckInIcon, LearningIcon, RamadanIcon, JourneyIcon, ProfileIcon, ToolsIcon, SadaqahIcon, HifdhIcon, JournalIcon, AudioIcon, DreamsIcon, AcademyIcon, NightIcon, KhutbahIcon } from '../constants';

interface NavigationProps {
  currentTab: AppState;
  onTabChange: (tab: AppState) => void;
  onSignOut: () => void;
  isSacredNightsActive?: boolean;
  subscription?: UserSubscription | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, onSignOut, isSacredNightsActive, subscription }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (tab: AppState) => {
    if (navigator.vibrate) navigator.vibrate(10);
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  const NavButton = ({ tab, icon, label, isActive }: { tab: AppState | 'menu', icon: any, label?: string, isActive: boolean }) => (
    <button
      onClick={() => tab === 'menu' ? setIsMenuOpen(!isMenuOpen) : handleNav(tab as AppState)}
      className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active-press ${isActive ? 'text-gold-primary bg-white/10 shadow-[0_0_15px_rgba(198,168,94,0.15)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
      <div className={`text-xl ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>{icon}</div>
      {isActive && <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-gold-primary animate-pulse"></div>}
    </button>
  );

  const MenuGridItem: React.FC<{ item: any }> = ({ item }) => (
    <button
      onClick={() => handleNav(item.id)}
      className="flex flex-col items-center justify-center p-4 rounded-3xl glass-card active-press group min-h-[100px] bg-zinc-900/50"
    >
      <div className={`text-2xl mb-2 transition-transform duration-300 group-hover:scale-110 ${currentTab === item.id ? 'text-gold-primary' : 'text-white/60'}`}>
        {item.icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${currentTab === item.id ? 'text-white' : 'text-white/40'}`}>
        {item.label}
      </span>
      {item.premium && (
        <span className="absolute top-2 right-2 text-[7px] font-black bg-gold-primary text-black px-1.5 py-0.5 rounded tracking-tighter shadow-sm">PRO</span>
      )}
    </button>
  );

  const menuSections = [
    {
      title: "Spiritual Path",
      items: [
         { id: AppState.CheckIn, icon: <CheckInIcon />, label: "Check-in" },
         { id: AppState.DeenJourney, icon: <JourneyIcon />, label: "Journey", premium: true },
         { id: AppState.LifeGuidance, icon: "✨", label: "Guidance", premium: true },
         { id: AppState.Goals, icon: "🎯", label: "Goals", premium: true },
         { id: AppState.MoodSupport, icon: "🕊️", label: "Sanctuary", premium: true },
         { id: AppState.Academy, icon: <AcademyIcon />, label: "Academy", premium: true },
         { id: AppState.Sadaqah, icon: <SadaqahIcon />, label: "Sadaqah", premium: true },
      ]
    },
    {
      title: "Sanctuary Config",
      items: [
         { id: AppState.AdhanSettings, icon: "🔊", label: "Adhan Voice" },
         { id: AppState.NightCompanion, icon: "🌙", label: "Night Mode", premium: true },
         { id: AppState.Ramadan, icon: <RamadanIcon />, label: "Ramadan", premium: true },
         { id: AppState.Tools, icon: <ToolsIcon />, label: "Toolkit", premium: true },
         ...(isSacredNightsActive ? [{ id: AppState.LaylatulQadr, icon: <NightIcon />, label: "Night Vigil" }] : []),
      ]
    },
    {
      title: "Media & Knowledge",
      items: [
        { id: AppState.Radio, icon: "📻", label: "Live Radio" },
        { id: AppState.Hadith, icon: "📜", label: "Hadith" },
        { id: AppState.Audio, icon: <AudioIcon />, label: "Audio" },
        { id: AppState.DuaLibrary, icon: "🤲", label: "Duas" },
        { id: AppState.Khutbah, icon: <KhutbahIcon />, label: "Khutbah", premium: true },
        { id: AppState.ImageGen, icon: "🎨", label: "Vision AI", premium: true },
        { id: AppState.Hifdh, icon: <HifdhIcon />, label: "Hifdh" },
        { id: AppState.Journal, icon: <JournalIcon />, label: "Journal", premium: true },
        { id: AppState.Dreams, icon: <DreamsIcon />, label: "Dreams", premium: true },
      ]
    }
  ];

  return (
    <>
      {/* Floating Glass Command Deck */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] md:hidden w-auto">
        <div className="glass-panel rounded-[2.5rem] p-2 flex items-center gap-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 bg-black/80">
          
          <NavButton tab={AppState.Dashboard} icon={<DashboardIcon />} isActive={currentTab === AppState.Dashboard} />
          <NavButton tab={AppState.Chat} icon={<ChatIcon />} isActive={currentTab === AppState.Chat} />

          {/* Central Presence Orb */}
          <div className="mx-2 -mt-10">
            <button
              onClick={() => handleNav(AppState.Presence)}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold-primary to-amber-200 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(198,168,94,0.4)] border-4 border-[#09090b] active:scale-90 transition-transform"
            >
              🧘
            </button>
          </div>

          <NavButton tab={AppState.Learning} icon={<LearningIcon />} isActive={currentTab === AppState.Learning} />
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active-press ${isMenuOpen ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
          >
            <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
               <div className={`h-0.5 w-4 bg-current rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
               <div className={`h-0.5 w-4 bg-current rounded-full transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
               <div className={`h-0.5 w-4 bg-current rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Full Screen Immersive Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[85] bg-zinc-950/95 backdrop-blur-2xl md:hidden animate-in fade-in duration-300 overflow-y-auto no-scrollbar pt-safe pb-40 px-6">
          <div className="max-w-md mx-auto space-y-10 mt-4">
            <header className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tightest text-white">Divine Vault</h2>
                {subscription?.tier !== 'premium' && (
                  <p className="text-[9px] font-black uppercase text-gold-primary tracking-widest">{subscription?.creditsRemaining || 0} Credits Available</p>
                )}
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors">
                ✕
              </button>
            </header>

            {menuSections.map(section => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-primary opacity-60 pl-2">{section.title}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {section.items.map(item => <MenuGridItem key={item.id} item={item} />)}
                </div>
              </div>
            ))}

            <div className="pt-8 space-y-4 pb-8">
              <button 
                onClick={() => handleNav(AppState.Profile)}
                className="w-full flex items-center justify-between p-6 glass-panel rounded-[2rem] active-press group bg-zinc-900"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gold-primary"><ProfileIcon /></div>
                  <span className="font-black text-xs uppercase tracking-widest text-white">Identity & Settings</span>
                </div>
                <span className="text-white/20 group-hover:text-white transition-colors">→</span>
              </button>
              
              {subscription?.tier !== 'premium' && (
                <button 
                  onClick={() => handleNav(AppState.Subscription)}
                  className="w-full p-6 bg-gradient-to-r from-gold-primary to-amber-600 text-black rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl animate-pulse-slow active-press"
                >
                  Upgrade to Premium
                </button>
              )}
              
              <button 
                onClick={onSignOut}
                className="w-full p-4 text-rose-400 font-black uppercase text-[10px] tracking-widest hover:text-rose-300 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
