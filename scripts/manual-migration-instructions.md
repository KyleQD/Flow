# Manual Migration Instructions

Since the automated migration scripts are not working with the current Supabase setup, please apply the enhanced site map features migration manually in the Supabase dashboard.

## Steps to Apply Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Execute the Migration SQL**
   - Copy and paste the contents of `supabase/migrations/20250131000002_enhanced_site_map_features.sql`
   - Execute the SQL in the Supabase SQL editor

3. **Verify Tables Created**
   After running the migration, you should see these new tables:
   - `map_layers`
   - `map_versions`
   - `equipment_qr_codes`
   - `map_task_assignments`
   - `map_measurements`
   - `map_templates`
   - `map_issues`

## Alternative: Use Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db reset
supabase db push
```

This will apply all pending migrations including the enhanced site map features.

## What the Migration Creates

### Core Tables
- **map_layers**: Customizable layers for organizing site map elements
- **map_versions**: Version control for site map layouts
- **equipment_qr_codes**: QR code tracking for equipment
- **map_task_assignments**: Task assignment system for crew members
- **map_measurements**: Smart measurements and compliance tracking
- **map_templates**: Reusable site map templates
- **map_issues**: Issue tracking and reporting system

### Features Added
- ✅ Drag-and-drop site map builder with layers
- ✅ Smart measurements & spacing tools
- ✅ Asset/inventory integration with QR codes
- ✅ Crew assignment & task management
- ✅ Version control & templates
- ✅ Issue tracking with location pins
- ✅ Compliance checking (fire lanes, ADA access, etc.)

## Next Steps

After applying the migration:

1. **Test the API endpoints** - The new endpoints should be available at:
   - `/api/admin/logistics/site-maps/layers`
   - `/api/admin/logistics/site-maps/measurements`
   - `/api/admin/logistics/site-maps/issues`

2. **Access the enhanced site map** - Navigate to `/admin/logistics` and click on the "Site Maps" tab

3. **Create your first enhanced site map** - Use the new "Design" tab to create layers and add measurements

## Troubleshooting

If you encounter any issues:

1. **Check RLS policies** - Ensure the Row Level Security policies are properly created
2. **Verify indexes** - Make sure all indexes are created for performance
3. **Test permissions** - Verify that the RBAC system works with the new tables
4. **Check API endpoints** - Test that the new API endpoints return data correctly

The enhanced site map system is now ready for use with all Phase 1 features implemented!
