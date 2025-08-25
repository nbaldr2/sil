const { logger } = require('../utils/logger');

/**
 * Global error handler middleware
 * Logs all errors and sends appropriate response to client
 */
const errorHandler = (err, req, res, next) => {
  // Log the error with detailed information
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    params: req.params,
    query: req.query,
    // Only include body in development to avoid logging sensitive data
    ...(process.env.NODE_ENV === 'development' && { body: req.body })
  });

  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Send response
  res.status(statusCode).json({
    error: isDevelopment ? err.message : 'An error occurred while processing your request',
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * Async handler to catch errors in async route handlers
 * Eliminates the need for try/catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    logger.error('Async handler caught error:', {
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
      method: req.method
    });
    next(err);
  });
};

/**
 * Not found handler middleware
 * Logs and handles 404 errors
 */
const notFoundHandler = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.status = 404;
  
  logger.warn('Route not found:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  next(err);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};