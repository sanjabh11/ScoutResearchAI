// Shared constants for ScoutResearchAI

export const STORAGE_KEYS = {
  PAPERS: 'research_papers',
  SUMMARIES_PREFIX: 'summaries_', // + <paperId>
  CODE_PREFIX: 'code_', // + <paperId>
  VIS_PREFIX: 'visualizations_', // + <paperId>
  GUEST_SESSION: 'sr_guest_session'
} as const;

export const DEFAULTS = {
  CACHE_TTL_MS: 5 * 60 * 1000,
} as const;
