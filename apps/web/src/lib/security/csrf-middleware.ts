/**
 * CSRF Middleware for API Routes
 *
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE, PATCH)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  validateCsrfToken,
  getCsrfTokenFromRequest,
  requiresCsrfProtection,
  getSessionIdentifier,
  generateCsrfToken,
  createCsrfCookieHeader,
} from './csrf';

export interface CsrfValidationResult {
  valid: boolean;
  error?: string;
  sessionId?: string;
}

/**
 * Validate CSRF token for a request
 */
export async function validateCsrfRequest(request: Request): Promise<CsrfValidationResult> {
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
    const sessionId = getSessionIdentifier(user?.id);

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

/**
 * Middleware wrapper for API routes to validate CSRF tokens
 *
 * Usage:
 * ```typescript
 * export async function POST(request: Request) {
 *   const csrfCheck = await withCsrfProtection(request);
 *   if (csrfCheck) return csrfCheck; // Returns error response if validation fails
 *
 *   // Continue with request handling
 * }
 * ```
 */
export async function withCsrfProtection(request: Request): Promise<NextResponse | null> {
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

  return null; // Validation passed, continue with request
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 *
 * Usage:
 * ```typescript
 * export const POST = withCsrf(async (request: Request) => {
 *   // Your handler logic here
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withCsrf(
  handler: (request: Request) => Promise<NextResponse>
): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    const csrfCheck = await withCsrfProtection(request);
    if (csrfCheck) {
      return csrfCheck; // Return error response
    }

    // Call the actual handler
    return handler(request);
  };
}

/**
 * Generate a new CSRF token response with cookie
 * Useful for refreshing tokens
 */
export async function generateCsrfResponse(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionIdentifier(user?.id);
    const token = generateCsrfToken(sessionId);

    const response = NextResponse.json({
      token,
      headerName: 'x-csrf-token',
    });

    const isSecure = process.env.NODE_ENV === 'production';
    response.headers.set('Set-Cookie', createCsrfCookieHeader(token, isSecure));

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
