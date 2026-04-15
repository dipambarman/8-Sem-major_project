/**
 * Central error handling middleware.
 */
class ErrorMiddleware {
  /**
   * Global error handler — catches all unhandled errors from routes.
   */
  static globalErrorHandler(err, req, res, _next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    console.error('🚨 Error:', err);

    // Prisma known errors
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this value already exists';
    }

    if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    // Validation errors
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    }

    // Request entity too large
    if (err.type === 'entity.too.large') {
      statusCode = 413;
      message = 'Request entity too large';
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  /**
   * 404 handler — catches requests to undefined routes.
   */
  static notFoundHandler(req, res, _next) {
    res.status(404).json({
      success: false,
      error: `Route ${req.originalUrl} not found`
    });
  }

  /**
   * Wraps an async route handler to automatically catch errors.
   * Usage: router.get('/path', asyncHandler(controller.method))
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

export default ErrorMiddleware;
