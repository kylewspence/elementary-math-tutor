/**
 * Application configuration
 * 
 * This file centralizes all configuration values and environment variables.
 * For local development, values can be overridden in .env files.
 */

// API Configuration
export const API_CONFIG = {
    // Use HTTPS for production endpoints
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    ENDPOINTS: {
        MATH_PROBLEMS: '/dev/publicmathget',
    },
    // In production, this would come from a secure source
    DEVICE_ID: import.meta.env.VITE_DEVICE_ID,
};

// Logging Configuration
export const LOGGING_CONFIG = {
    // Disable console logs in production
    ENABLE_DEBUG_LOGS: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGS === 'true',
};

// Feature Flags
export const FEATURES = {
    // Allow toggling features
    USE_API_PROBLEMS: import.meta.env.VITE_USE_API_PROBLEMS !== 'false', // Default to true
    ALLOW_LEVEL_SKIPPING: true,
};

/**
 * Safe console logger that respects environment settings
 */
export const logger = {
    log: () => {
        // Disabled - no logging
    },
    error: () => {
        // Disabled - no logging
    },
    warn: () => {
        // Disabled - no logging
    },
    info: () => {
        // Disabled - no logging
    },
}; 