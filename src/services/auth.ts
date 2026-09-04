// Authentication Service
import { getSupabaseClient } from '@/lib/supabase';
import type { User, AuthSession } from '../types';

function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  return configuredUrl.replace(/\/$/, '');
}

function getAuthCallbackUrl(nextPath = '/dashboard'): string {
  return `${getAppUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

export class AuthService {
  private get supabase() {
    return getSupabaseClient();
  }

  async register(email: string, password: string, username: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
        emailRedirectTo: getAuthCallbackUrl('/dashboard'),
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed. Please check your email.');
    }

    const mappedUser = await this.mapUser(data.user);

    if (!data.session) {
      return {
        access_token: '',
        refresh_token: '',
        expires_at: null,
        user: mappedUser,
      };
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at ?? null,
      user: mappedUser,
    };
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed. Please try again.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at ?? null,
      user: await this.mapUser(data.user),
    };
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async resendVerification(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl('/dashboard'),
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppUrl()}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        username: updates.username,
        display_name: updates.display_name,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapProfile(data);
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session } } = await this.supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const user = await this.mapUser(session.user);
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ?? null,
      user,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return this.mapUser(user);
  }

  async mapUser(authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; created_at?: string | null; updated_at?: string | null }): Promise<User> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !profile) {
      return {
        id: authUser.id,
        email: authUser.email || '',
        username: (authUser.user_metadata?.username as string) || 'user',
        display_name: (authUser.user_metadata?.display_name as string) || null,
        bio: null,
        avatar_url: null,
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: authUser.updated_at || new Date().toISOString(),
      };
    }

    return {
      id: profile.id,
      email: authUser.email || '',
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  private mapProfile(row: { id: string; username: string; display_name: string | null; bio: string | null; avatar_url: string | null; created_at: string; updated_at: string }): User {
    return {
      id: row.id,
      email: '',
      username: row.username,
      display_name: row.display_name,
      bio: row.bio,
      avatar_url: row.avatar_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const authService = new AuthService();

export function getAuthSupabaseClient() {
  return authService['supabase'];
}