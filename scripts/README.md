# AI-Shu Database Verification Scripts

This directory contains scripts for verifying and testing the Supabase database configuration.

---

## JavaScript Scripts

### 1. `verify-supabase-schema.js`

**Purpose**: Quick verification of database connectivity and schema

**What it checks**:
- Environment variables are set
- Database connection works
- Required tables exist
- RLS is enabled

**Usage**:
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
node scripts/verify-supabase-schema.js
```

**Expected Output**:
```
======================================
SUPABASE DATABASE VERIFICATION REPORT
======================================

1. ENVIRONMENT VARIABLES CHECK
✅ NEXT_PUBLIC_SUPABASE_URL: https://...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGci...

2. DATABASE CONNECTIVITY CHECK
✅ Successfully connected to Supabase

3. DATABASE SCHEMA VERIFICATION
✅ All required tables exist

4. ROW LEVEL SECURITY CHECK
✅ RLS is properly enforcing access control

✅ DATABASE IS READY FOR PRODUCTION
```

**When to use**:
- After updating environment variables
- Before starting development
- After making schema changes
- As a health check

---

### 2. `test-supabase-operations.js`

**Purpose**: Comprehensive test of database operations and RLS policies

**What it tests**:
- User signup and authentication
- User profile creation
- Student profile creation
- Session creation
- Message insertion
- RLS cross-user protection

**Usage**:
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
node scripts/test-supabase-operations.js
```

**Expected Output**:
```
==========================================
SUPABASE OPERATIONS TEST
==========================================

1. Testing Unauthenticated Access
✅ RLS correctly blocks unauthenticated access

2. Testing User Sign Up
✅ User created successfully

3. Testing User Profile Creation
✅ User profile created successfully

4. Testing Student Profile Creation
✅ Student profile created successfully

5. Testing Session Creation
✅ Session created successfully

6. Testing Message Insertion
✅ Message inserted successfully

7. Testing Query Own Data
✅ Successfully queried own sessions

8. Testing RLS Cross-User Protection
✅ RLS correctly prevents cross-user data access

✅ ALL TESTS PASSED
```

**When to use**:
- After fixing API key issues
- Before committing schema changes
- To verify RLS policies work correctly
- Integration testing

**Note**: This creates test users with email addresses like `test-{timestamp}@ai-shu.test`. These should be manually deleted after testing.

---

## SQL Scripts

### 3. `detailed-schema-check.sql`

**Purpose**: Detailed inspection of database schema using SQL queries

**What it provides**:
- List of all tables
- Column details for each table
- Foreign key relationships
- Index definitions
- RLS policy details
- Enum type values
- Trigger information
- Record counts

**Usage**:
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your AI-Shu project
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the contents of `detailed-schema-check.sql`
6. Click **Run** or press `Ctrl/Cmd + Enter`

**Output**:
- Multiple result sets showing different aspects of the schema
- Useful for documentation and troubleshooting

**When to use**:
- Documenting the database schema
- Investigating schema issues
- Verifying migrations were applied correctly
- Understanding foreign key relationships

---

### 4. `reset-test-data.sql`

**Purpose**: Clean up test users and data

**What it does**:
- Deletes all users with `@ai-shu.test` email addresses
- Cascade deletes related data (profiles, sessions, messages)
- Shows remaining user count
- Shows remaining record counts for all tables

**Usage**:
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your AI-Shu project
3. Click on **SQL Editor**
4. Copy and paste the contents of `reset-test-data.sql`
5. Review the queries carefully
6. Click **Run**

**⚠️ WARNING**:
- This permanently deletes data
- Only use in development
- Never run on production database
- Make sure you're in the correct project

**When to use**:
- After running `test-supabase-operations.js`
- When you want a clean slate for testing
- Before creating fresh test accounts
- During development iterations

---

## Quick Reference

### Daily Development Workflow

```bash
# 1. Start your day - verify everything is working
node scripts/verify-supabase-schema.js

# 2. Start dev server
npm run dev

# 3. Test at http://localhost:3002
```

### After Schema Changes

```bash
# 1. Apply migrations
supabase db push

# 2. Verify schema
node scripts/verify-supabase-schema.js

# 3. Test operations
node scripts/test-supabase-operations.js

# 4. Clean up test data (in Supabase SQL Editor)
# Run: reset-test-data.sql
```

### Troubleshooting

```bash
# Issue: "Invalid API key"
# Solution: Get fresh key from Supabase Dashboard
# Update: apps/web/.env.local
# Then run:
node scripts/verify-supabase-schema.js

# Issue: Tables don't exist
# Solution: Apply migrations
supabase db push

# Issue: RLS blocking legitimate access
# Solution: Check policies in Supabase Dashboard
# Or run for details:
# detailed-schema-check.sql (section 8)
```

---

## Environment Requirements

All scripts require:
- Node.js >= 18.0.0
- npm packages installed (`npm install`)
- Environment variables set in `apps/web/.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Exit Codes

JavaScript scripts use standard exit codes:
- `0` - Success
- `1` - Error/failure

This allows use in CI/CD pipelines:
```bash
node scripts/verify-supabase-schema.js && echo "Database verified" || echo "Database check failed"
```

---

## Adding New Tests

To add new verification tests:

1. **For connectivity tests**: Add to `verify-supabase-schema.js`
2. **For operation tests**: Add to `test-supabase-operations.js`
3. **For schema inspection**: Add queries to `detailed-schema-check.sql`

### Example: Adding a New Table Check

```javascript
// In verify-supabase-schema.js
REQUIRED_SCHEMA.new_table = {
  columns: {
    id: 'uuid',
    name: 'text',
    // ... other columns
  },
  foreign_keys: ['user_id']
};
```

---

## CI/CD Integration

These scripts can be used in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Verify Database Schema
  run: node scripts/verify-supabase-schema.js
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

- name: Test Database Operations
  run: node scripts/test-supabase-operations.js
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## Support

- **Full Documentation**: See `SUPABASE_VERIFICATION_REPORT.md`
- **Quick Start**: See `SUPABASE_QUICK_START.md`
- **API Key Issues**: See `SUPABASE_API_KEY_FIX.md`
- **Email Issues**: See `SUPABASE_EMAIL_FIX.md`

---

**Last Updated**: 2025-10-26
**Maintained by**: AI-Shu Development Team
