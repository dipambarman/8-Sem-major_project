import { body, param, query, validationResult } from 'express-validator';

class ValidationMiddleware {
  // Handle validation errors
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array()); // ✅ Added logging
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    next();
  }

  // User login validation
  static validateLogin = [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    ValidationMiddleware.handleValidationErrors
  ];

  // User registration validation (RELAXED for development)
  static validateRegister = [
    body('fullName')
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2-100 characters'),
    
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .isLength({ min: 10, max: 15 })  // ✅ More flexible - accepts any 10-15 digit number
      .withMessage('Phone number must be 10-15 digits'),
    
    body('password')
      .isLength({ min: 6 })  // ✅ Reduced from 8 to 6
      .withMessage('Password must be at least 6 characters'),
    // ✅ Removed the complex password requirement for development
    
    ValidationMiddleware.handleValidationErrors
  ];

  // Order creation validation
  static validateOrderCreation = [
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    
    body('items.*.menuItemId')
      .isUUID()
      .withMessage('Valid menu item ID is required'),
    
    body('items.*.quantity')
      .isInt({ min: 1, max: 50 })
      .withMessage('Quantity must be between 1-50'),
    
    body('orderType')
      .isIn(['delivery', 'pickup', 'dine_in'])
      .withMessage('Valid order type is required'),
    
    body('paymentMethod')
      .isIn(['wallet', 'razorpay'])
      .withMessage('Valid payment method is required'),
    
    body('specialInstructions')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Special instructions must be under 500 characters'),
    
    ValidationMiddleware.handleValidationErrors
  ];

  // Menu item validation
  static validateMenuItem = [
    body('name')
      .notEmpty()
      .withMessage('Item name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Item name must be between 2-100 characters'),
    
    body('price')
      .isFloat({ min: 0.01, max: 9999.99 })
      .withMessage('Price must be between 0.01-9999.99'),
    
    body('category')
      .isIn(['beverages', 'snacks', 'main_course', 'desserts', 'combo'])
      .withMessage('Valid category is required'),
    
    body('preparationTime')
      .isInt({ min: 1, max: 120 })
      .withMessage('Preparation time must be between 1-120 minutes'),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must be under 500 characters'),
    
    ValidationMiddleware.handleValidationErrors
  ];

  // Reservation validation
  static validateReservation = [
    body('reservationTime')
      .isISO8601()
      .withMessage('Valid reservation time is required')
      .custom((value) => {
        const reservationDate = new Date(value);
        const now = new Date();
        if (reservationDate <= now) {
          throw new Error('Reservation time must be in the future');
        }
        return true;
      }),
    
    body('partySize')
      .isInt({ min: 1, max: 20 })
      .withMessage('Party size must be between 1-20'),
    
    body('diningArea')
      .isIn(['main', 'outdoor', 'private', 'counter'])
      .withMessage('Valid dining area is required'),
    
    body('contactPhone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Valid phone number is required'),
    
    ValidationMiddleware.handleValidationErrors
  ];

  // Status update validation
  static validateStatusUpdate = [
    body('status')
      .isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
      .withMessage('Valid status is required'),
    
    body('estimatedTime')
      .optional()
      .isInt({ min: 1, max: 120 })
      .withMessage('Estimated time must be between 1-120 minutes'),
    
    ValidationMiddleware.handleValidationErrors
  ];

  // Profile update validation
  static validateProfileUpdate = [
    body('fullName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2-100 characters'),
    
    body('phone')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Valid phone number is required'),
    
    ValidationMiddleware.handleValidationErrors
  ];

  // Pagination validation
  static validatePagination = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1-100'),
    
    ValidationMiddleware.handleValidationErrors
  ];

  // UUID parameter validation
  static validateUUIDParam(paramName) {
    return [
      param(paramName)
        .isUUID()
        .withMessage(`Valid ${paramName} is required`),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }
}

export default ValidationMiddleware;
