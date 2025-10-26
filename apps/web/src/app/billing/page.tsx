'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/config/subscription-tiers';
import { AuthenticatedHeader } from '@/components/layout/AuthenticatedHeader';
import { VersionFooter } from '@/components/layout/VersionFooter';

interface UsageQuota {
  max_sessions_per_month: number;
  max_video_minutes_per_month: number;
  max_avatar_generations_per_month: number;
  max_whiteboard_exports_per_month: number;
  current_sessions: number;
  current_video_minutes: number;
  current_avatar_generations: number;
  current_whiteboard_exports: number;
  next_reset_at: string;
}

interface Subscription {
  id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  usage_quotas: UsageQuota[];
}

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  period_start: string;
  period_end: string;
  paid_at: string | null;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const getUsagePercentage = (current: number, max: number): number => {
    if (max === -1) return 0; // Unlimited
    return Math.min((current / max) * 100, 100);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading billing information...</div>
        </div>
        <VersionFooter />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedHeader />
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">No Active Subscription</h2>
                <p className="text-muted-foreground mb-6">
                  You don&apos;t have an active subscription yet.
                </p>
                <Button onClick={() => (window.location.href = '/pricing')}>
                  View Pricing Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <VersionFooter />
      </div>
    );
  }

  const quota = subscription.usage_quotas?.[0];

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <Button onClick={openBillingPortal} disabled={portalLoading}>
          {portalLoading ? 'Loading...' : 'Manage Subscription'}
        </Button>
      </div>

      {/* Subscription Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold capitalize">{subscription.tier} Plan</h3>
                <Badge
                  variant={
                    subscription.status === 'active'
                      ? 'default'
                      : subscription.status === 'trialing'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {subscription.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Period: </span>
                  <span>
                    {formatDate(subscription.current_period_start)} -{' '}
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
                {subscription.trial_end && (
                  <div>
                    <span className="text-muted-foreground">Trial Ends: </span>
                    <span>{formatDate(subscription.trial_end)}</span>
                  </div>
                )}
                {subscription.cancel_at_period_end && (
                  <div className="text-destructive font-medium">
                    Subscription will cancel at period end
                  </div>
                )}
              </div>
            </div>
            {quota && (
              <div>
                <h4 className="font-medium mb-2">Usage Resets On</h4>
                <p className="text-2xl font-bold">{formatDate(quota.next_reset_at)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Quotas */}
      {quota && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Usage This Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Sessions</span>
                  <span className="text-sm text-muted-foreground">
                    {quota.current_sessions} /{' '}
                    {quota.max_sessions_per_month === -1
                      ? 'Unlimited'
                      : quota.max_sessions_per_month}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(
                    quota.current_sessions,
                    quota.max_sessions_per_month
                  )}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Video Minutes</span>
                  <span className="text-sm text-muted-foreground">
                    {quota.current_video_minutes} /{' '}
                    {quota.max_video_minutes_per_month === -1
                      ? 'Unlimited'
                      : quota.max_video_minutes_per_month}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(
                    quota.current_video_minutes,
                    quota.max_video_minutes_per_month
                  )}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Avatar Generations</span>
                  <span className="text-sm text-muted-foreground">
                    {quota.current_avatar_generations} /{' '}
                    {quota.max_avatar_generations_per_month === -1
                      ? 'Unlimited'
                      : quota.max_avatar_generations_per_month}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(
                    quota.current_avatar_generations,
                    quota.max_avatar_generations_per_month
                  )}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Whiteboard Exports</span>
                  <span className="text-sm text-muted-foreground">
                    {quota.current_whiteboard_exports} /{' '}
                    {quota.max_whiteboard_exports_per_month === -1
                      ? 'Unlimited'
                      : quota.max_whiteboard_exports_per_month}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(
                    quota.current_whiteboard_exports,
                    quota.max_whiteboard_exports_per_month
                  )}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(invoice.amount_paid / 100)}
                      {invoice.status === 'paid' && invoice.paid_at && (
                        <span> • Paid on {formatDate(invoice.paid_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        invoice.status === 'paid'
                          ? 'default'
                          : invoice.status === 'open'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {invoice.status}
                    </Badge>
                    {invoice.invoice_pdf && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                          Download PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      <VersionFooter />
    </div>
  );
}
