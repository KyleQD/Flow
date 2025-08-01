-- Setup script for Tours and Events tables
-- Run this in your Supabase SQL Editor to ensure proper table structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TOURS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Changed from profiles(id) to auth.users(id)
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
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Changed from profiles(id) to auth.users(id)
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_shows CHECK (completed_shows <= total_shows AND completed_shows >= 0),
    CONSTRAINT valid_budget CHECK (budget >= 0 AND expenses >= 0 AND revenue >= 0)
);

-- =============================================================================
-- EVENTS TABLE
-- =============================================================================

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
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Changed from profiles(id) to auth.users(id)
    
    -- Constraints
    CONSTRAINT valid_capacity CHECK (capacity >= 0),
    CONSTRAINT valid_tickets CHECK (tickets_sold >= 0 AND tickets_sold <= capacity),
    CONSTRAINT valid_prices CHECK (ticket_price >= 0 AND vip_price >= 0),
    CONSTRAINT valid_revenue CHECK (expected_revenue >= 0 AND actual_revenue >= 0 AND expenses >= 0)
);

-- =============================================================================
-- TOUR TEAM MEMBERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tour_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Changed from profiles(id) to auth.users(id)
    role VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tour_id, user_id, role)
);

-- =============================================================================
-- EVENT EXPENSES TABLE
-- =============================================================================

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
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE -- Changed from profiles(id) to auth.users(id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_tours_artist_id ON tours(artist_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_dates ON tours(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tours_created_by ON tours(created_by);

CREATE INDEX IF NOT EXISTS idx_events_tour_id ON events(tour_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

CREATE INDEX IF NOT EXISTS idx_tour_team_tour_id ON tour_team_members(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_team_user_id ON tour_team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_event_expenses_event_id ON event_expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_expenses_tour_id ON event_expenses(tour_id);
CREATE INDEX IF NOT EXISTS idx_event_expenses_date ON event_expenses(expense_date);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tour_team_members_updated_at BEFORE UPDATE ON tour_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_expenses_updated_at BEFORE UPDATE ON event_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;

-- Tours policies
CREATE POLICY "Users can view tours they're associated with" ON tours
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() = artist_id OR
        EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create tours" ON tours
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update tours they created or are team members of" ON tours
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
    );

CREATE POLICY "Users can delete tours they created" ON tours
    FOR DELETE USING (auth.uid() = created_by);

-- Events policies  
CREATE POLICY "Users can view events for tours they're associated with" ON events
    FOR SELECT USING (
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

CREATE POLICY "Users can create events for tours they're associated with" ON events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND (
                auth.uid() = tours.created_by OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
            )
        )
    );

CREATE POLICY "Users can update events for tours they're associated with" ON events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND (
                auth.uid() = tours.created_by OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
            )
        )
    );

CREATE POLICY "Users can delete events for tours they created" ON events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND auth.uid() = tours.created_by
        )
    );

-- Team members policies
CREATE POLICY "Users can view team members for tours they're associated with" ON tour_team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = tour_team_members.tour_id 
            AND (
                auth.uid() = tours.created_by OR 
                auth.uid() = tours.artist_id OR
                user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage team members for tours they created" ON tour_team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = tour_team_members.tour_id 
            AND auth.uid() = tours.created_by
        )
    );

-- Event expenses policies
CREATE POLICY "Users can view expenses for events they're associated with" ON event_expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events 
            JOIN tours ON events.tour_id = tours.id
            WHERE events.id = event_expenses.event_id 
            AND (
                auth.uid() = tours.created_by OR 
                auth.uid() = tours.artist_id OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can manage expenses for events they created" ON event_expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events 
            JOIN tours ON events.tour_id = tours.id
            WHERE events.id = event_expenses.event_id 
            AND auth.uid() = tours.created_by
        )
    );

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check if tables were created successfully
SELECT 
    'tours' as table_name,
    COUNT(*) as row_count
FROM tours
UNION ALL
SELECT 
    'events' as table_name,
    COUNT(*) as row_count
FROM events
UNION ALL
SELECT 
    'tour_team_members' as table_name,
    COUNT(*) as row_count
FROM tour_team_members
UNION ALL
SELECT 
    'event_expenses' as table_name,
    COUNT(*) as row_count
FROM event_expenses;

-- Show table structure using standard SQL
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('tours', 'events', 'tour_team_members', 'event_expenses')
ORDER BY table_name, ordinal_position; 