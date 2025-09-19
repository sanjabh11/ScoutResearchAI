import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataStore } from '../src/lib/dataStore';
import { LocalStorageService } from '../src/lib/localStorageService';
import { SupabaseService } from '../src/lib/supabase';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock SupabaseService
vi.mock('../src/lib/supabase', () => ({
  SupabaseService: {
    getCurrentUserId: vi.fn(),
    getPapers: vi.fn(),
    savePaper: vi.fn(),
    getSummary: vi.fn(),
    saveSummary: vi.fn(),
    saveCodeGeneration: vi.fn(),
    saveVisualization: vi.fn(),
  },
}));

describe('DataStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getCurrentUserId', () => {
    it('should return guest user ID when Supabase is not available', async () => {
      vi.mocked(SupabaseService.getCurrentUserId).mockRejectedValue(new Error('No auth'));
      
      const userId = await DataStore.getCurrentUserId();
      
      expect(userId).toMatch(/^guest_\d+_\d+$/);
    });

    it('should return Supabase user ID when available', async () => {
      vi.mocked(SupabaseService.getCurrentUserId).mockResolvedValue('supabase-user-123');
      
      const userId = await DataStore.getCurrentUserId();
      
      expect(userId).toBe('supabase-user-123');
    });
  });

  describe('getPapers', () => {
    it('should return local papers when Supabase is not available', async () => {
      vi.mocked(SupabaseService.getCurrentUserId).mockRejectedValue(new Error('No auth'));
      
      // Add some local papers
      const localPaper = LocalStorageService.savePaper({
        title: 'Test Paper',
        content: 'Test content',
        filename: 'test.pdf',
        analysis: { complexity_score: 5 },
      });

      const papers = await DataStore.getPapers();
      
      expect(papers).toHaveLength(1);
      expect(papers[0].title).toBe('Test Paper');
      expect(papers[0].id).toBe(localPaper.id);
    });

    it('should return Supabase papers when available', async () => {
      const supabasePapers = [
        { id: 'supa-1', title: 'Supabase Paper', content: 'Content', user_id: 'user-1' },
      ];
      vi.mocked(SupabaseService.getCurrentUserId).mockResolvedValue('user-1');
      vi.mocked(SupabaseService.getPapers).mockResolvedValue(supabasePapers as any);

      const papers = await DataStore.getPapers();

      expect(papers).toEqual(supabasePapers);
    });
  });

  describe('savePaper', () => {
    it('should save paper locally when Supabase is not available', async () => {
      vi.mocked(SupabaseService.getCurrentUserId).mockRejectedValue(new Error('No auth'));

      const paperData = {
        title: 'Local Paper',
        content: 'Local content',
        filename: 'local.pdf',
        analysis: { complexity_score: 7 },
      };

      const savedPaper = await DataStore.savePaper(paperData);

      expect(savedPaper.title).toBe('Local Paper');
      expect(savedPaper.id).toMatch(/^\d+_\d+$/);
      
      // Verify it's in localStorage
      const localPapers = LocalStorageService.getPapers();
      expect(localPapers).toHaveLength(1);
      expect(localPapers[0].title).toBe('Local Paper');
    });

    it('should save paper to Supabase when available', async () => {
      const savedPaper = { id: 'supa-paper-1', title: 'Supabase Paper', created_at: new Date().toISOString() };
      vi.mocked(SupabaseService.getCurrentUserId).mockResolvedValue('user-1');
      vi.mocked(SupabaseService.savePaper).mockResolvedValue(savedPaper as any);

      const paperData = {
        title: 'Supabase Paper',
        content: 'Supabase content',
        filename: 'supabase.pdf',
        analysis: { complexity_score: 8 },
      };

      const result = await DataStore.savePaper(paperData);

      expect(result).toEqual(savedPaper);
      expect(SupabaseService.savePaper).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Supabase Paper',
          content: 'Supabase content',
        })
      );
    });
  });

  describe('getSummary and saveSummary', () => {
    it('should handle summaries locally when Supabase is not available', async () => {
      vi.mocked(SupabaseService.getCurrentUserId).mockRejectedValue(new Error('No auth'));

      const paperId = 'local-paper-1';
      const targetAge = 15;
      const summaryContent = { executive_summary: 'Test summary' };

      // Should return null when no summary exists
      const emptySummary = await DataStore.getSummary(paperId, targetAge);
      expect(emptySummary).toBeNull();

      // Save a summary
      const savedContent = await DataStore.saveSummary(paperId, targetAge, summaryContent);
      expect(savedContent).toEqual(summaryContent);

      // Should now return the saved summary
      const retrievedSummary = await DataStore.getSummary(paperId, targetAge);
      expect(retrievedSummary).toEqual(summaryContent);
    });

    it('should handle summaries via Supabase when available', async () => {
      const summaryRecord = { id: 'summary-1', content: { executive_summary: 'Supabase summary' } };
      vi.mocked(SupabaseService.getCurrentUserId).mockResolvedValue('user-1');
      vi.mocked(SupabaseService.getSummary).mockResolvedValue(summaryRecord as any);
      vi.mocked(SupabaseService.saveSummary).mockResolvedValue(summaryRecord as any);

      const paperId = 'supa-paper-1';
      const targetAge = 18;
      const summaryContent = { executive_summary: 'New summary' };

      // Get existing summary
      const existing = await DataStore.getSummary(paperId, targetAge);
      expect(existing).toEqual(summaryRecord.content);

      // Save new summary
      const saved = await DataStore.saveSummary(paperId, targetAge, summaryContent);
      expect(saved).toEqual(summaryRecord.content);
    });
  });

  describe('saveCodeGeneration and saveVisualization', () => {
    it('should save code locally when Supabase is not available', async () => {
      vi.mocked(SupabaseService.getCurrentUserId).mockRejectedValue(new Error('No auth'));

      const paperId = 'local-paper-1';
      const codePayload = {
        language: 'python',
        framework: 'tensorflow',
        code_content: { main_implementation: 'print("hello")' },
      };

      const saved = await DataStore.saveCodeGeneration(paperId, codePayload);

      expect(saved.language).toBe('python');
      expect(saved.framework).toBe('tensorflow');
      expect(saved.id).toMatch(/^\d+_\d+$/);
    });

    it('should save visualization locally when Supabase is not available', async () => {
      vi.mocked(SupabaseService.getCurrentUserId).mockRejectedValue(new Error('No auth'));

      const paperId = 'local-paper-1';
      const visPayload = {
        visualization_type: 'infographic',
        config: { title: 'Test Visualization' },
      };

      const saved = await DataStore.saveVisualization(paperId, visPayload);

      expect(saved.visualization_type).toBe('infographic');
      expect(saved.config.title).toBe('Test Visualization');
      expect(saved.id).toMatch(/^\d+_\d+$/);
    });
  });
});
