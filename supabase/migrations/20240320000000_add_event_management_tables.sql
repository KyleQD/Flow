-- Create analytics tables
CREATE TABLE event_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_ticket_price DECIMAL(10,2) DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_analytics_daily (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    tickets_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketing tables
CREATE TABLE event_marketing_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email', 'social', 'promo'
    status VARCHAR(50) NOT NULL, -- 'draft', 'scheduled', 'active', 'completed'
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    budget DECIMAL(10,2) DEFAULT 0,
    spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial tracking tables
CREATE TABLE event_expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'paid', 'cancelled'
    payment_method VARCHAR(50),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team collaboration tables
CREATE TABLE event_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    permissions TEXT[], -- Array of permissions
    status VARCHAR(50) NOT NULL, -- 'pending', 'active', 'inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_team_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_team_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_event_analytics_event_id ON event_analytics(event_id);
CREATE INDEX idx_event_analytics_daily_event_id ON event_analytics_daily(event_id);
CREATE INDEX idx_event_marketing_campaigns_event_id ON event_marketing_campaigns(event_id);
CREATE INDEX idx_event_promo_codes_event_id ON event_promo_codes(event_id);
CREATE INDEX idx_event_expenses_event_id ON event_expenses(event_id);
CREATE INDEX idx_event_budgets_event_id ON event_budgets(event_id);
CREATE INDEX idx_event_team_members_event_id ON event_team_members(event_id);
CREATE INDEX idx_event_team_messages_event_id ON event_team_messages(event_id);
CREATE INDEX idx_event_team_documents_event_id ON event_team_documents(event_id);

-- Create RLS policies
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Event analytics are viewable by event owners and team members"
    ON event_analytics FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events 
            WHERE created_by = auth.uid()
            OR id IN (
                SELECT event_id FROM event_team_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Marketing campaigns are manageable by event owners and team members"
    ON event_marketing_campaigns FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events 
            WHERE created_by = auth.uid()
            OR id IN (
                SELECT event_id FROM event_team_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Financial data is manageable by event owners and team members"
    ON event_expenses FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events 
            WHERE created_by = auth.uid()
            OR id IN (
                SELECT event_id FROM event_team_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Team collaboration is accessible by event owners and team members"
    ON event_team_messages FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events 
            WHERE created_by = auth.uid()
            OR id IN (
                SELECT event_id FROM event_team_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    ); 