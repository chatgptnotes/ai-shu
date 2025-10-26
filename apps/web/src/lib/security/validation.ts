/**
 * Input Validation & Sanitization
 *
 * Comprehensive validation schemas and sanitization utilities
 * for all API endpoints and user inputs
 */

import { z } from 'zod';

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

export const emailSchema = z.string().email('Invalid email address').toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

export const uuidSchema = z.string().uuid('Invalid ID format');

export const urlSchema = z.string().url('Invalid URL format');

export const curriculumSchema = z.enum(['ib', 'a-level', 'ap', 'igcse', 'cbse', 'other']);

export const subjectSchema = z.enum([
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'computer science',
  'english',
  'business',
  'economics',
  'history',
  'geography',
]);

export const subscriptionTierSchema = z.enum(['basic', 'pro', 'school']);

export const billingPeriodSchema = z.enum(['monthly', 'yearly']);

// ============================================================================
// API ENDPOINT VALIDATION SCHEMAS
// ============================================================================

/**
 * Chat API Validation
 */
export const chatRequestSchema = z.object({
  sessionId: uuidSchema,
  message: z.string().min(1).max(5000),
  subject: subjectSchema,
  topic: z.string().min(1).max(200),
  studentName: nameSchema,
  isInitial: z.boolean().optional(),
});

/**
 * Avatar Generation Validation
 */
export const avatarGenerationSchema = z.object({
  text: z.string().min(1).max(1000),
  voiceId: z.string().optional(),
  avatarUrl: urlSchema.optional(),
  useElevenLabs: z.boolean().optional(),
});

/**
 * Session Creation Validation
 */
export const sessionCreationSchema = z.object({
  subject: subjectSchema,
  topic: z.string().min(1).max(200),
  curriculum: curriculumSchema.optional(),
  gradeLevel: z.number().int().min(1).max(20).optional(),
});

/**
 * Profile Update Validation
 */
export const profileUpdateSchema = z.object({
  full_name: nameSchema,
  grade_level: z.number().int().min(1).max(20),
  curriculum: curriculumSchema,
  subjects: z.array(subjectSchema).min(1, 'At least one subject required'),
  learning_goals: z.string().max(500).optional(),
  timezone: z.string().optional(),
});

/**
 * Stripe Checkout Validation
 */
export const stripeCheckoutSchema = z.object({
  tier: subscriptionTierSchema,
  billingPeriod: billingPeriodSchema,
});

/**
 * Billing Portal Validation
 */
export const billingPortalSchema = z.object({
  returnUrl: urlSchema,
});

/**
 * Agora Token Validation
 */
export const agoraTokenSchema = z.object({
  channelName: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid channel name'),
  uid: z.number().int().min(0).optional(),
});

/**
 * Voice Text-to-Speech Validation
 */
export const voiceTTSSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().optional(),
  settings: z
    .object({
      stability: z.number().min(0).max(1).optional(),
      similarity_boost: z.number().min(0).max(1).optional(),
      style: z.number().min(0).max(1).optional(),
      use_speaker_boost: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Voice Speech-to-Text Validation
 */
export const voiceSTTSchema = z.object({
  audio: z.any(), // File object, validated separately
  language: z.string().length(2).optional(), // ISO 639-1 code
});

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate request body against a schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      return {
        success: false,
        error: errors.join(', '),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      error: 'Invalid request body',
    };
  }
}

/**
 * Validate form data against a schema
 */
export async function validateFormData<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      return {
        success: false,
        error: errors.join(', '),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      error: 'Invalid form data',
    };
  }
}

/**
 * Validate query parameters against a schema
 */
export function validateQueryParams<T>(
  url: URL,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(url.searchParams.entries());
    const result = schema.safeParse(params);

    if (!result.success) {
      const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      return {
        success: false,
        error: errors.join(', '),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      error: 'Invalid query parameters',
    };
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { success: true } | { success: false; error: string } {
  const { maxSize = 25 * 1024 * 1024, allowedTypes = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { success: true };
}
