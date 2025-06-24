/*
  # Fix ScoutResearchAI Database Schema

  1. New Tables
    - `research_papers` - Store uploaded research papers with analysis
    - `summaries` - Store age-appropriate summaries of papers  
    - `similar_papers` - Cache similar paper search results
    - `generated_code` - Store AI-generated code implementations
    - `visualizations` - Store visualization configurations

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data only

  3. Performance
    - Add indexes for common query patterns
    - Add updated_at trigger for research_papers
*/

-- Step 1: Create the trigger function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 2: Drop all existing tables to start fresh (in correct order)
DROP TABLE IF EXISTS visualizations CASCADE;
DROP TABLE IF EXISTS generated_code CASCADE;
DROP TABLE IF EXISTS similar_papers CASCADE;
DROP TABLE IF EXISTS summaries CASCADE;
DROP TABLE IF EXISTS research_papers CASCADE;

-- Step 3: Create research_papers table (base table with no dependencies)
CREATE TABLE research_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  content text NOT NULL,
  filename text NOT NULL,
  file_size integer,
  analysis jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 4: Create dependent tables (these reference research_papers)
CREATE TABLE summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  target_age integer NOT NULL CHECK (target_age >= 12 AND target_age <= 25),
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE similar_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  similar_papers jsonb NOT NULL,
  search_query text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE generated_code (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  language text NOT NULL,
  framework text NOT NULL,
  code_content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE visualizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  visualization_type text NOT NULL,
  config jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Step 5: Enable Row Level Security on all tables
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE similar_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for research_papers
CREATE POLICY "Users can view own papers" ON research_papers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own papers" ON research_papers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own papers" ON research_papers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own papers" ON research_papers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create RLS policies for summaries
CREATE POLICY "Users can view own summaries" ON summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries" ON summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries" ON summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries" ON summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create RLS policies for similar_papers
CREATE POLICY "Users can view own similar papers" ON similar_papers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own similar papers" ON similar_papers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own similar papers" ON similar_papers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own similar papers" ON similar_papers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create RLS policies for generated_code
CREATE POLICY "Users can view own generated code" ON generated_code
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated code" ON generated_code
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated code" ON generated_code
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated code" ON generated_code
  FOR DELETE USING (auth.uid() = user_id);

-- Step 10: Create RLS policies for visualizations
CREATE POLICY "Users can view own visualizations" ON visualizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visualizations" ON visualizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visualizations" ON visualizations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visualizations" ON visualizations
  FOR DELETE USING (auth.uid() = user_id);

-- Step 11: Create indexes for performance (after all tables exist)
CREATE INDEX idx_research_papers_user_id ON research_papers(user_id);
CREATE INDEX idx_research_papers_created_at ON research_papers(created_at DESC);
CREATE INDEX idx_summaries_paper_id ON summaries(paper_id);
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_similar_papers_paper_id ON similar_papers(paper_id);
CREATE INDEX idx_generated_code_paper_id ON generated_code(paper_id);
CREATE INDEX idx_visualizations_paper_id ON visualizations(paper_id);

-- Step 12: Create trigger for updated_at column
CREATE TRIGGER update_research_papers_updated_at
    BEFORE UPDATE ON research_papers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();