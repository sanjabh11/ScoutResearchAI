import { createClient } from '@supabase/supabase-js';

// Check if we have valid Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('supabase.co') || url.includes('localhost');
  } catch {
    return false;
  }
};

// Only create client if we have valid credentials
let supabase: any = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl) && supabaseKey !== 'your_supabase_anon_key_here') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    isSupabaseConfigured = false;
  }
} else {
  console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
  isSupabaseConfigured = false;
}

export { supabase, isSupabaseConfigured };

export interface ResearchPaper {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  filename: string;
  analysis: any;
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: string;
  paper_id: string;
  user_id?: string;
  target_age: number;
  content: any;
  created_at: string;
}

export interface SimilarPaperRecord {
  id: string;
  paper_id: string;
  user_id?: string;
  similar_papers: any[];
  created_at: string;
}

export class SupabaseService {
  static async getCurrentUserId(): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user?.id || null;
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      return null;
    }
  }

  static async savePaper(paper: Omit<ResearchPaper, 'id' | 'created_at' | 'updated_at'>): Promise<ResearchPaper> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    const { data, error } = await supabase
      .from('research_papers')
      .insert([paper])
      .select()
      .single();

    if (error) {
      console.error('Error saving paper:', error);
      throw new Error('Failed to save research paper');
    }

    return data;
  }

  static async getPapers(): Promise<ResearchPaper[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching papers:', error);
      return [];
    }

    return data || [];
  }

  static async saveSummary(summary: Omit<Summary, 'id' | 'created_at'>): Promise<Summary> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    const { data, error } = await supabase
      .from('summaries')
      .insert([summary])
      .select()
      .single();

    if (error) {
      console.error('Error saving summary:', error);
      throw new Error('Failed to save summary');
    }

    return data;
  }

  static async getSummary(paperId: string, targetAge: number): Promise<Summary | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('paper_id', paperId)
      .eq('target_age', targetAge)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}