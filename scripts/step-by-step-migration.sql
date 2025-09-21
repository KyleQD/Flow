-- Step-by-Step Site Map Migration
-- Run these steps in order to avoid dependency issues

-- STEP 1: Create the core site map tables first
-- =============================================================================

-- Site maps table
CREATE TABLE IF NOT EXISTS site_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    width INTEGER NOT NULL DEFAULT 1000,
    height INTEGER NOT NULL DEFAULT 1000,
    scale DECIMAL(8,2) DEFAULT 1.0,
    backgroundColor VARCHAR(7) DEFAULT '#f8f9fa',
    gridEnabled BOOLEAN DEFAULT true,
    gridSize INTEGER DEFAULT 20,
    isPublic BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft',
    eventId UUID,
    tourId UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Site map zones table
CREATE TABLE IF NOT EXISTS site_map_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6',
    zone_type VARCHAR(100) DEFAULT 'general',
    capacity INTEGER,
    amenities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Glamping tents table
CREATE TABLE IF NOT EXISTS glamping_tents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    tent_number VARCHAR(50) NOT NULL,
    tent_type VARCHAR(100) NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER DEFAULT 100,
    height INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'available',
    is_available BOOLEAN DEFAULT true,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    check_in_date DATE,
    check_out_date DATE,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site map elements table
CREATE TABLE IF NOT EXISTS site_map_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    element_type VARCHAR(100) NOT NULL,
    name VARCHAR(255),
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER DEFAULT 50,
    height INTEGER DEFAULT 50,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site map collaborators table
CREATE TABLE IF NOT EXISTS site_map_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer',
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_invite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_map_id, user_id)
);

-- Site map activity log table
CREATE TABLE IF NOT EXISTS site_map_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Create equipment tables
-- =============================================================================

-- Equipment catalog table
CREATE TABLE IF NOT EXISTS equipment_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID,
    
    -- Equipment identification
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'sound', 'lighting', 'stage', 'power', 'generator', 'tent', 'furniture',
        'catering', 'security', 'transportation', 'decor', 'custom'
    )),
    subcategory VARCHAR(100),
    
    -- Equipment specifications
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    dimensions JSONB,
    weight DECIMAL(8,2),
    power_consumption INTEGER,
    voltage_requirements VARCHAR(50),
    
    -- Visual representation
    symbol_type VARCHAR(50) DEFAULT 'rectangle',
    symbol_color VARCHAR(7) DEFAULT '#3b82f6',
    symbol_size INTEGER DEFAULT 40,
    icon_name VARCHAR(100),
    custom_shape_data JSONB,
    
    -- Equipment properties
    is_portable BOOLEAN DEFAULT true,
    requires_setup BOOLEAN DEFAULT false,
    setup_time_minutes INTEGER DEFAULT 0,
    requires_power BOOLEAN DEFAULT false,
    requires_water BOOLEAN DEFAULT false,
    requires_internet BOOLEAN DEFAULT false,
    weather_resistant BOOLEAN DEFAULT false,
    
    -- Rental information
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN (
        'available', 'rented', 'maintenance', 'reserved', 'out_of_service'
    )),
    
    -- Documentation
    description TEXT,
    setup_instructions TEXT,
    maintenance_notes TEXT,
    image_url TEXT,
    manual_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Equipment instances table
CREATE TABLE IF NOT EXISTS equipment_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    catalog_id UUID NOT NULL REFERENCES equipment_catalog(id) ON DELETE CASCADE,
    
    -- Instance identification
    serial_number VARCHAR(255),
    asset_tag VARCHAR(255),
    instance_name VARCHAR(255),
    
    -- Position on site map
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER DEFAULT 40,
    height INTEGER DEFAULT 40,
    rotation DECIMAL(5,2) DEFAULT 0.0,
    
    -- Status and assignment
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN (
        'available', 'in_use', 'setup', 'maintenance', 'packed', 'damaged'
    )),
    assigned_to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Setup information
    setup_start_time TIMESTAMP WITH TIME ZONE,
    setup_completed_time TIMESTAMP WITH TIME ZONE,
    setup_notes TEXT,
    
    -- Power and utility connections
    power_source_id UUID,
    power_cable_length INTEGER,
    connected_to_network BOOLEAN DEFAULT false,
    
    -- Rental information
    rental_start_date DATE,
    rental_end_date DATE,
    rental_rate DECIMAL(10,2),
    customer_name VARCHAR(255),
    customer_contact VARCHAR(255),
    
    -- Maintenance
    last_inspection_date DATE,
    next_inspection_date DATE,
    maintenance_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment setup workflows table
CREATE TABLE IF NOT EXISTS equipment_setup_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Workflow settings
    is_template BOOLEAN DEFAULT false,
    estimated_duration_minutes INTEGER,
    priority INTEGER DEFAULT 1,
    
    -- Status
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN (
        'planned', 'in_progress', 'completed', 'cancelled', 'on_hold'
    )),
    
    -- Timing
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    scheduled_end_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_team_leader UUID REFERENCES profiles(id) ON DELETE SET NULL,
    team_members UUID[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Equipment setup tasks table
CREATE TABLE IF NOT EXISTS equipment_setup_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES equipment_setup_workflows(id) ON DELETE CASCADE,
    equipment_instance_id UUID REFERENCES equipment_instances(id) ON DELETE SET NULL,
    
    -- Task details
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100) CHECK (task_type IN (
        'setup', 'positioning', 'power_connection', 'testing', 'calibration',
        'network_setup', 'safety_check', 'documentation', 'custom'
    )),
    
    -- Task requirements
    estimated_duration_minutes INTEGER,
    required_tools TEXT[],
    required_skills TEXT[],
    dependencies UUID[],
    
    -- Status and assignment
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'skipped', 'failed'
    )),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 2,
    
    -- Timing
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    scheduled_end_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Results
    completion_notes TEXT,
    issues_encountered TEXT,
    photos TEXT[],
    
    -- Position in workflow
    order_index INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Power distribution table
CREATE TABLE IF NOT EXISTS power_distribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
    
    -- Power source identification
    name VARCHAR(255) NOT NULL,
    power_type VARCHAR(100) NOT NULL CHECK (power_type IN (
        'generator', 'main_power', 'solar', 'battery', 'ups'
    )),
    
    -- Power specifications
    total_capacity_watts INTEGER NOT NULL,
    available_capacity_watts INTEGER NOT NULL,
    voltage_output VARCHAR(50) NOT NULL,
    phase_type VARCHAR(50) DEFAULT 'single',
    
    -- Position on site map
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER DEFAULT 60,
    height INTEGER DEFAULT 60,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active', 'maintenance', 'offline', 'overloaded'
    )),
    
    -- Connections
    max_connections INTEGER DEFAULT 10,
    current_connections INTEGER DEFAULT 0,
    
    -- Fuel/energy information
    fuel_type VARCHAR(100),
    fuel_level_percentage INTEGER,
    estimated_runtime_hours INTEGER,
    
    -- Monitoring
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment power connections table
CREATE TABLE IF NOT EXISTS equipment_power_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_instance_id UUID NOT NULL REFERENCES equipment_instances(id) ON DELETE CASCADE,
    power_source_id UUID NOT NULL REFERENCES power_distribution(id) ON DELETE CASCADE,
    
    -- Connection details
    connection_type VARCHAR(100),
    cable_length INTEGER,
    power_draw_watts INTEGER NOT NULL,
    voltage_required VARCHAR(50),
    
    -- Connection status
    is_connected BOOLEAN DEFAULT false,
    connected_at TIMESTAMP WITH TIME ZONE,
    disconnected_at TIMESTAMP WITH TIME ZONE,
    
    -- Safety and monitoring
    is_gfci_protected BOOLEAN DEFAULT false,
    last_safety_check TIMESTAMP WITH TIME ZONE,
    safety_check_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create indexes
-- =============================================================================

-- Site maps indexes
CREATE INDEX IF NOT EXISTS idx_site_maps_event_id ON site_maps(eventId);
CREATE INDEX IF NOT EXISTS idx_site_maps_tour_id ON site_maps(tourId);
CREATE INDEX IF NOT EXISTS idx_site_maps_created_by ON site_maps(created_by);
CREATE INDEX IF NOT EXISTS idx_site_maps_status ON site_maps(status);

-- Site map zones indexes
CREATE INDEX IF NOT EXISTS idx_site_map_zones_site_map_id ON site_map_zones(site_map_id);
CREATE INDEX IF NOT EXISTS idx_site_map_zones_position ON site_map_zones(x, y);

-- Glamping tents indexes
CREATE INDEX IF NOT EXISTS idx_glamping_tents_site_map_id ON glamping_tents(site_map_id);
CREATE INDEX IF NOT EXISTS idx_glamping_tents_tent_number ON glamping_tents(tent_number);
CREATE INDEX IF NOT EXISTS idx_glamping_tents_status ON glamping_tents(status);
CREATE INDEX IF NOT EXISTS idx_glamping_tents_position ON glamping_tents(x, y);

-- Site map elements indexes
CREATE INDEX IF NOT EXISTS idx_site_map_elements_site_map_id ON site_map_elements(site_map_id);
CREATE INDEX IF NOT EXISTS idx_site_map_elements_type ON site_map_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_site_map_elements_position ON site_map_elements(x, y);

-- Site map collaborators indexes
CREATE INDEX IF NOT EXISTS idx_site_map_collaborators_site_map_id ON site_map_collaborators(site_map_id);
CREATE INDEX IF NOT EXISTS idx_site_map_collaborators_user_id ON site_map_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_site_map_collaborators_active ON site_map_collaborators(is_active);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_site_map_activity_log_site_map_id ON site_map_activity_log(site_map_id);
CREATE INDEX IF NOT EXISTS idx_site_map_activity_log_user_id ON site_map_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_site_map_activity_log_created_at ON site_map_activity_log(created_at);

-- Equipment catalog indexes
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_category ON equipment_catalog(category);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_vendor_id ON equipment_catalog(vendor_id);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_status ON equipment_catalog(availability_status);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_created_by ON equipment_catalog(created_by);

-- Equipment instances indexes
CREATE INDEX IF NOT EXISTS idx_equipment_instances_site_map_id ON equipment_instances(site_map_id);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_catalog_id ON equipment_instances(catalog_id);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_status ON equipment_instances(status);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_position ON equipment_instances(x, y);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_assigned_to ON equipment_instances(assigned_to_user_id);

-- Setup workflows indexes
CREATE INDEX IF NOT EXISTS idx_equipment_setup_workflows_site_map_id ON equipment_setup_workflows(site_map_id);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_workflows_status ON equipment_setup_workflows(status);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_workflows_team_leader ON equipment_setup_workflows(assigned_team_leader);

-- Setup tasks indexes
CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_workflow_id ON equipment_setup_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_equipment_id ON equipment_setup_tasks(equipment_instance_id);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_status ON equipment_setup_tasks(status);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_assigned_to ON equipment_setup_tasks(assigned_to);

-- Power distribution indexes
CREATE INDEX IF NOT EXISTS idx_power_distribution_site_map_id ON power_distribution(site_map_id);
CREATE INDEX IF NOT EXISTS idx_power_distribution_status ON power_distribution(status);
CREATE INDEX IF NOT EXISTS idx_power_distribution_position ON power_distribution(x, y);

-- Power connections indexes
CREATE INDEX IF NOT EXISTS idx_equipment_power_connections_equipment_id ON equipment_power_connections(equipment_instance_id);
CREATE INDEX IF NOT EXISTS idx_equipment_power_connections_power_source_id ON equipment_power_connections(power_source_id);
CREATE INDEX IF NOT EXISTS idx_equipment_power_connections_status ON equipment_power_connections(is_connected);

-- STEP 4: Enable RLS on all tables
-- =============================================================================

ALTER TABLE site_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_map_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE glamping_tents ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_map_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_map_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_map_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_setup_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_setup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_power_connections ENABLE ROW LEVEL SECURITY;

SELECT 'Tables created successfully! Now run the policies script.' as message;
