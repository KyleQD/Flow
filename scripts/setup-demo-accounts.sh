#!/bin/bash

# Setup Demo Accounts System
# This script initializes the demo accounts with full backend functionality

echo "🚀 Setting up Demo Accounts System..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "npm install -g supabase"
    exit 1
fi

# Run the demo accounts migration
echo "📊 Running demo accounts migration..."
supabase db push --file supabase/migrations/20250120200000_demo_accounts_system.sql

if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

echo "✅ Migration completed successfully"

# Seed the demo profiles
echo "👥 Seeding demo profiles..."
supabase db push --file supabase/seed-demo-accounts.sql

if [ $? -ne 0 ]; then
    echo "❌ Profile seeding failed"
    exit 1
fi

echo "✅ Demo profiles seeded successfully"

# Seed posts and content
echo "📝 Seeding posts and content..."
supabase db push --file supabase/seed-demo-posts-and-content.sql

if [ $? -ne 0 ]; then
    echo "❌ Content seeding failed"
    exit 1
fi

echo "✅ Posts and content seeded successfully"

echo ""
echo "🎉 Demo Accounts System setup complete!"
echo ""
echo "Demo accounts created:"
echo "  👤 General Users:"
echo "    - @musiclover_sarah (Sarah Chen)"
echo "    - @vegasvibes_mike (Mike Rodriguez) ✓"
echo "    - @festival_emma (Emma Thompson)"
echo ""
echo "  🏢 Venues:"
echo "    - @neon_lounge_lv (The Neon Lounge) ✓"
echo "    - @desert_sky_amphitheater (Desert Sky Amphitheater) ✓"
echo "    - @velvet_room_vegas (The Velvet Room) ✓"
echo ""
echo "  🎵 Artists:"
echo "    - @neon_pulse_official (Neon Pulse) ✓"
echo "    - @desert_rose_band (Desert Rose) ✓"
echo "    - @maya_soul_official (Maya Soul)"
echo ""
echo "✓ = Verified accounts"
echo ""
echo "🔍 You can now:"
echo "  - Search and discover profiles on /discover"
echo "  - View detailed profile information"
echo "  - Follow accounts and interact with posts"
echo "  - Browse events and music releases"
echo ""
echo "🌐 API Endpoints available:"
echo "  - GET /api/demo-accounts (search profiles)"
echo "  - GET /api/demo-accounts/posts (get posts)"
echo "  - GET /api/demo-accounts/events (get events)"
echo "  - GET /api/demo-accounts/music (get music releases)"
echo "" 