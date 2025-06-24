import { supabase, isSupabaseConfigured } from './supabase';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  subscription_tier: string;
  api_credits: number;
  papers_count: number;
  summaries_count: number;
  visualizations_count: number;
  code_generations_count: number;
}

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  }

  static async signIn(email: string, password: string): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Authentication service is not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  static async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Authentication service is not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  static async signOut(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  }

  static async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async getUserSettings(userId: string): Promise<any | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }

    return data?.settings || null;
  }

  static async updateUserSettings(userId: string, settings: any): Promise<any | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .update({ settings })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data?.settings || null;
  }

  static async getNotificationPreferences(userId: string): Promise<any | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data;
  }

  static async updateNotificationPreferences(userId: string, preferences: any): Promise<any | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}