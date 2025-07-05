const fs = require('fs').promises;
const path = require('path');

const logFilePath = path.join(process.cwd(), 'transaction.log');

/**
 * Logs a message to the transaction log file.
 * @param {string} level - The log level (e.g., INFO, ERROR, WARN).
 * @param {string} message - The message to log.
 * @param {object | null} data - Optional data object to stringify and include.
 */
async function logTransaction(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const dataString = data ? `\n--- DATA ---\n${JSON.stringify(data, null, 2)}\n------------` : '';
  const logMessage = `[${timestamp}] [${level}] ${message}${dataString}\n\n`;

  try {
    await fs.appendFile(logFilePath, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

module.exports = { logTransaction };
