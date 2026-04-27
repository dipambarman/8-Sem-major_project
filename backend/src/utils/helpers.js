/**
 * Shared utility helpers — DRY up repeated patterns across controllers.
 */

// ─── PAGINATION ──────────────────────────────────────────────────────────────

/**
 * Parse pagination params from request query.
 * @param {object} query - req.query
 * @param {object} defaults - { page: 1, limit: 20 }
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query, defaults = {}) => {
  const page = parseInt(query.page) || defaults.page || 1;
  const limit = parseInt(query.limit) || defaults.limit || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a standard pagination response object.
 * @param {number} total - Total record count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {{ total, page, pages }}
 */
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  pages: Math.ceil(total / limit),
});

// ─── ORDER NUMBER ────────────────────────────────────────────────────────────

/**
 * Generate a unique order number.
 * Format: ORD-<timestamp36>-<random5>
 */
export const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

// ─── BONUS CALCULATION ───────────────────────────────────────────────────────

/**
 * Calculate wallet top-up bonus based on amount tiers.
 * @param {number} amount
 * @returns {number} bonus amount
 */
export const calculateBonus = (amount) => {
  if (amount >= 999) return 150;
  if (amount >= 699) return 70;
  if (amount >= 399) return 35;
  if (amount >= 199) return 15;
  return 0;
};

// ─── SMARTPASS DISCOUNT ──────────────────────────────────────────────────────

/**
 * SmartPass discount percent by tier.
 */
export const SMARTPASS_DISCOUNT_MAP = {
  SILVER: 5,
  GOLD: 10,
  PLATINUM: 15,
};

/**
 * Calculate SmartPass discount for a given amount and tier.
 * @param {number} amount
 * @param {string} tier - SILVER | GOLD | PLATINUM
 * @returns {number} discount amount
 */
export const calculateSmartPassDiscount = (amount, tier) => {
  const percent = SMARTPASS_DISCOUNT_MAP[tier] || 0;
  return Math.round((amount * percent) / 100 * 100) / 100;
};

// ─── FORMATTERS ──────────────────────────────────────────────────────────────

/**
 * Format amount as INR currency string.
 */
export const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

/**
 * Safely parse an integer from a value, returning null if invalid.
 */
export const safeParseInt = (value) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};
