/**
 * Feature Flags API - Get all flags for current user
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { featureFlags } from '@/lib/feature-flags';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimiters.api.check(identifier);

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for feature flags', {
        route: '/api/feature-flags',
        identifier,
        retryAfter: rateLimitResult.retryAfter,
      });

      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized feature flags access', {
        route: '/api/feature-flags',
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all flags for user
    logger.info('Fetching feature flags', {
      route: '/api/feature-flags',
      userId: user.id,
    });

    const flags = await featureFlags.getUserFlags(user.id);

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/feature-flags', 200, duration, {
      userId: user.id,
      flagCount: Object.keys(flags).length,
    });

    return NextResponse.json({ flags });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error fetching feature flags',
      { route: '/api/feature-flags' },
      error as Error
    );

    logger.apiResponse('GET', '/api/feature-flags', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
