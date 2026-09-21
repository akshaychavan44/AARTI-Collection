/**
 * Lightweight Client-Side In-Memory Stale-While-Revalidate (SWR) Cache
 * 
 * Provides instant data retrieval for page transitions, avoiding blank screens
 * and full-page loading spinners when navigating between tabs or pages.
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class ClientCache {
  private cache = new Map<string, CacheEntry>();
  private inflight = new Map<string, Promise<any>>();

  /**
   * Default TTL: 30 seconds for read queries
   */
  private defaultTtlMs = 30_000;

  /**
   * Get cached data synchronously if available.
   * Returns data even if stale so the UI can render immediately (SWR).
   */
  public get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data as T;
  }

  /**
   * Check if cache entry is still within its fresh TTL.
   */
  public isFresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttlMs;
  }

  /**
   * Set cached data with optional TTL.
   */
  public set<T = any>(key: string, data: T, ttlMs: number = this.defaultTtlMs): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  }

  /**
   * Invalidate cache entries matching a prefix or all entries.
   */
  public invalidate(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Fetch with in-flight deduplication and stale-while-revalidate pattern.
   * If fresh data is cached, returns it immediately.
   * If a fetch for this key is already running, reuses the in-flight promise.
   */
  public async fetchWithSWR<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = this.defaultTtlMs
  ): Promise<{ data: T; fromCache: boolean }> {
    const cached = this.get<T>(key);
    const isFresh = this.isFresh(key);

    // If fresh, return immediately without network call
    if (cached !== null && isFresh) {
      return { data: cached, fromCache: true };
    }

    // Deduplicate in-flight requests for the same key
    if (this.inflight.has(key)) {
      const data = await this.inflight.get(key);
      return { data, fromCache: false };
    }

    const promise = (async () => {
      try {
        const data = await fetcher();
        this.set(key, data, ttlMs);
        return data;
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);

    // If we have stale cached data, don't wait: return stale data while background updates!
    // Caller can use cached data immediately, and this background promise updates the cache.
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    const freshData = await promise;
    return { data: freshData, fromCache: false };
  }
}

export const clientCache = new ClientCache();
