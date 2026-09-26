// src/store/auth.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        set({ user: session.user, profile, loading: false, error: null });
      } else {
        set({ user: null, profile: null, loading: false, error: null });
      }
    } catch (err: any) {
      console.error('[auth.init] failed:', err);
      set({ loading: false, error: 'Failed to initialize session' });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();
    set({ user: data.user, profile, loading: false, error: null });
    return { error: null };
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      set({ user: data.user, profile, loading: false, error: null });
    } else {
      set({ loading: false });
    }
    return { error: null };
  },

  logout: async () => {
    localStorage.removeItem('megamart_guest_cart_v1');
    await supabase.auth.signOut();
    set({ user: null, profile: null, error: null });
  },

  refreshProfile: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    set({ profile });
  },

  requestPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  },
}));