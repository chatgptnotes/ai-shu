/**
 * Feature Flags API - Check single flag
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { featureFlags } from '@/lib/feature-flags';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { z } from 'zod';

// Validation schema
const checkFlagSchema = z.object({
  flagName: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimiters.api.check(identifier);

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for feature flag check', {
        route: '/api/feature-flags/check',
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = checkFlagSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Invalid feature flag check request', {
        route: '/api/feature-flags/check',
        errors,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { flagName } = validationResult.data;

    // Get authenticated user (optional for this endpoint)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check flag
    logger.info('Checking feature flag', {
      route: '/api/feature-flags/check',
      flagName,
      userId: user?.id,
    });

    const enabled = await featureFlags.isEnabled(flagName, user?.id);

    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/feature-flags/check', 200, duration, {
      flagName,
      userId: user?.id,
      enabled,
    });

    return NextResponse.json({ enabled });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error checking feature flag',
      { route: '/api/feature-flags/check' },
      error as Error
    );

    logger.apiResponse('POST', '/api/feature-flags/check', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
