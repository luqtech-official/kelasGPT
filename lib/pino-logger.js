import pino from 'pino';
import { randomBytes } from 'crypto';

const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

export function createLogger(request) {
  const requestId = request?.headers?.['x-request-id'] || randomBytes(16).toString('hex');
  const correlationId = request?.headers?.['x-correlation-id'] || randomBytes(8).toString('hex');
  
  const baseLogger = logger.child({ 
    requestId,
    correlationId,
    userAgent: request?.headers?.['user-agent'],
    ip: request?.headers?.['x-forwarded-for'] || request?.connection?.remoteAddress,
    method: request?.method,
    url: request?.url,
    timestamp: new Date().toISOString()
  });

  return {
    ...baseLogger,
    
    // Security Event Logging
    security: {
      authAttempt: (data) => baseLogger.info({ 
        category: 'SECURITY', 
        event: 'AUTH_ATTEMPT', 
        ...data 
      }, `Authentication attempt: ${data.outcome}`),
      
      sessionEvent: (data) => baseLogger.info({ 
        category: 'SECURITY', 
        event: 'SESSION_EVENT', 
        ...data 
      }, `Session event: ${data.action}`),
      
      csrfEvent: (data) => baseLogger.info({ 
        category: 'SECURITY', 
        event: 'CSRF_EVENT', 
        ...data 
      }, `CSRF event: ${data.action}`),
      
      suspiciousActivity: (data) => baseLogger.warn({ 
        category: 'SECURITY', 
        event: 'SUSPICIOUS_ACTIVITY', 
        ...data 
      }, `Suspicious activity detected: ${data.description}`),
      
      permissionDenied: (data) => baseLogger.warn({ 
        category: 'SECURITY', 
        event: 'PERMISSION_DENIED', 
        ...data 
      }, `Permission denied: ${data.resource}`),
      
      inputValidationFailure: (data) => baseLogger.warn({ 
        category: 'SECURITY', 
        event: 'INPUT_VALIDATION_FAILURE', 
        ...data 
      }, `Input validation failed: ${data.field}`)
    },

    // Audit Trail Logging
    audit: {
      dataAccess: (data) => baseLogger.info({ 
        category: 'AUDIT', 
        event: 'DATA_ACCESS', 
        ...data 
      }, `Data accessed: ${data.resource}`),
      
      dataModification: (data) => baseLogger.info({ 
        category: 'AUDIT', 
        event: 'DATA_MODIFICATION', 
        ...data 
      }, `Data modified: ${data.resource}`),
      
      exportOperation: (data) => baseLogger.info({ 
        category: 'AUDIT', 
        event: 'EXPORT_OPERATION', 
        ...data 
      }, `Data exported: ${data.type}`),
      
      adminAction: (data) => baseLogger.info({ 
        category: 'AUDIT', 
        event: 'ADMIN_ACTION', 
        ...data 
      }, `Admin action: ${data.action}`),
      
      statusChange: (data) => baseLogger.info({ 
        category: 'AUDIT', 
        event: 'STATUS_CHANGE', 
        ...data 
      }, `Status changed: ${data.entity} ${data.oldStatus} → ${data.newStatus}`)
    },

    // Performance & Development Logging
    performance: {
      queryTiming: (data) => baseLogger.debug({ 
        category: 'PERFORMANCE', 
        event: 'QUERY_TIMING', 
        ...data 
      }, `Query executed in ${data.duration}ms: ${data.operation}`),
      
      apiTiming: (data) => baseLogger.debug({ 
        category: 'PERFORMANCE', 
        event: 'API_TIMING', 
        ...data 
      }, `API ${data.endpoint} completed in ${data.duration}ms`),
      
      slowOperation: (data) => baseLogger.warn({ 
        category: 'PERFORMANCE', 
        event: 'SLOW_OPERATION', 
        ...data 
      }, `Slow operation detected: ${data.operation} took ${data.duration}ms`),
      
      memoryUsage: (data) => baseLogger.debug({ 
        category: 'PERFORMANCE', 
        event: 'MEMORY_USAGE', 
        ...data 
      }, `Memory usage: ${data.usage}`)
    },

    // Development & Debugging
    dev: {
      functionEntry: (data) => baseLogger.debug({ 
        category: 'DEV', 
        event: 'FUNCTION_ENTRY', 
        ...data 
      }, `Entering ${data.function} with params: ${JSON.stringify(data.params)}`),
      
      functionExit: (data) => baseLogger.debug({ 
        category: 'DEV', 
        event: 'FUNCTION_EXIT', 
        ...data 
      }, `Exiting ${data.function} with result: ${JSON.stringify(data.result)}`),
      
      stateChange: (data) => baseLogger.debug({ 
        category: 'DEV', 
        event: 'STATE_CHANGE', 
        ...data 
      }, `State changed: ${data.component} ${JSON.stringify(data.oldState)} → ${JSON.stringify(data.newState)}`),
      
      conditionalBranch: (data) => baseLogger.debug({ 
        category: 'DEV', 
        event: 'CONDITIONAL_BRANCH', 
        ...data 
      }, `Branch taken: ${data.condition} = ${data.result}`),
      
      dataTransformation: (data) => baseLogger.debug({ 
        category: 'DEV', 
        event: 'DATA_TRANSFORMATION', 
        ...data 
      }, `Data transformed: ${data.operation}`)
    },

    // Database Operation Logging
    database: {
      queryStart: (data) => baseLogger.debug({ 
        category: 'DATABASE', 
        event: 'QUERY_START', 
        ...data 
      }, `Starting query: ${data.operation}`),
      
      queryComplete: (data) => baseLogger.debug({ 
        category: 'DATABASE', 
        event: 'QUERY_COMPLETE', 
        ...data 
      }, `Query completed: ${data.operation} returned ${data.rowCount} rows in ${data.duration}ms`),
      
      transactionStart: (data) => baseLogger.debug({ 
        category: 'DATABASE', 
        event: 'TRANSACTION_START', 
        ...data 
      }, `Transaction started: ${data.type}`),
      
      transactionComplete: (data) => baseLogger.debug({ 
        category: 'DATABASE', 
        event: 'TRANSACTION_COMPLETE', 
        ...data 
      }, `Transaction ${data.result}: ${data.type}`),
      
      connectionEvent: (data) => baseLogger.debug({ 
        category: 'DATABASE', 
        event: 'CONNECTION_EVENT', 
        ...data 
      }, `Database connection: ${data.action}`)
    },

    // Frontend Event Logging  
    frontend: {
      userInteraction: (data) => baseLogger.debug({ 
        category: 'FRONTEND', 
        event: 'USER_INTERACTION', 
        ...data 
      }, `User interaction: ${data.action} on ${data.element}`),
      
      componentEvent: (data) => baseLogger.debug({ 
        category: 'FRONTEND', 
        event: 'COMPONENT_EVENT', 
        ...data 
      }, `Component event: ${data.component} ${data.event}`),
      
      errorBoundary: (data) => baseLogger.error({ 
        category: 'FRONTEND', 
        event: 'ERROR_BOUNDARY', 
        ...data 
      }, `Error boundary caught: ${data.error}`),
      
      apiCall: (data) => baseLogger.debug({ 
        category: 'FRONTEND', 
        event: 'API_CALL', 
        ...data 
      }, `API call: ${data.method} ${data.endpoint}`)
    }
  };
}

// Utility function for creating server-side loggers without request context
export function createServerLogger(context = {}) {
  const correlationId = randomBytes(8).toString('hex');
  
  const baseLogger = logger.child({
    correlationId,
    context: 'server',
    timestamp: new Date().toISOString(),
    ...context
  });

  return createLogger({ headers: {} });
}
