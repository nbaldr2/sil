const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Example controller showing proper error handling and logging
 */

// Method 1: Using asyncHandler (recommended)
const exampleAsyncHandler = asyncHandler(async (req, res) => {
  // This will be caught by asyncHandler if it fails
  const result = await someAsyncOperation();
  res.json(result);
});

// Method 2: Using try/catch with logger
const exampleTryCatch = async (req, res, next) => {
  try {
    const result = await someAsyncOperation();
    res.json(result);
  } catch (error) {
    // Log the error with detailed information
    logger.error('Operation failed:', {
      error: error.message,
      stack: error.stack,
      operation: 'someAsyncOperation',
      requestId: req.id,
      userId: req.user?.id
    });
    
    // Pass to error handler middleware
    next(error);
  }
};

// Method 3: For synchronous operations
const exampleSyncOperation = (req, res, next) => {
  try {
    // Some synchronous operation that might throw
    const result = someSyncOperation();
    res.json(result);
  } catch (error) {
    logger.error('Sync operation failed:', {
      error: error.message,
      stack: error.stack,
      operation: 'someSyncOperation'
    });
    next(error);
  }
};

// Example of logging different levels
const logLevelExample = (req, res) => {
  // Informational logs
  logger.info('User performed action', { 
    userId: req.user?.id, 
    action: 'view_dashboard' 
  });
  
  // Warning logs (non-critical issues)
  logger.warn('Resource is running low', { 
    resource: 'database_connections',
    current: 85,
    max: 100
  });
  
  // Error logs (problems that need attention)
  logger.error('Payment processing failed', {
    orderId: 'ORD123456',
    reason: 'gateway_timeout',
    amount: 199.99
  });
  
  res.json({ status: 'Logging example completed' });
};

// Placeholder functions
async function someAsyncOperation() {
  return { success: true };
}

function someSyncOperation() {
  return { success: true };
}

module.exports = {
  exampleAsyncHandler,
  exampleTryCatch,
  exampleSyncOperation,
  logLevelExample
};