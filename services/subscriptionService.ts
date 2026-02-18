
import { UserSubscription, SubscriptionTier } from '../types';
import { db, doc, getDoc, setDoc, updateDoc } from './firebaseClient';

const SUBSCRIPTION_KEY = 'noor_user_subscription';
const FREE_TRIAL_CREDITS = 20;
const RAZORPAY_KEY_ID = 'rzp_test_RoNBQUgI6XgHi0';

export const PRICING = {
  IN: {
    monthly: { price: 499, symbol: '₹', label: 'Monthly' },
    yearly: { price: 3499, symbol: '₹', label: 'Yearly' },
  },
  GLOBAL: {
    monthly: { price: 7.99, symbol: '$', label: 'Monthly' },
    yearly: { price: 99.99, symbol: '$', label: 'Yearly' },
  }
};

export const detectRegion = (): 'IN' | 'GLOBAL' => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.includes('Calcutta') || tz.includes('India') || tz.includes('Asia/Kolkata')) {
    return 'IN';
  }
  return 'GLOBAL';
};

export const getDefaultSubscription = (): UserSubscription => ({
  tier: 'free',
  creditsRemaining: FREE_TRIAL_CREDITS,
  lastRenewalDate: new Date().toISOString(),
  isYearly: false,
  region: detectRegion()
});

export const loadSubscription = async (userId: string): Promise<UserSubscription> => {
  const cached = localStorage.getItem(`${SUBSCRIPTION_KEY}_${userId}`);
  if (cached) {
    const parsed = JSON.parse(cached);
    return parsed;
  }

  try {
    const docRef = doc(db, 'user_subscriptions', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const sub: UserSubscription = {
        tier: data.tier as SubscriptionTier,
        creditsRemaining: data.credits_remaining,
        lastRenewalDate: data.last_renewal_date,
        isYearly: data.is_yearly,
        region: data.region
      };
      localStorage.setItem(`${SUBSCRIPTION_KEY}_${userId}`, JSON.stringify(sub));
      return sub;
    } else {
      // Create default subscription doc for new user
      const defaultSub = getDefaultSubscription();
      await setDoc(docRef, {
        tier: defaultSub.tier,
        credits_remaining: defaultSub.creditsRemaining,
        last_renewal_date: defaultSub.lastRenewalDate,
        is_yearly: defaultSub.isYearly,
        region: defaultSub.region
      });
      localStorage.setItem(`${SUBSCRIPTION_KEY}_${userId}`, JSON.stringify(defaultSub));
      return defaultSub;
    }
  } catch (e) {
    // Fail silently to default subscription if cloud is unreachable
  }

  return getDefaultSubscription();
};

export const useCredit = async (userId: string): Promise<boolean> => {
  const sub = await loadSubscription(userId);
  
  if (sub.tier === 'premium') return true;
  if (sub.creditsRemaining <= 0) return false;

  sub.creditsRemaining -= 1;
  localStorage.setItem(`${SUBSCRIPTION_KEY}_${userId}`, JSON.stringify(sub));
  
  try {
    const docRef = doc(db, 'user_subscriptions', userId);
    await updateDoc(docRef, {
      credits_remaining: sub.creditsRemaining
    });
  } catch (e) {}
  
  return true;
};

// Internal function to update DB after payment
const subscribe = async (userId: string, plan: 'monthly' | 'yearly') => {
  const region = detectRegion();
  const sub: UserSubscription = {
    tier: 'premium',
    creditsRemaining: 999999, 
    lastRenewalDate: new Date().toISOString(),
    isYearly: plan === 'yearly',
    region
  };

  localStorage.setItem(`${SUBSCRIPTION_KEY}_${userId}`, JSON.stringify(sub));
  
  try {
    const docRef = doc(db, 'user_subscriptions', userId);
    await setDoc(docRef, {
      tier: 'premium',
      credits_remaining: 999999,
      is_yearly: plan === 'yearly',
      region,
      last_renewal_date: sub.lastRenewalDate
    }, { merge: true });
  } catch (e) {}
  
  return sub;
};

const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (
  userId: string, 
  userEmail: string,
  plan: 'monthly' | 'yearly',
  onSuccess: () => void,
  onFailure: () => void
) => {
  const res = await loadRazorpay();
  if (!res) {
    alert("Razorpay SDK failed to load. Please check your internet connection.");
    onFailure();
    return;
  }

  const region = detectRegion();
  const priceInfo = PRICING[region][plan];
  const amount = Math.round(priceInfo.price * 100); // Amount in smallest currency unit (paise/cents)
  const currency = region === 'IN' ? 'INR' : 'USD';

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount,
    currency: currency,
    name: "Noor Islamic AI",
    description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Premium Subscription`,
    image: "https://cdn-icons-png.flaticon.com/512/2830/2830722.png",
    handler: async function (response: any) {
      // Payment successful
      // In production, verify signature on backend here
      await subscribe(userId, plan);
      onSuccess();
    },
    prefill: {
      email: userEmail,
    },
    theme: {
      color: "#D4AF37",
    },
    modal: {
      ondismiss: function() {
        onFailure();
      }
    }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.on('payment.failed', function (response: any){
    alert(`Payment Failed: ${response.error.description}`);
    onFailure();
  });
  rzp.open();
};
