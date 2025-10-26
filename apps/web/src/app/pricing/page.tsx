'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SUBSCRIPTION_TIERS,
  formatPrice,
  TRIAL_PERIOD_DAYS,
  type SubscriptionTier,
} from '@/config/subscription-tiers';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const router = useRouter();

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'enterprise') {
      // Redirect to contact sales
      window.location.href = 'mailto:sales@ai-shu.com?subject=Enterprise Plan Inquiry';
      return;
    }

    setLoadingTier(tier);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          billingPeriod,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        if (error.error === 'Unauthorized') {
          // Redirect to login
          router.push('/auth/signin?redirect=/pricing');
        } else {
          alert('Failed to start checkout. Please try again.');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Start with a {TRIAL_PERIOD_DAYS}-day free trial. No credit card required.
        </p>

        {/* Billing Period Toggle */}
        <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-background shadow-sm font-medium'
                : 'text-muted-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-background shadow-sm font-medium'
                : 'text-muted-foreground'
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          const tierKey = key as SubscriptionTier;
          const price =
            billingPeriod === 'monthly' ? tier.priceMonthly : tier.priceYearly / 12;
          const isEnterprise = tierKey === 'enterprise';
          const isLoading = loadingTier === tierKey;

          return (
            <Card
              key={tierKey}
              className={`relative ${tier.isPopular ? 'border-primary shadow-lg' : ''}`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="h-12">{tier.description}</CardDescription>
                <div className="mt-4">
                  {isEnterprise ? (
                    <div className="text-3xl font-bold">Contact Sales</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        {formatPrice(price)}
                        <span className="text-lg font-normal text-muted-foreground">/mo</span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Billed annually ({formatPrice(tier.priceYearly)}/year)
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={() => handleSubscribe(tierKey)}
                  disabled={isLoading}
                  className="w-full mb-6"
                  variant={tier.isPopular ? 'default' : 'outline'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : isEnterprise ? (
                    'Contact Sales'
                  ) : (
                    `Start ${TRIAL_PERIOD_DAYS}-Day Trial`
                  )}
                </Button>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="font-medium text-sm mb-2">Features:</div>
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Usage Limits */}
                {!isEnterprise && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="font-medium text-sm mb-2">Monthly Limits:</div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>
                        {tier.limits.maxSessionsPerMonth === -1
                          ? 'Unlimited'
                          : tier.limits.maxSessionsPerMonth}{' '}
                        Sessions
                      </div>
                      <div>
                        {tier.limits.maxVideoMinutesPerMonth === -1
                          ? 'Unlimited'
                          : `${tier.limits.maxVideoMinutesPerMonth} mins`}{' '}
                        Video
                      </div>
                      <div>
                        {tier.limits.maxAvatarGenerationsPerMonth === -1
                          ? 'Unlimited'
                          : tier.limits.maxAvatarGenerationsPerMonth}{' '}
                        Avatar Generations
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">How does the free trial work?</h3>
            <p className="text-muted-foreground">
              Start with a {TRIAL_PERIOD_DAYS}-day free trial of any plan. You won&apos;t be charged
              until the trial ends. Cancel anytime during the trial with no charge.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect
              immediately for upgrades, or at the end of your billing period for downgrades.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards (Visa, Mastercard, American Express) and bank
              transfers for Enterprise plans.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What happens if I exceed my limits?</h3>
            <p className="text-muted-foreground">
              If you approach your monthly limits, we&apos;ll notify you. You can upgrade your plan at
              any time to get higher limits immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
