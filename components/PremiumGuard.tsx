
import React, { useState, useEffect } from 'react';
import { UserSubscription, AppState } from '../types';
import { loadSubscription } from '../services/subscriptionService';
import { auth } from '../services/firebaseClient';
import SubscriptionWall from './SubscriptionWall';

interface Props {
  children: React.ReactNode;
  featureName: string;
  isAction?: boolean; 
  onExit: () => void;
}

const PremiumGuard: React.FC<Props> = ({ children, featureName, isAction, onExit }) => {
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [showWall, setShowWall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSub = async () => {
      const user = auth.currentUser;
      if (user) {
        const currentSub = await loadSubscription(user.uid);
        setSub(currentSub);
        
        if (currentSub.tier === 'free' && currentSub.creditsRemaining <= 0) {
          setShowWall(true);
        }
      }
      setLoading(false);
    };
    checkSub();
  }, []);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );

  if (showWall) {
    return (
      <SubscriptionWall 
        featureName={featureName} 
        onSuccess={() => { setShowWall(false); window.location.reload(); }} 
        onCancel={onExit} 
      />
    );
  }

  return <>{children}</>;
};

export default PremiumGuard;
