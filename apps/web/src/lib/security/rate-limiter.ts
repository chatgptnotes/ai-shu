/**
 * Rate Limiter
 * Implements token bucket and sliding window algorithms
 * Protects APIs from abuse and ensures fair usage
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp when the limit resets
  retryAfter?: number; // Seconds to wait before retrying
}

/**
 * In-memory rate limiter using sliding window
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request is allowed
   */
  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create request history for this identifier
    let history = this.requests.get(identifier) || [];

    // Remove requests outside the current window
    history = history.filter(timestamp => timestamp > windowStart);

    // Update history
    this.requests.set(identifier, history);

    const requestCount = history.length;
    const allowed = requestCount < this.config.maxRequests;

    if (allowed) {
      history.push(now);
      this.requests.set(identifier, history);
    }

    const oldestRequest = history[0] || now;
    const reset = oldestRequest + this.config.windowMs;
    const retryAfter = allowed ? undefined : Math.ceil((reset - now) / 1000);

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - history.length - (allowed ? 1 : 0)),
      reset,
      retryAfter,
    };
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [identifier, history] of this.requests.entries()) {
      const filtered = history.filter(timestamp => timestamp > windowStart);

      if (filtered.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, filtered);
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  public reset(identifier: string) {
    this.requests.delete(identifier);
  }

  /**
   * Get current request count for an identifier
   */
  public getCount(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const history = this.requests.get(identifier) || [];
    return history.filter(timestamp => timestamp > windowStart).length;
  }
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const rateLimiters = {
  // API endpoints - 100 requests per minute
  api: new RateLimiter({
    maxRequests: 100,
    windowMs: 60000,
    message: 'Too many API requests. Please try again later.',
  }),

  // Chat messages - 30 per minute
  chat: new RateLimiter({
    maxRequests: 30,
    windowMs: 60000,
    message: 'Too many messages. Please slow down.',
  }),

  // Authentication - 5 attempts per 15 minutes
  auth: new RateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60000,
    message: 'Too many login attempts. Please try again later.',
  }),

  // Session creation - 10 per hour
  session: new RateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60000,
    message: 'Too many sessions created. Please wait before starting a new one.',
  }),

  // Voice requests - 50 per hour
  voice: new RateLimiter({
    maxRequests: 50,
    windowMs: 60 * 60000,
    message: 'Voice quota exceeded. Please try again later.',
  }),

  // Whiteboard saves - 20 per hour
  whiteboard: new RateLimiter({
    maxRequests: 20,
    windowMs: 60 * 60000,
    message: 'Too many whiteboard saves. Please wait a moment.',
  }),
};

/**
 * Get user identifier for rate limiting
 * Uses IP address, user ID, or session ID
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get user ID from session/auth
  // For now, use IP address as fallback
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return ip.split(',')[0].trim();
}

/**
 * Create rate limit headers for HTTP responses
 */
export function createRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.reset / 1000)),
    ...(result.retryAfter && { 'Retry-After': String(result.retryAfter) }),
  };
}
