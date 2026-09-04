// Auth Store using Zustand
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, AuthSession } from '../types';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialState,
        setUser: (user) => set({ user }),
        setSession: (session) => {
          set({ session, user: session?.user || null, loading: false, error: null });
        },
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error, loading: false }),
        setInitialized: (initialized) => set({ initialized }),
        logout: () => {
          set({ user: null, session: null, loading: false, error: null });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('kairos-auth');
          }
        },
        reset: () => set({ ...initialState, loading: false }),
      }),
      {
        name: 'kairos-auth',
        partialize: (state) => ({ user: state.user, session: state.session }),
      }
    ),
    { name: 'auth-store' }
  )
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthInitialized = () => useAuthStore((state) => state.initialized);