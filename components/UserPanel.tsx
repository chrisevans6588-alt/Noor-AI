
import React, { useState, useEffect } from 'react';
import { auth, db, doc, getDoc, updateDoc, deleteDoc, deleteUser, firebaseSignOut } from '../services/firebaseClient';

interface UserProfileData {
  name: string;
  email: string;
  photoURL: string;
}

const UserPanel: React.FC<{ onSignOut: () => void; onSubscribe: () => void }> = ({ onSignOut, onSubscribe }) => {
  const [profile, setProfile] = useState<UserProfileData>({ name: '', email: '', photoURL: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setProfile({
              name: data.name || 'Seeker',
              email: data.email || auth.currentUser.email || '',
              photoURL: data.photoURL || ''
            });
            setNewName(data.name || 'Seeker');
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    onSignOut();
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, { name: newName });
      setProfile(prev => ({ ...prev, name: newName }));
      setIsEditing(false);
    } catch (e) {
      console.error("Error updating profile", e);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is irreversible and all your data will be lost.");
    if (!confirmDelete) return;

    try {
      // 1. Delete Firestore Data
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(db, 'users', uid));
      
      // 2. Delete Auth User
      await deleteUser(auth.currentUser);
      
      // 3. UI Cleanup
      onSignOut();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in to delete your account.");
      } else {
        alert("Failed to delete account. Please try again later.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <header className="bg-emerald-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10 font-arabic text-[14rem]">ن</div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-28 h-28 rounded-[2.5rem] bg-white/10 border-4 border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
             {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                <span className="text-5xl font-black">{profile.name.charAt(0).toUpperCase()}</span>
             )}
          </div>
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                 <input 
                   type="text" 
                   value={newName} 
                   onChange={(e) => setNewName(e.target.value)} 
                   className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white font-bold outline-none focus:bg-white/30"
                 />
                 <div className="flex gap-2">
                    <button onClick={handleSaveProfile} disabled={saving} className="bg-white text-emerald-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 disabled:opacity-50">
                       {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setIsEditing(false); setNewName(profile.name); }} className="bg-transparent border border-white/30 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10">
                       Cancel
                    </button>
                 </div>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black tracking-tight">{profile.name}</h2>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                   <p className="text-emerald-200/80 font-medium">{profile.email}</p>
                   <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                </div>
                <span className="inline-block px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase border border-white/10 tracking-widest mt-2">
                  Synced with Cloud Sanctuary
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-[#E9E5D9] shadow-sm space-y-6">
            <h4 className="text-xl font-black text-[#121212]">Account Actions</h4>
            <div className="space-y-3">
               <button onClick={handleSignOut} className="w-full flex items-center justify-between p-4 bg-[#FBF9F4] rounded-2xl hover:bg-slate-100 transition-colors group">
                  <span className="font-bold text-slate-700">Sign Out</span>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
               <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors group border border-rose-100">
                  <span className="font-bold text-rose-700">Delete Account</span>
                  <svg className="w-5 h-5 text-rose-400 group-hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
         </div>

         <div className="bg-[#121212] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between">
            <div className="space-y-2">
               <h4 className="text-xl font-black text-white">Premium Access</h4>
               <p className="text-white/60 text-sm">Unlock scholarly deep-dives and unlimited AI guidance.</p>
            </div>
            <button onClick={onSubscribe} className="mt-6 w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
               Manage Subscription
            </button>
         </div>
      </div>
    </div>
  );
};

export default UserPanel;
