/**
 * Centralized database configuration constants.
 */
export const DB_CONFIG = {
  url: process.env.DATABASE_URL,
  maxRetries: 3,
  retryTimeout: 3000,      // ms per attempt
  logLevel: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
};
