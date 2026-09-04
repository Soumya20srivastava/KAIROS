// Auth Provider
'use client';

import { useEffect, ReactNode } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { authService, getAuthSupabaseClient } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        setLoading(true);
        const session = await authService.getCurrentSession();
        
        if (mounted) {
          if (session) {
            setSession(session);
          } else {
            setUser(null);
            setSession(null);
          }
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    }

    // Listen for auth changes
    const supabase = getAuthSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const user = await authService.mapUser(session.user);
          setUser(user);
          setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at ?? null,
            user,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading, setInitialized]);

  return <>{children}</>;
}