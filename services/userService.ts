
import { db, doc, getDoc, setDoc } from './firebaseClient';

/**
 * Synchronizes the authenticated user's data to the Firestore 'users' collection.
 * Creates the document if it doesn't exist, or updates lastLogin if it does.
 */
export const syncUserToFirestore = async (user: any) => {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Seeker',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
    }
  } catch (e: any) {
    // If permission denied (likely due to unverified email or security rules), 
    // we suppress the error to prevent UI disruption. The sync will be retried
    // automatically in App.tsx once the user is verified.
    if (e.code !== 'permission-denied') {
      console.error("Error syncing user to Firestore:", e);
    }
  }
};
