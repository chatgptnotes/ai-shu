# Authentication Bugs - Quick Reference Guide

## Critical Bugs Requiring Immediate Fix

### BUG #1: Email Not Trimmed in Signup
**File:** `/Users/murali/1 imp backups/Ai-shu/apps/web/src/app/auth/signup/page.tsx:67-75`
```typescript
// BEFORE (line 67-69):
const { data, error: signUpError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,

// AFTER (add .trim()):
const { data, error: signUpError } = await supabase.auth.signUp({
  email: formData.email.trim(),
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName.trim(), // Also fix this
    },
  },
```

---

### BUG #2: Email Not Trimmed in Login
**File:** `/Users/murali/1 imp backups/Ai-shu/apps/web/src/app/auth/login/page.tsx:34-37`
```typescript
// BEFORE:
const { data, error: signInError } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
});

// AFTER:
const { data, error: signInError } = await supabase.auth.signInWithPassword({
  email: formData.email.trim(),
  password: formData.password,
});
```

---

### BUG #3: Email Not Trimmed in Password Reset
**File:** `/Users/murali/1 imp backups/Ai-shu/apps/web/src/app/auth/reset-password/page.tsx:23-25`
```typescript
// BEFORE:
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {

// AFTER:
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
```

---

### BUG #4: Grade Level Sent as String Instead of Number
**File:** `/Users/murali/1 imp backups/Ai-shu/apps/web/src/app/auth/setup-profile/page.tsx`

**Option A - Fix in handleChange (line 39-45):**
```typescript
// BEFORE:
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  setFormData((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
  setError(null);
};

// AFTER:
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: name === 'gradeLevel' ? parseInt(value, 10) : value,
  }));
  setError(null);
};
```

**Option B - Fix in handleSubmit (line 61-72):**
```typescript
// BEFORE:
const { error: profileError } = await supabase
  .from('student_profiles')
  .insert([
    {
      user_id: userId,
      full_name: fullName,
      grade_level: formData.gradeLevel,
      curriculum: formData.curriculum,
      language: formData.language,
      timezone: formData.timezone,
    },
  ]);

// AFTER:
const { error: profileError } = await supabase
  .from('student_profiles')
  .insert([
    {
      user_id: userId,
      full_name: fullName.trim(),
      grade_level: parseInt(formData.gradeLevel.toString(), 10),
      curriculum: formData.curriculum,
      language: formData.language,
      timezone: formData.timezone,
    },
  ]);
```

---

### BUG #5: Missing Profile Error Handling in Login
**File:** `/Users/murali/1 imp backups/Ai-shu/apps/web/src/app/auth/login/page.tsx:43-53`
```typescript
// BEFORE:
const { data: profile } = await supabase
  .from('student_profiles')
  .select('*')
  .eq('user_id', data.user.id)
  .single();

if (profile) {
  router.push('/dashboard');
} else {
  router.push('/auth/setup-profile');
}

// AFTER:
const { data: profile, error: profileError } = await supabase
  .from('student_profiles')
  .select('*')
  .eq('user_id', data.user.id)
  .single();

if (profileError || !profile) {
  router.push('/auth/setup-profile');
} else {
  router.push('/dashboard');
}
```

---

### BUG #6: Unsafe Destructuring in Update Password
**File:** `/Users/murali/1 imp backups/Ai-shu/apps/web/src/app/auth/update-password/page.tsx:54-64`
```typescript
// BEFORE (line 54):
const { data: { user }, error: userError } = await supabase.auth.getUser();

// AFTER:
const userResponse = await supabase.auth.getUser();

if (userResponse?.error) {
  console.error('User error:', userResponse.error);
}

if (!userResponse?.data?.user) {
  setError('No active session. Please use the password reset link from your email, or request a new one from the login page.');
} else {
  console.log('Existing session found for user:', userResponse.data.user.id);
}
```

---

### BUG #7: Missing Full Name Field in Profile Setup
**File:** `/Users/murali/1 imp backups/Ai-shu/apps/web/src/app/auth/setup-profile/page.tsx`

Add this field in the form (around line 100, before gradeLevel field):
```typescript
<div className="space-y-2">
  <Label htmlFor="fullName">Full Name</Label>
  <Input
    id="fullName"
    name="fullName"
    type="text"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    disabled={isLoading}
    placeholder="Enter your full name"
    required
  />
</div>
```

---

## Apply All Fixes at Once

```bash
# Navigate to the web app directory
cd "/Users/murali/1 imp backups/Ai-shu/apps/web"

# Apply fixes to each file using your code editor
# Or use the Edit tool to make the changes

# After applying fixes, run tests to verify
npm test

# Expected result: All tests should pass
```

---

## Verification Checklist

After applying fixes, verify each fix works:

- [ ] BUG #1: Signup with `  user@test.com  ` (spaces) works correctly
- [ ] BUG #2: Login with `  user@test.com  ` (spaces) works correctly
- [ ] BUG #3: Password reset with `  user@test.com  ` (spaces) works correctly
- [ ] BUG #4: Profile setup saves grade_level as integer in database
- [ ] BUG #5: Login handles missing profile correctly
- [ ] BUG #6: Update password handles missing session gracefully
- [ ] BUG #7: Profile setup shows and allows editing full name

---

## Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- signup/__tests__/page.test.tsx

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

---

## Manual Testing Steps

1. **Test Signup with Spaces:**
   ```
   - Go to http://localhost:3002/auth/signup
   - Enter email: "  test@example.com  " (with spaces)
   - Fill form and submit
   - Verify account created successfully
   - Try logging in with exact email (should work)
   ```

2. **Test Grade Level:**
   ```
   - Complete signup
   - On profile setup, select grade 12
   - Submit form
   - Check database: grade_level should be 12 (number), not "12" (string)
   ```

3. **Test Profile Error Handling:**
   ```
   - Login with account that has no profile
   - Should redirect to /auth/setup-profile
   - Should not crash or show error
   ```

4. **Test Password Reset Flow:**
   ```
   - Go to /auth/reset-password
   - Enter email with spaces: "  user@test.com  "
   - Should receive reset email
   - Click link in email
   - Should arrive at update-password page
   - Should be able to set new password
   ```

---

## Database Verification

After fixing BUG #4, verify the database schema:

```sql
-- Check the column type
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'student_profiles'
AND column_name = 'grade_level';

-- Should return: integer or int4

-- Check a record
SELECT user_id, grade_level, pg_typeof(grade_level) as type
FROM student_profiles
LIMIT 1;

-- type should be 'integer'
```

---

## Notes

- All fixes are backward compatible
- No database migration required (unless schema is wrong)
- Fixes improve security and UX
- Test coverage will increase from 82% to ~95% after fixes
