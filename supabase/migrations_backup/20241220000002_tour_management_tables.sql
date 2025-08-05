-- Create tour_team_members table
CREATE TABLE IF NOT EXISTS tour_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'declined')),
  arrival_date DATE,
  departure_date DATE,
  responsibilities TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tour_vendors table
CREATE TABLE IF NOT EXISTS tour_vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'declined')),
  services TEXT[] DEFAULT '{}',
  contract_amount DECIMAL(10,2),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'partial', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tour_team_members_tour_id ON tour_team_members(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_team_members_user_id ON tour_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_team_members_status ON tour_team_members(status);

CREATE INDEX IF NOT EXISTS idx_tour_vendors_tour_id ON tour_vendors(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_vendors_user_id ON tour_vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_vendors_status ON tour_vendors(status);

-- Add RLS policies for tour_team_members
ALTER TABLE tour_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tour team members" ON tour_team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tour team members" ON tour_team_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tour team members" ON tour_team_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tour team members" ON tour_team_members
  FOR DELETE USING (user_id = auth.uid());

-- Add RLS policies for tour_vendors
ALTER TABLE tour_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tour vendors" ON tour_vendors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tour vendors" ON tour_vendors
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tour vendors" ON tour_vendors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tour vendors" ON tour_vendors
  FOR DELETE USING (user_id = auth.uid());

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_tour_team_members_updated_at 
  BEFORE UPDATE ON tour_team_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_vendors_updated_at 
  BEFORE UPDATE ON tour_vendors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 