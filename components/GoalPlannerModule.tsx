
import React, { useState, useEffect } from 'react';
import { SpiritualGoal } from '../types';

const GoalPlannerModule: React.FC = () => {
  const [goals, setGoals] = useState<SpiritualGoal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<SpiritualGoal>>({
    category: 'Quran',
    unit: 'Ayahs',
    targetCount: 1,
    currentCount: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('noor_spiritual_goals');
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  const saveGoals = (updated: SpiritualGoal[]) => {
    setGoals(updated);
    localStorage.setItem('noor_spiritual_goals', JSON.stringify(updated));
  };

  const addGoal = () => {
    if (!newGoal.title) return;
    const goal: SpiritualGoal = {
      id: Date.now().toString(),
      title: newGoal.title!,
      description: newGoal.description || '',
      category: newGoal.category as any,
      unit: newGoal.unit || 'Units',
      targetCount: newGoal.targetCount || 1,
      currentCount: 0,
      isCompleted: false
    };
    saveGoals([...goals, goal]);
    setShowAdd(false);
    setNewGoal({ category: 'Quran', unit: 'Ayahs', targetCount: 1, currentCount: 0 });
  };

  const updateProgress = (id: string, amount: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const next = Math.max(0, Math.min(g.targetCount, g.currentCount + amount));
        return { ...g, currentCount: next, isCompleted: next >= g.targetCount };
      }
      return g;
    });
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this goal? This action cannot be undone and your progress for this objective will be lost.")) {
      saveGoals(goals.filter(g => g.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#E9E5D9] pb-8 px-2">
        <div className="text-center lg:text-left space-y-1">
           <h2 className="text-3xl md:text-5xl font-black text-[#121212] tracking-tightest">Goal Architect</h2>
           <p className="text-[#8E8E8E] font-medium text-sm italic">Define your path to spiritual excellence.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#044E3B] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-lg"
        >
          New Objective
        </button>
      </header>

      {showAdd && (
        <div className="bg-white rounded-[2rem] border border-[#E9E5D9] p-8 shadow-xl space-y-6 animate-in zoom-in-95">
          <h3 className="text-xl font-black text-[#121212]">Set a New Sacred Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Goal Title (e.g. Memorize Surah Mulk)" 
              className="w-full p-4 bg-[#FBF9F4] border border-[#E9E5D9] rounded-xl outline-none font-bold"
              value={newGoal.title || ''}
              onChange={e => setNewGoal({...newGoal, title: e.target.value})}
            />
            <select 
              className="w-full p-4 bg-[#FBF9F4] border border-[#E9E5D9] rounded-xl outline-none font-bold"
              value={newGoal.category}
              onChange={e => setNewGoal({...newGoal, category: e.target.value as any})}
            >
              <option value="Quran">Quran</option>
              <option value="Dhikr">Dhikr</option>
              <option value="Sunnah">Sunnah</option>
              <option value="Character">Character</option>
            </select>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Target" 
                className="flex-1 p-4 bg-[#FBF9F4] border border-[#E9E5D9] rounded-xl outline-none font-bold"
                value={newGoal.targetCount || ''}
                onChange={e => setNewGoal({...newGoal, targetCount: parseInt(e.target.value)})}
              />
              <input 
                type="text" 
                placeholder="Unit (e.g. Ayahs)" 
                className="flex-1 p-4 bg-[#FBF9F4] border border-[#E9E5D9] rounded-xl outline-none font-bold"
                value={newGoal.unit || ''}
                onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addGoal} className="flex-1 bg-[#121212] text-white py-4 rounded-xl font-black uppercase text-xs">Architect Goal</button>
            <button onClick={() => setShowAdd(false)} className="px-8 py-4 border border-[#E9E5D9] rounded-xl font-black uppercase text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-[2rem] p-8 border border-[#E9E5D9] shadow-sm flex flex-col md:flex-row items-center gap-8 relative group">
            <button 
              onClick={() => deleteGoal(goal.id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F4] flex items-center justify-center text-3xl shadow-inner shrink-0">
              {goal.category === 'Quran' ? '📖' : goal.category === 'Dhikr' ? '📿' : goal.category === 'Sunnah' ? '🌿' : '💎'}
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-black text-[#121212]">{goal.title}</h4>
                  <span className="text-[8px] font-black uppercase text-[#A68B5B] tracking-widest">{goal.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#121212]">{goal.currentCount}<span className="text-xs text-[#8E8E8E] font-medium ml-1">/ {goal.targetCount} {goal.unit}</span></span>
                </div>
              </div>
              <div className="w-full bg-[#FBF9F4] h-2.5 rounded-full overflow-hidden border border-[#E9E5D9]">
                <div 
                  className={`h-full transition-all duration-1000 ${goal.isCompleted ? 'bg-emerald-500' : 'bg-[#A68B5B]'}`} 
                  style={{ width: `${(goal.currentCount / goal.targetCount) * 100}%` }}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateProgress(goal.id, 1)} className="px-4 py-2 bg-[#FBF9F4] border border-[#E9E5D9] rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Record +1</button>
                <button onClick={() => updateProgress(goal.id, 5)} className="px-4 py-2 bg-[#FBF9F4] border border-[#E9E5D9] rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Record +5</button>
              </div>
            </div>
            {goal.isCompleted && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-black text-[9px] uppercase tracking-widest animate-bounce">Goal Accomplished</div>
            )}
          </div>
        ))}

        {goals.length === 0 && !showAdd && (
          <div className="py-20 text-center space-y-4 opacity-30">
            <div className="text-6xl">🎯</div>
            <p className="font-black uppercase text-xs tracking-widest">Your objective board is clear. Set a goal to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalPlannerModule;
