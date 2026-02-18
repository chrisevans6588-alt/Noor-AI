
import React, { useState } from 'react';
import { auth, sendEmailVerification } from '../services/firebaseClient';

const EmailVerification: React.FC<{ user: any; onSignOut: () => void }> = ({ user, onSignOut }) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setMessage('');
    try {
      await sendEmailVerification(user);
      setMessage('Verification email sent again. Please check your inbox (and spam).');
    } catch (e: any) {
      if (e.code === 'auth/too-many-requests') {
        setMessage('Please wait a moment before requesting another email.');
      } else {
        setMessage('Error sending email. Please try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-[#E9E5D9] text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm">
          ✉️
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[#121212] tracking-tight">Verify Your Email</h2>
          <p className="text-[#8E8E8E] font-medium leading-relaxed">
            We have sent a verification email to <span className="text-[#121212] font-bold">{user.email}</span>.
          </p>
          <p className="text-[#8E8E8E] text-sm">
            Please click the link in the email to verify your account, then log in.
          </p>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onSignOut}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Login
          </button>
          
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-xs font-bold text-[#8E8E8E] hover:text-[#121212] uppercase tracking-widest py-2 transition-colors disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
