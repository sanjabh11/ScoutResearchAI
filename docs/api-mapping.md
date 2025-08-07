# API Endpoint Mapping to User Stories

This document links **PRD user stories** to the concrete API / service calls that satisfy them. It serves as living documentation and a checklist for deployment readiness.

| Epic | User Story ID | Description (short) | Supabase Tables / RPC | Service / Method | UI Component(s) |
|------|---------------|---------------------|----------------------|------------------|-----------------|
| 1. Research Analysis | 1.1 | Upload & analyse paper | research_papers | `SupabaseService.savePaper()` + `GeminiService.analyzeResearchPaper()` | `ResearchUpload`, `SummarizationEngine` |
| | 1.2 | Visualise analysis | — (derived) | `GeminiService.analyzeResearchPaper()` data rendered | `SummarizationEngine`, `VisualizationStudio` |
| 2. Education Content | 2.1 | Age summaries | summaries | `SupabaseService.saveSummary()`, `GeminiService.generateAgeSummary()` | `SummarizationEngine` |
| | 2.2 | Interactive elements | summaries (JSON fields) | Same as above | `SummarizationEngine` |
| 3. Discovery | 3.1 | Similar paper discovery | similar_papers | `SupabaseService.saveSimilarPapers()` / `GeminiService.findSimilarPapers()` | `ResearchDiscovery` |
| | 3.2 | Advanced filters | research_papers (query) | `SupabaseService.getPapers()` client-side filter | `ResearchDiscovery` |
| 4. Code Generation | 4.1 | Research-to-code | code_generations | `SupabaseService.saveCodeGeneration()` + `GeminiService.generateCode()` | `CodeGenerator` |
| | 4.2 | Customise/export code | code_generations | same as 4.1 + download util | `CodeGenerator` |
| 5. Visualisation | 5.1 | Auto visualisation | visualizations | `SupabaseService.saveVisualization()` + `GeminiService.generateVisualization()` | `VisualizationStudio` |
| | 5.2 | Interactive exploration | visualizations | same as above | `VisualizationStudio` |
| 6. Comparison | 6.1 | Multi-paper comparison | research_papers (+ analysis JSON) | query via `SupabaseService.getPapers()` | `ComparisonMatrix` |
| | 6.2 | Synthesis opportunities | similar_papers, research_papers | future RPC (`synthesis_insights`) *planned* | `ComparisonMatrix`, `CitationNetwork` |
| — | Notifications | Real-time updates | notifications | `SupabaseService.getNotifications()` etc. | `Dashboard` |

## Gaps / TODO

1. **Synthesis opportunities RPC** – not yet implemented.
2. **Advanced search filters server-side** – client-side only, consider Postgres FTS or RPC.
3. **Tests** – none for API layer; add Vitest tests for each SupabaseService method.
4. **Code export/download** – UI exists but needs implementation.
5. **CI/Test pipeline** – setup pending.

*Last updated: 2025-08-07*
