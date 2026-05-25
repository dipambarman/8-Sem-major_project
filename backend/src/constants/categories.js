/**
 * Menu Item Categories
 * These constants define the standard categories used throughout the application.
 * All database entries use UPPERCASE format.
 */

export const MENU_CATEGORIES = {
  BREAKFAST: 'BREAKFAST',
  SNACKS: 'SNACKS',
  MAIN_COURSE: 'MAIN_COURSE',
  DESSERTS: 'DESSERTS',
  BEVERAGES: 'BEVERAGES',
};

/**
 * Category display names for UI (Title Case)
 * Used for displaying to users in dashboards and mobile apps
 */
export const CATEGORY_DISPLAY_NAMES = {
  BREAKFAST: 'Breakfast',
  SNACKS: 'Snacks',
  MAIN_COURSE: 'Main Course',
  DESSERTS: 'Desserts',
  BEVERAGES: 'Beverages',
};

/**
 * Get all available categories
 */
export const getAllCategories = () => Object.values(MENU_CATEGORIES);

/**
 * Get display name for a category
 * @param {string} category - The database category (UPPERCASE)
 * @returns {string} - The display name (Title Case)
 */
export const getCategoryDisplayName = (category) => {
  return CATEGORY_DISPLAY_NAMES[category] || category;
};

/**
 * Convert display name to database format
 * @param {string} displayName - The display name (Title Case)
 * @returns {string} - The database format (UPPERCASE)
 */
export const getDatabaseCategory = (displayName) => {
  const entry = Object.entries(CATEGORY_DISPLAY_NAMES).find(
    ([_, name]) => name.toUpperCase() === displayName.toUpperCase()
  );
  return entry ? entry[0] : displayName.toUpperCase();
};
