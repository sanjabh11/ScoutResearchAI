import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthService, User, Profile } from '../lib/auth';
import { STORAGE_KEYS } from '../lib/constants';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseConfigured || !supabase) {
        // Load guest session if present
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);
          if (raw) {
            const session = JSON.parse(raw);
            const guestUser: User = {
              id: session.userId,
              email: 'guest@local',
              user_metadata: { full_name: session.displayName || 'Guest' }
            } as any;
            setUser(guestUser);
            setProfile({
              id: session.userId,
              email: 'guest@local',
              full_name: session.displayName || 'Guest',
              avatar_url: null,
              subscription_tier: 'free',
              api_credits: 0,
              papers_count: 0,
              summaries_count: 0,
              visualizations_count: 0,
              code_generations_count: 0,
            });
          }
        } catch {}
        setIsLoading(false);
        return;
      }

      try {
        const user = await AuthService.getCurrentUser();
        setUser(user);

        if (user) {
          const userProfile = await AuthService.getProfile(user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Set up auth state change listener
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event: AuthChangeEvent, session: Session | null) => {
          if (session?.user) {
            const mapped: User = {
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: { full_name: (session.user.user_metadata as any)?.full_name }
            } as any;
            setUser(mapped);
            const userProfile = await AuthService.getProfile(session.user.id);
            setProfile(userProfile);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await AuthService.signIn(email, password);
      if (user) {
        const userProfile = await AuthService.getProfile(user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const user = await AuthService.signUp(email, password, fullName);
      if (user) {
        const userProfile = await AuthService.getProfile(user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await AuthService.signOut();
      } else {
        // Clear guest session
        localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
      }
      setUser(null);
      setProfile(null);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedProfile = await AuthService.updateProfile(user.id, updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};