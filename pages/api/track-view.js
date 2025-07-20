import { supabase } from '../../lib/supabase';
import { createLogger } from '../../lib/pino-logger';

// --- Constants ---
const VALID_PAGE_PATHS = ['/', '/checkout'];
const VISITOR_ID_REGEX = /^v_\d{13}_[a-zA-Z0-9]{8}$/;

/**
 * API handler for tracking page views.
 * Validates input and inserts a record into the page_views table.
 */
export default async function handler(req, res) {
  const logger = createLogger(req);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { pagePath, visitorId } = req.body;

    // --- Input Validation ---
    if (!pagePath || !visitorId) {
      logger.warn({ pagePath, visitorId }, 'Missing required fields');
      return res.status(400).json({ message: 'Missing required fields: pagePath and visitorId' });
    }

    if (!VALID_PAGE_PATHS.includes(pagePath)) {
      logger.warn({ pagePath }, 'Invalid page path');
      return res.status(400).json({ message: 'Invalid page path' });
    }

    if (typeof visitorId !== 'string' || !VISITOR_ID_REGEX.test(visitorId)) {
      logger.warn({ visitorId }, 'Invalid visitor ID format');
      return res.status(400).json({ message: 'Invalid visitor ID format' });
    }

    // --- Database Insertion ---
    const { error } = await supabase.from('page_views').insert([
      { 
        page_path: pagePath, 
        visitor_id: visitorId 
      }
    ]);

    if (error) {
      logger.error({ error, pagePath, visitorId }, 'Error inserting page view into database');
      // Use a more specific error code if possible, e.g., from postgres error codes
      return res.status(500).json({ message: 'Database error', details: error.message });
    }

    logger.info({ pagePath, visitorId }, 'Page view tracked successfully');
    res.status(201).json({ success: true, message: 'Page view tracked' });

  } catch (e) {
    logger.error(e, 'Unhandled error in track-view handler');
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

