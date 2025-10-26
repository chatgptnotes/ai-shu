import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCsrfToken, getSessionIdentifier, createCsrfCookieHeader } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf
 * Returns a CSRF token for the current session
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate session identifier (use user ID if authenticated)
    const sessionId = getSessionIdentifier(user?.id);

    // Generate CSRF token
    const csrfToken = generateCsrfToken(sessionId);

    // Create response with token
    const response = NextResponse.json({
      token: csrfToken,
      headerName: 'x-csrf-token',
    });

    // Set CSRF token in cookie
    const isSecure = process.env.NODE_ENV === 'production';
    response.headers.set('Set-Cookie', createCsrfCookieHeader(csrfToken, isSecure));

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
