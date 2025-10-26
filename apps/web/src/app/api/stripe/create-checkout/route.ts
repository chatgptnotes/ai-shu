import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe/client';
import { TRIAL_PERIOD_DAYS } from '@/config/subscription-tiers';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { withCsrfProtection } from '@/lib/security/csrf-middleware';
import { validateRequestBody, stripeCheckoutSchema } from '@/lib/security/validation';


export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  // Apply rate limiting for payment endpoints (10 requests per minute)
  const identifier = getRateLimitIdentifier(request);
  const rateLimitResult = rateLimiters.api.check(identifier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please wait before trying again',
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Apply CSRF protection
  const csrfCheck = await withCsrfProtection(request);
  if (csrfCheck) return csrfCheck;

  // Validate request body
  const validation = await validateRequestBody(request, stripeCheckoutSchema);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', message: validation.error },
      { status: 400 }
    );
  }

  try {
    const { tier, billingPeriod } = validation.data;

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a Stripe customer
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let stripeCustomerId: string;

    if (existingCustomer) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const stripeCustomer = await createStripeCustomer({
        email: user.email!,
        metadata: {
          userId: user.id,
        },
      });

      // Save to database
      await supabase.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: stripeCustomer.id,
        email: user.email!,
      });

      stripeCustomerId = stripeCustomer.id;
    }

    // Get price ID from environment
    const priceIdKey =
      billingPeriod === 'yearly'
        ? `NEXT_PUBLIC_STRIPE_PRICE_${tier.toUpperCase()}_YEARLY`
        : `NEXT_PUBLIC_STRIPE_PRICE_${tier.toUpperCase()}_MONTHLY`;

    const priceId = process.env[priceIdKey];

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for ${tier} ${billingPeriod}` },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        tier,
        billingPeriod,
      },
      trialPeriodDays: TRIAL_PERIOD_DAYS,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
