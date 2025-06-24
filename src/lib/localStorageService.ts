// Utility for saving and loading research papers and summaries in localStorage

export interface LocalResearchPaper {
  id: string;
  title: string;
  content: string;
  filename: string;
  analysis: any;
  uploadDate: string;
}

export interface LocalSummary {
  id: string;
  paperId: string;
  targetAge: number;
  content: any;
  createdAt: string;
}

export class LocalStorageService {
  static getPapers(): LocalResearchPaper[] {
    const data = localStorage.getItem('research_papers');
    return data ? JSON.parse(data) : [];
  }

  static savePaper(paper: Omit<LocalResearchPaper, 'id' | 'uploadDate'>): LocalResearchPaper {
    const papers = this.getPapers();
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const uploadDate = new Date().toISOString();
    const newPaper = { ...paper, id, uploadDate };
    papers.unshift(newPaper);
    localStorage.setItem('research_papers', JSON.stringify(papers));
    return newPaper;
  }

  static getSummaries(paperId: string): LocalSummary[] {
    const data = localStorage.getItem(`summaries_${paperId}`);
    return data ? JSON.parse(data) : [];
  }

  static saveSummary(summary: Omit<LocalSummary, 'id' | 'createdAt'>): LocalSummary {
    const summaries = this.getSummaries(summary.paperId);
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const createdAt = new Date().toISOString();
    const newSummary = { ...summary, id, createdAt };
    summaries.unshift(newSummary);
    localStorage.setItem(`summaries_${summary.paperId}`, JSON.stringify(summaries));
    return newSummary;
  }
}
