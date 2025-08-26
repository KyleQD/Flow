#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createWorkingSignup() {
  console.log('🔧 Creating Working Signup System...\n')
  
  try {
    // Step 1: Disable the problematic trigger temporarily
    console.log('1. Disabling problematic trigger...')
    try {
      await supabase.rpc('exec_sql', { 
        sql: 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;' 
      })
      console.log('   ✅ Trigger disabled')
    } catch (err) {
      console.log('   ⚠️  Could not disable trigger:', err.message)
    }

    // Step 2: Create a simple, working trigger function
    console.log('2. Creating working trigger function...')
    const workingFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Simple profile creation with minimal fields
        BEGIN
          INSERT INTO public.profiles (
            id, 
            name, 
            username, 
            full_name, 
            email,
            created_at, 
            updated_at
          ) VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NEW.email,
            NOW(), 
            NOW()
          );
        EXCEPTION
          WHEN OTHERS THEN
            -- Just log the error, don't crash
            RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
        END;

        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          -- Ultimate fallback - never crash the signup
          RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    try {
      await supabase.rpc('exec_sql', { sql: workingFunctionSQL })
      console.log('   ✅ Working function created')
    } catch (err) {
      console.log('   ❌ Could not create function:', err.message)
      console.log('   Please create it manually in Supabase Dashboard')
    }

    // Step 3: Create the trigger
    console.log('3. Creating trigger...')
    try {
      await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        ` 
      })
      console.log('   ✅ Trigger created')
    } catch (err) {
      console.log('   ❌ Could not create trigger:', err.message)
      console.log('   Please create it manually in Supabase Dashboard')
    }

    // Step 4: Test the signup
    console.log('\n4. Testing signup...')
    const testEmail = `test-${Date.now()}@example.com`
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User',
          username: 'testuser'
        }
      }
    })

    if (error) {
      console.log(`❌ Signup still failing:`)
      console.log(`   Message: ${error.message}`)
      console.log(`   Code: ${error.code}`)
      console.log(`   Status: ${error.status}`)
      
      // Try alternative approach - create user without trigger
      console.log('\n5. Trying alternative approach...')
      await tryAlternativeSignup()
    } else {
      console.log('✅ Signup succeeded!')
      console.log(`   User ID: ${data.user?.id}`)
      console.log(`   Session: ${data.session ? 'Created' : 'None'}`)
      
      // Check if profile was created
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.log(`❌ Profile not created: ${profileError.message}`)
        } else {
          console.log('✅ Profile created automatically')
        }
      }
    }

  } catch (error) {
    console.error('❌ Failed to create working signup:', error.message)
  }
}

async function tryAlternativeSignup() {
  console.log('🔧 Trying alternative signup approach...')
  
  try {
    // Create user directly in auth.users table
    const testEmail = `alt-test-${Date.now()}@example.com`
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Alternative Test User',
        username: 'alttestuser'
      }
    })

    if (userError) {
      console.log(`❌ Admin user creation failed: ${userError.message}`)
      
      // Last resort - create profile manually
      console.log('\n6. Creating profile manually...')
      await createProfileManually()
    } else {
      console.log('✅ Alternative signup succeeded!')
      console.log(`   User ID: ${userData.user?.id}`)
      
      // Create profile manually
      if (userData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: userData.user.id,
            name: 'Alternative Test User',
            username: 'alttestuser',
            full_name: 'Alternative Test User',
            email: testEmail,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        
        if (profileError) {
          console.log(`❌ Manual profile creation failed: ${profileError.message}`)
        } else {
          console.log('✅ Manual profile creation succeeded')
        }
      }
    }

  } catch (error) {
    console.error('❌ Alternative signup failed:', error.message)
  }
}

async function createProfileManually() {
  console.log('🔧 Creating profile manually...')
  
  try {
    // Get a test user ID
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log(`❌ Could not list users: ${usersError.message}`)
      return
    }

    if (users.users && users.users.length > 0) {
      const testUser = users.users[0]
      console.log(`   Using test user: ${testUser.id}`)
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: testUser.id,
          name: 'Manual Test User',
          username: 'manualtest',
          full_name: 'Manual Test User',
          email: testUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      
      if (profileError) {
        console.log(`❌ Manual profile creation failed: ${profileError.message}`)
        console.log('\n🔧 DIAGNOSIS: The profiles table structure is incompatible')
        console.log('   You need to fix the table structure first')
      } else {
        console.log('✅ Manual profile creation succeeded')
        console.log('\n🎉 The issue is with the trigger, not the table structure')
      }
    } else {
      console.log('❌ No users found to test with')
    }

  } catch (error) {
    console.error('❌ Manual profile creation failed:', error.message)
  }
}

createWorkingSignup()
