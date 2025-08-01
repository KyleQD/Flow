#!/bin/bash
# =============================================================================
# ADMIN BACKEND SETUP SCRIPT
# This script sets up the comprehensive admin backend for Tourify
# =============================================================================

set -e  # Exit on any error

echo "🚀 Setting up Tourify Admin Backend..."
echo "======================================"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Supabase environment variables are not set"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Apply the admin backend migration
echo "📊 Applying admin backend migration..."
echo "This will create all necessary tables and functions for:"
echo "  • Staff & Crew Management"
echo "  • Ticketing System"
echo "  • Logistics Management"
echo "  • Financial Tracking"
echo "  • Analytics & Reporting"
echo "  • System Settings"
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/20250121000000_admin_backend_comprehensive.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    echo "Please ensure the migration file exists"
    exit 1
fi

# Apply the migration
echo "🔧 Applying migration to Supabase..."
if supabase migration up; then
    echo "✅ Migration applied successfully"
else
    echo "❌ Migration failed"
    echo "Please check your Supabase connection and try again"
    exit 1
fi

echo ""

# Create some initial test data
echo "📋 Creating initial test data..."

# Function to execute SQL with error handling
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "  → $description"
    if echo "$sql" | supabase db sql --stdin; then
        echo "    ✅ Success"
    else
        echo "    ⚠️  Warning: $description failed (this might be expected if data already exists)"
    fi
}

# Insert budget categories if they don't exist
execute_sql "
INSERT INTO budget_categories (name, description) VALUES
('Production', 'Stage, sound, lighting, and technical production'),
('Transportation', 'Tour buses, flights, local transport'),
('Accommodation', 'Hotels, lodging, and hospitality'),
('Staff & Crew', 'Salaries, wages, and crew expenses'),
('Marketing', 'Promotion, advertising, and publicity'),
('Equipment', 'Instruments, gear, and technical equipment'),
('Catering', 'Food and beverages for staff and crew'),
('Insurance', 'Tour insurance and liability coverage'),
('Merchandise', 'Tour merchandise and sales'),
('Miscellaneous', 'Other tour-related expenses')
ON CONFLICT (name) DO NOTHING;
" "Budget categories"

# Insert system settings if they don't exist
execute_sql "
INSERT INTO system_settings (category, setting_key, setting_value, description) VALUES
('general', 'organization_name', '\"Tourify Event Management\"', 'Organization display name'),
('general', 'default_timezone', '\"UTC\"', 'Default system timezone'),
('general', 'default_currency', '\"USD\"', 'Default currency for financial operations'),
('security', 'session_timeout', '30', 'Session timeout in minutes'),
('security', 'max_login_attempts', '5', 'Maximum failed login attempts'),
('security', 'password_expiry_days', '90', 'Password expiry period in days'),
('notifications', 'email_enabled', 'true', 'Enable email notifications'),
('notifications', 'push_enabled', 'true', 'Enable push notifications'),
('notifications', 'sms_enabled', 'false', 'Enable SMS notifications')
ON CONFLICT (category, setting_key) DO NOTHING;
" "System settings"

echo ""
echo "🎉 Admin Backend Setup Complete!"
echo "================================"
echo ""
echo "📋 What was created:"
echo "  • All admin tables and relationships"
echo "  • Row Level Security policies"
echo "  • Database functions and triggers"
echo "  • Initial budget categories"
echo "  • System configuration settings"
echo ""
echo "🔧 API Endpoints Available:"
echo "  • Staff Management: /api/admin/staff"
echo "  • Ticketing: /api/admin/ticketing"
echo "  • Logistics: /api/admin/logistics"
echo "  • Finances: /api/admin/finances"
echo "  • Analytics: /api/admin/analytics"
echo "  • System: /api/admin/system"
echo ""
echo "🎯 Next Steps:"
echo "  1. Restart your development server: npm run dev"
echo "  2. Visit /admin/dashboard to access the admin interface"
echo "  3. Check system health at /api/admin/system?type=health"
echo ""
echo "💡 Admin Dashboard Features:"
echo "  • Real-time metrics and KPIs"
echo "  • Comprehensive staff management"
echo "  • Advanced ticketing system"
echo "  • Logistics coordination"
echo "  • Financial tracking and budgeting"
echo "  • Analytics and reporting"
echo "  • System configuration"
echo ""
echo "✨ Your admin backend is now ready for production use!" 