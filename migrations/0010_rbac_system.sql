-- Tour/Event Management RBAC System Migration
-- This creates comprehensive role-based access control for the tour/event management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles table for tour/event management
CREATE TABLE IF NOT EXISTS tour_management_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- System roles can't be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS tour_management_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- tour_management, event_management, financial, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create role-permission mapping table
CREATE TABLE IF NOT EXISTS tour_role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES tour_management_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES tour_management_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(role_id, permission_id)
);

-- Create user-role assignment table
CREATE TABLE IF NOT EXISTS user_tour_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES tour_management_roles(id) ON DELETE CASCADE,
    tour_id UUID, -- NULL means global role, otherwise specific to tour
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL means no expiration
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, role_id, tour_id)
);

-- Create tours table for data isolation
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tour_manager_id UUID REFERENCES auth.users(id),
    artist_id UUID REFERENCES auth.users(id),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create events table linked to tours
CREATE TABLE IF NOT EXISTS tour_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    venue_name VARCHAR(200),
    venue_address TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert system roles
INSERT INTO tour_management_roles (name, display_name, description, is_system_role) VALUES
('super_admin', 'Super Admin', 'Full access to all system features and settings', TRUE),
('tour_manager', 'Tour Manager', 'Can manage all aspects of assigned tours', TRUE),
('artist', 'Artist', 'Can view tour details and manage artist-specific content', TRUE),
('crew_chief', 'Crew Chief', 'Can manage crew members and coordinate logistics', TRUE),
('crew_member', 'Crew Member', 'Can view assigned tasks and submit reports', TRUE),
('vendor', 'Vendor', 'Can access vendor-specific features and submit invoices', TRUE),
('venue_coordinator', 'Venue Coordinator', 'Can manage venue-related logistics', TRUE),
('financial_manager', 'Financial Manager', 'Can manage budgets and financial reporting', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert permissions
INSERT INTO tour_management_permissions (name, display_name, description, category) VALUES
-- Tour Management
('tours.create', 'Create Tours', 'Can create new tours', 'tour_management'),
('tours.view', 'View Tours', 'Can view tour details', 'tour_management'),
('tours.edit', 'Edit Tours', 'Can edit tour information', 'tour_management'),
('tours.delete', 'Delete Tours', 'Can delete tours', 'tour_management'),
('tours.manage_staff', 'Manage Tour Staff', 'Can assign and manage tour staff', 'tour_management'),

-- Event Management
('events.create', 'Create Events', 'Can create new events', 'event_management'),
('events.view', 'View Events', 'Can view event details', 'event_management'),
('events.edit', 'Edit Events', 'Can edit event information', 'event_management'),
('events.delete', 'Delete Events', 'Can delete events', 'event_management'),
('events.manage_logistics', 'Manage Event Logistics', 'Can manage event logistics and coordination', 'event_management'),

-- Staff Management
('staff.view', 'View Staff', 'Can view staff information', 'staff_management'),
('staff.invite', 'Invite Staff', 'Can invite new staff members', 'staff_management'),
('staff.manage', 'Manage Staff', 'Can manage staff roles and permissions', 'staff_management'),
('staff.remove', 'Remove Staff', 'Can remove staff members', 'staff_management'),

-- Financial Management
('finances.view', 'View Finances', 'Can view financial information', 'financial_management'),
('finances.edit', 'Edit Finances', 'Can edit financial records', 'financial_management'),
('finances.approve', 'Approve Expenses', 'Can approve expense reports', 'financial_management'),
('finances.reports', 'Generate Financial Reports', 'Can generate financial reports', 'financial_management'),

-- Logistics Management
('logistics.view', 'View Logistics', 'Can view logistics information', 'logistics_management'),
('logistics.edit', 'Edit Logistics', 'Can edit logistics plans', 'logistics_management'),
('logistics.equipment', 'Manage Equipment', 'Can manage equipment and inventory', 'logistics_management'),
('logistics.transport', 'Manage Transportation', 'Can manage transportation arrangements', 'logistics_management'),

-- Communication
('communications.view', 'View Communications', 'Can view team communications', 'communications'),
('communications.send', 'Send Messages', 'Can send messages to team', 'communications'),
('communications.broadcast', 'Broadcast Messages', 'Can send broadcast messages', 'communications'),

-- Analytics & Reporting
('analytics.view', 'View Analytics', 'Can view analytics and reports', 'analytics'),
('analytics.export', 'Export Data', 'Can export analytics data', 'analytics'),

-- System Administration
('admin.users', 'Manage Users', 'Can manage user accounts', 'administration'),
('admin.roles', 'Manage Roles', 'Can manage roles and permissions', 'administration'),
('admin.settings', 'Manage Settings', 'Can manage system settings', 'administration')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
WITH role_permissions AS (
    SELECT 
        r.id as role_id, 
        p.id as permission_id
    FROM tour_management_roles r
    CROSS JOIN tour_management_permissions p
    WHERE 
        -- Super Admin gets all permissions
        (r.name = 'super_admin') OR
        
        -- Tour Manager gets most permissions except system admin
        (r.name = 'tour_manager' AND p.category != 'administration') OR
        
        -- Artist gets limited permissions
        (r.name = 'artist' AND p.name IN (
            'tours.view', 'events.view', 'communications.view', 'communications.send'
        )) OR
        
        -- Crew Chief gets crew and logistics permissions
        (r.name = 'crew_chief' AND p.name IN (
            'tours.view', 'events.view', 'staff.view', 'staff.manage', 'logistics.view', 
            'logistics.edit', 'logistics.equipment', 'communications.view', 'communications.send'
        )) OR
        
        -- Crew Member gets basic permissions
        (r.name = 'crew_member' AND p.name IN (
            'tours.view', 'events.view', 'communications.view', 'communications.send'
        )) OR
        
        -- Vendor gets vendor-specific permissions
        (r.name = 'vendor' AND p.name IN (
            'tours.view', 'events.view', 'finances.view', 'communications.view', 'communications.send'
        )) OR
        
        -- Venue Coordinator gets venue-related permissions
        (r.name = 'venue_coordinator' AND p.name IN (
            'tours.view', 'events.view', 'events.edit', 'events.manage_logistics', 
            'communications.view', 'communications.send'
        )) OR
        
        -- Financial Manager gets financial permissions
        (r.name = 'financial_manager' AND p.name IN (
            'tours.view', 'events.view', 'finances.view', 'finances.edit', 
            'finances.approve', 'finances.reports', 'analytics.view', 'analytics.export'
        ))
)
INSERT INTO tour_role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tour_role_permissions_role_id ON tour_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_tour_role_permissions_permission_id ON tour_role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_roles_user_id ON user_tour_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_roles_tour_id ON user_tour_roles(tour_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_roles_active ON user_tour_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_manager_id ON tours(tour_manager_id);
CREATE INDEX IF NOT EXISTS idx_tours_artist_id ON tours(artist_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tour_events_tour_id ON tour_events(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_events_date ON tour_events(event_date);

-- Enable RLS on all tables
ALTER TABLE tour_management_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_management_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tour_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tour_management_roles
CREATE POLICY "Anyone can view roles" ON tour_management_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON tour_management_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = auth.uid() AND tmp.name = 'admin.roles' AND utr.is_active = true
    )
);

-- Create RLS policies for tour_management_permissions
CREATE POLICY "Anyone can view permissions" ON tour_management_permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage permissions" ON tour_management_permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = auth.uid() AND tmp.name = 'admin.roles' AND utr.is_active = true
    )
);

-- Create RLS policies for tour_role_permissions
CREATE POLICY "Anyone can view role permissions" ON tour_role_permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage role permissions" ON tour_role_permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = auth.uid() AND tmp.name = 'admin.roles' AND utr.is_active = true
    )
);

-- Create RLS policies for user_tour_roles
CREATE POLICY "Users can view their own roles" ON user_tour_roles FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = auth.uid() AND tmp.name = 'staff.view' AND utr.is_active = true
    )
);

CREATE POLICY "Tour managers can manage roles in their tours" ON user_tour_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = auth.uid() AND tmp.name = 'staff.manage' AND utr.is_active = true
        AND (utr.tour_id = user_tour_roles.tour_id OR utr.tour_id IS NULL)
    )
);

-- Create RLS policies for tours
CREATE POLICY "Users can view tours they have access to" ON tours FOR SELECT USING (
    created_by = auth.uid() OR
    tour_manager_id = auth.uid() OR
    artist_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        WHERE utr.user_id = auth.uid() AND (utr.tour_id = tours.id OR utr.tour_id IS NULL) AND utr.is_active = true
    )
);

CREATE POLICY "Tour managers can manage tours" ON tours FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = auth.uid() AND tmp.name LIKE 'tours.%' AND utr.is_active = true
        AND (utr.tour_id = tours.id OR utr.tour_id IS NULL)
    )
);

-- Create RLS policies for tour_events
CREATE POLICY "Users can view events for accessible tours" ON tour_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM tours t
        WHERE t.id = tour_events.tour_id AND (
            t.created_by = auth.uid() OR
            t.tour_manager_id = auth.uid() OR
            t.artist_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_tour_roles utr
                WHERE utr.user_id = auth.uid() AND (utr.tour_id = t.id OR utr.tour_id IS NULL) AND utr.is_active = true
            )
        )
    )
);

CREATE POLICY "Event managers can manage events" ON tour_events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = auth.uid() AND tmp.name LIKE 'events.%' AND utr.is_active = true
        AND (utr.tour_id = tour_events.tour_id OR utr.tour_id IS NULL)
    )
);

-- Create function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    user_id UUID,
    permission_name TEXT,
    tour_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_tour_roles utr
        JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
        JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
        WHERE utr.user_id = user_has_permission.user_id
        AND tmp.name = permission_name
        AND utr.is_active = true
        AND (utr.tour_id = tour_id OR utr.tour_id IS NULL)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(
    user_id UUID,
    tour_id UUID DEFAULT NULL
) RETURNS TABLE (
    permission_name TEXT,
    permission_display_name TEXT,
    permission_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        tmp.name,
        tmp.display_name,
        tmp.category
    FROM user_tour_roles utr
    JOIN tour_role_permissions trp ON utr.role_id = trp.role_id
    JOIN tour_management_permissions tmp ON trp.permission_id = tmp.id
    WHERE utr.user_id = get_user_permissions.user_id
    AND utr.is_active = true
    AND (utr.tour_id = tour_id OR utr.tour_id IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign role to user
CREATE OR REPLACE FUNCTION assign_user_role(
    target_user_id UUID,
    role_name TEXT,
    target_tour_id UUID DEFAULT NULL,
    assigner_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    role_id UUID;
    assignment_id UUID;
BEGIN
    -- Get role ID
    SELECT id INTO role_id FROM tour_management_roles WHERE name = role_name;
    
    IF role_id IS NULL THEN
        RAISE EXCEPTION 'Role % not found', role_name;
    END IF;
    
    -- Insert role assignment
    INSERT INTO user_tour_roles (user_id, role_id, tour_id, assigned_by)
    VALUES (target_user_id, role_id, target_tour_id, assigner_user_id)
    ON CONFLICT (user_id, role_id, tour_id) DO UPDATE
    SET is_active = true, updated_at = NOW()
    RETURNING id INTO assignment_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tour_management_roles_updated_at
    BEFORE UPDATE ON tour_management_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tour_roles_updated_at
    BEFORE UPDATE ON user_tour_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
    BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_events_updated_at
    BEFORE UPDATE ON tour_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 