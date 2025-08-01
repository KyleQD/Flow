#!/bin/bash

# Apply messaging system migration to Supabase database
# This script applies the messaging system tables and functions

echo "🚀 Applying messaging system migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ This doesn't appear to be a Supabase project. Please run from the project root."
    exit 1
fi

# Apply the migration
echo "📁 Applying migration: 0013_messaging_system.sql"

# Check if supabase directory exists
if [ ! -d "supabase/migrations" ]; then
    echo "❌ Supabase migrations directory not found. Please initialize Supabase first."
    exit 1
fi

# Copy migration to supabase directory
cp migrations/0013_messaging_system.sql supabase/migrations/

# Apply the migration
supabase db push --include-all

if [ $? -eq 0 ]; then
    echo "✅ Messaging system migration applied successfully!"
    echo ""
    echo "📋 The following tables and functions were created:"
    echo "   • conversations - Store conversation metadata"
    echo "   • messages - Store individual messages"
    echo "   • get_or_create_conversation() - Helper function"
    echo "   • update_conversation_last_message() - Trigger function"
    echo ""
    echo "🔒 Row Level Security (RLS) policies have been applied:"
    echo "   • Users can only view their own conversations"
    echo "   • Users can only send messages in conversations they participate in"
    echo "   • Real-time subscriptions are secured"
    echo ""
    echo "🔄 Real-time subscriptions are now active for:"
    echo "   • New messages"
    echo "   • Conversation updates"
    echo ""
    echo "🎉 Your messaging system is now ready to use!"
else
    echo "❌ Failed to apply migration. Please check the error above."
    exit 1
fi 