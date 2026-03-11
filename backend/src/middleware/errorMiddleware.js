class ErrorMiddleware {
  // Global error handler
  static globalErrorHandler(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;

    console.error('🚨 Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const message = 'Duplicate field value entered';
      error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid token';
      error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
      const message = 'Token expired';
      error = { message, statusCode: 401 };
    }

    // Sequelize errors
    if (err.name === 'SequelizeValidationError') {
      const message = err.errors.map(e => e.message).join(', ');
      error = { message, statusCode: 400 };
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
      const message = 'Duplicate entry';
      error = { message, statusCode: 400 };
    }

    // File upload errors
    if (err.code === 'MULTER_ERROR') {
      const message = 'File upload error';
      error = { message, statusCode: 400 };
    }

    // Rate limiting errors
    if (err.type === 'entity.too.large') {
      const message = 'Request entity too large';
      error = { message, statusCode: 413 };
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // 404 handler
  static notFoundHandler(req, res, next) {
    const message = `Route ${req.originalUrl} not found`;
    
    res.status(404).json({
      success: false,
      error: message
    });
  }

  // Async error wrapper
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Database connection error handler
  static databaseErrorHandler(err) {
    console.error('🔴 Database connection error:', err);
    
    if (err.name === 'SequelizeConnectionError') {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }
  }

  // Unhandled promise rejection handler
  static unhandledRejectionHandler(err, promise) {
    console.error('🔴 Unhandled Promise Rejection:', err);
    process.exit(1);
  }

  // Uncaught exception handler
  static uncaughtExceptionHandler(err) {
    console.error('🔴 Uncaught Exception:', err);
    process.exit(1);
  }
}

module.exports = ErrorMiddleware;
