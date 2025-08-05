-- =============================================================================
-- ENHANCED ROLES & PERMISSIONS SYSTEM FOR VENUE STAFF MANAGEMENT
-- =============================================================================
-- Migration: 20250121000000_enhanced_roles_permissions.sql
-- Description: Comprehensive roles and permissions system with role-based access control
-- =============================================================================

-- =============================================================================
-- STEP 1: Create role definitions table
-- =============================================================================

CREATE TABLE IF NOT EXISTS venue_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  role_name TEXT NOT NULL,
  role_description TEXT,
  role_level INTEGER NOT NULL DEFAULT 1, -- 1=entry, 2=mid, 3=senior, 4=manager, 5=admin
  is_system_role BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, role_name)
);

-- =============================================================================
-- STEP 2: Create permissions table
-- =============================================================================

CREATE TABLE IF NOT EXISTS venue_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_name TEXT NOT NULL UNIQUE,
  permission_description TEXT,
  permission_category TEXT NOT NULL, -- 'staff', 'events', 'bookings', 'analytics', 'settings', 'documents', 'payroll', 'communications'
  is_system_permission BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 3: Create role-permission assignments table
-- =============================================================================

CREATE TABLE IF NOT EXISTS venue_role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES venue_roles(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES venue_permissions(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- =============================================================================
-- STEP 4: Create user-role assignments table
-- =============================================================================

CREATE TABLE IF NOT EXISTS venue_user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES venue_roles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL, -- For temporary role assignments
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(venue_id, user_id, role_id)
);

-- =============================================================================
-- STEP 5: Create permission overrides table for individual users
-- =============================================================================

CREATE TABLE IF NOT EXISTS venue_user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES venue_permissions(id) ON DELETE CASCADE NOT NULL,
  is_granted BOOLEAN NOT NULL, -- true = grant, false = deny
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  reason TEXT,
  UNIQUE(venue_id, user_id, permission_id)
);

-- =============================================================================
-- STEP 6: Create audit log for permission changes
-- =============================================================================

CREATE TABLE IF NOT EXISTS venue_permission_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'role_assigned', 'role_removed', 'permission_granted', 'permission_denied', 'override_added', 'override_removed'
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role_id UUID REFERENCES venue_roles(id) ON DELETE SET NULL,
  permission_id UUID REFERENCES venue_permissions(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB,
  ip_address INET,
  user_agent TEXT
);

-- =============================================================================
-- STEP 7: Insert system permissions
-- =============================================================================

INSERT INTO venue_permissions (permission_name, permission_description, permission_category, is_system_permission) VALUES
-- Staff Management Permissions
('staff.view', 'View staff profiles and basic information', 'staff', true),
('staff.create', 'Create new staff profiles', 'staff', true),
('staff.edit', 'Edit staff profile information', 'staff', true),
('staff.delete', 'Delete staff profiles', 'staff', true),
('staff.manage_roles', 'Assign and manage staff roles', 'staff', true),
('staff.view_sensitive', 'View sensitive staff information (pay, performance, etc.)', 'staff', true),
('staff.manage_performance', 'Create and manage performance reviews', 'staff', true),
('staff.manage_certifications', 'Manage staff certifications and documents', 'staff', true),

-- Event Management Permissions
('events.view', 'View events and schedules', 'events', true),
('events.create', 'Create new events', 'events', true),
('events.edit', 'Edit event details', 'events', true),
('events.delete', 'Delete events', 'events', true),
('events.manage_staff', 'Assign staff to events', 'events', true),
('events.manage_schedule', 'Manage event scheduling and timing', 'events', true),
('events.view_financial', 'View event financial information', 'events', true),
('events.manage_financial', 'Manage event budgets and expenses', 'events', true),

-- Booking Management Permissions
('bookings.view', 'View booking requests and confirmations', 'bookings', true),
('bookings.create', 'Create new bookings', 'bookings', true),
('bookings.edit', 'Edit booking details', 'bookings', true),
('bookings.delete', 'Delete bookings', 'bookings', true),
('bookings.approve', 'Approve or reject booking requests', 'bookings', true),
('bookings.manage_contracts', 'Manage booking contracts and agreements', 'bookings', true),

-- Analytics and Reporting Permissions
('analytics.view', 'View basic analytics and reports', 'analytics', true),
('analytics.view_financial', 'View financial analytics and reports', 'analytics', true),
('analytics.view_staff', 'View staff performance analytics', 'analytics', true),
('analytics.export', 'Export analytics data', 'analytics', true),
('analytics.manage_dashboards', 'Create and manage custom dashboards', 'analytics', true),

-- Settings and Configuration Permissions
('settings.view', 'View venue settings', 'settings', true),
('settings.edit_basic', 'Edit basic venue information', 'settings', true),
('settings.edit_advanced', 'Edit advanced venue settings', 'settings', true),
('settings.manage_integrations', 'Manage third-party integrations', 'settings', true),
('settings.manage_billing', 'Manage billing and subscription settings', 'settings', true),

-- Document Management Permissions
('documents.view', 'View venue documents', 'documents', true),
('documents.upload', 'Upload new documents', 'documents', true),
('documents.edit', 'Edit document metadata', 'documents', true),
('documents.delete', 'Delete documents', 'documents', true),
('documents.manage_categories', 'Manage document categories and organization', 'documents', true),

-- Payroll and Compensation Permissions
('payroll.view', 'View payroll information', 'payroll', true),
('payroll.edit', 'Edit payroll and compensation data', 'payroll', true),
('payroll.process', 'Process payroll payments', 'payroll', true),
('payroll.view_tax_info', 'View tax and financial information', 'payroll', true),
('payroll.manage_rates', 'Manage hourly rates and salary information', 'payroll', true),

-- Communication Permissions
('communications.view', 'View communications and messages', 'communications', true),
('communications.send', 'Send messages to staff', 'communications', true),
('communications.broadcast', 'Send broadcast messages to all staff', 'communications', true),
('communications.manage_templates', 'Manage message templates', 'communications', true),
('communications.view_private', 'View private communications', 'communications', true),

-- System Administration Permissions
('admin.manage_roles', 'Manage all roles and permissions', 'admin', true),
('admin.manage_users', 'Manage all user accounts', 'admin', true),
('admin.view_audit_logs', 'View system audit logs', 'admin', true),
('admin.system_settings', 'Manage system-wide settings', 'admin', true),
('admin.data_export', 'Export all venue data', 'admin', true)
ON CONFLICT (permission_name) DO NOTHING;

-- =============================================================================
-- STEP 8: Insert default system roles
-- =============================================================================

-- Function to create default roles for a venue
CREATE OR REPLACE FUNCTION create_default_venue_roles(venue_uuid UUID)
RETURNS void AS $$
DECLARE
  role_record RECORD;
  permission_record RECORD;
BEGIN
  -- Create default roles
  INSERT INTO venue_roles (venue_id, role_name, role_description, role_level, is_system_role) VALUES
    (venue_uuid, 'Venue Owner', 'Full access to all venue features and settings', 5, true),
    (venue_uuid, 'Venue Manager', 'Manage venue operations, staff, and events', 4, true),
    (venue_uuid, 'Event Coordinator', 'Coordinate events and manage bookings', 3, true),
    (venue_uuid, 'Staff Supervisor', 'Supervise staff and manage schedules', 3, true),
    (venue_uuid, 'FOH Manager', 'Manage front-of-house operations', 3, true),
    (venue_uuid, 'Technical Manager', 'Manage technical operations and equipment', 3, true),
    (venue_uuid, 'Security Manager', 'Manage security operations and staff', 3, true),
    (venue_uuid, 'Bar Manager', 'Manage bar operations and staff', 3, true),
    (venue_uuid, 'Kitchen Manager', 'Manage kitchen operations and staff', 3, true),
    (venue_uuid, 'Senior Staff', 'Experienced staff with additional responsibilities', 2, true),
    (venue_uuid, 'Staff Member', 'Regular staff member with basic access', 1, true),
    (venue_uuid, 'Temporary Staff', 'Temporary or seasonal staff member', 1, true),
    (venue_uuid, 'Viewer', 'Read-only access to basic information', 1, true)
  ON CONFLICT (venue_id, role_name) DO NOTHING;

  -- Assign permissions to roles
  -- Venue Owner gets all permissions
  FOR permission_record IN SELECT id FROM venue_permissions LOOP
    INSERT INTO venue_role_permissions (role_id, permission_id)
    SELECT r.id, permission_record.id
    FROM venue_roles r
    WHERE r.venue_id = venue_uuid AND r.role_name = 'Venue Owner'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;

  -- Venue Manager permissions
  INSERT INTO venue_role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM venue_roles r, venue_permissions p
  WHERE r.venue_id = venue_uuid 
    AND r.role_name = 'Venue Manager'
    AND p.permission_name IN (
      'staff.view', 'staff.create', 'staff.edit', 'staff.manage_roles', 'staff.view_sensitive', 'staff.manage_performance', 'staff.manage_certifications',
      'events.view', 'events.create', 'events.edit', 'events.manage_staff', 'events.manage_schedule', 'events.view_financial',
      'bookings.view', 'bookings.create', 'bookings.edit', 'bookings.approve', 'bookings.manage_contracts',
      'analytics.view', 'analytics.view_financial', 'analytics.view_staff', 'analytics.export',
      'settings.view', 'settings.edit_basic', 'settings.edit_advanced',
      'documents.view', 'documents.upload', 'documents.edit', 'documents.manage_categories',
      'payroll.view', 'payroll.edit', 'payroll.manage_rates',
      'communications.view', 'communications.send', 'communications.broadcast', 'communications.manage_templates'
    )
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- Event Coordinator permissions
  INSERT INTO venue_role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM venue_roles r, venue_permissions p
  WHERE r.venue_id = venue_uuid 
    AND r.role_name = 'Event Coordinator'
    AND p.permission_name IN (
      'staff.view', 'staff.edit',
      'events.view', 'events.create', 'events.edit', 'events.manage_staff', 'events.manage_schedule',
      'bookings.view', 'bookings.create', 'bookings.edit', 'bookings.approve',
      'analytics.view',
      'documents.view', 'documents.upload', 'documents.edit',
      'communications.view', 'communications.send'
    )
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- Staff Supervisor permissions
  INSERT INTO venue_role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM venue_roles r, venue_permissions p
  WHERE r.venue_id = venue_uuid 
    AND r.role_name = 'Staff Supervisor'
    AND p.permission_name IN (
      'staff.view', 'staff.edit', 'staff.manage_performance',
      'events.view', 'events.manage_staff',
      'analytics.view', 'analytics.view_staff',
      'payroll.view', 'payroll.edit',
      'communications.view', 'communications.send'
    )
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- Senior Staff permissions
  INSERT INTO venue_role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM venue_roles r, venue_permissions p
  WHERE r.venue_id = venue_uuid 
    AND r.role_name = 'Senior Staff'
    AND p.permission_name IN (
      'staff.view',
      'events.view',
      'analytics.view',
      'communications.view', 'communications.send'
    )
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- Staff Member permissions
  INSERT INTO venue_role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM venue_roles r, venue_permissions p
  WHERE r.venue_id = venue_uuid 
    AND r.role_name = 'Staff Member'
    AND p.permission_name IN (
      'staff.view',
      'events.view',
      'communications.view', 'communications.send'
    )
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- Viewer permissions
  INSERT INTO venue_role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM venue_roles r, venue_permissions p
  WHERE r.venue_id = venue_uuid 
    AND r.role_name = 'Viewer'
    AND p.permission_name IN (
      'staff.view',
      'events.view'
    )
  ON CONFLICT (role_id, permission_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STEP 9: Create indexes for performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_venue_roles_venue_id ON venue_roles(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_roles_role_level ON venue_roles(role_level);
CREATE INDEX IF NOT EXISTS idx_venue_roles_is_active ON venue_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_venue_permissions_category ON venue_permissions(permission_category);
CREATE INDEX IF NOT EXISTS idx_venue_permissions_is_system ON venue_permissions(is_system_permission);

CREATE INDEX IF NOT EXISTS idx_venue_role_permissions_role_id ON venue_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_venue_role_permissions_permission_id ON venue_role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_venue_user_roles_venue_id ON venue_user_roles(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_user_roles_user_id ON venue_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_user_roles_role_id ON venue_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_venue_user_roles_is_active ON venue_user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_venue_user_permission_overrides_venue_id ON venue_user_permission_overrides(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_user_permission_overrides_user_id ON venue_user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_user_permission_overrides_permission_id ON venue_user_permission_overrides(permission_id);

CREATE INDEX IF NOT EXISTS idx_venue_permission_audit_log_venue_id ON venue_permission_audit_log(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_permission_audit_log_target_user_id ON venue_permission_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_venue_permission_audit_log_performed_at ON venue_permission_audit_log(performed_at);

-- =============================================================================
-- STEP 10: Enable Row Level Security
-- =============================================================================

ALTER TABLE venue_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_permission_audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 11: Create RLS Policies
-- =============================================================================

-- Drop existing policies if they exist (for idempotent migration)
DROP POLICY IF EXISTS "Venue owners can manage their roles" ON venue_roles;
DROP POLICY IF EXISTS "Staff can view roles for their venue" ON venue_roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON venue_permissions;
DROP POLICY IF EXISTS "Venue owners can manage role permissions" ON venue_role_permissions;
DROP POLICY IF EXISTS "Staff can view role permissions for their venue" ON venue_role_permissions;
DROP POLICY IF EXISTS "Venue owners can manage user roles" ON venue_user_roles;
DROP POLICY IF EXISTS "Users can view their own role assignments" ON venue_user_roles;
DROP POLICY IF EXISTS "Venue owners can manage permission overrides" ON venue_user_permission_overrides;
DROP POLICY IF EXISTS "Users can view their own permission overrides" ON venue_user_permission_overrides;
DROP POLICY IF EXISTS "Venue owners can view audit logs" ON venue_permission_audit_log;
DROP POLICY IF EXISTS "Users can view audit logs for their actions" ON venue_permission_audit_log;

-- Venue Roles Policies
CREATE POLICY "Venue owners can manage their roles"
  ON venue_roles FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view roles for their venue"
  ON venue_roles FOR SELECT
  USING (
    venue_id IN (
      SELECT venue_id FROM venue_team_members WHERE user_id = auth.uid()
    )
  );

-- Venue Permissions Policies (system-wide, readable by all authenticated users)
CREATE POLICY "Authenticated users can view permissions"
  ON venue_permissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Venue Role Permissions Policies
CREATE POLICY "Venue owners can manage role permissions"
  ON venue_role_permissions FOR ALL
  USING (
    role_id IN (
      SELECT id FROM venue_roles 
      WHERE venue_id IN (
        SELECT id FROM venue_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can view role permissions for their venue"
  ON venue_role_permissions FOR SELECT
  USING (
    role_id IN (
      SELECT r.id FROM venue_roles r
      WHERE r.venue_id IN (
        SELECT venue_id FROM venue_team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Venue User Roles Policies
CREATE POLICY "Venue owners can manage user roles"
  ON venue_user_roles FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own role assignments"
  ON venue_user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Venue User Permission Overrides Policies
CREATE POLICY "Venue owners can manage permission overrides"
  ON venue_user_permission_overrides FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own permission overrides"
  ON venue_user_permission_overrides FOR SELECT
  USING (user_id = auth.uid());

-- Venue Permission Audit Log Policies
CREATE POLICY "Venue owners can view audit logs"
  ON venue_permission_audit_log FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view audit logs for their actions"
  ON venue_permission_audit_log FOR SELECT
  USING (performed_by = auth.uid());

-- =============================================================================
-- STEP 12: Create helper functions
-- =============================================================================

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  user_uuid UUID,
  venue_uuid UUID,
  permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
  override_granted BOOLEAN := FALSE;
  override_denied BOOLEAN := FALSE;
BEGIN
  -- Check for explicit permission overrides first
  SELECT 
    COALESCE(bool_or(is_granted), FALSE) INTO override_granted
  FROM venue_user_permission_overrides
  WHERE user_id = user_uuid 
    AND venue_id = venue_uuid 
    AND permission_id = (SELECT id FROM venue_permissions WHERE permission_name = $3)
    AND (expires_at IS NULL OR expires_at > NOW())
    AND is_granted = TRUE;

  SELECT 
    COALESCE(bool_or(is_granted), FALSE) INTO override_denied
  FROM venue_user_permission_overrides
  WHERE user_id = user_uuid 
    AND venue_id = venue_uuid 
    AND permission_id = (SELECT id FROM venue_permissions WHERE permission_name = $3)
    AND (expires_at IS NULL OR expires_at > NOW())
    AND is_granted = FALSE;

  -- If explicitly denied, return false
  IF override_denied THEN
    RETURN FALSE;
  END IF;

  -- If explicitly granted, return true
  IF override_granted THEN
    RETURN TRUE;
  END IF;

  -- Check role-based permissions
  SELECT EXISTS(
    SELECT 1
    FROM venue_user_roles ur
    JOIN venue_role_permissions rp ON ur.role_id = rp.role_id
    JOIN venue_permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid
      AND ur.venue_id = venue_uuid
      AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND p.permission_name = permission_name
  ) INTO has_permission;

  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a user at a venue
CREATE OR REPLACE FUNCTION get_user_permissions(
  user_uuid UUID,
  venue_uuid UUID
)
RETURNS TABLE(permission_name TEXT, permission_category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.permission_name, p.permission_category
  FROM venue_permissions p
  WHERE (
    -- Role-based permissions
    EXISTS(
      SELECT 1
      FROM venue_user_roles ur
      JOIN venue_role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = user_uuid
        AND ur.venue_id = venue_uuid
        AND ur.is_active = TRUE
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND rp.permission_id = p.id
    )
    OR
    -- Explicitly granted overrides
    EXISTS(
      SELECT 1
      FROM venue_user_permission_overrides o
      WHERE o.user_id = user_uuid
        AND o.venue_id = venue_uuid
        AND o.permission_id = p.id
        AND o.is_granted = TRUE
        AND (o.expires_at IS NULL OR o.expires_at > NOW())
    )
  )
  AND NOT EXISTS(
    -- Explicitly denied overrides
    SELECT 1
    FROM venue_user_permission_overrides o
    WHERE o.user_id = user_uuid
      AND o.venue_id = venue_uuid
      AND o.permission_id = p.id
      AND o.is_granted = FALSE
      AND (o.expires_at IS NULL OR o.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log permission changes
CREATE OR REPLACE FUNCTION log_permission_change(
  venue_uuid UUID,
  action_type TEXT,
  target_user_uuid UUID,
  role_uuid UUID DEFAULT NULL,
  permission_uuid UUID DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO venue_permission_audit_log (
    venue_id,
    action_type,
    target_user_id,
    role_id,
    permission_id,
    performed_by,
    details,
    ip_address
  ) VALUES (
    venue_uuid,
    action_type,
    target_user_uuid,
    role_uuid,
    permission_uuid,
    auth.uid(),
    details,
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 13: Create update triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist (for idempotent migration)
DROP TRIGGER IF EXISTS update_venue_roles_updated_at ON venue_roles;
DROP TRIGGER IF EXISTS update_venue_permissions_updated_at ON venue_permissions;

CREATE TRIGGER update_venue_roles_updated_at 
  BEFORE UPDATE ON venue_roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_permissions_updated_at 
  BEFORE UPDATE ON venue_permissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 14: Update existing venue_team_members table
-- =============================================================================

-- Add role_id column to venue_team_members for backward compatibility
ALTER TABLE venue_team_members 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES venue_roles(id) ON DELETE SET NULL;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_venue_team_members_role_id ON venue_team_members(role_id);

-- =============================================================================
-- STEP 15: Create default roles for existing venues
-- =============================================================================

-- Create default roles for all existing venues
DO $$
DECLARE
  venue_record RECORD;
BEGIN
  FOR venue_record IN SELECT id FROM venue_profiles LOOP
    PERFORM create_default_venue_roles(venue_record.id);
  END LOOP;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- ============================================================================= 