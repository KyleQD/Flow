# Supabase Migrations

This folder contains SQL migrations for the Tourify application.

## Required Tables

The application requires the following tables:

1. `profiles` - Stores user profile information including their role
2. `onboarding` - Stores user onboarding responses

## Manual Migration Instructions

If you're not using the Supabase CLI, you can apply these migrations manually:

1. Go to the Supabase dashboard
2. Select your project
3. Go to the SQL Editor
4. Copy and paste each migration file in sequence
5. Run the SQL commands

## Migration Files

- `20230101000000_onboarding_table.sql` - Creates the onboarding table with RLS policies
- `20230101000001_ensure_profiles.sql` - Ensures the profiles table exists with the correct structure

## Troubleshooting

If users are having trouble with authentication or onboarding:

1. Check that the migrations have been applied successfully
2. Verify that the tables exist and have the correct structure
3. Make sure the RLS policies are allowing the necessary operations
4. Clear browser cookies/cache if users are stuck in a redirect loop 