const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Check if site map tables exist
async function checkSiteMapTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔍 Checking for site map tables...')

  const tablesToCheck = [
    'site_maps',
    'site_map_zones', 
    'glamping_tents',
    'site_map_elements',
    'equipment_catalog',
    'equipment_instances',
    'equipment_setup_workflows',
    'equipment_setup_tasks',
    'power_distribution',
    'equipment_power_connections'
  ]

  const results = {}

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        results[table] = { exists: false, error: error.message }
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        results[table] = { exists: true, count: data?.length || 0 }
        console.log(`✅ ${table}: exists (${data?.length || 0} records)`)
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message }
      console.log(`❌ ${table}: ${err.message}`)
    }
  }

  console.log('\n📊 Summary:')
  const existingTables = Object.entries(results).filter(([_, result]) => result.exists)
  const missingTables = Object.entries(results).filter(([_, result]) => !result.exists)

  console.log(`✅ Existing tables: ${existingTables.length}`)
  console.log(`❌ Missing tables: ${missingTables.length}`)

  if (missingTables.length > 0) {
    console.log('\n🚨 Missing tables:')
    missingTables.forEach(([table, result]) => {
      console.log(`   - ${table}: ${result.error}`)
    })
    
    console.log('\n📝 To fix this, run the database migrations:')
    console.log('1. Go to your Supabase SQL Editor')
    console.log('2. Copy and paste the contents of scripts/step-by-step-migration.sql')
    console.log('3. Run the migration')
    console.log('4. Copy and paste the contents of scripts/step-by-step-policies.sql')
    console.log('5. Run the policies migration')
  } else {
    console.log('\n🎉 All site map tables exist! The vendor features should work correctly.')
  }

  return results
}

// Run the check
checkSiteMapTables()
  .then((results) => {
    const missingTables = Object.entries(results).filter(([_, result]) => !result.exists)
    process.exit(missingTables.length > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error('❌ Error checking tables:', error)
    process.exit(1)
  })
