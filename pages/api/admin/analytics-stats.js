import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/adminAuth';
import { createLogger } from '../../../lib/pino-logger';

// --- Constants ---
const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * API handler for fetching analytics data statistics.
 * Provides data for the admin dashboard to monitor storage and trigger cleanup.
 */
async function handler(req, res) {
  const logger = createLogger(req);

  // Disable Caching for Admin Data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // --- Fetch Total Record Count ---
    const { count, error: countError } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      logger.error({ error: countError }, 'Error fetching page_views count');
      throw countError;
    }

    // --- Fetch Oldest Record ---
    const { data: oldestRecord, error: oldestRecordError } = await supabase
      .from('page_views')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (oldestRecordError && oldestRecordError.code !== 'PGRST116') { // Ignore 'not found' error
      logger.error({ error: oldestRecordError }, 'Error fetching oldest page_view record');
      throw oldestRecordError;
    }

    const oldestRecordDate = oldestRecord ? new Date(oldestRecord.created_at) : null;
    const isCleanupNeeded = oldestRecordDate ? (new Date() - oldestRecordDate) > THREE_DAYS_IN_MS : false;

    let recordsToCleanup = 0;
    if (isCleanupNeeded) {
      const cleanupDate = new Date(Date.now() - THREE_DAYS_IN_MS);
      const { count: cleanupCount, error: cleanupCountError } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cleanupDate.toISOString());

      if (cleanupCountError) {
        logger.error({ error: cleanupCountError }, 'Error fetching cleanup count');
        // Non-critical, can proceed without this count
      } else {
        recordsToCleanup = cleanupCount;
      }
    }

    const stats = {
      currentRecords: count || 0,
      oldestRecord: oldestRecordDate ? oldestRecordDate.toISOString().split('T')[0] : 'N/A',
      canCleanup: isCleanupNeeded && recordsToCleanup > 0,
      recordsToCleanup: recordsToCleanup,
    };

    logger.info({ stats }, 'Successfully fetched analytics stats');
    res.status(200).json(stats);

  } catch (error) {
    logger.error(error, 'Unhandled error in analytics-stats handler');
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}

export default requireAuth(handler);
