# Notification System Deployment Guide

## 🚀 Quick Start

Follow these steps to deploy the notification system without errors:

### 1. Run Dependencies Migration First

**IMPORTANT**: Run this migration first to fix dependency issues:

```sql
-- Copy and paste this into your Supabase SQL editor:
\i supabase/migrations/20250122000001_fix_notification_system_dependencies.sql
```

This migration ensures all required functions and triggers exist before setting up the notification system.

### 2. Run the Main Notification System Migration

After the dependencies are fixed, run the main notification system:

```sql
-- Copy and paste this into your Supabase SQL editor:
\i supabase/migrations/20250122000000_enhanced_notification_system.sql
```

## 🔧 What Each Migration Does

### Dependencies Migration (`20250122000001_fix_notification_system_dependencies.sql`)

This migration fixes the `refresh_account_display_info(uuid)` function error by:

- ✅ Creating the missing `refresh_account_display_info()` function
- ✅ Creating the missing `trigger_refresh_account_info()` function  
- ✅ Ensuring the `accounts` table exists with proper structure
- ✅ Adding the `unread_notifications` column to the `profiles` table
- ✅ Creating all necessary indexes

### Main Notification System Migration (`20250122000000_enhanced_notification_system.sql`)

This migration sets up the complete notification system:

- ✅ Enhanced `notifications` table with 20+ notification types
- ✅ `notification_preferences` table for user settings
- ✅ `notification_templates` table for consistent messaging
- ✅ `notification_delivery_log` table for tracking delivery
- ✅ `notification_batches` table for digest emails
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers for notification counts
- ✅ Default notification templates
- ✅ Sample data for testing

## 🐛 Troubleshooting

### Error: "function refresh_account_display_info(uuid) does not exist"

**Cause**: The notification system migration is trying to run before the account system functions are created.

**Solution**: 
1. Run the dependencies migration first: `20250122000001_fix_notification_system_dependencies.sql`
2. Then run the main notification system: `20250122000000_enhanced_notification_system.sql`

### Error: "column unread_notifications does not exist"

**Cause**: The `profiles` table doesn't have the required column.

**Solution**: The dependencies migration will automatically add this column.

### Error: "table accounts does not exist"

**Cause**: The account system tables haven't been created yet.

**Solution**: The dependencies migration will create the `accounts` table if it doesn't exist.

## 📋 Migration Order

For a complete setup, run migrations in this order:

1. **Base Tables** (if not already run):
   ```sql
   \i supabase/migrations/20240501000000_create_base_tables.sql
   ```

2. **Unified Account System** (if not already run):
   ```sql
   \i supabase/migrations/20250112000001_unified_account_system.sql
   ```

3. **Notification Dependencies** (NEW):
   ```sql
   \i supabase/migrations/20250122000001_fix_notification_system_dependencies.sql
   ```

4. **Enhanced Notification System** (NEW):
   ```sql
   \i supabase/migrations/20250122000000_enhanced_notification_system.sql
   ```

## ✅ Verification

After running both migrations, verify the setup:

```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('refresh_account_display_info', 'trigger_refresh_account_info');

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('notifications', 'notification_preferences', 'notification_templates');

-- Check if profiles table has the new column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'unread_notifications';
```

## 🎯 Next Steps

After successful migration:

1. **Add the Notification Bell to your layout**:
   ```tsx
   import { NotificationBell } from "@/components/notifications/notification-bell"
   
   // Add to your header/navigation
   <NotificationBell />
   ```

2. **Test the system**:
   ```typescript
   // Create test notifications
   await fetch('/api/notifications/test', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${token}` },
     body: JSON.stringify({ type: 'all' })
   })
   ```

3. **Create real notifications**:
   ```typescript
   import { NotificationService } from "@/lib/services/notification-service"
   
   await NotificationService.sendLikeNotification(
     userId, 
     likedByUserId, 
     contentId, 
     contentType, 
     contentTitle
   )
   ```

## 🔄 Rollback (If Needed)

If you need to rollback the notification system:

```sql
-- Drop notification tables
DROP TABLE IF EXISTS notification_batches CASCADE;
DROP TABLE IF EXISTS notification_delivery_log CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Remove unread_notifications column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS unread_notifications;

-- Drop notification functions
DROP FUNCTION IF EXISTS update_notification_count() CASCADE;
DROP FUNCTION IF EXISTS create_notification_preferences() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_notifications() CASCADE;
```

## 📞 Support

If you encounter any issues:

1. Check the migration logs in Supabase
2. Verify all functions exist using the verification queries above
3. Ensure migrations are run in the correct order
4. Check that your Supabase project has the necessary permissions

The notification system is designed to be robust and handle edge cases gracefully. The dependency migration ensures compatibility with existing systems. 