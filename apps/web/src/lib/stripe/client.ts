/**
 * Stripe Client
 * Server-side Stripe integration for AI-Shu
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not configured. Payment features will be disabled.');
}

/**
 * Initialize Stripe client
 */
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null;

/**
 * Get Stripe webhook secret
 */
export function getWebhookSecret(): string {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }
  return STRIPE_WEBHOOK_SECRET;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata || {},
  });
}

/**
 * Create a checkout session
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return await stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
    subscription_data: params.trialPeriodDays
      ? {
          trial_period_days: params.trialPeriodDays,
        }
      : undefined,
  });
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

/**
 * Get subscription
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(params: {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
}): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  if (params.cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(params.subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(params.subscriptionId);
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(params: {
  subscriptionId: string;
  priceId?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const updateData: Stripe.SubscriptionUpdateParams = {};

  if (params.priceId) {
    const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);
    updateData.items = [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
      },
    ];
  }

  if (params.metadata) {
    updateData.metadata = params.metadata;
  }

  return await stripe.subscriptions.update(params.subscriptionId, updateData);
}

/**
 * Get customer
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return await stripe.customers.retrieve(customerId) as Stripe.Customer;
}

/**
 * List invoices for customer
 */
export async function listInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, getWebhookSecret());
}
