const fs = require('fs').promises;
const path = require('path');

const LOGGING_ENABLED = true; // Temporarily enabled for production testing

const logFilePath = path.join(process.cwd(), 'transaction.log');

/**
 * Logs a message to the transaction log file.
 * @param {string} level - The log level (e.g., INFO, ERROR, WARN).
 * @param {string} message - The message to log.
 * @param {object | null} data - Optional data object to stringify and include.
 */
async function logTransaction(level, message, data = null) {
  if (!LOGGING_ENABLED) {
    return; // Exit if logging is disabled
  }

  const timestamp = new Date().toISOString();
  const dataString = data ? `\n--- DATA ---\n${JSON.stringify(data, null, 2)}\n------------` : '';
  const logMessage = `[${timestamp}] [${level}] ${message}${dataString}`;

  // Always log to console for Vercel production debugging
  if (data) {
    console.log(`🔍 [${level}] ${message}`, data);
  } else {
    console.log(`🔍 [${level}] ${message}`);
  }

  // Skip file logging on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    return; // Exit early if running on Vercel
  }

  try {
    await fs.appendFile(logFilePath, logMessage + '\n\n');
  } catch (error) {
    // Silently ignore file system errors in production
    if (error.code !== 'EROFS') {
      console.error('Failed to write to log file:', error);
    }
  }
}

module.exports = { logTransaction };
