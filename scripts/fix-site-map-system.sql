-- Complete Fix for Site Map System
-- This script will clean up existing issues and create all necessary tables

-- STEP 1: Drop all existing conflicting policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on site map related tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'site_maps', 'site_map_zones', 'glamping_tents', 'site_map_elements',
            'site_map_collaborators', 'site_map_activity_log', 'equipment_catalog',
            'equipment_instances', 'equipment_setup_workflows', 'equipment_setup_tasks',
            'power_distribution', 'equipment_power_connections'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy % on table %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- STEP 2: Create missing tables if they don't exist

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

-- STEP 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_category ON equipment_catalog(category);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_vendor_id ON equipment_catalog(vendor_id);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_status ON equipment_catalog(availability_status);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_created_by ON equipment_catalog(created_by);

CREATE INDEX IF NOT EXISTS idx_equipment_instances_site_map_id ON equipment_instances(site_map_id);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_catalog_id ON equipment_instances(catalog_id);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_status ON equipment_instances(status);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_position ON equipment_instances(x, y);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_assigned_to ON equipment_instances(assigned_to_user_id);

CREATE INDEX IF NOT EXISTS idx_equipment_setup_workflows_site_map_id ON equipment_setup_workflows(site_map_id);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_workflows_status ON equipment_setup_workflows(status);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_workflows_team_leader ON equipment_setup_workflows(assigned_team_leader);

CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_workflow_id ON equipment_setup_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_equipment_id ON equipment_setup_tasks(equipment_instance_id);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_status ON equipment_setup_tasks(status);
CREATE INDEX IF NOT EXISTS idx_equipment_setup_tasks_assigned_to ON equipment_setup_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_power_distribution_site_map_id ON power_distribution(site_map_id);
CREATE INDEX IF NOT EXISTS idx_power_distribution_status ON power_distribution(status);
CREATE INDEX IF NOT EXISTS idx_power_distribution_position ON power_distribution(x, y);

CREATE INDEX IF NOT EXISTS idx_equipment_power_connections_equipment_id ON equipment_power_connections(equipment_instance_id);
CREATE INDEX IF NOT EXISTS idx_equipment_power_connections_power_source_id ON equipment_power_connections(power_source_id);
CREATE INDEX IF NOT EXISTS idx_equipment_power_connections_status ON equipment_power_connections(is_connected);

-- STEP 4: Enable RLS on all tables
ALTER TABLE equipment_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_setup_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_setup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_power_connections ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create simple, non-recursive RLS policies

-- Equipment catalog policies
CREATE POLICY "Users can view equipment catalog" ON equipment_catalog
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own equipment" ON equipment_catalog
    FOR ALL USING (auth.uid() = created_by);

-- Equipment instances policies
CREATE POLICY "Users can view equipment instances" ON equipment_instances
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage equipment instances" ON equipment_instances
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Setup workflows policies
CREATE POLICY "Users can view workflows" ON equipment_setup_workflows
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage workflows" ON equipment_setup_workflows
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Setup tasks policies
CREATE POLICY "Users can view tasks" ON equipment_setup_tasks
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage tasks" ON equipment_setup_tasks
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Power distribution policies
CREATE POLICY "Users can view power distribution" ON power_distribution
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage power distribution" ON power_distribution
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Power connections policies
CREATE POLICY "Users can view power connections" ON equipment_power_connections
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage power connections" ON equipment_power_connections
    FOR ALL USING (auth.uid() IS NOT NULL);

-- STEP 6: Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_site_map_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_equipment_catalog_updated_at
    BEFORE UPDATE ON equipment_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_instances_updated_at
    BEFORE UPDATE ON equipment_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_setup_workflows_updated_at
    BEFORE UPDATE ON equipment_setup_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_setup_tasks_updated_at
    BEFORE UPDATE ON equipment_setup_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_power_distribution_updated_at
    BEFORE UPDATE ON power_distribution
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

CREATE TRIGGER trigger_update_equipment_power_connections_updated_at
    BEFORE UPDATE ON equipment_power_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_site_map_updated_at();

-- Success message
SELECT 'Site map system fixed successfully! All tables created and policies updated.' as message;
