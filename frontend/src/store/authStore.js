import { create } from 'zustand';
import { auth, db } from '../utils/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuthStore = create((set) => {
  // Listen to auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      set({
        user: user,
        userRole: userDoc.data()?.role || 'customer',
        isLoading: false,
      });
    } else {
      set({
        user: null,
        userRole: null,
        isLoading: false,
      });
    }
  });

  return {
    user: null,
    userRole: null,
    isLoading: true,

    register: async (email, password, name) => {
      try {
        set({ isLoading: true });
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
          name,
          email,
          role: 'customer',
          createdAt: new Date(),
        });

        set({ user: result.user, userRole: 'customer', isLoading: false });
        return result.user;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    login: async (email, password) => {
      try {
        set({ isLoading: true });
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        set({ user: result.user, userRole: userDoc.data()?.role, isLoading: false });
        return result.user;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        set({ isLoading: true });
        await signOut(auth);
        set({ user: null, userRole: null, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },
  };
});
