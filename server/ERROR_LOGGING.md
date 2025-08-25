# Error Logging System

This document explains how errors are logged in the SIL Laboratory Management System API.

## Overview

The system uses Winston for logging, with different log levels and destinations:

- **Error logs**: Saved to `server/logs/error.log`
- **Combined logs**: Saved to `server/logs/combined.log`
- **Console logs**: Displayed during development

## Log Levels

The system uses the following log levels (in order of severity):

1. **error**: Critical errors that need immediate attention
2. **warn**: Warning conditions that should be reviewed
3. **info**: Informational messages about normal operation
4. **debug**: Detailed debugging information (development only)

## Error Handling Middleware

The application uses several middleware components for error handling:

1. **requestLogger**: Logs all incoming requests
2. **errorLogger**: Logs errors from request processing
3. **notFoundHandler**: Handles and logs 404 errors
4. **errorHandler**: Global error handler that logs and formats error responses

## How to Use in Controllers

### Method 1: Using asyncHandler (Recommended)

```javascript
const { asyncHandler } = require('../middleware/errorHandler');

// The asyncHandler will automatically catch any errors and pass them to the error middleware
const myController = asyncHandler(async (req, res) => {
  const result = await someAsyncOperation();
  res.json(result);
});
```

### Method 2: Using try/catch with logger

```javascript
const { logger } = require('../utils/logger');

const myController = async (req, res, next) => {
  try {
    const result = await someAsyncOperation();
    res.json(result);
  } catch (error) {
    // Log the error with detailed information
    logger.error('Operation failed:', {
      error: error.message,
      stack: error.stack,
      operation: 'someAsyncOperation'
    });
    
    // Pass to error handler middleware
    next(error);
  }
};
```

## Log Format

Logs are stored in JSON format with the following information:

- **timestamp**: When the log was created
- **level**: Log level (error, warn, info, debug)
- **message**: Main log message
- **service**: Service name (sil-lab-api)
- **error**: Error message (for error logs)
- **stack**: Error stack trace (for error logs)
- **method**: HTTP method (for request logs)
- **url**: Request URL (for request logs)
- **statusCode**: HTTP status code (for response logs)
- **duration**: Request processing time (for response logs)
- **userId**: User ID if authenticated

## Log Rotation

Logs are automatically rotated:

- Maximum file size: 5MB
- Maximum files: 5 (per log type)

## Viewing Logs

You can view logs using standard Unix tools:

```bash
# View the last 100 lines of the error log
tail -n 100 server/logs/error.log

# Search for specific errors
grep "database connection" server/logs/error.log

# Monitor error log in real-time
tail -f server/logs/error.log
```

## Best Practices

1. Use the appropriate log level for each message
2. Include relevant context with each log (user ID, request ID, etc.)
3. Don't log sensitive information (passwords, tokens, etc.)
4. Use structured logging (objects) rather than string concatenation
5. Use the asyncHandler for all async route handlers to ensure errors are caught