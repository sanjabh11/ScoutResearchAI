-- Create research_papers table
CREATE TABLE IF NOT EXISTS research_papers (
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

-- Create summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  target_age integer NOT NULL CHECK (target_age >= 12 AND target_age <= 25),
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create similar_papers table
CREATE TABLE IF NOT EXISTS similar_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  similar_papers jsonb NOT NULL,
  search_query text,
  created_at timestamptz DEFAULT now()
);

-- Create code_generations table
CREATE TABLE IF NOT EXISTS code_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  language text NOT NULL,
  framework text NOT NULL,
  code_content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create visualizations table
CREATE TABLE IF NOT EXISTS visualizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  visualization_type text NOT NULL,
  config jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE similar_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own papers" ON research_papers;
DROP POLICY IF EXISTS "Users can insert own papers" ON research_papers;
DROP POLICY IF EXISTS "Users can update own papers" ON research_papers;
DROP POLICY IF EXISTS "Users can delete own papers" ON research_papers;

DROP POLICY IF EXISTS "Users can view own summaries" ON summaries;
DROP POLICY IF EXISTS "Users can insert own summaries" ON summaries;
DROP POLICY IF EXISTS "Users can update own summaries" ON summaries;
DROP POLICY IF EXISTS "Users can delete own summaries" ON summaries;

DROP POLICY IF EXISTS "Users can view own similar papers" ON similar_papers;
DROP POLICY IF EXISTS "Users can insert own similar papers" ON similar_papers;
DROP POLICY IF EXISTS "Users can update own similar papers" ON similar_papers;
DROP POLICY IF EXISTS "Users can delete own similar papers" ON similar_papers;

DROP POLICY IF EXISTS "Users can view own generated code" ON code_generations;
DROP POLICY IF EXISTS "Users can insert own generated code" ON code_generations;
DROP POLICY IF EXISTS "Users can update own generated code" ON code_generations;
DROP POLICY IF EXISTS "Users can delete own generated code" ON code_generations;

DROP POLICY IF EXISTS "Users can view own visualizations" ON visualizations;
DROP POLICY IF EXISTS "Users can insert own visualizations" ON visualizations;
DROP POLICY IF EXISTS "Users can update own visualizations" ON visualizations;
DROP POLICY IF EXISTS "Users can delete own visualizations" ON visualizations;

-- Create policies for research_papers
CREATE POLICY "Users can view own papers" ON research_papers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own papers" ON research_papers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own papers" ON research_papers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own papers" ON research_papers
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for summaries
CREATE POLICY "Users can view own summaries" ON summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries" ON summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries" ON summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries" ON summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for similar_papers
CREATE POLICY "Users can view own similar papers" ON similar_papers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own similar papers" ON similar_papers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own similar papers" ON similar_papers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own similar papers" ON similar_papers
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for code_generations
CREATE POLICY "Users can view own generated code" ON code_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated code" ON code_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated code" ON code_generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated code" ON code_generations
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for visualizations
CREATE POLICY "Users can view own visualizations" ON visualizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visualizations" ON visualizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visualizations" ON visualizations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visualizations" ON visualizations
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_research_papers_user_id ON research_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_created_at ON research_papers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_paper_id ON summaries(paper_id);
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_similar_papers_paper_id ON similar_papers(paper_id);
CREATE INDEX IF NOT EXISTS idx_code_generations_paper_id ON code_generations(paper_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_paper_id ON visualizations(paper_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_research_papers_updated_at ON research_papers;

-- Create trigger for research_papers updated_at
CREATE TRIGGER update_research_papers_updated_at
    BEFORE UPDATE ON research_papers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();