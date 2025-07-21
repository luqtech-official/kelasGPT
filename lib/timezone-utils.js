/**
 * Centralized Timezone Utilities for KelasGPT
 * 
 * Provides consistent timezone handling across the application.
 * All functions ensure proper UTC storage with Malaysia timezone display.
 * 
 * LOCALE STANDARDS:
 * - 'en-CA': Used for date parsing operations (YYYY-MM-DD format, consistent parsing)
 * - 'en-MY': Used for user-facing display operations (appropriate for Malaysia users)
 * - Consistent locale usage prevents edge case issues around month/year boundaries
 */

// --- Constants ---
export const MALAYSIA_TIMEZONE = 'Asia/Kuala_Lumpur';
export const MALAYSIA_UTC_OFFSET_HOURS = 8; // Malaysia is UTC+8

// --- Performance Caching ---
const boundariesCache = new Map();
const dateStringCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Clear caches periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of boundariesCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY) {
      boundariesCache.delete(key);
    }
  }
  for (const [key, value] of dateStringCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY) {
      dateStringCache.delete(key);
    }
  }
}, CACHE_EXPIRY);

// --- Core Timezone Functions ---

/**
 * Creates a UTC timestamp for database storage.
 * Use this instead of new Date().toISOString() for consistency.
 * @returns {string} UTC timestamp in ISO format
 */
export function createUTCTimestamp() {
  return new Date().toISOString();
}

/**
 * Formats a UTC timestamp for Malaysia timezone display.
 * @param {string} utcTimestamp - UTC timestamp in ISO format
 * @param {object} options - Formatting options (optional)
 * @returns {string} Formatted date string in Malaysia timezone
 */
export function formatMalaysiaTime(utcTimestamp, options = {}) {
  // Input validation
  if (!utcTimestamp) {
    console.warn('formatMalaysiaTime: Invalid timestamp provided, using current time');
    utcTimestamp = createUTCTimestamp();
  }
  
  try {
    const date = new Date(utcTimestamp);
    
    // Validate date is not invalid
    if (isNaN(date.getTime())) {
      console.warn('formatMalaysiaTime: Invalid date, using current time');
      utcTimestamp = createUTCTimestamp();
    }
    
    const defaultOptions = {
      timeZone: MALAYSIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return new Date(utcTimestamp).toLocaleString('en-MY', {
      ...defaultOptions,
      ...options
    });
  } catch (error) {
    console.error('formatMalaysiaTime: Error formatting timestamp, using fallback', { error: error.message, utcTimestamp });
    // Fallback to basic ISO string formatting
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
  }
}

/**
 * Converts a UTC timestamp to Malaysia date only (YYYY-MM-DD format).
 * Critical for analytics grouping by Malaysia business day.
 * @param {string} utcTimestamp - UTC timestamp in ISO format
 * @returns {string} Date in YYYY-MM-DD format for Malaysia timezone
 */
export function getMalaysiaDateString(utcTimestamp) {
  // Input validation
  if (!utcTimestamp) {
    console.warn('getMalaysiaDateString: Invalid timestamp provided, using current time');
    utcTimestamp = createUTCTimestamp();
  }
  
  // Check cache first for performance
  const cacheKey = `dateString-${utcTimestamp}`;
  const cached = dateStringCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
    return cached.value;
  }
  
  try {
    const date = new Date(utcTimestamp);
    
    // Validate date is not invalid
    if (isNaN(date.getTime())) {
      console.warn('getMalaysiaDateString: Invalid date, using current time');
      utcTimestamp = createUTCTimestamp();
    }
    
    const result = new Date(utcTimestamp).toLocaleDateString('en-CA', {
      timeZone: MALAYSIA_TIMEZONE
    }); // en-CA locale gives YYYY-MM-DD format
    
    // Cache the result
    dateStringCache.set(cacheKey, {
      value: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('getMalaysiaDateString: Error converting timestamp, using fallback', { error: error.message, utcTimestamp });
    // Fallback to basic date formatting
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Gets Malaysia day boundaries in UTC for database queries.
 * Essential for accurate daily analytics and reporting.
 * @param {Date|string} date - The date to get boundaries for (defaults to today)
 * @returns {object} {start: string, end: string} UTC timestamps for day boundaries
 */
export function getMalaysiaDayBoundaries(date = new Date()) {
  try {
    // Input validation and conversion
    let targetDate;
    if (!date) {
      console.warn('getMalaysiaDayBoundaries: No date provided, using current date');
      targetDate = new Date();
    } else if (typeof date === 'string') {
      targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        console.warn('getMalaysiaDayBoundaries: Invalid date string, using current date');
        targetDate = new Date();
      }
    } else if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        console.warn('getMalaysiaDayBoundaries: Invalid Date object, using current date');
        targetDate = new Date();
      } else {
        targetDate = date;
      }
    } else {
      console.warn('getMalaysiaDayBoundaries: Invalid date type, using current date');
      targetDate = new Date();
    }
    
    // Check cache first for performance
    const cacheKey = `boundaries-${targetDate.toISOString().split('T')[0]}`;
    const cached = boundariesCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
      return cached.value;
    }
    
    // Get the date in Malaysia timezone (YYYY-MM-DD format)
    const malaysiaDateString = targetDate.toLocaleDateString('en-CA', {
      timeZone: MALAYSIA_TIMEZONE
    });
    
    // Create Malaysia timezone boundaries using proper timezone offset
    // This creates dates that are explicitly in Malaysia timezone (+08:00)
    const startOfDayMalaysia = new Date(`${malaysiaDateString}T00:00:00.000+08:00`);
    const endOfDayMalaysia = new Date(`${malaysiaDateString}T23:59:59.999+08:00`);
    
    const result = {
      start: startOfDayMalaysia.toISOString(),
      end: endOfDayMalaysia.toISOString()
    };
    
    // Cache the result
    boundariesCache.set(cacheKey, {
      value: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('getMalaysiaDayBoundaries: Critical error, using fallback boundaries', { error: error.message, date });
    // Fallback: use server timezone day boundaries as last resort
    const fallbackDate = new Date();
    const startOfDay = new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), fallbackDate.getDate());
    const endOfDay = new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), fallbackDate.getDate() + 1);
    return {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString()
    };
  }
}

/**
 * Gets Malaysia month boundaries in UTC for database queries.
 * Essential for accurate monthly analytics and revenue calculations.
 * @param {Date|string} date - The date to get month boundaries for (defaults to today)
 * @returns {object} {start: string, end: string} UTC timestamps for month boundaries
 */
export function getMalaysiaMonthBoundaries(date = new Date()) {
  try {
    // Input validation and conversion
    let targetDate;
    if (!date) {
      console.warn('getMalaysiaMonthBoundaries: No date provided, using current date');
      targetDate = new Date();
    } else if (typeof date === 'string') {
      targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        console.warn('getMalaysiaMonthBoundaries: Invalid date string, using current date');
        targetDate = new Date();
      }
    } else if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        console.warn('getMalaysiaMonthBoundaries: Invalid Date object, using current date');
        targetDate = new Date();
      } else {
        targetDate = date;
      }
    } else {
      console.warn('getMalaysiaMonthBoundaries: Invalid date type, using current date');
      targetDate = new Date();
    }
    
    // Get the date in Malaysia timezone to determine the correct month
    const malaysiaYear = parseInt(targetDate.toLocaleDateString('en-CA', {
      timeZone: MALAYSIA_TIMEZONE,
      year: 'numeric'
    }));
    const malaysiaMonth = parseInt(targetDate.toLocaleDateString('en-CA', {
      timeZone: MALAYSIA_TIMEZONE,
      month: '2-digit'
    }));
    
    // Validate extracted year and month
    if (isNaN(malaysiaYear) || isNaN(malaysiaMonth) || malaysiaMonth < 1 || malaysiaMonth > 12) {
      throw new Error(`Invalid Malaysia year/month: ${malaysiaYear}/${malaysiaMonth}`);
    }
    
    // Create month boundaries in Malaysia timezone
    // Start of month: 1st day at 00:00:00 Malaysia time
    const startOfMonthMalaysia = new Date(`${malaysiaYear}-${malaysiaMonth.toString().padStart(2, '0')}-01T00:00:00.000+08:00`);
    
    // End of month: 1st day of next month at 00:00:00 Malaysia time
    let endMonthYear = malaysiaYear;
    let endMonth = malaysiaMonth + 1;
    if (endMonth > 12) {
      endMonth = 1;
      endMonthYear++;
    }
    const endOfMonthMalaysia = new Date(`${endMonthYear}-${endMonth.toString().padStart(2, '0')}-01T00:00:00.000+08:00`);
    
    return {
      start: startOfMonthMalaysia.toISOString(),
      end: endOfMonthMalaysia.toISOString()
    };
  } catch (error) {
    console.error('getMalaysiaMonthBoundaries: Critical error, using fallback boundaries', { error: error.message, date });
    // Fallback: use server timezone month boundaries as last resort
    const fallbackDate = new Date();
    const startOfMonth = new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), 1);
    const endOfMonth = new Date(fallbackDate.getFullYear(), fallbackDate.getMonth() + 1, 1);
    return {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString()
    };
  }
}

/**
 * Gets date range for the last N days from Malaysia timezone perspective.
 * Used for analytics queries that need Malaysia business day boundaries.
 * @param {number} days - Number of days to include (default 7)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @returns {object} {start: string, end: string} UTC timestamps for range
 */
export function getMalaysiaDateRange(days = 7, fromDate = new Date()) {
  // Calculate the start date (N days ago from Malaysia perspective)
  const endDate = fromDate;
  const startDate = new Date(fromDate);
  startDate.setDate(startDate.getDate() - (days - 1)); // Include fromDate in range
  
  // Get Malaysia day boundaries for the range
  const startBoundary = getMalaysiaDayBoundaries(startDate);
  const endBoundary = getMalaysiaDayBoundaries(endDate);
  
  return {
    start: startBoundary.start,
    end: endBoundary.end
  };
}

/**
 * Gets relative time description for Malaysia timezone.
 * @param {string} utcTimestamp - UTC timestamp in ISO format
 * @returns {string} Human-readable relative time (e.g., "2 hours ago")
 */
export function getMalaysiaRelativeTime(utcTimestamp) {
  const now = new Date();
  const date = new Date(utcTimestamp);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

/**
 * Validates if a timestamp is within Malaysia business hours.
 * @param {string} utcTimestamp - UTC timestamp to check
 * @param {number} startHour - Business start hour (default 9 AM)
 * @param {number} endHour - Business end hour (default 6 PM) 
 * @returns {boolean} True if within business hours
 */
export function isWithinMalaysiaBusinessHours(utcTimestamp, startHour = 9, endHour = 18) {
  // Use en-CA locale for consistent parsing (standardized across timezone functions)
  const malaysiaDateTime = new Date(utcTimestamp).toLocaleString('en-CA', {
    timeZone: MALAYSIA_TIMEZONE,
    hour12: false,
    hour: '2-digit'
  });
  
  // Extract hour from HH:MM format
  const hour = parseInt(malaysiaDateTime.split(' ')[1].split(':')[0]);
  return hour >= startHour && hour < endHour;
}

// --- Legacy Support Functions ---

/**
 * @deprecated Use getMalaysiaDateString instead
 * Converts UTC timestamp to Malaysia date for backward compatibility.
 */
export function convertToMalaysiaDate(utcTimestamp) {
  console.warn('convertToMalaysiaDate is deprecated. Use getMalaysiaDateString instead.');
  return getMalaysiaDateString(utcTimestamp);
}

// --- Export all functions as default object for convenience ---
const timezoneUtils = {
  MALAYSIA_TIMEZONE,
  MALAYSIA_UTC_OFFSET_HOURS,
  createUTCTimestamp,
  formatMalaysiaTime,
  getMalaysiaDateString,
  getMalaysiaDayBoundaries,
  getMalaysiaMonthBoundaries,
  getMalaysiaDateRange,
  getMalaysiaRelativeTime,
  isWithinMalaysiaBusinessHours
};

export default timezoneUtils;