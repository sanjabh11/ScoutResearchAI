import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseService, ResearchPaper, Summary, Notification } from '../src/lib/supabase';

vi.mock('../src/lib/supabase', async (importOriginal) => {
  const mod = await importOriginal();
  // Mock only the Supabase client methods used
  return {
    ...mod,
    supabase: {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: { id: 'mock', ...mockPaper }, error: null })) })) })),
        select: vi.fn(() => ({ order: vi.fn(() => ({ data: [mockPaper], error: null })) })),
        eq: vi.fn(() => ({ single: vi.fn(() => ({ data: mockPaper, error: null })) })),
        update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
      }))
    },
    isSupabaseConfigured: true
  };
});

const mockPaper = {
  id: 'mock',
  user_id: 'user1',
  title: 'Test Paper',
  content: 'Lorem ipsum',
  filename: 'test.pdf',
  analysis: {},
  created_at: '2025-08-07T00:00:00Z',
  updated_at: '2025-08-07T00:00:00Z',
};

describe('SupabaseService', () => {
  it('should save and fetch papers', async () => {
    const saved = await SupabaseService.savePaper({
      user_id: 'user1',
      title: 'Test Paper',
      content: 'Lorem ipsum',
      filename: 'test.pdf',
      analysis: {}
    });
    expect(saved.id).toBe('mock');
    const papers = await SupabaseService.getPapers();
    expect(Array.isArray(papers)).toBe(true);
    expect(papers[0].title).toBe('Test Paper');
  });

  it('should save and fetch summaries', async () => {
    const summary = await SupabaseService.saveSummary({
      paper_id: 'mock',
      user_id: 'user1',
      target_age: 18,
      content: {}
    });
    expect(summary.id).toBe('mock');
    const got = await SupabaseService.getSummary('mock', 18);
    expect(got).toBeTruthy();
  });

  it('should handle notifications', async () => {
    const notification = await SupabaseService.saveNotification({
      user_id: 'user1',
      title: 'Test',
      message: 'msg',
      read: false
    });
    expect(notification.id).toBe('mock');
    const notifs = await SupabaseService.getNotifications();
    expect(Array.isArray(notifs)).toBe(true);
  });
});
