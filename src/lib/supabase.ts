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

// Simple in-memory cache for performance optimization
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(operation: string, params: any): string {
  return `${operation}_${JSON.stringify(params)}`;
}

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedData(key: string, data: any, ttl: number = DEFAULT_CACHE_TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

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

// Enhanced error handling with retry logic
class SupabaseError extends Error {
  constructor(message: string, public originalError?: any, public retryable: boolean = false) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Retry utility function
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable (network issues, temporary server errors)
      const retryableErrors = ['network', 'timeout', 'ECONNRESET', 'ENOTFOUND'];
      const isRetryable = retryableErrors.some(code =>
        error.message?.includes(code) ||
        error.code === code ||
        (error.originalError && retryableErrors.some(code => error.originalError.message?.includes(code)))
      );

      if (!isRetryable || attempt === maxRetries) {
        throw new SupabaseError(
          `Operation failed after ${attempt} attempts: ${error.message}`,
          error,
          isRetryable
        );
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
}

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

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface CodeGeneration {
  id: string;
  paper_id: string;
  user_id: string;
  language: string;
  framework: string;
  code_content: {
    functions?: string[];
    classes?: string[];
    variables?: string[];
    imports?: string[];
    main_code?: string;
  };
  created_at: string;
}

export interface Visualization {
  id: string;
  paper_id: string;
  user_id: string;
  visualization_type: string;
  config: {
    data?: any;
    chart_type?: string;
    x_axis?: string;
    y_axis?: string;
    title?: string;
  };
  created_at: string;
}

export interface SimilarPaperRecord {
  id: string;
  paper_id: string;
  user_id: string;
  similar_papers: Array<{
    title: string;
    similarity_score: number;
    url?: string;
    doi?: string;
  }>;
  search_query: string;
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

    return withRetry(async () => {
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
    });
  }

  static async getPapers(): Promise<ResearchPaper[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    const cacheKey = getCacheKey('getPapers', { userId: await this.getCurrentUserId() });
    const cachedData = getCachedData<ResearchPaper[]>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching papers:', error);
      return [];
    }

    const papers = data || [];
    setCachedData(cacheKey, papers);
    return papers;
  }

  static async saveSummary(summary: Omit<Summary, 'id' | 'created_at'>): Promise<Summary> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    return withRetry(async () => {
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
    });
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

  // ------------------ Notifications ------------------
  static async getNotifications(): Promise<Notification[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  }

  static async saveNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();
    if (error) {
      console.error('Error saving notification:', error);
      throw new Error('Failed to save notification');
    }
    return data;
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) console.error('Error marking notification as read:', error);
  }

  // ------------------ Similar Papers ------------------
  static async saveSimilarPapers(record: Omit<SimilarPaperRecord, 'id' | 'created_at'>): Promise<SimilarPaperRecord> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }
    const { data, error } = await supabase
      .from('similar_papers')
      .insert([record])
      .select()
      .single();
    if (error) {
      console.error('Error saving similar papers record:', error);
      throw new Error('Failed to save similar papers record');
    }
    return data;
  }

  static async getSimilarPapers(paperId: string): Promise<SimilarPaperRecord | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('similar_papers')
      .select('*')
      .eq('paper_id', paperId)
      .single();
    if (error) return null;
    return data;
  }

  // ------------------ Code Generations ------------------
  static async saveCodeGeneration(record: Omit<CodeGeneration, 'id' | 'created_at'>): Promise<CodeGeneration> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }
    const { data, error } = await supabase
      .from('code_generations')
      .insert([record])
      .select()
      .single();
    if (error) {
      console.error('Error saving code generation:', error);
      throw new Error('Failed to save code generation');
    }
    return data;
  }

  // ------------------ Visualizations ------------------
  static async saveVisualization(record: Omit<Visualization, 'id' | 'created_at'>): Promise<Visualization> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }
    const { data, error } = await supabase
      .from('visualizations')
      .insert([record])
      .select()
      .single();
    if (error) {
      console.error('Error saving visualization:', error);
      throw new Error('Failed to save visualization');
    }
    return data;
  }
}

// Export supabase client and configuration flag for consumers
export { supabase, isSupabaseConfigured };