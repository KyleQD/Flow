#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestData() {
  console.log('🎵 Creating Test Collaboration Data...\n')

  try {
    // 1. Create test collaboration projects
    console.log('1. Creating test collaboration projects...')
    
    const testProjects = [
      {
        name: 'Midnight Vibes EP',
        description: 'Collaborative EP with electronic and jazz fusion elements. Looking for talented musicians to bring this vision to life.',
        type: 'ep',
        genre: ['Electronic', 'Jazz', 'Fusion'],
        owner_id: '97b9e178-b65f-47a3-910e-550864a4568a', // Current user
        status: 'in_progress',
        start_date: '2024-01-01',
        target_completion: '2024-03-15',
        privacy: 'collaborators_only'
      },
      {
        name: 'Acoustic Sessions Vol. 1',
        description: 'Intimate acoustic recordings featuring singer-songwriter collaborations.',
        type: 'album',
        genre: ['Acoustic', 'Folk', 'Singer-Songwriter'],
        owner_id: '97b9e178-b65f-47a3-910e-550864a4568a',
        status: 'planning',
        start_date: '2024-02-01',
        target_completion: '2024-04-30',
        privacy: 'public'
      }
    ]

    for (const project of testProjects) {
      const { data, error } = await supabase
        .from('collaboration_projects')
        .insert(project)
        .select()

      if (error) {
        console.error(`   ❌ Error creating project "${project.name}":`, error.message)
      } else {
        console.log(`   ✅ Created project: "${project.name}"`)
      }
    }

    // 2. Create test collaboration jobs
    console.log('\n2. Creating test collaboration opportunities...')
    
    const testJobs = [
      {
        title: 'Vocalist Needed - R&B/Soul Track',
        description: 'Looking for a soulful vocalist with range and emotion for an R&B track. The song explores themes of love and resilience. Professional studio recording experience preferred.',
        job_type: 'collaboration',
        instruments_needed: ['Vocals', 'Harmonies'],
        required_genres: ['R&B', 'Soul'],
        payment_type: 'revenue_share',
        location_type: 'hybrid',
        location: 'Los Angeles, CA',
        required_experience: 'intermediate',
        deadline: '2024-03-01',
        posted_by: '97b9e178-b65f-47a3-910e-550864a4568a',
        status: 'active',
        collaboration_details: {
          project_timeline: '6 weeks',
          estimated_hours: '20-30 hours',
          collaboration_type: 'single',
          file_sharing_preferences: 'Google Drive',
          communication_preferences: 'Discord, Email'
        }
      },
      {
        title: 'Electronic Producer - Ambient Project',
        description: 'Seeking an electronic music producer skilled in ambient, downtempo, and atmospheric soundscapes. This is for a concept album exploring urban solitude.',
        job_type: 'collaboration',
        instruments_needed: ['Production', 'Sound Design', 'Synthesizers'],
        required_genres: ['Electronic', 'Ambient', 'Downtempo'],
        payment_type: 'paid',
        payment_amount: 1500,
        location_type: 'remote',
        location: 'Remote',
        required_experience: 'advanced',
        deadline: '2024-02-20',
        posted_by: '97b9e178-b65f-47a3-910e-550864a4568a',
        status: 'active',
        collaboration_details: {
          project_timeline: '8 weeks',
          estimated_hours: '60-80 hours',
          collaboration_type: 'album',
          file_sharing_preferences: 'Dropbox',
          communication_preferences: 'Slack, Video calls'
        }
      },
      {
        title: 'Guitarist for Indie Rock Band',
        description: 'Our indie rock band is looking for a lead guitarist to complete our lineup. We have gigs lined up and need someone committed to the vision.',
        job_type: 'collaboration',
        instruments_needed: ['Guitar', 'Lead Guitar'],
        required_genres: ['Indie Rock', 'Alternative', 'Post-Rock'],
        payment_type: 'revenue_share',
        location_type: 'in_person',
        location: 'Brooklyn, NY',
        required_experience: 'intermediate',
        deadline: '2024-02-10',
        posted_by: '97b9e178-b65f-47a3-910e-550864a4568a',
        status: 'active',
        collaboration_details: {
          project_timeline: 'Ongoing',
          estimated_hours: '10-15 hours/week',
          collaboration_type: 'band',
          file_sharing_preferences: 'Google Drive',
          communication_preferences: 'WhatsApp, In-person'
        }
      },
      {
        title: 'Hip-Hop Beat Collaboration',
        description: 'Producer looking to collaborate with other beat makers on a hip-hop project. Mixing boom-bap with modern trap elements.',
        job_type: 'collaboration',
        instruments_needed: ['Production', 'Beats', 'Mixing'],
        required_genres: ['Hip-Hop', 'Trap', 'Boom-Bap'],
        payment_type: 'revenue_share',
        location_type: 'remote',
        location: 'Remote',
        required_experience: 'intermediate',
        deadline: '2024-02-28',
        posted_by: '97b9e178-b65f-47a3-910e-550864a4568a',
        status: 'active',
        collaboration_details: {
          project_timeline: '4 weeks',
          estimated_hours: '15-25 hours',
          collaboration_type: 'ep',
          file_sharing_preferences: 'WeTransfer',
          communication_preferences: 'Instagram, Email'
        }
      }
    ]

    // First get a collaboration category ID
    const { data: categories } = await supabase
      .from('artist_job_categories')
      .select('id')
      .eq('name', 'Collaborations')
      .limit(1)

    if (!categories || categories.length === 0) {
      console.error('   ❌ Could not find Collaborations category')
      return
    }

    const categoryId = categories[0].id

    for (const job of testJobs) {
      const jobWithCategory = {
        ...job,
        category_id: categoryId,
        posted_by_type: 'artist',
        status: 'open'
      }

      const { data, error } = await supabase
        .from('artist_jobs')
        .insert(jobWithCategory)
        .select()

      if (error) {
        console.error(`   ❌ Error creating job "${job.title}":`, error.message)
      } else {
        console.log(`   ✅ Created collaboration: "${job.title}"`)
      }
    }

    // 3. Create storage bucket for project files
    console.log('\n3. Creating storage bucket for project files...')
    
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket('project-files', {
        public: false,
        fileSizeLimit: 52428800 // 50MB
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('   ❌ Error creating storage bucket:', bucketError.message)
    } else {
      console.log('   ✅ Project files storage bucket ready')
    }

    // 4. Test data summary
    console.log('\n📊 Test Data Summary:')
    
    const { data: projectsCount } = await supabase
      .from('collaboration_projects')
      .select('*', { count: 'exact', head: true })
    
    const { data: jobsCount } = await supabase
      .from('artist_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('job_type', 'collaboration')

    console.log(`   • Collaboration Projects: ${projectsCount?.length || 0}`)
    console.log(`   • Collaboration Jobs: ${jobsCount?.length || 0}`)

    console.log('\n🎉 Test data creation completed!')
    console.log('✨ You can now test the collaboration features with real data!')

  } catch (error) {
    console.error('\n❌ Error creating test data:', error)
  }
}

// Run the script
createTestData()