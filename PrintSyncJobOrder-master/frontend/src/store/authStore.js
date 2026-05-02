import { create } from 'zustand';
import { auth, db } from '../utils/firebase';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ── Use env var so localhost never ships to production ────────────────────────
const CONTINUE_URL = import.meta.env.VITE_APP_URL
  ? `${import.meta.env.VITE_APP_URL}/login`
  : 'http://localhost:5173/login';

// Internal flag — prevents the onAuthStateChanged listener from setting
// isAuthenticated during temporary sign-ins (resend verification flow).
let _suppressAuthListener = false;

export const useAuthStore = create((set, get) => ({
  user:            null,
  userRole:        null,
  isAuthenticated: false,
  isLoading:       true,

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  // Signs out any persisted Firebase session first so every fresh page load
  // always starts unauthenticated, then sets up the auth state listener.
  init: () => {
    // Force sign-out of any Firebase-persisted session before listening.
    // This ensures a fresh app open never auto-restores a previous login.
    signOut(auth).finally(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        // Skip listener updates during temporary sign-ins (e.g. resend flow)
        if (_suppressAuthListener) return;

        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const role = userDoc.data()?.role || 'customer';

          // Admins bypass email verification (dummy/test accounts)
          if (user.emailVerified || role === 'admin') {
            set({
              user,
              userRole:        role,
              isAuthenticated: true,
              isLoading:       false,
            });
          } else {
            // Signed in but unverified customer — treat as logged out
            set({
              user:            null,
              userRole:        null,
              isAuthenticated: false,
              isLoading:       false,
            });
          }
        } else {
          set({
            user:            null,
            userRole:        null,
            isAuthenticated: false,
            isLoading:       false,
          });
        }
      });

      return unsubscribe;
    });

    // Return a no-op cleanup since we can't easily return the inner unsubscribe
    // from inside .finally(). The listener is cleaned up when the component unmounts
    // via the signOut-then-listen chain above.
    return () => signOut(auth);
  },

  // ── Register ──────────────────────────────────────────────────────────────
  register: async (email, password, name) => {
    try {
      set({ isLoading: true });

      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, { displayName: name });

      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email,
        role:      'customer',
        createdAt: new Date(),
      });

      await sendEmailVerification(result.user, { url: CONTINUE_URL });

      // Sign out immediately — user must verify before accessing the app
      await signOut(auth);

      set({ user: null, userRole: null, isAuthenticated: false, isLoading: false });
      return result.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    try {
      set({ isLoading: true });

      const result = await signInWithEmailAndPassword(auth, email, password);

      // Fetch role first so admins can bypass the email verification requirement
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const role = userDoc.data()?.role || 'customer';

      if (!result.user.emailVerified && role !== 'admin') {
        await signOut(auth);
        set({ isLoading: false });
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      set({
        user:            result.user,
        userRole:        role,
        isAuthenticated: true,
        isLoading:       false,
      });

      return result.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ── Resend verification email ─────────────────────────────────────────────
  // Suppresses the auth listener during the temporary sign-in so the app
  // never flickers into an authenticated state.
  resendVerificationEmail: async (email, password) => {
    try {
      _suppressAuthListener = true;

      const result = await signInWithEmailAndPassword(auth, email, password);

      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user, { url: CONTINUE_URL });
      }

      await signOut(auth);
    } catch (error) {
      throw error;
    } finally {
      _suppressAuthListener = false;
    }
  },
  
  // ── Forgot password ───────────────────────────────────────────────────────
  forgotPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, { url: CONTINUE_URL });
    } catch (error) {
      throw error;
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
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
}));