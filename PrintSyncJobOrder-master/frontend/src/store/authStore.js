import { create } from 'zustand';
import { auth, db } from '../utils/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuthStore = create((set) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      set({
        user: user,
        userRole: userDoc.data()?.role || 'customer',
        isAuthenticated: true,
        isLoading: false,  // ✅ only set false AFTER firebase confirms
      });
    } else {
      set({
        user: null,
        userRole: null,
        isAuthenticated: false,
        isLoading: false,  // ✅ only set false AFTER firebase confirms
      });
    }
  });

  return {
    user: null,
    userRole: null,
    isAuthenticated: false,
    isLoading: true, // ✅ starts true, waits for onAuthStateChanged

    register: async (email, password, name) => {
      try {
        set({ isLoading: true });
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await setDoc(doc(db, 'users', result.user.uid), {
          name,
          email,
          role: 'customer',
          createdAt: new Date(),
        });
        set({ user: result.user, userRole: 'customer', isAuthenticated: true, isLoading: false });
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
        set({ user: result.user, userRole: userDoc.data()?.role || 'customer', isAuthenticated: true, isLoading: false });
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
        set({ user: null, userRole: null, isAuthenticated: false, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },
  };
});