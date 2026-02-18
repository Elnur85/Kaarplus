/**
 * Simple in-memory cache service with TTL support.
 * Used for optimizing expensive database queries and API responses.
 */

type CacheEntry<T> = {
    value: T;
    expiresAt: number;
};

export class CacheService {
    private cache = new Map<string, CacheEntry<unknown>>();

    /**
     * Set a value in the cache with a specific TTL
     * @param key Unique identifier for the cached item
     * @param value The data to cache
     * @param ttlSeconds Time-to-live in seconds
     */
    set<T>(key: string, value: T, ttlSeconds: number): void {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    /**
     * Retrieve a value from the cache
     * @param key Unique identifier
     * @returns The cached value or null if not found or expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value as T;
    }

    /**
     * Delete a specific key from the cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Delete all keys that contain a specific substring
     * Useful for invalidating sets of related data (e.g., "search:")
     */
    invalidatePattern(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all items from the cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get total number of items in cache (for debugging)
     */
    size(): number {
        return this.cache.size;
    }
}

// Singleton instance
export const cacheService = new CacheService();
