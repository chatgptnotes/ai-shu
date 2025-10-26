/**
 * Subscription Tiers Configuration
 * Defines pricing plans, features, and limits for AI-Shu subscriptions
 */

export type SubscriptionTier = 'basic' | 'premium' | 'school' | 'enterprise';

export interface SubscriptionFeatures {
  name: string;
  description: string;
  priceMonthly: number; // in USD
  priceYearly: number; // in USD (with discount)
  stripePriceIdMonthly?: string; // Set in environment
  stripePriceIdYearly?: string; // Set in environment
  limits: {
    maxSessionsPerMonth: number; // -1 for unlimited
    maxVideoMinutesPerMonth: number;
    maxAvatarGenerationsPerMonth: number;
    maxWhiteboardExportsPerMonth: number;
  };
  features: string[];
  supportsMultipleStudents: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  isPopular?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionFeatures> = {
  basic: {
    name: 'Basic',
    description: 'Perfect for individual students getting started with AI-powered learning',
    priceMonthly: 49,
    priceYearly: 490, // ~17% discount (2 months free)
    limits: {
      maxSessionsPerMonth: 30,
      maxVideoMinutesPerMonth: 300, // 5 hours
      maxAvatarGenerationsPerMonth: 300,
      maxWhiteboardExportsPerMonth: 100,
    },
    features: [
      'AI Avatar Tutor with Aishu',
      'Live Video Sessions',
      'Interactive Whiteboard',
      'Chat History & Transcripts',
      'Session Recording',
      'Mobile & Desktop Access',
      'Email Support',
    ],
    supportsMultipleStudents: false,
    prioritySupport: false,
    customBranding: false,
  },

  premium: {
    name: 'Premium',
    description: 'Best for serious learners with intensive study needs',
    priceMonthly: 99,
    priceYearly: 990, // ~17% discount
    limits: {
      maxSessionsPerMonth: 100,
      maxVideoMinutesPerMonth: 1000, // ~17 hours
      maxAvatarGenerationsPerMonth: 1000,
      maxWhiteboardExportsPerMonth: 500,
    },
    features: [
      'Everything in Basic',
      '3x More Sessions (100/month)',
      '3x More Video Time',
      'Priority Support (24h response)',
      'Advanced Analytics Dashboard',
      'Parent Progress Dashboard',
      'Custom Learning Plans',
      'Exam Preparation Tools',
      'Study Schedule Planning',
    ],
    supportsMultipleStudents: false,
    prioritySupport: true,
    customBranding: false,
    isPopular: true, // Highlight as recommended
  },

  school: {
    name: 'School',
    description: 'Designed for classrooms, tutoring centers, and small institutions',
    priceMonthly: 499,
    priceYearly: 4990, // ~17% discount
    limits: {
      maxSessionsPerMonth: 1000,
      maxVideoMinutesPerMonth: 10000, // ~167 hours
      maxAvatarGenerationsPerMonth: 10000,
      maxWhiteboardExportsPerMonth: 5000,
    },
    features: [
      'Everything in Premium',
      'Up to 50 Students',
      'Teacher Dashboard',
      'Admin Panel',
      'Bulk Student Management',
      'Class Management Tools',
      'Custom Curriculum Upload',
      'Group Sessions',
      'Assignment Tracking',
      'Dedicated Support Manager',
      'Onboarding Training',
    ],
    supportsMultipleStudents: true,
    prioritySupport: true,
    customBranding: false,
  },

  enterprise: {
    name: 'Enterprise',
    description: 'Custom solutions for large schools, districts, and organizations',
    priceMonthly: 0, // Contact sales
    priceYearly: 0, // Contact sales
    limits: {
      maxSessionsPerMonth: -1, // Unlimited
      maxVideoMinutesPerMonth: -1, // Unlimited
      maxAvatarGenerationsPerMonth: -1, // Unlimited
      maxWhiteboardExportsPerMonth: -1, // Unlimited
    },
    features: [
      'Everything in School',
      'Unlimited Students',
      'White Label Solution',
      'Custom Integration (SSO, LMS)',
      'API Access',
      'Custom Domain',
      'Advanced Analytics & Reporting',
      'Service Level Agreement (SLA)',
      'Dedicated Account Manager',
      'Custom Feature Development',
      'On-Premise Deployment Option',
    ],
    supportsMultipleStudents: true,
    prioritySupport: true,
    customBranding: true,
  },
};

/**
 * Get subscription tier by name
 */
export function getSubscriptionTier(tier: SubscriptionTier): SubscriptionFeatures {
  return SUBSCRIPTION_TIERS[tier];
}

/**
 * Get all available tiers
 */
export function getAllTiers(): SubscriptionFeatures[] {
  return Object.values(SUBSCRIPTION_TIERS);
}

/**
 * Calculate yearly savings
 */
export function getYearlySavings(tier: SubscriptionTier): number {
  const config = SUBSCRIPTION_TIERS[tier];
  const monthlyTotal = config.priceMonthly * 12;
  return monthlyTotal - config.priceYearly;
}

/**
 * Calculate percentage savings for yearly plan
 */
export function getYearlySavingsPercentage(tier: SubscriptionTier): number {
  const config = SUBSCRIPTION_TIERS[tier];
  if (config.priceYearly === 0) return 0;
  const monthlyTotal = config.priceMonthly * 12;
  return Math.round(((monthlyTotal - config.priceYearly) / monthlyTotal) * 100);
}

/**
 * Check if tier allows feature
 */
export function tierAllowsFeature(
  tier: SubscriptionTier,
  feature: 'multipleStudents' | 'prioritySupport' | 'customBranding'
): boolean {
  const config = SUBSCRIPTION_TIERS[tier];
  switch (feature) {
    case 'multipleStudents':
      return config.supportsMultipleStudents;
    case 'prioritySupport':
      return config.prioritySupport;
    case 'customBranding':
      return config.customBranding;
    default:
      return false;
  }
}

/**
 * Get recommended tier for user
 */
export function getRecommendedTier(usage: {
  sessionsPerMonth?: number;
  videoMinutesPerMonth?: number;
  numberOfStudents?: number;
}): SubscriptionTier {
  const { sessionsPerMonth = 0, videoMinutesPerMonth = 0, numberOfStudents = 1 } = usage;

  // Enterprise for large organizations
  if (numberOfStudents > 50) {
    return 'enterprise';
  }

  // School for multiple students
  if (numberOfStudents > 1) {
    return 'school';
  }

  // Premium for intensive use
  if (sessionsPerMonth > 30 || videoMinutesPerMonth > 300) {
    return 'premium';
  }

  // Basic for everyone else
  return 'basic';
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price === 0) {
    return 'Contact Sales';
  }
  return `$${price.toFixed(2)}`;
}

/**
 * Get trial period days
 */
export const TRIAL_PERIOD_DAYS = 14;

/**
 * Get grace period days after payment failure
 */
export const GRACE_PERIOD_DAYS = 3;
