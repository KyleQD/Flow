const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function applyMigration() {
  console.log('🚀 Applying enhanced site map features migration...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    console.log('📄 Creating map_layers table...')
    const { error: layersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS map_layers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          layer_type VARCHAR(100) NOT NULL CHECK (layer_type IN (
            'infrastructure', 'crew_zones', 'guest_areas', 'safety_zones', 
            'vip_areas', 'backstage', 'restricted', 'power', 'water', 'wifi', 'custom'
          )),
          color VARCHAR(7) DEFAULT '#3b82f6',
          opacity DECIMAL(3,2) DEFAULT 1.0,
          is_visible BOOLEAN DEFAULT true,
          is_locked BOOLEAN DEFAULT false,
          z_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (layersError) {
      console.error('❌ Error creating map_layers:', layersError)
      return
    }
    
    console.log('📄 Creating map_versions table...')
    const { error: versionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS map_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
          version_name VARCHAR(255) NOT NULL,
          description TEXT,
          version_number INTEGER NOT NULL,
          is_current BOOLEAN DEFAULT false,
          created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (versionsError) {
      console.error('❌ Error creating map_versions:', versionsError)
      return
    }
    
    console.log('📄 Creating equipment_qr_codes table...')
    const { error: qrError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS equipment_qr_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          equipment_instance_id UUID NOT NULL REFERENCES equipment_instances(id) ON DELETE CASCADE,
          qr_code VARCHAR(255) UNIQUE NOT NULL,
          qr_data JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_scanned TIMESTAMP WITH TIME ZONE,
          scan_count INTEGER DEFAULT 0,
          created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
        );
      `
    })
    
    if (qrError) {
      console.error('❌ Error creating equipment_qr_codes:', qrError)
      return
    }
    
    console.log('📄 Creating map_task_assignments table...')
    const { error: tasksError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS map_task_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
          element_id UUID NOT NULL,
          element_type VARCHAR(100) NOT NULL CHECK (element_type IN (
            'zone', 'tent', 'element', 'equipment_instance', 'power_distribution'
          )),
          assigned_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          task_type VARCHAR(100) NOT NULL,
          task_description TEXT,
          priority INTEGER DEFAULT 2,
          status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
            'pending', 'in_progress', 'completed', 'blocked', 'cancelled'
          )),
          scheduled_start_time TIMESTAMP WITH TIME ZONE,
          scheduled_end_time TIMESTAMP WITH TIME ZONE,
          actual_start_time TIMESTAMP WITH TIME ZONE,
          actual_end_time TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (tasksError) {
      console.error('❌ Error creating map_task_assignments:', tasksError)
      return
    }
    
    console.log('📄 Creating map_measurements table...')
    const { error: measurementsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS map_measurements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
          measurement_type VARCHAR(100) NOT NULL CHECK (measurement_type IN (
            'distance', 'area', 'clearance', 'fire_lane', 'ada_access', 'emergency_route'
          )),
          start_x INTEGER NOT NULL,
          start_y INTEGER NOT NULL,
          end_x INTEGER,
          end_y INTEGER,
          width INTEGER,
          height INTEGER,
          value DECIMAL(10,2),
          unit VARCHAR(20) DEFAULT 'meters',
          label VARCHAR(255),
          color VARCHAR(7) DEFAULT '#ff6b6b',
          is_compliant BOOLEAN DEFAULT true,
          compliance_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (measurementsError) {
      console.error('❌ Error creating map_measurements:', measurementsError)
      return
    }
    
    console.log('📄 Creating map_templates table...')
    const { error: templatesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS map_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL CHECK (category IN (
            'festival', 'concert', 'corporate', 'wedding', 'sports', 'exhibition', 'custom'
          )),
          template_data JSONB NOT NULL,
          is_public BOOLEAN DEFAULT false,
          created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (templatesError) {
      console.error('❌ Error creating map_templates:', templatesError)
      return
    }
    
    console.log('📄 Creating map_issues table...')
    const { error: issuesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS map_issues (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          site_map_id UUID NOT NULL REFERENCES site_maps(id) ON DELETE CASCADE,
          issue_type VARCHAR(100) NOT NULL CHECK (issue_type IN (
            'safety', 'maintenance', 'logistics', 'accessibility', 'compliance', 'other'
          )),
          severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          x INTEGER NOT NULL,
          y INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
            'open', 'in_progress', 'resolved', 'closed'
          )),
          assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
          reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
          photos TEXT[],
          notes TEXT,
          resolved_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (issuesError) {
      console.error('❌ Error creating map_issues:', issuesError)
      return
    }
    
    console.log('✅ All tables created successfully!')
    console.log('📊 Created tables:')
    console.log('  - map_layers')
    console.log('  - map_versions') 
    console.log('  - equipment_qr_codes')
    console.log('  - map_task_assignments')
    console.log('  - map_measurements')
    console.log('  - map_templates')
    console.log('  - map_issues')
    
    console.log('\n⚠️  Note: RLS policies and indexes need to be created manually in the Supabase dashboard.')
    console.log('   Please run the SQL from the migration file in the Supabase SQL editor.')
    
  } catch (error) {
    console.error('❌ Error applying migration:', error)
  }
}

applyMigration()
