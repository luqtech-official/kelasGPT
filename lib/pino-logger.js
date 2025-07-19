import pino from 'pino';
import { randomBytes } from 'crypto';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export function createLogger(request) {
  const requestId = request.headers.get('x-request-id') || randomBytes(16).toString('hex');
  return logger.child({ requestId });
}
