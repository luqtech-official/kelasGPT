import pino from 'pino';
import { randomUUID } from 'crypto';

/**
 * Root pino instance with sane defaults for both development and production.
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  formatters: {
    level: label => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

/**
 * Attach domain‑specific helper namespaces (security, audit, etc.)
 * to a pino logger instance without breaking its prototype.
 * Replace the examples with your own helpers as needed.
 */
function attachHelpers(target) {
  /* ---------- Security helpers ---------- */
  target.security = {
    inputValidationFailure(data, msg = 'Input validation error') {
      target.warn({ category: 'SECURITY', ...data }, msg);
    },
    authenticationFailure(data, msg = 'Authentication failure') {
      target.warn({ category: 'SECURITY', ...data }, msg);
    },
  };

  /* ---------- Audit helpers ---------- */
  target.audit = {
    userAction(data, msg = 'User action') {
      target.info({ category: 'AUDIT', ...data }, msg);
    },
  };

  /* ---------- Performance helpers ---------- */
  target.performance = {
    latency(ms, route) {
      target.info({ category: 'PERFORMANCE', ms, route }, 'Request latency');
    },
  };

  /* ---------- Dev helpers ---------- */
  target.dev = {
    dump(obj, label = 'Debug dump') {
      target.debug({ category: 'DEV', obj }, label);
    },
  };

  /* ---------- Database helpers ---------- */
  target.database = {
    query(sql, duration, msg = 'SQL query') {
      target.debug({ category: 'DATABASE', sql, duration }, msg);
    },
  };

  return target;
}

/**
 * Create a request‑scoped logger.
 * @param {import('http').IncomingMessage} [req]
 */
export function createLogger(req) {
  const requestId = req?.headers?.['x-request-id'] || randomUUID();
  const correlationId = req?.headers?.['x-correlation-id'] || randomUUID();

  const baseLogger = logger.child({
    requestId,
    correlationId,
    userAgent: req?.headers?.['user-agent'],
    ip:
      (req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim() ||
      req?.socket?.remoteAddress,
    method: req?.method,
    url: req?.url,
  });

  return attachHelpers(baseLogger);
}

/**
 * Create a process‑level logger that is not tied to a single HTTP request.
 * @param {Object} [context]
 */
export function createServerLogger(context = {}) {
  const baseLogger = logger.child({
    correlationId: randomUUID(),
    context: 'server',
    ...context,
  });

  return attachHelpers(baseLogger);
}

export default logger;
