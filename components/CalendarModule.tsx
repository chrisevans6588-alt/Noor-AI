
import React, { useState, useEffect } from 'react';
import { fetchMonthlyCalendar, CalendarDay } from '../services/islamicApiService';

const CalendarModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const d = await fetchMonthlyCalendar(pos.coords.latitude, pos.coords.longitude, currentDate.getMonth() + 1, currentDate.getFullYear());
        setCalendarData(d); setIsLoading(false);
      }, () => fetchMonthlyCalendar(21.4225, 39.8262, currentDate.getMonth() + 1, currentDate.getFullYear()).then(d => { setCalendarData(d); setIsLoading(false); }));
    };
    load();
  }, [currentDate]);

  const padding = Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-4xl font-black text-[#1A1A1A] tracking-tight">Islamic Calendar</h2>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth()-1); setCurrentDate(d); }} className="p-2 active:bg-slate-100 rounded-lg">←</button>
           <span className="px-4 text-xs font-black uppercase text-[#1A1A1A]">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
           <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth()+1); setCurrentDate(d); }} className="p-2 active:bg-slate-100 rounded-lg">→</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 md:p-6 overflow-hidden">
          <div className="grid grid-cols-7 mb-2">
            {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[9px] font-black uppercase text-slate-300 py-3">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {padding.map((_, i) => <div key={i} className="aspect-square"></div>)}
            {calendarData.map((day, idx) => {
              const hDay = parseInt(day.date.hijri.day);
              const isWhite = hDay >= 13 && hDay <= 15;
              const hasHol = day.date.hijri.holidays.length > 0;
              const isToday = new Date().getDate().toString() === day.date.gregorian.day && new Date().getMonth() === currentDate.getMonth();
              
              return (
                <button key={idx} onClick={() => setSelectedDay(day)} className={`relative aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center p-1 ${isToday ? 'bg-emerald-900 border-emerald-900 text-white shadow-lg' : 'bg-white border-slate-50 active:border-[#C6A85E]'}`}>
                  <span className={`absolute top-1 left-1.5 text-[7px] md:text-[8px] font-bold opacity-30 ${isToday ? 'text-white' : ''}`}>{day.date.gregorian.day}</span>
                  <p className={`text-base md:text-xl font-black ${isToday ? 'text-white' : 'text-slate-800'}`}>{day.date.hijri.day}</p>
                  {isWhite && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-emerald-400'}`}></div>}
                  {hasHol && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center text-[6px]">✨</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4">
           <div className={`bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden h-full min-h-[300px] border border-white/5 transition-all ${selectedDay ? 'opacity-100' : 'opacity-40'}`}>
              {selectedDay ? (
                <div className="relative z-10 space-y-8 animate-in slide-in-from-bottom-4">
                   <header className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">{selectedDay.date.readable}</span>
                      <h3 className="text-3xl font-black tracking-tight">{selectedDay.date.hijri.day} {selectedDay.date.hijri.month.en}</h3>
                   </header>
                   {selectedDay.date.hijri.holidays.length > 0 && <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-xl text-amber-200 text-xs font-black uppercase">{selectedDay.date.hijri.holidays.join(', ')}</div>}
                   <div className="grid grid-cols-1 gap-2">
                     {['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(p => (
                       <div key={p} className="flex justify-between items-center p-4 bg-white/5 rounded-xl text-xs font-bold border border-white/5">
                         <span className="text-slate-400">{p}</span>
                         <span className="text-emerald-400">{selectedDay.timings[p]}</span>
                       </div>
                     ))}
                   </div>
                </div>
              ) : <div className="h-full flex items-center justify-center opacity-30 font-black uppercase text-xs tracking-widest">Select a Date</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModule;
