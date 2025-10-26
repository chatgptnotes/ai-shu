/**
 * Rate Limiting Middleware
 * Can be used in API routes to enforce rate limits
 */

import { NextResponse } from 'next/server';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders, RateLimiter } from '@/lib/security/rate-limiter';

export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  limiter: RateLimiter = rateLimiters.api
) {
  return async (request: Request): Promise<Response> => {
    // Get identifier for rate limiting
    const identifier = getRateLimitIdentifier(request);

    // Check rate limit
    const result = limiter.check(identifier);

    // If rate limit exceeded, return 429
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: createRateLimitHeaders(result),
        }
      );
    }

    // Call the actual handler
    try {
      const response = await handler(request);

      // Add rate limit headers to response
      const headers = createRateLimitHeaders(result);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Handler error:', error);
      throw error;
    }
  };
}

/**
 * Example usage in API route:
 *
 * export const POST = withRateLimit(async (request: Request) => {
 *   // Your API logic here
 *   return NextResponse.json({ success: true });
 * }, rateLimiters.chat);
 */
