
import React, { useState } from 'react';
import { AppState, UserSubscription } from '../types';
import { DashboardIcon, ChatIcon, CheckInIcon, LearningIcon, ToolsIcon, AudioIcon, RamadanIcon, ProfileIcon, DreamsIcon, KhutbahIcon, JournalIcon, HifdhIcon, JourneyIcon, DuaLibraryIcon, AcademyIcon, NightIcon } from '../constants';

interface SidebarProps {
  currentTab: AppState;
  onTabChange: (tab: AppState) => void;
  onSignOut: () => void;
  isSacredNightsActive?: boolean;
  subscription?: UserSubscription | null;
  onShowTour?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onSignOut, isSacredNightsActive, subscription, onShowTour }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: AppState.Dashboard, label: 'Hub', icon: <DashboardIcon /> },
    { id: AppState.DeenJourney, label: 'Deen Journey', icon: <JourneyIcon />, premium: true },
    { id: AppState.LifeGuidance, label: 'Life Guidance', icon: <div className="text-xl">✨</div>, premium: true },
    { id: AppState.Goals, label: 'Goal Architect', icon: <div className="text-xl">🎯</div>, premium: true },
    { id: AppState.MoodSupport, label: 'Sanctuary', icon: <div className="text-xl">🕊️</div>, premium: true },
    { id: AppState.Academy, label: 'Academy', icon: <AcademyIcon />, premium: true },
    { id: AppState.Sunnah, label: 'Sunnah Companion', icon: <span className="text-xl">🌿</span>, premium: true },
    { id: AppState.Ramadan, label: 'Ramadan Hub', icon: <RamadanIcon />, premium: true },
    ...(isSacredNightsActive ? [{ id: AppState.LaylatulQadr, label: 'Night Vigil', icon: <NightIcon /> }] : []),
    { id: AppState.Chat, label: 'Noor AI', icon: <ChatIcon />, premium: true },
    { id: AppState.ImageGen, label: 'Art Studio', icon: <div className="text-xl">🎨</div>, premium: true },
    { id: AppState.Radio, label: 'Quran Radio', icon: <div className="text-xl">📻</div> },
    { id: AppState.Hadith, label: 'Hadith Library', icon: <div className="text-xl">📜</div> },
    { id: AppState.DuaLibrary, label: 'Treasury', icon: <DuaLibraryIcon /> },
    { id: AppState.Hifdh, label: 'Hifdh Hub', icon: <HifdhIcon /> },
    { id: AppState.Journal, label: 'Journal', icon: <JournalIcon />, premium: true },
    { id: AppState.Audio, label: 'Audio', icon: <AudioIcon /> },
    { id: AppState.Khutbah, label: 'Khutbah', icon: <KhutbahIcon />, premium: true },
    { id: AppState.Dreams, label: 'Ru\'ya Dreams', icon: <DreamsIcon />, premium: true },
    { id: AppState.CheckIn, label: 'Vitals', icon: <CheckInIcon /> },
    { id: AppState.Learning, label: 'The Quran', icon: <LearningIcon /> },
    { id: AppState.Tools, label: 'Toolkit', icon: <ToolsIcon />, premium: true },
    { id: AppState.Profile, label: 'Identity', icon: <ProfileIcon /> },
  ];

  return (
    <div className={`hidden md:flex ${isCollapsed ? 'w-24' : 'w-80'} bg-zinc-950 text-white flex-col h-full transition-all duration-500 z-50 border-r border-white/5 relative`}>
      
      {/* Header Area */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} relative z-10`}>
        {!isCollapsed && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
              <span className="text-2xl font-bold font-arabic text-white">ن</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tightest uppercase text-white/90">NOOR</h1>
              {subscription?.tier === 'premium' ? (
                <span className="text-[7px] bg-gold-primary text-black px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Premium</span>
              ) : (
                <span className="text-[7px] text-zinc-500 font-black tracking-widest uppercase">Basic Mode</span>
              )}
            </div>
          </div>
        )}
        
        {isCollapsed && (
           <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 mb-2">
              <span className="text-2xl font-bold font-arabic text-white">ن</span>
           </div>
        )}

        {/* Hamburger Toggle (3 Lines) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
          title={isCollapsed ? "Extend Sidebar" : "Collapse Sidebar"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 mt-2 px-3 space-y-1 overflow-y-auto no-scrollbar relative z-10 custom-scroll">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-5 px-5'} py-4 rounded-2xl transition-all duration-300 group relative ${
              currentTab === item.id 
                ? 'bg-white/10 text-white border border-white/5' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-white'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            <span className={`transition-transform duration-500 ${currentTab === item.id ? 'scale-110 text-white' : 'group-hover:scale-105'} text-xl`}>
              {item.icon}
            </span>
            
            {!isCollapsed && (
              <span className="font-bold text-xs tracking-widest uppercase">{item.label}</span>
            )}

            {/* Premium PRO Badge */}
            {item.premium && (
              <div className={`absolute ${isCollapsed ? 'top-1 right-1' : 'right-4 top-1/2 -translate-y-1/2'}`}>
                <span className="text-[8px] font-black bg-gold-primary text-black px-1.5 py-0.5 rounded-md tracking-tighter shadow-sm">PRO</span>
              </div>
            )}
            
            {/* Active Indicator Bar */}
            {currentTab === item.id && !isCollapsed && <div className="absolute left-1 w-1 h-6 bg-gold-primary rounded-full"></div>}
          </button>
        ))}
      </nav>

      {/* Footer Area */}
      <div className="p-6 border-t border-white/5 relative z-10 space-y-2">
        {!isCollapsed && (!subscription || subscription.tier === 'free') && (
          <div className="mb-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
             <p className="text-[9px] font-black text-gold-primary uppercase tracking-widest mb-1">Trial Credits</p>
             <div className="flex items-end justify-between">
                <p className="text-xl font-black text-white">{subscription?.creditsRemaining || 0}</p>
                <button onClick={() => onTabChange(AppState.Subscription)} className="text-[7px] font-black uppercase text-zinc-400 hover:text-white hover:underline">Go Premium</button>
             </div>
             <div className="w-full bg-black h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-gold-primary h-full" style={{ width: `${((subscription?.creditsRemaining || 0) / 20) * 100}%` }}></div>
             </div>
          </div>
        )}
        
        {onShowTour && (
          <button 
            onClick={onShowTour}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-5 px-5'} py-4 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all group`}
            title="App Tour"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isCollapsed && <span className="font-black text-[9px] uppercase tracking-[0.2em]">App Tour</span>}
          </button>
        )}

        <button 
          onClick={onSignOut}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-5 px-5'} py-4 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-rose-400 transition-all group`}
          title="Sign Out"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="font-black text-[9px] uppercase tracking-[0.2em]">End Session</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
