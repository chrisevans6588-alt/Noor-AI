
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  limit,
  deleteDoc,
  addDoc,
  writeBatch,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
  User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGj502JD0NuugqFxZAQUZ2aYogy9r4aLA",
  authDomain: "noor-96f3a.firebaseapp.com",
  projectId: "noor-96f3a",
  storageBucket: "noor-96f3a.firebasestorage.app",
  messagingSenderId: "466718770972",
  appId: "1:466718770972:web:d96269a474a070f3f71cd9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  collection, 
  getDocs, 
  query, 
  where, 
  limit,
  writeBatch,
  Timestamp,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile
};
