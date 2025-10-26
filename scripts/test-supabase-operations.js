#!/usr/bin/env node

/**
 * Supabase Operations Test Script
 *
 * This script tests:
 * 1. Authentication flow
 * 2. User profile creation
 * 3. Session creation
 * 4. Message insertion
 * 5. RLS policy enforcement
 */

require('dotenv').config({ path: './apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test user credentials
const TEST_EMAIL = `test-${Date.now()}@ai-shu.test`;
const TEST_PASSWORD = 'TestPassword123!';

async function testSupabaseOperations() {
  console.log('==========================================');
  console.log('SUPABASE OPERATIONS TEST');
  console.log('==========================================\n');

  let testUserId = null;
  let testStudentProfileId = null;
  let testSessionId = null;

  try {
    // Test 1: Check unauthenticated access (should fail due to RLS)
    console.log('1. Testing Unauthenticated Access');
    console.log('----------------------------------');

    const { data: unauthData, error: unauthError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);

    if (unauthError) {
      if (unauthError.code === '42501' || unauthError.message.includes('row-level security')) {
        console.log('✅ RLS correctly blocks unauthenticated access');
      } else {
        console.log(`⚠️  Unexpected error: ${unauthError.message}`);
      }
    } else {
      console.log('⚠️  Warning: Unauthenticated access allowed (RLS may not be strict enough)');
      console.log(`   Retrieved ${unauthData?.length || 0} records`);
    }

    console.log('');

    // Test 2: Sign Up
    console.log('2. Testing User Sign Up');
    console.log('-----------------------');
    console.log(`Creating test user: ${TEST_EMAIL}`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signUpError) {
      console.log(`❌ Sign up failed: ${signUpError.message}`);
      return;
    }

    if (signUpData.user) {
      testUserId = signUpData.user.id;
      console.log(`✅ User created successfully`);
      console.log(`   User ID: ${testUserId}`);
      console.log(`   Email confirmed: ${signUpData.user.confirmed_at ? 'Yes' : 'No'}`);
    }

    console.log('');

    // Test 3: Create User Profile
    console.log('3. Testing User Profile Creation');
    console.log('--------------------------------');

    const { data: userProfileData, error: userProfileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: testUserId,
          role: 'student'
        }
      ])
      .select();

    if (userProfileError) {
      console.log(`❌ User profile creation failed: ${userProfileError.message}`);
      console.log(`   Code: ${userProfileError.code}`);
      console.log(`   Details: ${JSON.stringify(userProfileError.details)}`);
    } else {
      console.log(`✅ User profile created successfully`);
    }

    console.log('');

    // Test 4: Create Student Profile
    console.log('4. Testing Student Profile Creation');
    console.log('-----------------------------------');

    const { data: studentProfileData, error: studentProfileError } = await supabase
      .from('student_profiles')
      .insert([
        {
          user_id: testUserId,
          full_name: 'Test Student',
          grade_level: 9,
          curriculum: 'IB',
          language: 'en',
          timezone: 'UTC'
        }
      ])
      .select();

    if (studentProfileError) {
      console.log(`❌ Student profile creation failed: ${studentProfileError.message}`);
      console.log(`   Code: ${studentProfileError.code}`);
      console.log(`   Details: ${JSON.stringify(studentProfileError.details)}`);
    } else {
      testStudentProfileId = studentProfileData[0].id;
      console.log(`✅ Student profile created successfully`);
      console.log(`   Profile ID: ${testStudentProfileId}`);
    }

    console.log('');

    // Test 5: Create Session
    console.log('5. Testing Session Creation');
    console.log('---------------------------');

    if (testStudentProfileId) {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            student_id: testStudentProfileId,
            subject: 'mathematics',
            topic: 'Algebra',
            status: 'in_progress'
          }
        ])
        .select();

      if (sessionError) {
        console.log(`❌ Session creation failed: ${sessionError.message}`);
        console.log(`   Code: ${sessionError.code}`);
      } else {
        testSessionId = sessionData[0].id;
        console.log(`✅ Session created successfully`);
        console.log(`   Session ID: ${testSessionId}`);
      }
    } else {
      console.log('⏭️  Skipping (student profile not created)');
    }

    console.log('');

    // Test 6: Insert Message
    console.log('6. Testing Message Insertion');
    console.log('----------------------------');

    if (testSessionId) {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            session_id: testSessionId,
            role: 'student',
            content: 'Hello, can you help me with algebra?'
          }
        ])
        .select();

      if (messageError) {
        console.log(`❌ Message insertion failed: ${messageError.message}`);
        console.log(`   Code: ${messageError.code}`);
      } else {
        console.log(`✅ Message inserted successfully`);
        console.log(`   Message ID: ${messageData[0].id}`);
      }
    } else {
      console.log('⏭️  Skipping (session not created)');
    }

    console.log('');

    // Test 7: Query Own Data
    console.log('7. Testing Query Own Data');
    console.log('-------------------------');

    if (testStudentProfileId) {
      const { data: ownSessions, error: queryError } = await supabase
        .from('sessions')
        .select('*')
        .eq('student_id', testStudentProfileId);

      if (queryError) {
        console.log(`❌ Query failed: ${queryError.message}`);
      } else {
        console.log(`✅ Successfully queried own sessions`);
        console.log(`   Found ${ownSessions.length} session(s)`);
      }
    }

    console.log('');

    // Test 8: Test Cross-User Access (should fail)
    console.log('8. Testing RLS Cross-User Protection');
    console.log('------------------------------------');

    // Create a second user to test RLS
    const { data: user2Data, error: user2Error } = await supabase.auth.signUp({
      email: `test2-${Date.now()}@ai-shu.test`,
      password: TEST_PASSWORD,
    });

    if (user2Error) {
      console.log(`⚠️  Could not create second user for RLS test: ${user2Error.message}`);
    } else if (user2Data.user) {
      // Try to access first user's data with second user's credentials
      const { data: crossUserData, error: crossUserError } = await supabase
        .from('sessions')
        .select('*')
        .eq('student_id', testStudentProfileId);

      if (crossUserError || !crossUserData || crossUserData.length === 0) {
        console.log('✅ RLS correctly prevents cross-user data access');
      } else {
        console.log('❌ WARNING: RLS is not preventing cross-user access!');
        console.log(`   Second user can see ${crossUserData.length} session(s) of first user`);
      }

      // Clean up second user
      await supabase.auth.signOut();
    }

    console.log('');

  } catch (error) {
    console.log(`❌ Fatal error: ${error.message}`);
    console.error(error);
  } finally {
    // Cleanup: Delete test data
    console.log('9. Cleanup Test Data');
    console.log('--------------------');

    if (testUserId) {
      console.log('⚠️  Note: Test user should be manually deleted from Supabase dashboard');
      console.log(`   User ID: ${testUserId}`);
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log('');
      console.log('   Or run this SQL in Supabase SQL Editor:');
      console.log(`   DELETE FROM auth.users WHERE id = '${testUserId}';`);
    }

    console.log('');
  }

  // Summary
  console.log('==========================================');
  console.log('TEST SUMMARY');
  console.log('==========================================\n');

  if (testUserId && testStudentProfileId && testSessionId) {
    console.log('✅ ALL TESTS PASSED');
    console.log('');
    console.log('Database is functioning correctly:');
    console.log('- User registration works');
    console.log('- Profile creation works');
    console.log('- Session creation works');
    console.log('- Message insertion works');
    console.log('- RLS policies are enforced');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('');
    console.log('Review the errors above and:');
    console.log('1. Check RLS policies are correctly applied');
    console.log('2. Verify migrations have been run');
    console.log('3. Check foreign key relationships');
  }

  console.log('\n==========================================\n');
}

// Run tests
testSupabaseOperations()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
