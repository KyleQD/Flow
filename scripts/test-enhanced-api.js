const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testEnhancedAPI() {
  console.log('🧪 Testing Enhanced Site Map API Endpoints...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test 1: Check if new tables exist
    console.log('\n📊 Testing table existence...')
    
    const tables = [
      'map_layers',
      'map_versions', 
      'equipment_qr_codes',
      'map_task_assignments',
      'map_measurements',
      'map_templates',
      'map_issues'
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error && error.code === 'PGRST116') {
          console.log(`❌ Table ${table} does not exist`)
        } else {
          console.log(`✅ Table ${table} exists`)
        }
      } catch (err) {
        console.log(`❌ Error checking table ${table}:`, err.message)
      }
    }
    
    // Test 2: Check if site_maps table exists and has data
    console.log('\n📋 Testing site_maps table...')
    const { data: siteMaps, error: siteMapsError } = await supabase
      .from('site_maps')
      .select('*')
      .limit(5)
    
    if (siteMapsError) {
      console.log('❌ Error accessing site_maps table:', siteMapsError.message)
    } else {
      console.log(`✅ site_maps table accessible, found ${siteMaps?.length || 0} records`)
    }
    
    // Test 3: Check if equipment_catalog table exists
    console.log('\n🔧 Testing equipment_catalog table...')
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment_catalog')
      .select('*')
      .limit(5)
    
    if (equipmentError) {
      console.log('❌ Error accessing equipment_catalog table:', equipmentError.message)
    } else {
      console.log(`✅ equipment_catalog table accessible, found ${equipment?.length || 0} records`)
    }
    
    console.log('\n🎯 Summary:')
    console.log('- If all tables show ✅, the migration was successful')
    console.log('- If any tables show ❌, you need to apply the migration manually')
    console.log('- Check the manual-migration-instructions.md file for details')
    
  } catch (error) {
    console.error('❌ Error testing API:', error)
  }
}

testEnhancedAPI()
