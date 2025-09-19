# PBI-0001: Local-first offline mode, graceful AI errors, and data persistence

## Objective
Enable the app to run entirely in local/guest mode without remote dependencies, while gracefully using Supabase and Gemini when configured. Persist all key artifacts (papers, summaries, code, visuals) in local browser storage, and avoid app crashes when API keys are missing.

## Scope
- Introduce local guest authentication and session stored in localStorage.
- Orchestrate data flow via a DataStore abstraction with local-first fallback.
- Persist papers, summaries, code, and visualizations locally.
- Gracefully handle missing Gemini API key and rate-limit errors.
- Enhance discovery, comparison, and citation network with local analytics.

## Acceptance Criteria
- App boots without .env or Supabase, usable in guest mode.
- Upload, analyze (if Gemini present), save papers locally if Supabase absent.
- Summaries save locally when Supabase absent; use Supabase otherwise.
- Code generation and visualizations persist locally; downloadable.
- Discovery filters and similarity implemented locally.
- Comparison matrix and citation edges computed from local `analysis`.
- Unit tests covering DataStore fallback and local flows.

## Non-Goals
- Long-running builds or DB push during development.
- Full server-side search; local is sufficient for this PBI.

## Risks & Mitigations
- Gemini quota: show clear errors; allow manual retry; local flows unaffected.
- RLS restrictions: local-first ensures functionality without auth.

## Test Plan Summary
- DataStore chooses backend based on configuration/auth.
- Upload→Analyze→Save works in local mode.
- Summarization cached and reloaded locally.
- Download buttons produce correct files.
