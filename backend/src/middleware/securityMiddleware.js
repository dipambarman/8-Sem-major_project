import rateLimit from 'express-rate-limit';

/**
 * Security middleware — rate limiters, input sanitization, request logging.
 * Converted from CommonJS to ESM. Removed express-slow-down dependency (not in package.json).
 */
class SecurityMiddleware {
  // API rate limiting
  static apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.endsWith('/health') || req.path === '/',
    keyGenerator: (req) => {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) return token;
      }
      return req.ip;
    }
  });

  // Strict rate limiting for auth endpoints
  static authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Payment endpoint rate limiting
  static paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
      success: false,
      error: 'Too many payment requests, please try again later.',
    },
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    }
  });

  // Request sanitization
  static sanitizeInput(req, res, next) {
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
  }

  // IP whitelist for admin endpoints
  static adminIPWhitelist(req, res, next) {
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];

    if (allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied from this IP address',
      });
    }

    next();
  }

  // Request logging
  static requestLogger(req, res, next) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      };

      if (res.statusCode >= 400 || duration > 1000) {
        console.log('⚠️  Request:', JSON.stringify(logData));
      }
    });

    next();
  }
}

export default SecurityMiddleware;
