#!/usr/bin/env node

/**
 * Script to create test users in Supabase for development
 * Run: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: 'apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'test@ai-shu.com',
    password: 'TestPass123!',
    fullName: 'Test User',
    role: 'student',
  },
  {
    email: 'dev@ai-shu.com',
    password: 'DevPass123!',
    fullName: 'Test Developer',
    role: 'student',
  },
  {
    email: 'teacher@ai-shu.com',
    password: 'TeacherPass123!',
    fullName: 'Test Teacher',
    role: 'teacher',
  },
  {
    email: 'admin@ai-shu.com',
    password: 'AdminPass123!',
    fullName: 'Test Admin',
    role: 'admin',
  },
];

async function createTestUsers() {
  console.log('🚀 Creating test users in Supabase...\n');

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      // Create auth user with Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for test users
        user_metadata: {
          full_name: user.fullName,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
          continue;
        }
        throw authError;
      }

      console.log(`✅ Created auth user: ${user.email} (ID: ${authData.user.id})`);

      // Create or update student profile
      const { error: profileError } = await supabase
        .from('student_profiles')
        .upsert(
          {
            user_id: authData.user.id,
            full_name: user.fullName,
            role: user.role,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (profileError) {
        console.warn(`⚠️  Profile creation warning for ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Created profile for ${user.email} with role: ${user.role}`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message);
      console.log('');
    }
  }

  console.log('✨ Test user creation complete!\n');
  console.log('📋 Test Credentials:');
  console.log('─────────────────────────────────────────');
  testUsers.forEach((user) => {
    console.log(`${user.role.toUpperCase().padEnd(10)} | ${user.email.padEnd(25)} | ${user.password}`);
  });
  console.log('─────────────────────────────────────────\n');
}

createTestUsers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
