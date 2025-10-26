import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';


export const dynamic = 'force-dynamic';
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Construct and verify webhook event
    const event = constructWebhookEvent(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as any);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription & { current_period_start: number; current_period_end: number; canceled_at?: number; trial_start?: number; trial_end?: number }) {
  const supabaseAdmin = getSupabaseAdmin();
  const customerId = subscription.customer as string;

  // Get user from Stripe customer
  const { data: stripeCustomer } = await supabaseAdmin
    .from('stripe_customers')
    .select('id, user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!stripeCustomer) {
    console.error('Customer not found:', customerId);
    return;
  }

  const tier = (subscription.metadata?.tier as string) || 'basic';

  // Upsert subscription
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: stripeCustomer.user_id,
    stripe_customer_id: stripeCustomer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price.id,
    tier,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    metadata: subscription.metadata || {},
  });

  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log('Subscription deleted:', subscription.id);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice & { subscription?: string; period_start: number; period_end: number }) {
  const supabaseAdmin = getSupabaseAdmin();
  const customerId = invoice.customer as string;

  // Get customer
  const { data: stripeCustomer } = await supabaseAdmin
    .from('stripe_customers')
    .select('id, user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!stripeCustomer) {
    console.error('Customer not found:', customerId);
    return;
  }

  // Save invoice
  await supabaseAdmin.from('invoices').upsert({
    user_id: stripeCustomer.user_id,
    stripe_invoice_id: invoice.id,
    stripe_customer_id: stripeCustomer.id,
    subscription_id: invoice.subscription
      ? await getSubscriptionId(invoice.subscription as string)
      : null,
    amount_due: invoice.amount_due,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status!,
    invoice_pdf: invoice.invoice_pdf || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    period_start: new Date(invoice.period_start * 1000).toISOString(),
    period_end: new Date(invoice.period_end * 1000).toISOString(),
    paid_at: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null,
  });

  console.log('Invoice payment succeeded:', invoice.id);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // TODO: Send email notification about payment failure
  console.log('Invoice payment failed:', invoice.id);
}

async function getSubscriptionId(stripeSubscriptionId: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  return data?.id || null;
}
