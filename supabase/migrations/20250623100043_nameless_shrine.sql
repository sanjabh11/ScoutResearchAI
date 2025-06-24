/*
  # Add team collaboration features
  
  1. New Tables
    - `teams` - Stores team information
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `manager_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `team_members` - Stores team membership
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `joined_at` (timestamp)
      - `is_active` (boolean)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for team management
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES auth.users(id),
  team_goals jsonb DEFAULT '[]',
  skill_requirements jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for teams
CREATE POLICY "Team managers can update their teams" 
  ON teams FOR UPDATE 
  USING (manager_id = auth.uid());

CREATE POLICY "Team members can view their teams" 
  ON teams FOR SELECT 
  USING (id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Create policies for team_members
CREATE POLICY "Team members can view team membership" 
  ON team_members FOR SELECT 
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Users can manage their own team membership" 
  ON team_members FOR ALL 
  USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);