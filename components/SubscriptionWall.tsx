
import React, { useState } from 'react';
import { PRICING, detectRegion, initiatePayment } from '../services/subscriptionService';
import { auth } from '../services/firebaseClient';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  featureName?: string;
}

const SubscriptionWall: React.FC<Props> = ({ onSuccess, onCancel, featureName }) => {
  const [loading, setLoading] = useState(false);
  const region = detectRegion();
  const plans = PRICING[region];

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && user.email) {
      await initiatePayment(
        user.uid,
        user.email,
        plan,
        () => {
          setLoading(false);
          onSuccess();
        },
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
      alert("Please sign in to subscribe.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md" onClick={onCancel}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-emerald-900 p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="text-9xl font-arabic">ن</span>
           </div>
           <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl border border-white/20">💎</div>
           <h2 className="text-3xl md:text-5xl font-black text-white tracking-tightest mb-4">Noor Premium</h2>
           <p className="text-emerald-100/60 text-lg font-medium max-w-md mx-auto leading-relaxed">
             Unlock unlimited insights, scholarly deep-dives, and spiritual engines for the soul.
           </p>
           {featureName && (
             <div className="mt-6 inline-block px-4 py-2 bg-white/10 rounded-full border border-white/20 text-[10px] font-black uppercase text-amber-400 tracking-widest animate-pulse">
               Accessing: {featureName}
             </div>
           )}
        </div>

        <div className="p-8 md:p-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => handleSubscribe('monthly')}
                disabled={loading}
                className="group p-8 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 transition-all text-left bg-[#FBF9F4] hover:bg-white active:scale-95"
              >
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Standard Path</span>
                 <h4 className="text-2xl font-black text-slate-900 mb-2">Monthly</h4>
                 <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-emerald-600">{plans.monthly.symbol}{plans.monthly.price}</span>
                    <span className="text-xs text-slate-400 font-bold">/ month</span>
                 </div>
                 <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {loading ? 'Processing...' : 'Select Plan →'}
                 </span>
              </button>

              <button 
                onClick={() => handleSubscribe('yearly')}
                disabled={loading}
                className="group p-8 rounded-[2rem] border-2 border-amber-400 bg-amber-50/30 hover:bg-white transition-all text-left relative active:scale-95"
              >
                 <div className="absolute top-4 right-4 bg-amber-400 text-slate-900 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm">Save 40%</div>
                 <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1 block">Infinite Path</span>
                 <h4 className="text-2xl font-black text-slate-900 mb-2">Yearly</h4>
                 <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-emerald-600">{plans.yearly.symbol}{plans.yearly.price}</span>
                    <span className="text-xs text-slate-400 font-bold">/ year</span>
                 </div>
                 <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-900 px-3 py-1 rounded-full">
                    {loading ? 'Processing...' : 'Best Value →'}
                 </span>
              </button>
           </div>

           <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                 <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 <span className="text-xs font-bold uppercase tracking-wide">Unlimited Advanced Noor AI & Scholarly Insights</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                 <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 <span className="text-xs font-bold uppercase tracking-wide">Ad-Free Experience & Offline Sanctuary Access</span>
              </div>
           </div>

           <div className="mt-12 flex items-center justify-between">
              <button onClick={onCancel} className="text-[10px] font-black uppercase text-slate-300 hover:text-slate-500 transition-colors">Maybe Later</button>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-300 italic">Secured by</span>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Razorpay</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionWall;
