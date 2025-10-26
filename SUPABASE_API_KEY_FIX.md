# Supabase API Key Fix Guide

## Problem
The current Supabase anon key in `.env.local` returns "Invalid API key" error.

## Solution (5 minutes)

### Step 1: Get Fresh API Key
1. Go to: https://app.supabase.com
2. Click on your AI-Shu project
3. Click on the **Settings** icon (gear) in the left sidebar
4. Click on **API** in the Settings menu
5. Under **Project API keys**, find the **anon public** key
6. Click the **Copy** button next to it

### Step 2: Update .env.local
1. Open: `/Users/murali/1 imp backups/Ai-shu/apps/web/.env.local`
2. Find the line: `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
3. Replace the entire key value with the one you just copied
4. Save the file

**Example**:
```bash
# Before
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.OLD_KEY_HERE...

# After (with your fresh key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_KEY_HERE...
```

### Step 3: Verify Email Settings
While you're in the Supabase Dashboard:

1. Click on **Authentication** in the left sidebar
2. Click on **Providers**
3. Click on **Email** in the providers list
4. Scroll down to **Email confirmation settings**
5. **UNCHECK** "Enable email confirmations"
6. Click **Save**

### Step 4: Clean Up Test Users
1. In the Supabase Dashboard, click on **Authentication** → **Users**
2. Delete any test users that are in "unconfirmed" state
3. Or run this in SQL Editor:
   ```sql
   DELETE FROM auth.users WHERE email LIKE 'test%@ai-shu.test';
   ```

### Step 5: Restart Dev Server
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
npm run dev
```

### Step 6: Test
Run the verification script:
```bash
node scripts/test-supabase-operations.js
```

You should see:
```
✅ User created successfully
✅ User profile created successfully
✅ Student profile created successfully
✅ Session created successfully
✅ Message inserted successfully
```

## What if it still doesn't work?

### Check 1: Verify the URL matches
Make sure your Supabase URL is correct:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://mdzavfrynjjivxvvibnr.supabase.co
```

### Check 2: Check for typos
- No extra spaces before or after the key
- No line breaks in the middle of the key
- The key should start with `eyJ...`

### Check 3: Verify the key type
- Make sure you copied the **anon public** key, NOT the service role key
- The service role key should NEVER be in .env.local

### Check 4: Check project status
In Supabase Dashboard, verify:
- Project is active (not paused)
- Database is running
- No billing issues

## Quick Test

After updating the key, test with this one-liner:
```bash
cd "/Users/murali/1 imp backups/Ai-shu" && node scripts/verify-supabase-schema.js
```

Should output:
```
✅ NEXT_PUBLIC_SUPABASE_URL: https://mdzavfrynjjivxvvibnr.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGci...
✅ Successfully connected to Supabase
✅ All required tables exist
```

---

**Time Required**: 5 minutes
**Difficulty**: Easy
**Prerequisites**: Access to Supabase Dashboard
