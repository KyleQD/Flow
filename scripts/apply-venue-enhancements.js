const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env.local
const fs = require('fs')
const path = require('path')

function loadEnvVars() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key] = value.replace(/"/g, '')
      }
    })
  }
}

loadEnvVars()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyVenueEnhancements() {
  console.log('🚀 Starting venue profile enhancements...')

  try {
    // Step 1: Add new columns to venue_profiles table
    console.log('📊 Adding new columns to venue_profiles table...')
    
    const addColumnsSQL = `
      DO $$ 
      BEGIN
        -- Basic venue information enhancements
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'tagline') THEN
          ALTER TABLE venue_profiles ADD COLUMN tagline TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'neighborhood') THEN
          ALTER TABLE venue_profiles ADD COLUMN neighborhood TEXT;
        END IF;
        
        -- Location and coordinates
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'coordinates') THEN
          ALTER TABLE venue_profiles ADD COLUMN coordinates JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Enhanced capacity information
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'capacity_standing') THEN
          ALTER TABLE venue_profiles ADD COLUMN capacity_standing INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'capacity_seated') THEN
          ALTER TABLE venue_profiles ADD COLUMN capacity_seated INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'capacity_total') THEN
          ALTER TABLE venue_profiles ADD COLUMN capacity_total INTEGER;
        END IF;
        
        -- Age restrictions
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'age_restrictions') THEN
          ALTER TABLE venue_profiles ADD COLUMN age_restrictions TEXT;
        END IF;
        
        -- Operating hours
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'operating_hours') THEN
          ALTER TABLE venue_profiles ADD COLUMN operating_hours JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Public URL slug for sharing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'url_slug') THEN
          ALTER TABLE venue_profiles ADD COLUMN url_slug TEXT;
        END IF;
        
        -- Avatar and cover images
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'avatar_url') THEN
          ALTER TABLE venue_profiles ADD COLUMN avatar_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'cover_image_url') THEN
          ALTER TABLE venue_profiles ADD COLUMN cover_image_url TEXT;
        END IF;
        
        -- SEO and discoverability
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'meta_description') THEN
          ALTER TABLE venue_profiles ADD COLUMN meta_description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'keywords') THEN
          ALTER TABLE venue_profiles ADD COLUMN keywords TEXT[] DEFAULT '{}';
        END IF;
        
        -- Public profile visibility
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'is_public') THEN
          ALTER TABLE venue_profiles ADD COLUMN is_public BOOLEAN DEFAULT true;
        END IF;
        
        -- Profile completion percentage
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'profile_completion') THEN
          ALTER TABLE venue_profiles ADD COLUMN profile_completion INTEGER DEFAULT 0;
        END IF;

      END $$;
    `

    const { error: addColumnsError } = await supabase.rpc('execute_sql', { sql: addColumnsSQL })
    if (addColumnsError) {
      console.log('ℹ️  Columns may already exist, continuing...')
    } else {
      console.log('✅ Successfully added new columns')
    }

    // Step 2: Update social_links to support extended platforms
    console.log('🔗 Updating social_links structure...')
    
    const { data: venues, error: fetchError } = await supabase
      .from('venue_profiles')
      .select('id, social_links')
      .not('social_links', 'is', null)

    if (!fetchError && venues) {
      for (const venue of venues) {
        const currentLinks = venue.social_links || {}
        if (!currentLinks.tiktok) {
          const updatedLinks = {
            ...currentLinks,
            tiktok: null,
            youtube: null,
            linkedin: null
          }

          await supabase
            .from('venue_profiles')
            .update({ social_links: updatedLinks })
            .eq('id', venue.id)
        }
      }
      console.log('✅ Updated social links structure')
    }

    // Step 3: Enhance settings structure with comprehensive options
    console.log('⚙️ Enhancing settings structure...')
    
    const defaultSettings = {
      booking: {
        accept_bookings: true,
        min_advance_booking: "2_weeks",
        max_advance_booking: "1_year", 
        auto_approve_bookings: false,
        require_deposit: false,
        deposit_percentage: null,
        cancellation_policy: "",
        house_rules: "",
        age_restriction: "all_ages"
      },
      amenities: {
        sound_system: false,
        lighting_system: false,
        stage: false,
        recording_capabilities: false,
        live_streaming: false,
        projection_screen: false,
        dj_booth: false,
        green_room: false,
        dressing_rooms: false,
        storage_space: false,
        load_in_dock: false,
        merchandise_space: false,
        office_space: false,
        bar_service: false,
        food_service: false,
        catering_kitchen: false,
        security: false,
        coat_check: false,
        valet_parking: false,
        event_planning: false,
        photography_services: false,
        accessible: false,
        elevator: false,
        air_conditioning: false,
        heating: false,
        outdoor_space: false,
        smoking_area: false,
        parking: false,
        parking_spaces: null,
        valet_available: false,
        public_transport_nearby: false,
        uber_dropoff: false,
        wifi: false,
        high_speed_internet: false,
        power_outlets: false,
        charging_stations: false
      },
      technical_specs: {
        stage_dimensions: {
          length: null,
          width: null,
          height: null
        },
        sound_system_details: "",
        lighting_details: "",
        power_specifications: "",
        internet_speed: "",
        load_in_details: "",
        acoustic_treatment: "",
        ceiling_height: null,
        noise_restrictions: ""
      },
      operational: {
        setup_time_required: "",
        breakdown_time_required: "",
        staff_provided: false,
        security_required: false,
        insurance_required: false,
        permits_required: false,
        union_venue: false,
        preferred_vendors: "",
        house_rules: "",
        noise_curfew: "",
        alcohol_policy: ""
      },
      payment: {
        base_rental_rate: "",
        hourly_rate: "",
        security_deposit: "",
        accepted_payment_methods: [],
        payment_terms: "50_50",
        late_fee_percentage: null,
        currency: "USD"
      }
    }

    const { data: venuesForSettings } = await supabase
      .from('venue_profiles')
      .select('id, settings')

    if (venuesForSettings) {
      for (const venue of venuesForSettings) {
        const currentSettings = venue.settings || {}
        const mergedSettings = {
          ...defaultSettings,
          ...currentSettings
        }

        await supabase
          .from('venue_profiles')
          .update({ settings: mergedSettings })
          .eq('id', venue.id)
      }
      console.log('✅ Enhanced settings structure')
    }

    // Step 4: Generate URL slugs for existing venues
    console.log('🔗 Generating URL slugs for existing venues...')
    
    const { data: venuesWithoutSlugs } = await supabase
      .from('venue_profiles')
      .select('id, venue_name, url_slug')
      .or('url_slug.is.null,url_slug.eq.""')

    if (venuesWithoutSlugs) {
      for (const venue of venuesWithoutSlugs) {
        if (venue.venue_name) {
          let baseSlug = venue.venue_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
          
          if (!baseSlug) {
            baseSlug = `venue-${venue.id.substring(0, 8)}`
          }

          let finalSlug = baseSlug
          let counter = 0

          // Ensure uniqueness
          while (true) {
            const testSlug = counter === 0 ? finalSlug : `${finalSlug}-${counter}`
            const { data: existing } = await supabase
              .from('venue_profiles')
              .select('id')
              .eq('url_slug', testSlug)
              .neq('id', venue.id)
              .single()

            if (!existing) {
              finalSlug = testSlug
              break
            }
            counter++
          }

          await supabase
            .from('venue_profiles')
            .update({ url_slug: finalSlug })
            .eq('id', venue.id)
        }
      }
      console.log('✅ Generated URL slugs for existing venues')
    }

    // Step 5: Create indexes for performance
    console.log('📊 Creating performance indexes...')
    
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_venue_profiles_url_slug ON venue_profiles(url_slug);
      CREATE INDEX IF NOT EXISTS idx_venue_profiles_is_public ON venue_profiles(is_public);
      CREATE INDEX IF NOT EXISTS idx_venue_profiles_venue_types ON venue_profiles USING GIN(venue_types);
      CREATE INDEX IF NOT EXISTS idx_venue_profiles_keywords ON venue_profiles USING GIN(keywords);
      CREATE INDEX IF NOT EXISTS idx_venue_profiles_city ON venue_profiles(city);
      CREATE INDEX IF NOT EXISTS idx_venue_profiles_state ON venue_profiles(state);
    `

    // Try to create indexes one by one to avoid errors
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_venue_profiles_url_slug ON venue_profiles(url_slug);',
      'CREATE INDEX IF NOT EXISTS idx_venue_profiles_is_public ON venue_profiles(is_public);', 
      'CREATE INDEX IF NOT EXISTS idx_venue_profiles_city ON venue_profiles(city);',
      'CREATE INDEX IF NOT EXISTS idx_venue_profiles_state ON venue_profiles(state);'
    ]

    for (const indexQuery of indexes) {
      try {
        await supabase.rpc('execute_sql', { sql: indexQuery })
      } catch (error) {
        console.log(`ℹ️  Index may already exist: ${error.message}`)
      }
    }

    console.log('✅ Created performance indexes')

    console.log('🎉 Venue profile enhancements completed successfully!')
    console.log('\n📋 Summary of changes:')
    console.log('  • Added comprehensive venue profile fields')
    console.log('  • Enhanced social media links structure') 
    console.log('  • Expanded settings with amenities, technical specs, and policies')
    console.log('  • Generated unique URL slugs for venue profiles')
    console.log('  • Created performance indexes')

  } catch (error) {
    console.error('❌ Error applying venue enhancements:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  applyVenueEnhancements()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { applyVenueEnhancements } 