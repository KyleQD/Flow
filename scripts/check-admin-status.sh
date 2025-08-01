#!/bin/bash
# =============================================================================
# ADMIN SYSTEM STATUS CHECK
# This script checks the status of the admin backend system
# =============================================================================

set -e

echo "🔍 Checking Tourify Admin System Status..."
echo "=========================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""

# Check environment
echo "📊 Environment Check:"
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "  ✅ Supabase URL configured"
else
    echo "  ❌ Supabase URL not configured"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "  ✅ Supabase Anon Key configured"
else
    echo "  ❌ Supabase Anon Key not configured"
fi

echo ""

# Check if development server is running
echo "🖥️  Development Server Check:"
if curl -s http://localhost:3000 > /dev/null 2>&1 || curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "  ✅ Development server is running"
    SERVER_RUNNING=true
else
    echo "  ❌ Development server is not running"
    echo "     Run 'npm run dev' to start the server"
    SERVER_RUNNING=false
fi

echo ""

# Check database tables
echo "📋 Database Tables Check:"
check_table() {
    local table_name="$1"
    if echo "SELECT 1 FROM $table_name LIMIT 1;" | supabase db sql --stdin > /dev/null 2>&1; then
        echo "  ✅ $table_name table exists"
    else
        echo "  ❌ $table_name table missing"
    fi
}

# Check core admin tables
check_table "staff_profiles"
check_table "ticket_types"
check_table "transportation"
check_table "equipment"
check_table "budgets"
check_table "expenses"
check_table "revenue"
check_table "analytics_metrics"
check_table "system_settings"
check_table "integrations"
check_table "admin_audit_log"

echo ""

# Check API endpoints if server is running
if [ "$SERVER_RUNNING" = true ]; then
    echo "🔗 API Endpoints Check:"
    
    check_endpoint() {
        local endpoint="$1"
        local description="$2"
        local port=""
        
        # Try both ports
        for p in 3000 3001; do
            if curl -s "http://localhost:$p$endpoint" > /dev/null 2>&1; then
                port=$p
                break
            fi
        done
        
        if [ -n "$port" ]; then
            echo "  ✅ $description (http://localhost:$port$endpoint)"
        else
            echo "  ❌ $description not accessible"
        fi
    }
    
    check_endpoint "/api/admin/staff" "Staff Management API"
    check_endpoint "/api/admin/ticketing" "Ticketing API"
    check_endpoint "/api/admin/logistics" "Logistics API"
    check_endpoint "/api/admin/finances" "Finances API"
    check_endpoint "/api/admin/analytics" "Analytics API"
    check_endpoint "/api/admin/system" "System API"
    check_endpoint "/admin/dashboard" "Admin Dashboard"
fi

echo ""

# Check for required files
echo "📁 Required Files Check:"
check_file() {
    local file_path="$1"
    local description="$2"
    if [ -f "$file_path" ]; then
        echo "  ✅ $description"
    else
        echo "  ❌ $description missing"
    fi
}

check_file "types/admin.ts" "Admin TypeScript types"
check_file "app/api/admin/staff/route.ts" "Staff API endpoint"
check_file "app/api/admin/ticketing/route.ts" "Ticketing API endpoint"
check_file "app/api/admin/logistics/route.ts" "Logistics API endpoint"
check_file "app/api/admin/finances/route.ts" "Finances API endpoint"
check_file "app/api/admin/analytics/route.ts" "Analytics API endpoint"
check_file "app/api/admin/system/route.ts" "System API endpoint"
check_file "app/admin/dashboard/page.tsx" "Admin dashboard page"
check_file "supabase/migrations/20250121000000_admin_backend_comprehensive.sql" "Admin migration file"

echo ""

# System health summary
echo "🏥 System Health Summary:"
echo "========================"

# Count checks
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Environment (2 checks)
TOTAL_CHECKS=$((TOTAL_CHECKS + 2))
[ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))

# Server (1 check)
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
[ "$SERVER_RUNNING" = true ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))

# Calculate health percentage
HEALTH_PERCENT=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $HEALTH_PERCENT -eq 100 ]; then
    echo "🟢 System Status: HEALTHY ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
elif [ $HEALTH_PERCENT -ge 80 ]; then
    echo "🟡 System Status: GOOD ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
elif [ $HEALTH_PERCENT -ge 60 ]; then
    echo "🟠 System Status: DEGRADED ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
else
    echo "🔴 System Status: CRITICAL ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
fi

echo ""

# Recommendations
echo "💡 Recommendations:"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "  • Configure Supabase environment variables"
fi

if [ "$SERVER_RUNNING" = false ]; then
    echo "  • Start the development server: npm run dev"
fi

if [ $HEALTH_PERCENT -lt 100 ]; then
    echo "  • Run setup script: ./scripts/setup-admin-backend.sh"
    echo "  • Check Supabase connection and permissions"
fi

if [ $HEALTH_PERCENT -eq 100 ]; then
    echo "  ✨ Your admin system is running perfectly!"
    echo "  • Visit /admin/dashboard to access the admin interface"
    echo "  • Check /api/admin/system?type=health for detailed health status"
fi

echo ""
echo "🎯 Quick Links:"
echo "  • Admin Dashboard: http://localhost:3000/admin/dashboard"
echo "  • System Health API: http://localhost:3000/api/admin/system?type=health"
echo "  • Documentation: Check the README.md for admin features" 