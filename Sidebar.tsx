
import React from 'react';
// Fix: Use correct relative path for imports from the same directory
import { AppState } from './types';
import { DashboardIcon, ChatIcon, CheckInIcon, LearningIcon, ToolsIcon, AudioIcon, RamadanIcon, ProfileIcon, DreamsIcon, KhutbahIcon, JournalIcon, HifdhIcon, JourneyIcon, DuaLibraryIcon, AcademyIcon } from './constants';

interface SidebarProps {
  currentTab: AppState;
  onTabChange: (tab: AppState) => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onSignOut }) => {
  const navItems = [
    { id: AppState.Dashboard, label: 'Home', icon: <DashboardIcon /> },
    { id: AppState.DeenJourney, label: 'Deen Journey', icon: <JourneyIcon /> },
    { id: AppState.Academy, label: 'Spiritual Academy', icon: <AcademyIcon /> },
    { id: AppState.Ramadan, label: 'Ramadan Hub', icon: <RamadanIcon /> },
    { id: AppState.Chat, label: 'Ask Noor', icon: <ChatIcon /> },
    { id: AppState.DuaLibrary, label: 'Dua Library', icon: <DuaLibraryIcon /> },
    { id: AppState.Hifdh, label: 'Hifdh Hub', icon: <HifdhIcon /> },
    { id: AppState.Journal, label: 'Noor Journal', icon: <JournalIcon /> },
    { id: AppState.Audio, label: 'Quran Audio', icon: <AudioIcon /> },
    { id: AppState.Khutbah, label: 'Khutbah Studio', icon: <KhutbahIcon /> },
    { id: AppState.Dreams, label: 'Ru\'ya Insight', icon: <DreamsIcon /> },
    { id: AppState.CheckIn, label: 'Check-in', icon: <CheckInIcon /> },
    { id: AppState.Learning, label: 'Learn', icon: <LearningIcon /> },
    { id: AppState.Tools, label: 'Tools', icon: <ToolsIcon /> },
    { id: AppState.Profile, label: 'Account', icon: <ProfileIcon /> },
  ];

  return (
    <div className="w-20 md:w-64 bg-emerald-900 text-white flex flex-col h-full transition-all duration-300 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center shadow-inner border border-emerald-600/50">
          <span className="text-xl font-bold font-arabic">ن</span>
        </div>
        <h1 className="text-2xl font-black hidden md:block tracking-tighter">NOOR</h1>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${
              currentTab === item.id 
                ? 'bg-emerald-800 text-white shadow-xl shadow-emerald-950/20' 
                : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
            }`}
          >
            <span className={`${currentTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              {item.icon}
            </span>
            <span className="hidden md:block font-bold text-sm tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <div className="hidden md:block mb-6 px-2">
          <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-black mb-2 opacity-60">Spiritual Light</p>
          <p className="text-sm italic text-emerald-50 font-arabic leading-relaxed">
            "Remember Me, and I will remember you."
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-bold">— Quran 2:152</p>
        </div>
        
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-emerald-300 hover:bg-rose-500/20 hover:text-rose-100 transition-all group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
