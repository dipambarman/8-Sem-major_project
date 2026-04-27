/**
 * Reusable validation helpers.
 * These complement express-validator by providing standalone functions
 * usable in services and controllers (not just middleware chains).
 */

/**
 * Validate email format.
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate Indian phone number (10 digits starting with 6-9).
 */
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

/**
 * Validate positive numeric amount.
 */
export const isValidAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Validate password strength (min 6 chars).
 */
export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Validate an ID is a positive integer.
 */
export const isValidId = (id) => {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0;
};

/**
 * Validate enum value against allowed values.
 */
export const isValidEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Sanitize string — trim and remove script tags.
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};
