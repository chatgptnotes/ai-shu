import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBillingPortalSession } from '@/lib/stripe/client';
import { withCsrfProtection } from '@/lib/security/csrf-middleware';
import { validateRequestBody, billingPortalSchema } from '@/lib/security/validation';
import { sanitizeUrl } from '@/lib/security/sanitization';

export async function POST(request: Request) {
  // Apply CSRF protection
  const csrfCheck = await withCsrfProtection(request);
  if (csrfCheck) return csrfCheck;

  // Validate request body
  const validation = await validateRequestBody(request, billingPortalSchema);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', message: validation.error },
      { status: 400 }
    );
  }

  try {
    const { returnUrl } = validation.data;

    // Sanitize return URL
    const sanitizedReturnUrl = sanitizeUrl(returnUrl);
    if (!sanitizedReturnUrl) {
      return NextResponse.json(
        { error: 'Invalid return URL' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Stripe customer ID
    const { data: stripeCustomer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (customerError || !stripeCustomer) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 404 }
      );
    }

    // Create billing portal session
    const session = await createBillingPortalSession({
      customerId: stripeCustomer.stripe_customer_id,
      returnUrl: sanitizedReturnUrl,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Billing portal creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
