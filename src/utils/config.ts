/**
 * Application configuration
 * 
 * This file centralizes all configuration values and environment variables.
 * For local development, values can be overridden in .env files.
 */

// API Configuration
export const API_CONFIG = {
    // Use HTTPS for production endpoints
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    ENDPOINTS: {
        MATH_PROBLEMS: '/dev/publicmathget',
    },
    // In production, this would come from a secure source
    DEVICE_ID: import.meta.env.VITE_DEVICE_ID || '',
};

// Logging Configuration
export const LOGGING_CONFIG = {
    // Disable console logs in production
    ENABLE_DEBUG_LOGS: false, // Disabled to clean up console
};

// Feature Flags
export const FEATURES = {
    // Allow toggling features
    USE_API_PROBLEMS: import.meta.env.VITE_USE_API_PROBLEMS !== 'false', // Re-enabled for debugging
    ALLOW_LEVEL_SKIPPING: true,
};

/**
 * Safe console logger that respects environment settings
 */
export const logger = {
    log: (...args: any[]) => {
        if (LOGGING_CONFIG.ENABLE_DEBUG_LOGS) {
            console.log('[DEBUG]', ...args);
        }
    },
    error: (...args: any[]) => {
        if (LOGGING_CONFIG.ENABLE_DEBUG_LOGS) {
            console.error('[ERROR]', ...args);
        }
    },
    warn: (...args: any[]) => {
        if (LOGGING_CONFIG.ENABLE_DEBUG_LOGS) {
            console.warn('[WARN]', ...args);
        }
    },
    info: (...args: any[]) => {
        if (LOGGING_CONFIG.ENABLE_DEBUG_LOGS) {
            console.info('[INFO]', ...args);
        }
    },
}; 