-- Create the onboarding table to store user onboarding responses
CREATE TABLE IF NOT EXISTS onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  purpose TEXT,
  on_tour BOOLEAN,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies to secure the onboarding table
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view and edit only their own onboarding data
CREATE POLICY "Users can view their own onboarding data" 
  ON onboarding FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data" 
  ON onboarding FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data" 
  ON onboarding FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT; 