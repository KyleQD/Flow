#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupEnvironment() {
  console.log('🔧 Tourify Environment Setup')
  console.log('============================\n')
  
  console.log('This script will help you set up your environment variables for Tourify.')
  console.log('You can find your Supabase credentials in your Supabase dashboard:\n')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to Settings > API')
  console.log('4. Copy the Project URL and anon public key\n')

  const supabaseUrl = await question('Enter your Supabase Project URL: ')
  const supabaseAnonKey = await question('Enter your Supabase anon public key: ')
  const supabaseServiceKey = await question('Enter your Supabase service role key (optional): ')
  const nextAuthSecret = await question('Enter a random string for NEXTAUTH_SECRET (or press enter for auto-generated): ')

  // Generate a random secret if none provided
  const authSecret = nextAuthSecret || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  const envContent = `# Tourify Environment Configuration
# =====================================

# Core Application
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DOMAIN=http://localhost:3000
PORT=3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
${supabaseServiceKey ? `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}` : '# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here'}

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${authSecret}

# Development Mode Configuration
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_DEMO_DATA_ENABLED=false
NEXT_PUBLIC_DEMO_BANNER_ENABLED=false

# Performance & Caching
CACHE_TTL=1800
MAX_CONCURRENT_USERS=1000
NEXT_TELEMETRY_DISABLED=1

# Security
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_REQUESTS_PER_HOUR=1000
SESSION_SECRET=${authSecret}

# File Upload Configuration
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,video/mp4

# Feature Flags
ENABLE_REAL_TIME_CHAT=true
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_SOCIAL_SHARING=true
ENABLE_HEALTH_MONITORING=true
ENABLE_DEMO_TOUR=false
ENABLE_DEMO_RESET=false

# Development-specific settings
DEMO_SESSION_TIMEOUT=7200
DEMO_MAX_PROFILES=100
DEMO_MAX_POSTS=200
DEMO_MAX_EVENTS=50
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('\n✅ Environment file created successfully!')
    console.log(`📁 Location: ${envPath}`)
    console.log('\n🚀 Next steps:')
    console.log('1. Restart your development server')
    console.log('2. Try the signup process again')
    console.log('3. Check the browser console for any remaining issues')
    
    // Check if the keys look valid
    if (supabaseUrl.includes('your_') || supabaseAnonKey.includes('your_')) {
      console.log('\n⚠️  Warning: It looks like you might be using placeholder values.')
      console.log('Please make sure you copied the actual values from your Supabase dashboard.')
    }
    
  } catch (error) {
    console.error('\n❌ Error creating environment file:', error.message)
    console.log('\nPlease create the .env.local file manually with the following content:')
    console.log('\n' + envContent)
  }
  
  rl.close()
}

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!')
  const overwrite = await question('Do you want to overwrite it? (y/N): ')
  if (overwrite.toLowerCase() !== 'y') {
    console.log('Setup cancelled.')
    rl.close()
    process.exit(0)
  }
}

setupEnvironment().catch(console.error)
