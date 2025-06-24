/*
  # Create ScoutResearchAI Database Schema

  1. New Tables
    - `research_papers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `content` (text)
      - `filename` (text)
      - `file_size` (integer)
      - `analysis` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `summaries`
      - `id` (uuid, primary key)
      - `paper_id` (uuid, foreign key to research_papers)
      - `user_id` (uuid, foreign key to auth.users)
      - `target_age` (integer, 12-25)
      - `content` (jsonb)
      - `created_at` (timestamptz)
    
    - `similar_papers`
      - `id` (uuid, primary key)
      - `paper_id` (uuid, foreign key to research_papers)
      - `user_id` (uuid, foreign key to auth.users)
      - `similar_papers` (jsonb)
      - `search_query` (text)
      - `created_at` (timestamptz)
    
    - `generated_code`
      - `id` (uuid, primary key)
      - `paper_id` (uuid, foreign key to research_papers)
      - `user_id` (uuid, foreign key to auth.users)
      - `language` (text)
      - `framework` (text)
      - `code_content` (jsonb)
      - `created_at` (timestamptz)
    
    - `visualizations`
      - `id` (uuid, primary key)
      - `paper_id` (uuid, foreign key to research_papers)
      - `user_id` (uuid, foreign key to auth.users)
      - `visualization_type` (text)
      - `config` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Ensure proper foreign key constraints