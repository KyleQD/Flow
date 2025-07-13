#!/usr/bin/env npx tsx
import { makeMasterAdmin } from '../lib/admin/make-master-admin'

async function main() {
  const email = process.argv[2] || 'kyleqdaley@gmail.com'
  
  console.log('🚀 Creating master admin account...')
  console.log(`📧 Target email: ${email}`)
  console.log('')
  
  const result = await makeMasterAdmin(email)
  
  if (result.success) {
    console.log('')
    console.log('🎉 Master admin account created successfully!')
    console.log('✅ The user now has full access to all platform features.')
    console.log('')
    console.log('Next steps:')
    console.log('1. Have the user log out and log back in')
    console.log('2. They should now see admin options in the interface')
    console.log('3. They can access /admin for admin dashboard')
    process.exit(0)
  } else {
    console.log('')
    console.log('❌ Failed to create master admin account')
    console.log('Error:', result.error)
    console.log('')
    console.log('Troubleshooting:')
    console.log('1. Make sure the user has signed up and confirmed their email')
    console.log('2. Check that SUPABASE_SERVICE_ROLE_KEY is set in environment')
    console.log('3. Verify the email address is correct')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
} 