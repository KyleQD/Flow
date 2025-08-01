# 🔐 Enhanced Roles & Permissions System

## 📋 Overview

The Enhanced Roles & Permissions System provides comprehensive role-based access control (RBAC) for venue staff management. This system allows venue owners to create custom roles, assign specific permissions, and manage user access with fine-grained control.

## ✨ Key Features

### 🎯 **Role Management**
- **Custom Role Creation** - Create venue-specific roles with custom names and descriptions
- **Role Hierarchy** - 5-level role system (Entry, Mid, Senior, Manager, Admin)
- **System Roles** - Pre-defined roles that cannot be deleted
- **Role Permissions** - Assign specific permissions to each role
- **Role Editing & Deletion** - Manage existing roles (except system roles)

### 👥 **User Role Assignment**
- **Role Assignment** - Assign roles to users with optional expiration dates
- **Multiple Roles** - Users can have multiple roles simultaneously
- **Temporary Access** - Set expiration dates for temporary role assignments
- **Assignment Notes** - Add notes to role assignments for tracking
- **Role Removal** - Remove role assignments when no longer needed

### 🔒 **Permission System**
- **45 System Permissions** - Comprehensive permission set across 9 categories
- **Permission Categories**:
  - Staff Management (8 permissions)
  - Events (8 permissions)
  - Bookings (6 permissions)
  - Analytics (5 permissions)
  - Settings (5 permissions)
  - Documents (5 permissions)
  - Payroll (5 permissions)
  - Communications (5 permissions)
  - Administration (5 permissions)

### 🛡️ **Security Features**
- **Row Level Security (RLS)** - Database-level security policies
- **Permission Overrides** - Grant or deny specific permissions to individual users
- **Audit Logging** - Complete audit trail of all permission changes
- **Temporary Permissions** - Time-limited permission grants
- **Principle of Least Privilege** - Only necessary permissions are granted

## 🗃️ Database Schema

### **Core Tables**

#### `venue_roles`
```sql
CREATE TABLE venue_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  role_name TEXT NOT NULL,
  role_description TEXT,
  role_level INTEGER NOT NULL DEFAULT 1, -- 1=entry, 2=mid, 3=senior, 4=manager, 5=admin
  is_system_role BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, role_name)
);
```

#### `venue_permissions`
```sql
CREATE TABLE venue_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_name TEXT NOT NULL UNIQUE,
  permission_description TEXT,
  permission_category TEXT NOT NULL,
  is_system_permission BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venue_role_permissions`
```sql
CREATE TABLE venue_role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES venue_roles(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES venue_permissions(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);
```

#### `venue_user_roles`
```sql
CREATE TABLE venue_user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES venue_roles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(venue_id, user_id, role_id)
);
```

#### `venue_user_permission_overrides`
```sql
CREATE TABLE venue_user_permission_overrides (
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
```

#### `venue_permission_audit_log`
```sql
CREATE TABLE venue_permission_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role_id UUID REFERENCES venue_roles(id) ON DELETE SET NULL,
  permission_id UUID REFERENCES venue_permissions(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB,
  ip_address INET,
  user_agent TEXT
);
```

## 🔧 Service Layer

### **VenueRolesPermissionsService**

The service provides comprehensive methods for managing roles and permissions:

#### **Role Management**
```typescript
// Get all roles for a venue
static async getVenueRoles(venueId: string): Promise<VenueRole[]>

// Create a new role
static async createVenueRole(roleData: CreateVenueRoleData): Promise<VenueRole>

// Update a role
static async updateVenueRole(roleId: string, updates: UpdateVenueRoleData): Promise<VenueRole>

// Delete a role (soft delete)
static async deleteVenueRole(roleId: string): Promise<void>
```

#### **Permission Management**
```typescript
// Get all system permissions
static async getSystemPermissions(): Promise<VenuePermission[]>

// Get permissions by category
static async getPermissionsByCategory(category: string): Promise<VenuePermission[]>
```

#### **Role-Permission Assignments**
```typescript
// Get role with its permissions
static async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null>

// Assign permissions to a role
static async assignPermissionsToRole(roleId: string, permissionIds: string[], grantedBy: string): Promise<void>

// Remove permissions from a role
static async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void>
```

#### **User-Role Assignments**
```typescript
// Get user roles for a venue
static async getUserRoles(venueId: string, userId: string): Promise<VenueUserRole[]>

// Assign a role to a user
static async assignUserRole(assignmentData: AssignUserRoleData, assignedBy: string): Promise<VenueUserRole>

// Remove a role from a user
static async removeUserRole(venueId: string, userId: string, roleId: string): Promise<void>

// Get all users with their roles for a venue
static async getUsersWithRoles(venueId: string): Promise<UserWithRoles[]>
```

#### **Permission Checking**
```typescript
// Check if a user has a specific permission
static async userHasPermission(venueId: string, userId: string, permissionName: PermissionName): Promise<boolean>

// Get all permissions for a user at a venue
static async getUserPermissions(venueId: string, userId: string): Promise<PermissionName[]>

// Get comprehensive user permissions data
static async getUserPermissionsData(venueId: string, userId: string): Promise<UserPermissions>
```

## 🎨 UI Components

### **RoleManagement Component**
- **Role Creation Dialog** - Multi-step form with permission selection
- **Role Grid** - Display all roles with edit/delete actions
- **Permission Categories** - Organized by tabs for easy selection
- **Role Level Indicators** - Visual hierarchy representation

### **UserRoleAssignment Component**
- **User Search** - Find users by ID or role
- **Role Assignment Dialog** - Assign roles with expiration and notes
- **Assignment Management** - View and remove role assignments
- **Permission Overview** - See all permissions for each user

### **Main Page Integration**
- **Tabbed Interface** - Separate tabs for roles and assignments
- **Statistics Dashboard** - Quick overview of system usage
- **Best Practices Guide** - Security recommendations
- **Information Cards** - Role levels and permission categories

## 🔌 API Endpoints

### **Roles Management**
```typescript
// GET /api/venue/roles?venueId={venueId}
// Returns all roles for a venue

// POST /api/venue/roles
// Creates a new role with permissions
{
  venueId: string
  roleName: string
  roleDescription?: string
  roleLevel: number
  permissions: string[]
}
```

### **User Role Assignment**
```typescript
// GET /api/venue/user-roles?venueId={venueId}&userId={userId}?
// Returns user roles (specific user or all users)

// POST /api/venue/user-roles
// Assigns a role to a user
{
  venueId: string
  userId: string
  roleId: string
  expiresAt?: string
  notes?: string
}
```

### **Permissions**
```typescript
// GET /api/venue/permissions?category={category}&venueId={venueId}&userId={userId}
// Returns permissions (by category, user permissions, or all system permissions)
```

## 🛡️ Security Implementation

### **Row Level Security (RLS)**
All tables have comprehensive RLS policies:

```sql
-- Venue owners can manage their roles
CREATE POLICY "Venue owners can manage their roles"
  ON venue_roles FOR ALL
  USING (venue_id IN (SELECT id FROM venue_profiles WHERE user_id = auth.uid()));

-- Staff can view roles for their venue
CREATE POLICY "Staff can view roles for their venue"
  ON venue_roles FOR SELECT
  USING (venue_id IN (SELECT venue_id FROM venue_team_members WHERE user_id = auth.uid()));
```

### **Permission Checking Functions**
```sql
-- Check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  user_uuid UUID,
  venue_uuid UUID,
  permission_name TEXT
) RETURNS BOOLEAN

-- Get all user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(
  user_uuid UUID,
  venue_uuid UUID
) RETURNS TABLE(permission_name TEXT, permission_category TEXT)
```

### **Audit Logging**
All permission changes are automatically logged:
- Role assignments/removals
- Permission grants/denials
- Override additions/removals
- IP address and user agent tracking

## 📊 Default System Roles

### **Pre-defined Roles**
1. **Venue Owner** (Level 5) - Full access to all features
2. **Venue Manager** (Level 4) - Comprehensive management permissions
3. **Event Coordinator** (Level 3) - Event and booking management
4. **Staff Supervisor** (Level 3) - Staff and performance management
5. **FOH Manager** (Level 3) - Front-of-house operations
6. **Technical Manager** (Level 3) - Technical operations
7. **Security Manager** (Level 3) - Security operations
8. **Bar Manager** (Level 3) - Bar operations
9. **Kitchen Manager** (Level 3) - Kitchen operations
10. **Senior Staff** (Level 2) - Enhanced staff permissions
11. **Staff Member** (Level 1) - Basic staff permissions
12. **Temporary Staff** (Level 1) - Temporary access
13. **Viewer** (Level 1) - Read-only access

### **Permission Sets**
Each role comes with a carefully curated set of permissions based on their responsibilities and access needs.

## 🚀 Usage Examples

### **Creating a Custom Role**
```typescript
// Create a new role
const newRole = await VenueRolesPermissionsService.createVenueRole({
  venue_id: 'venue-uuid',
  role_name: 'Event Specialist',
  role_description: 'Specialized role for event coordination',
  role_level: 3,
  is_system_role: false,
  created_by: 'user-uuid'
});

// Assign permissions
await VenueRolesPermissionsService.assignPermissionsToRole(
  newRole.id,
  ['events.view', 'events.create', 'events.edit', 'bookings.view'],
  'user-uuid'
);
```

### **Assigning a Role to a User**
```typescript
// Assign role to user
const userRole = await VenueRolesPermissionsService.assignUserRole({
  venue_id: 'venue-uuid',
  user_id: 'user-uuid',
  role_id: 'role-uuid',
  expires_at: '2024-12-31T23:59:59Z',
  notes: 'Temporary assignment for summer events'
}, 'admin-uuid');
```

### **Checking User Permissions**
```typescript
// Check specific permission
const hasPermission = await VenueRolesPermissionsService.userHasPermission(
  'venue-uuid',
  'user-uuid',
  'events.create'
);

// Get all user permissions
const permissions = await VenueRolesPermissionsService.getUserPermissions(
  'venue-uuid',
  'user-uuid'
);
```

## 🔄 Migration Instructions

### **1. Run Database Migration**
Execute the migration file in your Supabase dashboard:
```sql
-- Copy and paste the contents of 20250121000000_enhanced_roles_permissions.sql
-- into your Supabase SQL Editor and run it
```

### **2. Verify Migration Success**
Check that all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'venue_%'
AND table_name IN ('venue_roles', 'venue_permissions', 'venue_role_permissions', 'venue_user_roles', 'venue_user_permission_overrides', 'venue_permission_audit_log');
```

### **3. Create Default Roles**
The migration automatically creates default roles for existing venues:
```sql
-- This is handled automatically by the migration
SELECT * FROM venue_roles WHERE is_system_role = true;
```

## 🎯 Next Steps

The Roles & Permissions system is now complete and ready for integration with:

1. **📆 Scheduling & Shifts** - Role-based access to scheduling features
2. **✅ Availability & Time Off** - Permission-based time-off management
3. **⏱️ Check-In / Check-Out** - Role-based access to check-in systems
4. **💵 Payroll & Compensation** - Permission-based payroll access
5. **📬 Communication & Messaging** - Role-based messaging permissions

## 🔧 Configuration

### **Environment Variables**
No additional environment variables are required. The system uses existing Supabase configuration.

### **Customization**
- **Permission Categories** - Add new categories in the migration
- **Role Levels** - Modify the role level system in the types
- **Default Roles** - Customize default roles in the migration
- **UI Theming** - Modify component styling to match your design system

## 📈 Performance Considerations

- **Indexes** - All tables have appropriate indexes for performance
- **Caching** - Consider implementing Redis caching for frequently accessed permissions
- **Pagination** - Large user lists should implement pagination
- **Real-time Updates** - Consider Supabase real-time for live permission changes

## 🛠️ Troubleshooting

### **Common Issues**
1. **Permission Denied** - Check RLS policies and user permissions
2. **Role Not Found** - Verify role exists and is active
3. **Duplicate Role** - Role names must be unique per venue
4. **Expired Permissions** - Check expiration dates on role assignments

### **Debug Queries**
```sql
-- Check user permissions
SELECT * FROM get_user_permissions('user-uuid', 'venue-uuid');

-- Check role assignments
SELECT * FROM venue_user_roles WHERE user_id = 'user-uuid' AND venue_id = 'venue-uuid';

-- Check audit log
SELECT * FROM venue_permission_audit_log WHERE venue_id = 'venue-uuid' ORDER BY performed_at DESC LIMIT 10;
```

---

This comprehensive roles and permissions system provides the foundation for secure, scalable venue staff management with fine-grained access control and complete audit trails. 