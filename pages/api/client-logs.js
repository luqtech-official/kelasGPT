import { createLogger } from '../../lib/pino-logger';

/**
 * API endpoint for receiving client-side logs
 * Accepts log entries from the client-side logger and processes them server-side
 */
async function clientLogsHandler(req, res) {
  const logger = createLogger(req);

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
    });
  }

  try {
    const logEntry = req.body;

    // Validate log entry structure
    if (!logEntry || typeof logEntry !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid log entry format' 
      });
    }

    // Log the client event server-side with appropriate categorization
    const { level, category, event, data, message, component, timestamp } = logEntry;

    if (level === 'error' || category === 'ERROR') {
      logger.error(`Client Error: ${message || event}`, {
        clientTimestamp: timestamp,
        component: component || 'client',
        clientData: data,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
      });
    } else if (level === 'security' || category === 'SECURITY') {
      logger.security.suspiciousActivity({
        description: message || event,
        clientTimestamp: timestamp,
        component: component || 'client',
        clientData: data,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
      });
    } else if (level === 'audit' || category === 'AUDIT') {
      logger.audit.dataAccess({
        resource: `CLIENT_${event || 'UNKNOWN'}`,
        clientTimestamp: timestamp,
        component: component || 'client',
        clientData: data,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
      });
    } else {
      // General client log
      logger.info(`Client Log: ${message || event}`, {
        level: level || 'info',
        category: category || 'CLIENT',
        event: event || 'LOG',
        clientTimestamp: timestamp,
        component: component || 'client',
        clientData: data,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Log received' 
    });

  } catch (error) {
    console.error('Failed to process client log:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });

    res.status(500).json({ 
      success: false, 
      message: 'Failed to process log' 
    });
  }
}

export default clientLogsHandler;