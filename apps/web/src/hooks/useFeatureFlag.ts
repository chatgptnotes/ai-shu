/**
 * React Hook for Feature Flags
 * Client-side feature flag checking
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook to check if a feature flag is enabled
 */
export function useFeatureFlag(flagName: string): {
  enabled: boolean;
  loading: boolean;
  error: Error | null;
} {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkFlag() {
      try {
        setLoading(true);
        setError(null);

        // Call API to check feature flag
        const response = await fetch('/api/feature-flags/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ flagName }),
        });

        if (!response.ok) {
          throw new Error('Failed to check feature flag');
        }

        const data = await response.json();

        if (mounted) {
          setEnabled(data.enabled || false);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setEnabled(false); // Fail closed
          setLoading(false);
        }
      }
    }

    checkFlag();

    return () => {
      mounted = false;
    };
  }, [flagName]);

  return { enabled, loading, error };
}

/**
 * Hook to get all feature flags for the current user
 */
export function useFeatureFlags(): {
  flags: Record<string, boolean>;
  loading: boolean;
  error: Error | null;
} {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchFlags() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/feature-flags');

        if (!response.ok) {
          throw new Error('Failed to fetch feature flags');
        }

        const data = await response.json();

        if (mounted) {
          setFlags(data.flags || {});
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setFlags({});
          setLoading(false);
        }
      }
    }

    fetchFlags();

    return () => {
      mounted = false;
    };
  }, []);

  return { flags, loading, error };
}

/**
 * Hook to subscribe to feature flag changes in real-time
 */
export function useFeatureFlagRealtime(flagName: string): {
  enabled: boolean;
  loading: boolean;
} {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Initial fetch
    async function fetchFlag() {
      const { data } = await supabase
        .from('feature_flags')
        .select('enabled, rollout_percentage')
        .eq('name', flagName)
        .single();

      if (mounted && data) {
        setEnabled(data.enabled && data.rollout_percentage > 0);
        setLoading(false);
      }
    }

    fetchFlag();

    // Subscribe to changes
    const channel = supabase
      .channel(`feature-flag-${flagName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
          filter: `name=eq.${flagName}`,
        },
        (payload) => {
          if (mounted && payload.new) {
            const flag = payload.new as any;
            setEnabled(flag.enabled && flag.rollout_percentage > 0);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [flagName]);

  return { enabled, loading };
}
