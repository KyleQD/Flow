#!/usr/bin/env node

/**
 * COMPREHENSIVE MULTI-ACCOUNT SYSTEM TEST
 * Tests the complete scalable solution for multi-account posting
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key',
  TEST_USER_ID: 'bce15693-d2bf-42db-a2f2-68239568fafe', // Clive Malone
  TEST_ARTIST_NAME: 'Clive Malone',
  TEST_CONTENT: 'Testing comprehensive multi-account system! 🎉'
};

// Create Supabase client
const supabase = createClient(TEST_CONFIG.SUPABASE_URL, TEST_CONFIG.SUPABASE_SERVICE_KEY);

// Test helpers
const log = (message, data = null) => {
  console.log(`[TEST] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const error = (message, data = null) => {
  console.error(`[ERROR] ${message}`);
  if (data) console.error(JSON.stringify(data, null, 2));
};

const success = (message, data = null) => {
  console.log(`[SUCCESS] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

// Test functions
async function testDatabaseSchema() {
  log('Testing database schema...');
  
  try {
    // Test posts table schema
    const { data: postsColumns, error: postsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'posts');
    
    if (postsError) {
      error('Failed to get posts table schema:', postsError);
      return false;
    }
    
    const requiredColumns = [
      'id', 'user_id', 'content', 'type', 'visibility', 'location', 'hashtags', 
      'media_urls', 'posted_as_profile_id', 'posted_as_account_type',
      'account_display_name', 'account_username', 'account_avatar_url'
    ];
    
    const existingColumns = postsColumns.map(c => c.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      error('Missing required columns in posts table:', missingColumns);
      return false;
    }
    
    // Test user_accounts table
    const { data: accountsData, error: accountsError } = await supabase
      .from('user_accounts')
      .select('*')
      .limit(1);
    
    if (accountsError) {
      error('user_accounts table not found or accessible:', accountsError);
      return false;
    }
    
    success('Database schema is correct');
    return true;
    
  } catch (err) {
    error('Schema test failed:', err);
    return false;
  }
}

async function testAccountFunctions() {
  log('Testing account management functions...');
  
  try {
    // Test get_or_create_account for artist
    const { data: artistAccount, error: artistError } = await supabase
      .rpc('get_or_create_account', {
        p_user_id: TEST_CONFIG.TEST_USER_ID,
        p_account_type: 'artist',
        p_profile_id: null
      });
    
    if (artistError) {
      error('Failed to get artist account:', artistError);
      return false;
    }
    
    if (!artistAccount || artistAccount.length === 0) {
      error('No artist account data returned');
      return false;
    }
    
    const artist = artistAccount[0];
    if (artist.display_name !== TEST_CONFIG.TEST_ARTIST_NAME) {
      error(`Expected artist name "${TEST_CONFIG.TEST_ARTIST_NAME}", got "${artist.display_name}"`);
      return false;
    }
    
    // Test get_or_create_account for primary
    const { data: primaryAccount, error: primaryError } = await supabase
      .rpc('get_or_create_account', {
        p_user_id: TEST_CONFIG.TEST_USER_ID,
        p_account_type: 'primary',
        p_profile_id: null
      });
    
    if (primaryError) {
      error('Failed to get primary account:', primaryError);
      return false;
    }
    
    success('Account functions working correctly');
    return true;
    
  } catch (err) {
    error('Account functions test failed:', err);
    return false;
  }
}

async function testPostCreation() {
  log('Testing post creation API...');
  
  try {
    // Create a test post as artist
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/posts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: TEST_CONFIG.TEST_CONTENT,
        type: 'text',
        visibility: 'public',
        posted_as: 'artist',
        userId: TEST_CONFIG.TEST_USER_ID
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      error(`Post creation failed with status ${response.status}:`, errorData);
      return false;
    }
    
    const result = await response.json();
    
    if (!result.success) {
      error('Post creation returned success: false', result);
      return false;
    }
    
    const post = result.post;
    
    // Verify post data
    const checks = [
      { field: 'content', expected: TEST_CONFIG.TEST_CONTENT, actual: post.content },
      { field: 'user_id', expected: TEST_CONFIG.TEST_USER_ID, actual: post.user_id },
      { field: 'posted_as_account_type', expected: 'artist', actual: post.posted_as_account_type },
      { field: 'account_display_name', expected: TEST_CONFIG.TEST_ARTIST_NAME, actual: post.account_display_name },
      { field: 'type', expected: 'text', actual: post.type },
      { field: 'visibility', expected: 'public', actual: post.visibility }
    ];
    
    for (const check of checks) {
      if (check.actual !== check.expected) {
        error(`Post ${check.field} mismatch. Expected: "${check.expected}", Got: "${check.actual}"`);
        return false;
      }
    }
    
    success('Post creation API working correctly', {
      postId: post.id,
      accountName: post.account_display_name,
      accountType: post.posted_as_account_type
    });
    
    return { success: true, postId: post.id };
    
  } catch (err) {
    error('Post creation test failed:', err);
    return false;
  }
}

async function testFeedAPI() {
  log('Testing feed API...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/feed/posts?type=all&limit=10`);
    
    if (!response.ok) {
      const errorData = await response.text();
      error(`Feed API failed with status ${response.status}:`, errorData);
      return false;
    }
    
    const result = await response.json();
    
    if (!result.data || !Array.isArray(result.data)) {
      error('Feed API did not return data array', result);
      return false;
    }
    
    const posts = result.data;
    
    // Find artist posts
    const artistPosts = posts.filter(p => p.posted_as_account_type === 'artist');
    
    if (artistPosts.length === 0) {
      error('No artist posts found in feed');
      return false;
    }
    
    // Check if artist posts display correctly
    const artistPost = artistPosts[0];
    if (artistPost.profiles.full_name !== TEST_CONFIG.TEST_ARTIST_NAME) {
      error(`Artist post shows wrong name. Expected: "${TEST_CONFIG.TEST_ARTIST_NAME}", Got: "${artistPost.profiles.full_name}"`);
      return false;
    }
    
    success('Feed API working correctly', {
      totalPosts: posts.length,
      artistPosts: artistPosts.length,
      artistName: artistPost.profiles.full_name
    });
    
    return true;
    
  } catch (err) {
    error('Feed API test failed:', err);
    return false;
  }
}

async function testDataConsistency() {
  log('Testing data consistency...');
  
  try {
    // Get posts from database directly
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id, user_id, content, posted_as_account_type, 
        account_display_name, posted_as_profile_id
      `)
      .eq('user_id', TEST_CONFIG.TEST_USER_ID)
      .eq('posted_as_account_type', 'artist')
      .limit(5);
    
    if (postsError) {
      error('Failed to get posts from database:', postsError);
      return false;
    }
    
    if (!posts || posts.length === 0) {
      error('No artist posts found in database');
      return false;
    }
    
    // Check data consistency
    for (const post of posts) {
      if (post.account_display_name !== TEST_CONFIG.TEST_ARTIST_NAME) {
        error(`Post ${post.id} has wrong display name: "${post.account_display_name}"`);
        return false;
      }
      
      if (!post.posted_as_profile_id) {
        error(`Post ${post.id} missing posted_as_profile_id`);
        return false;
      }
    }
    
    success('Data consistency check passed', {
      artistPosts: posts.length,
      displayName: posts[0].account_display_name
    });
    
    return true;
    
  } catch (err) {
    error('Data consistency test failed:', err);
    return false;
  }
}

async function testScalability() {
  log('Testing system scalability...');
  
  try {
    // Test multiple account types
    const accountTypes = ['primary', 'artist'];
    
    for (const accountType of accountTypes) {
      const { data: accountData, error: accountError } = await supabase
        .rpc('get_or_create_account', {
          p_user_id: TEST_CONFIG.TEST_USER_ID,
          p_account_type: accountType,
          p_profile_id: null
        });
      
      if (accountError) {
        error(`Failed to get ${accountType} account:`, accountError);
        return false;
      }
      
      if (!accountData || accountData.length === 0) {
        error(`No ${accountType} account data returned`);
        return false;
      }
      
      log(`✅ ${accountType} account: ${accountData[0].display_name}`);
    }
    
    success('Scalability test passed');
    return true;
    
  } catch (err) {
    error('Scalability test failed:', err);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 COMPREHENSIVE MULTI-ACCOUNT SYSTEM TEST SUITE');
  console.log('================================================');
  
  const tests = [
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Account Functions', fn: testAccountFunctions },
    { name: 'Post Creation API', fn: testPostCreation },
    { name: 'Feed API', fn: testFeedAPI },
    { name: 'Data Consistency', fn: testDataConsistency },
    { name: 'Scalability', fn: testScalability }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} test...`);
    
    try {
      const result = await test.fn();
      if (result) {
        success(`${test.name} test PASSED`);
        passed++;
      } else {
        error(`${test.name} test FAILED`);
        failed++;
      }
    } catch (err) {
      error(`${test.name} test CRASHED:`, err);
      failed++;
    }
  }
  
  console.log('\n🎯 TEST RESULTS');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Comprehensive multi-account system is working correctly.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please review and fix issues.`);
  }
  
  return failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 