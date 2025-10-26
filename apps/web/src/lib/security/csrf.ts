/**
 * CSRF Protection Utility
 *
 * Implements Double Submit Cookie pattern for CSRF protection.
 * Generates tokens based on user session and validates them on state-changing requests.
 */

import { createHmac, randomBytes } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token for a given session identifier
 */
export function generateCsrfToken(sessionId: string): string {
  const random = randomBytes(TOKEN_LENGTH).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${sessionId}:${timestamp}:${random}`;

  // Create HMAC signature
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');

  // Return token as base64-encoded payload + signature
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');
  return token;
}

/**
 * Validate a CSRF token against a session identifier
 */
export function validateCsrfToken(token: string, sessionId: string): boolean {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');

    if (parts.length !== 4) {
      return false;
    }

    const [tokenSessionId, timestamp, random, signature] = parts;

    // Verify session ID matches
    if (tokenSessionId !== sessionId) {
      return false;
    }

    // Verify token is not too old (max 1 hour)
    const tokenTimestamp = parseInt(timestamp, 10);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    if (now - tokenTimestamp > maxAge) {
      return false;
    }

    // Verify HMAC signature
    const payload = `${tokenSessionId}:${timestamp}:${random}`;
    const hmac = createHmac('sha256', CSRF_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(signature, expectedSignature);
  } catch (error) {
    console.error('CSRF token validation error:', error);
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Extract CSRF token from request headers or cookies
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  // Try to get from header first (for API calls)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Try to get from cookie (for form submissions)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const csrfCookie = cookies.find(c => c.startsWith(`${CSRF_COOKIE_NAME}=`));
    if (csrfCookie) {
      return csrfCookie.substring(CSRF_COOKIE_NAME.length + 1);
    }
  }

  return null;
}

/**
 * Create Set-Cookie header for CSRF token
 */
export function createCsrfCookieHeader(token: string, secure: boolean = true): string {
  const cookieOptions = [
    `${CSRF_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=3600', // 1 hour
  ];

  if (secure) {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}

/**
 * Get session identifier from request (uses user ID or generates anonymous ID)
 */
export function getSessionIdentifier(userId?: string): string {
  if (userId) {
    return userId;
  }

  // For anonymous users, generate a random identifier
  // In production, this would be stored in a session cookie
  return randomBytes(16).toString('hex');
}

export const CSRF_CONFIG = {
  cookieName: CSRF_COOKIE_NAME,
  headerName: CSRF_HEADER_NAME,
  secret: CSRF_SECRET,
};
