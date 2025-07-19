/**
 * Standardized API Response Utilities
 * Ensures consistent error and success response formats across all admin APIs
 */

// Standard error codes for programmatic handling
export const ERROR_CODES = {
  // Authentication & Authorization
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  CSRF_INVALID: 'CSRF_INVALID',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  
  // Resource Management
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LIMIT: 'RESOURCE_LIMIT',
  
  // Business Logic
  OPERATION_FAILED: 'OPERATION_FAILED',
  STATE_INVALID: 'STATE_INVALID',
  DEPENDENCY_MISSING: 'DEPENDENCY_MISSING',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  RATE_LIMITED: 'RATE_LIMITED'
};

/**
 * Create standardized success response
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} meta - Additional metadata
 */
export function successResponse(res, data = null, message = 'Success', statusCode = 200, meta = null) {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...(data !== null && { data }),
    ...(meta && { meta })
  };
  
  return res.status(statusCode).json(response);
}

/**
 * Create standardized error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Programmatic error code
 * @param {Array} errors - Detailed error array (for validation)
 * @param {object} context - Additional error context
 */
export function errorResponse(res, message, statusCode = 500, errorCode = ERROR_CODES.INTERNAL_ERROR, errors = null, context = null) {
  const response = {
    success: false,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
    ...(errors && { errors }),
    ...(context && { context })
  };
  
  return res.status(statusCode).json(response);
}

/**
 * Specific error response functions for common cases
 */

export function authRequiredResponse(res, message = 'Authentication required') {
  return errorResponse(res, message, 401, ERROR_CODES.AUTH_REQUIRED);
}

export function authInvalidResponse(res, message = 'Invalid credentials') {
  return errorResponse(res, message, 401, ERROR_CODES.AUTH_INVALID);
}

export function csrfInvalidResponse(res, message = 'Invalid CSRF token') {
  return errorResponse(res, message, 403, ERROR_CODES.CSRF_INVALID);
}

export function validationErrorResponse(res, message = 'Validation failed', errors = []) {
  return errorResponse(res, message, 400, ERROR_CODES.VALIDATION_ERROR, errors);
}

export function notFoundResponse(res, resource = 'Resource', message = null) {
  const errorMessage = message || `${resource} not found`;
  return errorResponse(res, errorMessage, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
}

export function conflictResponse(res, message = 'Resource conflict') {
  return errorResponse(res, message, 409, ERROR_CODES.RESOURCE_CONFLICT);
}

export function methodNotAllowedResponse(res, allowedMethods = []) {
  const context = allowedMethods.length > 0 ? { allowedMethods } : null;
  return errorResponse(res, 'Method not allowed', 405, ERROR_CODES.METHOD_NOT_ALLOWED, null, context);
}

export function internalErrorResponse(res, message = 'Internal server error', context = null) {
  return errorResponse(res, message, 500, ERROR_CODES.INTERNAL_ERROR, null, context);
}

export function operationFailedResponse(res, message = 'Operation failed', context = null) {
  return errorResponse(res, message, 400, ERROR_CODES.OPERATION_FAILED, null, context);
}

export function rateLimitResponse(res, message = 'Rate limit exceeded') {
  return errorResponse(res, message, 429, ERROR_CODES.RATE_LIMITED);
}

/**
 * Handle common async errors with proper logging
 * @param {function} asyncFn - Async function to execute
 * @param {object} res - Express response object
 * @param {object} logger - Pino logger instance
 * @param {string} operation - Operation description for logging
 */
export async function handleAsyncError(asyncFn, res, logger, operation = 'API operation') {
  try {
    return await asyncFn();
  } catch (error) {
    logger.error({ 
      error: error.message, 
      stack: error.stack, 
      operation 
    }, `${operation} failed`);
    
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';
      
    return internalErrorResponse(res, message);
  }
}

/**
 * Middleware wrapper for standardized error handling
 */
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('Unhandled error in API handler:', error);
      return internalErrorResponse(res, 'Internal server error');
    }
  };
}

/**
 * Map common validation errors to standardized responses
 */
export function mapValidationErrors(validationResult) {
  if (validationResult.isValid) return null;
  
  return validationErrorResponse(null, 'Validation failed', validationResult.errors);
}