-- Manual Database Deployment Script
-- Run this in the Supabase SQL Editor

-- Create tours table
CREATE TABLE IF NOT EXISTS tours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    total_shows INTEGER DEFAULT 0,
    completed_shows INTEGER DEFAULT 0,
    budget DECIMAL(12,2) DEFAULT 0,
    expenses DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Logistics
    transportation VARCHAR(255),
    accommodation VARCHAR(255),
    equipment_requirements TEXT,
    crew_size INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_shows CHECK (completed_shows <= total_shows AND completed_shows >= 0),
    CONSTRAINT valid_budget CHECK (budget >= 0 AND expenses >= 0 AND revenue >= 0)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    venue_id UUID, -- We'll reference this to venues when that system is ready
    venue_name VARCHAR(255),
    venue_address TEXT,
    
    -- Event details
    event_date DATE NOT NULL,
    event_time TIME,
    doors_open TIME,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed')),
    
    -- Capacity and ticketing
    capacity INTEGER DEFAULT 0,
    tickets_sold INTEGER DEFAULT 0,
    ticket_price DECIMAL(10,2),
    vip_price DECIMAL(10,2),
    
    -- Financial
    expected_revenue DECIMAL(12,2) DEFAULT 0,
    actual_revenue DECIMAL(12,2) DEFAULT 0,
    expenses DECIMAL(12,2) DEFAULT 0,
    
    -- Technical requirements
    sound_requirements TEXT,
    lighting_requirements TEXT,
    stage_requirements TEXT,
    special_requirements TEXT,
    
    -- Contact and logistics
    venue_contact_name VARCHAR(255),
    venue_contact_email VARCHAR(255),
    venue_contact_phone VARCHAR(50),
    load_in_time TIME,
    sound_check_time TIME,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Constraints
    CONSTRAINT valid_capacity CHECK (capacity >= 0),
    CONSTRAINT valid_tickets CHECK (tickets_sold >= 0 AND tickets_sold <= capacity),
    CONSTRAINT valid_prices CHECK (ticket_price >= 0 AND vip_price >= 0),
    CONSTRAINT valid_revenue CHECK (expected_revenue >= 0 AND actual_revenue >= 0 AND expenses >= 0)
);

-- Create tour team members table
CREATE TABLE IF NOT EXISTS tour_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tour_id, user_id, role)
);

-- Create event expenses table
CREATE TABLE IF NOT EXISTS event_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    vendor VARCHAR(255),
    expense_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    receipt_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Create event notes table for communication
CREATE TABLE IF NOT EXISTS event_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'technical', 'logistics', 'financial', 'urgent')),
    title VARCHAR(255),
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_artist_id ON tours(artist_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_dates ON tours(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_events_tour_id ON events(tour_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_tour_team_tour_id ON tour_team_members(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_team_user_id ON tour_team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_event_expenses_event_id ON event_expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_expenses_tour_id ON event_expenses(tour_id);
CREATE INDEX IF NOT EXISTS idx_event_expenses_date ON event_expenses(expense_date);

CREATE INDEX IF NOT EXISTS idx_event_notes_event_id ON event_notes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notes_tour_id ON event_notes(tour_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_tours_updated_at ON tours;
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_team_members_updated_at ON tour_team_members;
CREATE TRIGGER update_tour_team_members_updated_at BEFORE UPDATE ON tour_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_expenses_updated_at ON event_expenses;
CREATE TRIGGER update_event_expenses_updated_at BEFORE UPDATE ON event_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_notes_updated_at ON event_notes;
CREATE TRIGGER update_event_notes_updated_at BEFORE UPDATE ON event_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_notes ENABLE ROW LEVEL SECURITY;

-- Tours RLS policies
DROP POLICY IF EXISTS "Users can view tours they're associated with" ON tours;
CREATE POLICY "Users can view tours they're associated with" ON tours
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() = artist_id OR
        EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create tours" ON tours;
CREATE POLICY "Users can create tours" ON tours
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update tours they created or are team members of" ON tours;
CREATE POLICY "Users can update tours they created or are team members of" ON tours
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
    );

DROP POLICY IF EXISTS "Users can delete tours they created" ON tours;
CREATE POLICY "Users can delete tours they created" ON tours
    FOR DELETE USING (auth.uid() = created_by);

-- Events RLS policies  
DROP POLICY IF EXISTS "Users can view events for tours they're associated with" ON events;
CREATE POLICY "Users can view events for tours they're associated with" ON events
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND (
                auth.uid() = tours.created_by OR 
                auth.uid() = tours.artist_id OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Users can create events for tours they're associated with" ON events;
CREATE POLICY "Users can create events for tours they're associated with" ON events
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND (
            tour_id IS NULL OR
            EXISTS (
                SELECT 1 FROM tours 
                WHERE tours.id = events.tour_id 
                AND (
                    auth.uid() = tours.created_by OR
                    EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
                )
            )
        )
    );

DROP POLICY IF EXISTS "Users can update events for tours they're associated with" ON events;
CREATE POLICY "Users can update events for tours they're associated with" ON events
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND (
                auth.uid() = tours.created_by OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete events for tours they created" ON events;
CREATE POLICY "Users can delete events for tours they created" ON events
    FOR DELETE USING (auth.uid() = created_by);

-- Tour team members policies
DROP POLICY IF EXISTS "Users can view team members for tours they're associated with" ON tour_team_members;
CREATE POLICY "Users can view team members for tours they're associated with" ON tour_team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = tour_team_members.tour_id 
            AND (
                auth.uid() = tours.created_by OR 
                auth.uid() = tours.artist_id OR
                auth.uid() = tour_team_members.user_id
            )
        )
    );

DROP POLICY IF EXISTS "Tour creators can manage team members" ON tour_team_members;
CREATE POLICY "Tour creators can manage team members" ON tour_team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = tour_team_members.tour_id 
            AND auth.uid() = tours.created_by
        )
    );

-- Event expenses policies
DROP POLICY IF EXISTS "Users can view expenses for tours they're associated with" ON event_expenses;
CREATE POLICY "Users can view expenses for tours they're associated with" ON event_expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = event_expenses.tour_id 
            AND (
                auth.uid() = tours.created_by OR 
                auth.uid() = tours.artist_id OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Users can create expenses for tours they're associated with" ON event_expenses;
CREATE POLICY "Users can create expenses for tours they're associated with" ON event_expenses
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = event_expenses.tour_id 
            AND (
                auth.uid() = tours.created_by OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
            )
        )
    );

-- Event notes policies
DROP POLICY IF EXISTS "Users can view notes for tours they're associated with" ON event_notes;
CREATE POLICY "Users can view notes for tours they're associated with" ON event_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = event_notes.tour_id 
            AND (
                auth.uid() = tours.created_by OR 
                auth.uid() = tours.artist_id OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Users can create notes for tours they're associated with" ON event_notes;
CREATE POLICY "Users can create notes for tours they're associated with" ON event_notes
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = event_notes.tour_id 
            AND (
                auth.uid() = tours.created_by OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
            )
        )
    );

-- Mark migration as complete
INSERT INTO supabase_migrations.schema_migrations (version, statements, name) 
VALUES (
    '20250625000001',
    1,
    'create_tours_and_events'
) ON CONFLICT (version) DO NOTHING; 