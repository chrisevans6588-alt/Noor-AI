
import React, { useState } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile
} from '../services/firebaseClient';
import { syncUserToFirestore } from '../services/userService';

type LoginMode = 'login' | 'signup' | 'forgot' | 'reset-sent';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<LoginMode>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        await sendEmailVerification(userCredential.user);
      } else if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(userCredential.user);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setMode('reset-sent');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err);
      if (mode === 'signup') {
         if (err.code === 'auth/email-already-in-use') {
             setError('Email is already registered.');
         } else if (err.code === 'auth/weak-password') {
             setError('Password should be at least 6 characters.');
         } else {
             setError('Failed to create account. Please check your details.');
         }
      } else if (mode === 'login') {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError('Password or Email Incorrect');
        } else {
            setError('Failed to login. Please try again.');
        }
      } else if (mode === 'forgot') {
        if (err.code === 'auth/user-not-found') {
            setError('No account found with this email.');
        } else {
            setError('Failed to send reset link. Please verify email.');
        }
      }
    } finally {
      if (mode !== 'forgot') setLoading(false);
    }
  };

  if (mode === 'reset-sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-zinc-200 text-center">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm mb-6">
            📧
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Check Your Email</h2>
          <p className="text-zinc-500 font-medium leading-relaxed mb-8">
            We sent you a password change link to <span className="font-bold text-slate-800">{email}</span>
          </p>
          <button 
            onClick={() => { setMode('login'); setError(''); setPassword(''); }}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-zinc-200">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-4xl text-gold-primary font-arabic mx-auto mb-4 shadow-lg">
            ن
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'signup' ? 'Join Noor' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">
            {mode === 'signup' ? 'Start your spiritual journey' : mode === 'forgot' ? 'Enter your email to receive a link' : 'Enter your sanctuary'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/10 transition-all font-medium text-slate-900"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/10 transition-all font-medium text-slate-900"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-2 pr-1">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-[10px] font-bold text-gold-primary hover:underline tracking-wide"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/10 transition-all font-medium text-slate-900"
                required
              />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold text-center border border-rose-100 animate-in shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading 
              ? (mode === 'signup' ? 'Creating Account...' : mode === 'forgot' ? 'Sending...' : 'Entering...') 
              : (mode === 'signup' ? 'Sign Up' : mode === 'forgot' ? 'Get Reset Link' : 'Login')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-100 pt-6">
          <button 
            onClick={() => { 
              if (mode === 'login') setMode('signup');
              else setMode('login');
              setError(''); 
            }}
            className="text-xs font-bold text-zinc-400 hover:text-slate-900 transition-colors uppercase tracking-wider"
          >
            {mode === 'login' ? "Don't have an account? Create one" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
