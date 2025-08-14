#!/bin/bash

echo "🚀 Running Logistics System Database Migrations..."
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/migrations/20250131000000_backline_rentals_system.sql" ]; then
    echo "❌ Error: Migration files not found. Please run this script from the project root directory."
    exit 1
fi

echo "📋 Available migrations to run:"
echo "1. Logistics Tasks Core (20250813094500_logistics_tasks.sql)"
echo "2. Backline & Rentals System (20250131000000_backline_rentals_system.sql)"
echo "3. Comprehensive Lodging System (20250131000001_comprehensive_lodging_system.sql)"
echo "4. Advanced Travel Coordination (20250131000002_advanced_travel_coordination.sql)"
echo ""

echo "⚠️  IMPORTANT: These migrations need to be run manually in your Supabase dashboard."
echo ""
echo "📝 Instructions:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste each migration file content"
echo "4. Run them in order (1, 2, 3)"
echo ""

echo "🔗 Migration files location:"
echo "- supabase/migrations/20250813094500_logistics_tasks.sql"
echo "- supabase/migrations/20250131000000_backline_rentals_system.sql"
echo "- supabase/migrations/20250131000001_comprehensive_lodging_system.sql"
echo "- supabase/migrations/20250131000002_advanced_travel_coordination.sql"
echo ""

echo "✅ After running the migrations, the logistics dashboard should work without 500 errors."
echo ""

read -p "Press Enter to continue..." 