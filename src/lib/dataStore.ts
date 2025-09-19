import { SupabaseService, ResearchPaper, Summary, Visualization as SupaVisualization, CodeGeneration as SupaCodeGen } from './supabase';
import { LocalStorageService, LocalResearchPaper, LocalSummary } from './localStorageService';
import { STORAGE_KEYS } from './constants';

// Helper to get or create a guest session
function getGuestUserId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.userId) return parsed.userId as string;
    }
    const id = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const session = { userId: id, displayName: 'Guest', createdAt: new Date().toISOString(), mode: 'guest' };
    localStorage.setItem(STORAGE_KEYS.GUEST_SESSION, JSON.stringify(session));
    return id;
  } catch {
    return 'guest';
  }
}

async function isSupabaseReady(): Promise<boolean> {
  try {
    const uid = await SupabaseService.getCurrentUserId();
    return !!uid;
  } catch {
    return false;
  }
}

// Map local paper to shared ResearchPaper-like shape
function mapLocalPaperToResearchPaper(p: LocalResearchPaper): ResearchPaper {
  return {
    id: p.id,
    user_id: getGuestUserId(),
    title: p.title,
    content: p.content,
    filename: p.filename,
    analysis: p.analysis,
    created_at: p.uploadDate,
    updated_at: p.uploadDate,
  } as unknown as ResearchPaper;
}

export const DataStore = {
  async getCurrentUserId(): Promise<string | null> {
    const supa = await isSupabaseReady();
    if (supa) return await SupabaseService.getCurrentUserId();
    return getGuestUserId();
  },

  async getPapers(): Promise<ResearchPaper[]> {
    const supa = await isSupabaseReady();
    if (supa) {
      return await SupabaseService.getPapers();
    }
    const locals = LocalStorageService.getPapers();
    return locals.map(mapLocalPaperToResearchPaper);
  },

  async savePaper(paper: { title: string; content: string; filename: string; file_size?: number; analysis: any; }): Promise<ResearchPaper> {
    const supa = await isSupabaseReady();
    if (supa) {
      const userId = await SupabaseService.getCurrentUserId();
      const saved = await SupabaseService.savePaper({
        user_id: userId || undefined,
        title: paper.title,
        content: paper.content,
        filename: paper.filename,
        analysis: paper.analysis,
        file_size: paper.file_size,
      } as any);
      return saved;
    }
    // Local path
    const local = LocalStorageService.savePaper({
      title: paper.title,
      content: paper.content,
      filename: paper.filename,
      analysis: paper.analysis,
    });
    return mapLocalPaperToResearchPaper(local);
  },

  async getSummary(paperId: string, targetAge: number): Promise<any | null> {
    const supa = await isSupabaseReady();
    if (supa) {
      const rec = await SupabaseService.getSummary(paperId, targetAge);
      return rec?.content || null;
    }
    const list = LocalStorageService.getSummaries(paperId);
    const found = list.find((s: LocalSummary) => s.targetAge === targetAge);
    return found?.content || null;
  },

  async saveSummary(paperId: string, targetAge: number, content: any): Promise<any> {
    const supa = await isSupabaseReady();
    if (supa) {
      const userId = await SupabaseService.getCurrentUserId();
      const saved = await SupabaseService.saveSummary({
        paper_id: paperId,
        user_id: userId || undefined,
        target_age: targetAge,
        content,
      } as any);
      return saved.content;
    }
    const savedLocal = LocalStorageService.saveSummary({ paperId, targetAge, content });
    return savedLocal.content;
  },

  async saveCodeGeneration(paperId: string, payload: any): Promise<any> {
    const supa = await isSupabaseReady();
    if (supa) {
      const userId = await SupabaseService.getCurrentUserId();
      return await SupabaseService.saveCodeGeneration({
        paper_id: paperId,
        user_id: userId || 'guest',
        language: payload.language,
        framework: payload.framework,
        code_content: payload.code_content,
      } as unknown as SupaCodeGen);
    }
    return LocalStorageService.saveCode(paperId, payload);
  },

  async saveVisualization(paperId: string, payload: any): Promise<any> {
    const supa = await isSupabaseReady();
    if (supa) {
      const userId = await SupabaseService.getCurrentUserId();
      return await SupabaseService.saveVisualization({
        paper_id: paperId,
        user_id: userId || 'guest',
        visualization_type: payload.visualization_type,
        config: payload.config,
      } as unknown as SupaVisualization);
    }
    return LocalStorageService.saveVisualization(paperId, payload);
  },

  async getVisualizations(paperId: string): Promise<any[]> {
    const supa = await isSupabaseReady();
    if (supa) {
      // For now, we rely on client to track visualizations locally as the UI doesn't load them from Supabase
      return LocalStorageService.getVisualizations(paperId);
    }
    return LocalStorageService.getVisualizations(paperId);
  },
};
