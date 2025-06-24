/**
 * Cache Preloader
 * 
 * This module provides functionality to preload the API cache on application startup
 * to improve initial performance and reduce API calls.
 */

import { cachedApiService } from './apiCache';

/**
 * Preloads the cache with math problems data
 * This should be called early in the application lifecycle
 */
export async function preloadCache(): Promise<void> {
    try {
        console.log('🚀 Starting cache preload...');

        // Preload the main math problems data
        await cachedApiService.preloadCache();

        console.log('✅ Cache preload completed successfully');

        // Log cache statistics
        const stats = cachedApiService.getStats();
        console.log('📊 Cache stats after preload:', stats);

    } catch (error) {
        console.error('❌ Cache preload failed:', error);
        // Don't throw the error - app should still work without cache
    }
}

/**
 * Initializes cache preloading with optional delay
 * Useful for non-blocking startup
 */
export function initCachePreload(delayMs: number = 1000): void {
    setTimeout(() => {
        preloadCache();
    }, delayMs);
} 