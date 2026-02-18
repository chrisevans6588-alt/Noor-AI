
import React, { useState, useEffect } from 'react';
import { AdhanSettings } from '../types';
import { CALCULATION_METHODS, loadAdhanSettings, saveAdhanSettings } from '../services/adhanService';
import { auth } from '../services/firebaseClient';

const AdhanSettingsModule: React.FC = () => {
  const [settings, setSettings] = useState<AdhanSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      const loaded = await loadAdhanSettings(user?.uid || 'guest');
      setSettings(loaded);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleUpdate = async (updates: Partial<AdhanSettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setIsSaving(true);
    await saveAdhanSettings(newSettings);
    setIsSaving(false);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert("Notifications enabled. Noor will alert you at prayer times.");
      }
    }
  };

  if (isLoading || !settings) return (
    <div className="py-40 flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-4 border-slate-100 border-t-amber-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Sanctuary Controls...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 px-4 md:px-0">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
           <div className="w-2 h-6 bg-amber-600 rounded-full gold-beam"></div>
           <span className="text-[11px] font-black uppercase text-amber-700 tracking-[0.4em]">Prayer Configuration</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tightest leading-none">Sanctuary Settings</h2>
        <p className="text-slate-500 font-medium text-sm md:text-xl italic opacity-70">Customize how your prayer times are calculated.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Calculation Method</label>
                <select 
                  value={settings.method}
                  onChange={(e) => handleUpdate({ method: parseInt(e.target.value) })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/10"
                >
                   {CALCULATION_METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <p className="text-xs text-slate-400 font-medium">Select the calculation authority that matches your local mosque.</p>
             </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
             <h3 className="text-xl font-black text-slate-900">Notification Alerts</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-lg shadow-sm">🔔</div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Push Notifications</p>
                        <p className="text-[10px] text-slate-400 font-medium">Text alerts when prayer time arrives.</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => {
                      if (settings.notificationsEnabled) handleUpdate({ notificationsEnabled: false });
                      else requestNotificationPermission().then(() => handleUpdate({ notificationsEnabled: true }));
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-200'}`}
                   >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
             </div>
          </section>
        </div>
      </div>

      <footer className="text-center pt-20 border-t border-slate-100 space-y-6 opacity-60">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Noor Sanctuary • Timekeeping</p>
      </footer>
    </div>
  );
};

export default AdhanSettingsModule;
