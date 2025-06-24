/**
 * API Cache System
 * 
 * This module implements intelligent caching to reduce redundant API calls.
 * It caches the full API response and serves filtered data for different operations.
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface ApiResponse {
    tag: string;
    public: {
        addition_0: any[];
        addition_1: any[];
        addition_2: any[];
        multiplication_0: any[];
        multiplication_1: any[];
        multiplication_2: any[];
        division_0: any[];
        division_1: any[];
        division_2: any[];
        [key: string]: any[];
    };
}

class ApiCache {
    private cache = new Map<string, CacheEntry<any>>();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

    /**
     * Sets a cache entry with TTL
     */
    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl
        });
    }

    /**
     * Gets a cache entry if it exists and hasn't expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Checks if a key exists and is valid
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Clears expired entries
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clears all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Gets cache statistics
     */
    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            hitRate: 0 // Will be calculated by usage
        };
    }
}

// Global cache instance
export const apiCache = new ApiCache();

// Cache keys
export const CACHE_KEYS = {
    MATH_PROBLEMS: 'math_problems_full',
    DIVISION_PROBLEMS: (level: number) => `division_problems_${level}`,
    ADDITION_PROBLEMS: (level: number) => `addition_problems_${level}`,
    MULTIPLICATION_PROBLEMS: (level: number) => `multiplication_problems_${level}`,
    SUBTRACTION_PROBLEMS: (level: number) => `subtraction_problems_${level}`,
};

/**
 * Cached API service wrapper
 * This provides the same interface as the original API service but with caching
 */
export class CachedApiService {
    private hitCount = 0;
    private missCount = 0;

    /**
     * Gets the full math problems response with caching
     */
    async getMathProblems(forceFresh = false): Promise<ApiResponse | null> {
        const cacheKey = CACHE_KEYS.MATH_PROBLEMS;

        // Check cache first (unless forcing fresh data)
        if (!forceFresh) {
            const cached = apiCache.get<ApiResponse>(cacheKey);
            if (cached) {
                this.hitCount++;
                console.log('🔄 Cache HIT for math problems');
                return cached;
            }
        }

        // Cache miss - need to fetch from API
        this.missCount++;
        console.log('🌐 Cache MISS for math problems - fetching from API');

        try {
            // Import the actual fetch function to avoid circular dependency
            const { fetchMathProblems } = await import('./apiService');
            const response = await fetchMathProblems();

            // Cache the response for 5 minutes
            apiCache.set(cacheKey, response, 5 * 60 * 1000);

            return response;
        } catch (error) {
            console.error('Failed to fetch math problems:', error);
            return null;
        }
    }

    /**
     * Gets filtered problems for a specific operation and level
     */
    async getFilteredProblems(
        operation: 'division' | 'addition' | 'multiplication' | 'subtraction',
        level: number,
        forceFresh = false
    ): Promise<any[]> {
        // Build cache key based on operation
        let cacheKey: string;
        switch (operation) {
            case 'division':
                cacheKey = CACHE_KEYS.DIVISION_PROBLEMS(level);
                break;
            case 'addition':
                cacheKey = CACHE_KEYS.ADDITION_PROBLEMS(level);
                break;
            case 'multiplication':
                cacheKey = CACHE_KEYS.MULTIPLICATION_PROBLEMS(level);
                break;
            case 'subtraction':
                cacheKey = CACHE_KEYS.SUBTRACTION_PROBLEMS(level);
                break;
        }

        // Check cache first
        if (!forceFresh) {
            const cached = apiCache.get<any[]>(cacheKey);
            if (cached) {
                this.hitCount++;
                console.log(`🔄 Cache HIT for ${operation} level ${level}`);
                return cached;
            }
        }

        // Cache miss - get from full response and filter
        this.missCount++;
        console.log(`🌐 Cache MISS for ${operation} level ${level}`);

        const fullResponse = await this.getMathProblems(forceFresh);
        if (!fullResponse) {
            return [];
        }

        // Filter the response based on operation
        let filteredProblems: any[] = [];

        if (operation === 'division') {
            // Get all division problems from all levels
            for (let i = 0; i <= 2; i++) {
                const key = `division_${i}`;
                const problems = fullResponse.public[key] || [];
                filteredProblems.push(...problems);
            }
        } else if (operation === 'multiplication') {
            // Get all multiplication problems from all levels
            for (let i = 0; i <= 2; i++) {
                const key = `multiplication_${i}`;
                const problems = fullResponse.public[key] || [];
                filteredProblems.push(...problems);
            }
        } else if (operation === 'addition') {
            // Get all addition problems from all levels
            for (let i = 0; i <= 2; i++) {
                const key = `addition_${i}`;
                const problems = fullResponse.public[key] || [];
                filteredProblems.push(...problems);
            }
        } else if (operation === 'subtraction') {
            // Subtraction uses addition problems converted
            for (let i = 0; i <= 2; i++) {
                const key = `addition_${i}`;
                const problems = fullResponse.public[key] || [];
                filteredProblems.push(...problems);
            }
        }

        // Cache the filtered results for 5 minutes
        apiCache.set(cacheKey, filteredProblems, 5 * 60 * 1000);

        return filteredProblems;
    }

    /**
     * Gets cache hit rate
     */
    getCacheHitRate(): number {
        const total = this.hitCount + this.missCount;
        return total > 0 ? Math.round((this.hitCount / total) * 100) : 0;
    }

    /**
     * Gets cache statistics
     */
    getStats() {
        return {
            hitCount: this.hitCount,
            missCount: this.missCount,
            hitRate: this.getCacheHitRate(),
            cacheStats: apiCache.getStats()
        };
    }

    /**
     * Clears all cache and resets counters
     */
    clearCache() {
        apiCache.clear();
        this.hitCount = 0;
        this.missCount = 0;
        console.log('🧹 API cache cleared');
    }

    /**
     * Preloads cache with fresh data
     */
    async preloadCache(): Promise<void> {
        console.log('🔄 Preloading API cache...');
        await this.getMathProblems(true); // Force fresh fetch
        console.log('✅ API cache preloaded');
    }
}

// Global cached API service instance
export const cachedApiService = new CachedApiService();

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
    apiCache.cleanup();
}, 5 * 60 * 1000); 