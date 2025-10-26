/**
 * Avatar Video Cache
 * In-memory cache for avatar videos to improve performance
 */

interface CacheEntry {
  videoUrl: string;
  timestamp: number;
  text: string;
}

export class AvatarVideoCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 5, ttl: number = 3600000) {
    // 1 hour default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Generate cache key from text
   */
  private generateKey(text: string, voiceId?: string): string {
    const normalizedText = text.trim().toLowerCase();
    return voiceId ? `${voiceId}:${normalizedText}` : normalizedText;
  }

  /**
   * Get cached video URL if available
   */
  get(text: string, voiceId?: string): string | null {
    const key = this.generateKey(text, voiceId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.videoUrl;
  }

  /**
   * Store video URL in cache
   */
  set(text: string, videoUrl: string, voiceId?: string): void {
    const key = this.generateKey(text, voiceId);

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      videoUrl,
      timestamp: Date.now(),
      text,
    });
  }

  /**
   * Check if text is cached
   */
  has(text: string, voiceId?: string): boolean {
    return this.get(text, voiceId) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{ text: string; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.values()).map((entry) => ({
      text: entry.text.substring(0, 50) + (entry.text.length > 50 ? '...' : ''),
      age: now - entry.timestamp,
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries,
    };
  }
}

// Global cache instance
let globalCache: AvatarVideoCache | null = null;

/**
 * Get or create the global cache instance
 */
export function getAvatarCache(): AvatarVideoCache {
  if (!globalCache) {
    globalCache = new AvatarVideoCache(5, 3600000); // 5 videos, 1 hour TTL
  }
  return globalCache;
}

/**
 * Reset the global cache
 */
export function resetAvatarCache(): void {
  if (globalCache) {
    globalCache.clear();
  }
  globalCache = null;
}
