/**
 * Centralized JWT configuration.
 * All JWT operations should reference these constants.
 */
export const JWT_SECRET = process.env.JWT_SECRET || 'smart_canteen_jwt_secret_key';
export const JWT_EXPIRY = '7d';
export const JWT_ALGORITHM = 'HS256';
