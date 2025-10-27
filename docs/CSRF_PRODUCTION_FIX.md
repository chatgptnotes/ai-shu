# CSRF Protection - Production Implementation Plan

## Current Status

**Development**: CSRF protection disabled (bypassed for local testing)
**Production**: CSRF protection active but **BROKEN** - same issue as development

## Problem Analysis

### Root Cause

The current CSRF implementation has a critical flaw in session identifier management:

```typescript
// Current implementation in csrf.ts
export function getSessionIdentifier(userId?: string): string {
  if (userId) {
    return userId;
  }
  // ❌ PROBLEM: Generates NEW random ID on every call
  return randomBytes(16).toString('hex');
}
```

**What happens:**
1. User visits `/api/csrf` → Generates token with session ID `ABC123`
2. User makes POST to `/api/chat` → Validates with NEW session ID `XYZ789`
3. Token validation fails → 403 Forbidden

### Why It's Broken

- **No persistence**: Session identifier is not stored anywhere
- **Random generation**: Each call to `getSessionIdentifier()` creates a new ID
- **Token mismatch**: Generation and validation use different session IDs
- **Works for logged-in users**: User ID is stable, so tokens work
- **Fails for anonymous users**: Random IDs break the flow

## Solution: Implement Session-Based CSRF

### Architecture Overview

```
┌─────────────────┐
│   Client        │
│  (Browser)      │
└────────┬────────┘
         │
         │ 1. GET /api/csrf
         ├──────────────────────────────────────┐
         │                                      │
         │ ← CSRF Token + Session Cookie       │
         │   Token: base64(sessionId:timestamp:random:hmac)
         │   Cookie: session-id=ABC123; HttpOnly; Secure
         │
         │ 2. POST /api/chat
         │    Headers: X-CSRF-Token: <token>
         │    Cookies: session-id=ABC123
         ├──────────────────────────────────────┐
         │                                      │
         │                                      ▼
         │                            ┌──────────────────┐
         │                            │  Server          │
         │                            │  1. Read cookie  │
         │                            │  2. Read header  │
         │                            │  3. Validate:    │
         │                            │     - Session ID │
         │                            │     - Timestamp  │
         │                            │     - HMAC       │
         │                            └──────────────────┘
```

## Implementation Plan

### Phase 1: Add Session Cookie Management

**File**: `/apps/web/src/lib/security/csrf.ts`

**Changes needed:**

1. **Add session cookie utilities:**

```typescript
const SESSION_COOKIE_NAME = 'ai-shu-session';

/**
 * Get session ID from cookie or create new one
 */
export function getOrCreateSessionId(request: Request): string {
  const cookieHeader = request.headers.get('cookie');

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c =>
      c.startsWith(`${SESSION_COOKIE_NAME}=`)
    );

    if (sessionCookie) {
      return sessionCookie.substring(SESSION_COOKIE_NAME.length + 1);
    }
  }

  // Create new session ID if none exists
  return randomBytes(16).toString('hex');
}

/**
 * Create session cookie header
 */
export function createSessionCookie(
  sessionId: string,
  secure: boolean = true
): string {
  const cookieOptions = [
    `${SESSION_COOKIE_NAME}=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=86400', // 24 hours
  ];

  if (secure) {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
}
```

2. **Update `getSessionIdentifier` to use cookie:**

```typescript
export function getSessionIdentifier(
  userId?: string,
  request?: Request
): string {
  // Use user ID for authenticated users (most secure)
  if (userId) {
    return userId;
  }

  // Use session cookie for anonymous users
  if (request) {
    return getOrCreateSessionId(request);
  }

  // Fallback (should not happen in production)
  throw new Error('Session identifier requires either userId or request');
}
```

### Phase 2: Update CSRF Endpoint

**File**: `/apps/web/src/app/api/csrf/route.ts`

**Changes needed:**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateCsrfToken,
  createCsrfCookieHeader,
  createSessionCookie,
  getOrCreateSessionId,
  getSessionIdentifier,
} from '@/lib/security/csrf';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get or create session ID
    const sessionId = getOrCreateSessionId(request);

    // Use user ID if authenticated, otherwise session ID
    const identifier = getSessionIdentifier(user?.id, request);

    // Generate CSRF token
    const token = generateCsrfToken(identifier);

    const response = NextResponse.json({
      token,
      headerName: 'x-csrf-token',
    });

    const isSecure = process.env.NODE_ENV === 'production';

    // Set both CSRF token cookie and session cookie
    const cookies = [
      createCsrfCookieHeader(token, isSecure),
      createSessionCookie(sessionId, isSecure),
    ];

    response.headers.set('Set-Cookie', cookies.join(', '));

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
```

### Phase 3: Update CSRF Validation

**File**: `/apps/web/src/lib/security/csrf-middleware.ts`

**Changes needed:**

```typescript
export async function validateCsrfRequest(
  request: Request
): Promise<CsrfValidationResult> {
  try {
    // Check if method requires CSRF protection
    if (!requiresCsrfProtection(request.method)) {
      return { valid: true };
    }

    // Get CSRF token from request
    const token = getCsrfTokenFromRequest(request);
    if (!token) {
      return {
        valid: false,
        error: 'CSRF token missing. Please include X-CSRF-Token header.',
      };
    }

    // Get user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get session identifier (from user ID or session cookie)
    const sessionId = getSessionIdentifier(user?.id, request);

    // Validate token
    const isValid = validateCsrfToken(token, sessionId);
    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid or expired CSRF token.',
      };
    }

    return {
      valid: true,
      sessionId,
    };
  } catch (error) {
    console.error('CSRF validation error:', error);
    return {
      valid: false,
      error: 'CSRF validation failed.',
    };
  }
}
```

### Phase 4: Update Middleware (Remove Dev Bypass)

**File**: `/apps/web/src/lib/security/csrf-middleware.ts`

**Remove the development bypass:**

```typescript
export async function withCsrfProtection(
  request: Request
): Promise<NextResponse | null> {
  // ❌ REMOVE THIS:
  // if (process.env.NODE_ENV === 'development') {
  //   return null;
  // }

  const result = await validateCsrfRequest(request);

  if (!result.valid) {
    return NextResponse.json(
      {
        error: 'CSRF validation failed',
        message: result.error || 'Invalid CSRF token',
      },
      { status: 403 }
    );
  }

  return null;
}
```

## Testing Plan

### Test Scenarios

1. **Authenticated User Flow**
   - ✓ User logs in
   - ✓ CSRF token uses user ID as session identifier
   - ✓ Token validates correctly
   - ✓ Chat API works

2. **Anonymous User Flow**
   - ✓ User visits site without logging in
   - ✓ GET /api/csrf creates session cookie
   - ✓ Session ID stored in cookie
   - ✓ POST requests use same session ID
   - ✓ Token validates correctly

3. **Session Expiration**
   - ✓ Token expires after 1 hour
   - ✓ User gets new token on next /api/csrf call
   - ✓ Old token rejected with 403

4. **Cookie Tampering**
   - ✓ Modified session cookie rejected
   - ✓ Modified CSRF token rejected
   - ✓ Mismatched session ID rejected

### Test Commands

```bash
# Test 1: Get CSRF token (creates session)
curl -c cookies.txt -i http://localhost:3002/api/csrf

# Test 2: Use token in API call (should work)
TOKEN=$(curl -b cookies.txt -s http://localhost:3002/api/csrf | jq -r .token)
curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -X POST http://localhost:3002/api/chat \
  -d '{"sessionId":"test","message":"Hello","subject":"Physics","topic":"Test","studentName":"Test"}'

# Test 3: Use token without cookie (should fail)
curl -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -X POST http://localhost:3002/api/chat \
  -d '{...}'  # Should return 403
```

## Rollout Strategy

### Option 1: Big Bang (Recommended for MVP)

1. Implement all changes at once
2. Test thoroughly in local environment
3. Deploy to staging for QA
4. Deploy to production with monitoring

**Pros**: Clean, complete solution
**Cons**: Higher risk if bugs exist

### Option 2: Gradual Rollout

1. **Week 1**: Implement session cookie infrastructure
2. **Week 2**: Update CSRF endpoint
3. **Week 3**: Update validation logic
4. **Week 4**: Enable in production, monitor

**Pros**: Lower risk, easier to debug
**Cons**: Takes longer, multiple deployments

## Security Considerations

### What We're Protecting Against

1. **Cross-Site Request Forgery (CSRF)**
   - ✓ Malicious site makes requests on behalf of user
   - ✓ Protected by validating token + session

2. **Token Replay Attacks**
   - ✓ Attacker reuses old token
   - ✓ Protected by timestamp expiration

3. **Session Fixation**
   - ✓ Attacker sets session ID
   - ✓ Protected by HttpOnly, Secure cookies

### What We're NOT Protecting Against (Out of Scope)

- XSS attacks (handled by Content-Security-Policy)
- SQL injection (handled by Supabase parameterized queries)
- DDoS attacks (handled by rate limiting)

## Alternative Solutions Considered

### 1. SameSite Cookie Only (Rejected)

**Why it works:**
- Modern browsers support SameSite=Strict
- Prevents CSRF automatically

**Why we rejected it:**
- Not supported by all browsers
- Defense-in-depth better with token validation

### 2. Origin Header Validation (Rejected)

**Why it works:**
- Validate Origin/Referer headers match expected domain

**Why we rejected it:**
- Headers can be stripped by proxies
- Less reliable than token-based approach

### 3. Double Submit Cookie (Current Approach)

**Why we chose it:**
- Industry standard pattern
- Works with both authenticated and anonymous users
- Compatible with all browsers
- Provides defense-in-depth

## Monitoring & Metrics

### Key Metrics to Track

1. **CSRF Validation Failure Rate**
   - Target: <0.1% of requests
   - Alert if >1%

2. **Session Cookie Creation Rate**
   - Track new session creations
   - Detect anomalies

3. **Token Expiration Errors**
   - Track how often users hit expired tokens
   - Adjust expiration if needed

### Logging

Add structured logging for:

```typescript
logger.info('CSRF token generated', {
  sessionId: sessionId.substring(0, 8) + '...', // Log prefix only
  authenticated: !!user,
});

logger.warn('CSRF validation failed', {
  reason: result.error,
  authenticated: !!user,
});
```

## Timeline Estimate

- **Planning & Design**: 1 day (DONE)
- **Implementation**: 2-3 days
- **Testing**: 2 days
- **Deployment & Monitoring**: 1 day

**Total**: 5-7 days

## Success Criteria

- [ ] All test scenarios pass
- [ ] Zero CSRF validation errors for valid requests
- [ ] 100% rejection of invalid tokens
- [ ] No impact on authenticated user experience
- [ ] Session cookies work for anonymous users
- [ ] Production deployment successful
- [ ] Monitoring dashboards showing healthy metrics

## Next Steps

1. **Review this plan** with team
2. **Schedule implementation** sprint
3. **Create feature branch**: `feat/csrf-production-fix`
4. **Implement changes** following phases above
5. **Test thoroughly** using test scenarios
6. **Deploy to staging** for QA
7. **Deploy to production** with rollback plan
8. **Monitor for 48 hours** post-deployment

## Documentation Updates Needed

- [ ] Update API documentation with CSRF requirements
- [ ] Add CSRF section to developer guide
- [ ] Document session cookie behavior
- [ ] Update troubleshooting guide
- [ ] Add CSRF testing guide for developers

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)

---

**Created**: 2025-10-27
**Author**: Claude Code
**Status**: Ready for Implementation
**Priority**: High (Security Issue)
