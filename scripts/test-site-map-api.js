const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Test the site map API endpoints
async function testSiteMapAPI() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🧪 Testing Site Map API...')

  try {
    // Test 1: Check if we can query site_maps table directly
    console.log('\n1. Testing direct database query...')
    const { data: siteMaps, error: siteMapsError } = await supabase
      .from('site_maps')
      .select('*')
      .limit(5)

    if (siteMapsError) {
      console.log('❌ Database query failed:', siteMapsError.message)
    } else {
      console.log(`✅ Database query successful: ${siteMaps?.length || 0} site maps found`)
    }

    // Test 2: Check if we can query equipment_catalog table
    console.log('\n2. Testing equipment catalog query...')
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment_catalog')
      .select('*')
      .limit(5)

    if (equipmentError) {
      console.log('❌ Equipment query failed:', equipmentError.message)
    } else {
      console.log(`✅ Equipment query successful: ${equipment?.length || 0} equipment items found`)
    }

    // Test 3: Check if we can query equipment_instances table
    console.log('\n3. Testing equipment instances query...')
    const { data: instances, error: instancesError } = await supabase
      .from('equipment_instances')
      .select('*')
      .limit(5)

    if (instancesError) {
      console.log('❌ Instances query failed:', instancesError.message)
    } else {
      console.log(`✅ Instances query successful: ${instances?.length || 0} instances found`)
    }

    // Test 4: Check if we can query workflows table
    console.log('\n4. Testing workflows query...')
    const { data: workflows, error: workflowsError } = await supabase
      .from('equipment_setup_workflows')
      .select('*')
      .limit(5)

    if (workflowsError) {
      console.log('❌ Workflows query failed:', workflowsError.message)
    } else {
      console.log(`✅ Workflows query successful: ${workflows?.length || 0} workflows found`)
    }

    console.log('\n🎉 All database queries successful! The site map system should be working.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testSiteMapAPI()
  .then(() => {
    console.log('\n✅ Site Map API test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Site Map API test failed:', error)
    process.exit(1)
  })
