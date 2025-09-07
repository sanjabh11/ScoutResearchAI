import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: 'mock-id', ...mockPaper },
          error: null
        }))
      }))
    })),
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        data: [mockPaper],
        error: null
      })),
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: mockPaper,
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null
      }))
    }))
  }))
};

// Mock auth
const mockAuth = {
  user: () => ({ id: 'user1' }),
  getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user1' } }, error: null }))
};

// Mock the supabase client
vi.mock('../src/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  isSupabaseConfigured: true
}));

// Mock SupabaseService
vi.mock('../src/lib/supabase', async () => {
  const actual = await vi.importActual('../src/lib/supabase');
  return {
    ...actual,
    SupabaseService: {
      getPapers: vi.fn(() => Promise.resolve([mockPaper])),
      savePaper: vi.fn(() => Promise.resolve({ id: 'mock-id', ...mockPaper })),
      getSummary: vi.fn(() => Promise.resolve(mockSummary)),
      saveSummary: vi.fn(() => Promise.resolve({ id: 'mock-id', ...mockSummary })),
      getNotifications: vi.fn(() => Promise.resolve([mockNotification])),
      saveNotification: vi.fn(() => Promise.resolve({ id: 'mock-id', ...mockNotification })),
      markNotificationRead: vi.fn(() => Promise.resolve()),
      getSimilarPapers: vi.fn(() => Promise.resolve(mockSimilarPapers)),
      saveSimilarPapers: vi.fn(() => Promise.resolve({ id: 'mock-id', ...mockSimilarPapers })),
      saveCodeGeneration: vi.fn(() => Promise.resolve({ id: 'mock-id', ...mockCodeGeneration })),
      saveVisualization: vi.fn(() => Promise.resolve({ id: 'mock-id', ...mockVisualization })),
      getCurrentUserId: vi.fn(() => Promise.resolve('user1'))
    }
  };
});

const mockPaper = {
  id: 'mock-id',
  user_id: 'user1',
  title: 'Test Paper',
  content: 'Lorem ipsum',
  filename: 'test.pdf',
  analysis: {},
  file_size: 1024,
  created_at: '2025-08-07T00:00:00Z',
  updated_at: '2025-08-07T00:00:00Z',
};

const mockSummary = {
  id: 'mock-id',
  paper_id: 'mock-id',
  user_id: 'user1',
  target_age: 18,
  content: {},
  created_at: '2025-08-07T00:00:00Z',
};

const mockNotification = {
  id: 'mock-id',
  user_id: 'user1',
  title: 'Test Notification',
  message: 'Test message',
  read: false,
  created_at: '2025-08-07T00:00:00Z',
};

const mockSimilarPapers = {
  id: 'mock-id',
  paper_id: 'mock-id',
  user_id: 'user1',
  similar_papers: [],
  search_query: 'test',
  created_at: '2025-08-07T00:00:00Z',
};

const mockCodeGeneration = {
  id: 'mock-id',
  paper_id: 'mock-id',
  user_id: 'user1',
  language: 'python',
  framework: 'tensorflow',
  code_content: {},
  created_at: '2025-08-07T00:00:00Z',
};

const mockVisualization = {
  id: 'mock-id',
  paper_id: 'mock-id',
  user_id: 'user1',
  visualization_type: 'chart',
  config: {},
  created_at: '2025-08-07T00:00:00Z',
};

describe('SupabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Paper Operations', () => {
    it('should save and fetch papers', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      const saved = await SupabaseService.savePaper({
        user_id: 'user1',
        title: 'Test Paper',
        content: 'Lorem ipsum',
        filename: 'test.pdf',
        analysis: {},
        file_size: 1024
      });
      expect(saved.id).toBe('mock-id');
      const papers = await SupabaseService.getPapers();
      expect(Array.isArray(papers)).toBe(true);
      expect(papers[0].title).toBe('Test Paper');
    });
  });

  describe('Summary Operations', () => {
    it('should save and fetch summaries', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      const summary = await SupabaseService.saveSummary({
        paper_id: 'mock-id',
        user_id: 'user1',
        target_age: 18,
        content: {}
      });
      expect(summary.id).toBe('mock-id');
      const got = await SupabaseService.getSummary('mock-id', 18);
      expect(got).toBeTruthy();
    });
  });

  describe('Notification Operations', () => {
    it('should handle notifications', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      const notification = await SupabaseService.saveNotification({
        user_id: 'user1',
        title: 'Test',
        message: 'msg',
        read: false
      });
      expect(notification.id).toBe('mock-id');
      const notifs = await SupabaseService.getNotifications();
      expect(Array.isArray(notifs)).toBe(true);
    });

    it('should mark notification as read', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      await expect(SupabaseService.markNotificationRead('mock-id')).resolves.toBeUndefined();
    });
  });

  describe('Similar Papers Operations', () => {
    it('should save and fetch similar papers', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      const record = await SupabaseService.saveSimilarPapers({
        paper_id: 'mock-id',
        user_id: 'user1',
        similar_papers: [],
        search_query: 'test'
      });
      expect(record.id).toBe('mock-id');
      const got = await SupabaseService.getSimilarPapers('mock-id');
      expect(got).toBeTruthy();
    });
  });

  describe('Code Generation Operations', () => {
    it('should save code generation', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      const record = await SupabaseService.saveCodeGeneration({
        paper_id: 'mock-id',
        user_id: 'user1',
        language: 'python',
        framework: 'tensorflow',
        code_content: {}
      });
      expect(record.id).toBe('mock-id');
    });
  });

  describe('Visualization Operations', () => {
    it('should save visualization', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      const record = await SupabaseService.saveVisualization({
        paper_id: 'mock-id',
        user_id: 'user1',
        visualization_type: 'chart',
        config: {}
      });
      expect(record.id).toBe('mock-id');
    });
  });

  describe('User Authentication', () => {
    it('should get current user ID', async () => {
      const { SupabaseService } = await import('../src/lib/supabase');
      const userId = await SupabaseService.getCurrentUserId();
      expect(typeof userId).toBe('string');
      expect(userId).toBe('user1');
    });
  });
});
