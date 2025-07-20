import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/adminAuth';
import { createLogger } from '../../../lib/pino-logger';

// --- Constants ---
const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * API handler for cleaning up and archiving analytics data.
 * This is a critical function for managing database storage.
 */
async function handler(req, res) {
  const logger = createLogger(req);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const cleanupDate = new Date(Date.now() - THREE_DAYS_IN_MS);
    const cleanupTimestamp = cleanupDate.toISOString();

    logger.info(`Starting analytics cleanup for records older than ${cleanupTimestamp}`);

    // --- 1. Aggregate page_views data older than 3 days ---
    const { data: recordsToArchive, error: fetchError } = await supabase
      .from('page_views')
      .select('page_path, visitor_id, created_at')
      .lt('created_at', cleanupTimestamp);

    if (fetchError) {
      logger.error({ error: fetchError }, 'Error fetching records to archive');
      throw fetchError;
    }

    if (!recordsToArchive || recordsToArchive.length === 0) {
      logger.info('No records to archive. Cleanup process not needed.');
      return res.status(200).json({ success: true, message: 'No records needed cleanup.', recordsArchived: 0, recordsDeleted: 0 });
    }

    // --- 2. Process and aggregate data in memory ---
    const dailySummaries = recordsToArchive.reduce((acc, record) => {
      const date = new Date(record.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          landing_total_visits: 0,
          landing_unique_visitors: new Set(),
          checkout_total_visits: 0,
          checkout_unique_visitors: new Set(),
        };
      }

      if (record.page_path === '/') {
        acc[date].landing_total_visits++;
        acc[date].landing_unique_visitors.add(record.visitor_id);
      } else if (record.page_path === '/checkout') {
        acc[date].checkout_total_visits++;
        acc[date].checkout_unique_visitors.add(record.visitor_id);
      }
      return acc;
    }, {});

    const upsertData = Object.values(dailySummaries).map(summary => ({
      date: summary.date,
      landing_total_visits: summary.landing_total_visits,
      landing_unique_visitors: summary.landing_unique_visitors.size,
      checkout_total_visits: summary.checkout_total_visits,
      checkout_unique_visitors: summary.checkout_unique_visitors.size,
      conversion_rate: summary.landing_unique_visitors.size > 0
        ? ((summary.checkout_unique_visitors.size / summary.landing_unique_visitors.size) * 100).toFixed(2)
        : 0,
    }));

    // --- 3. Insert/update analytics_daily summaries ---
    // Using 'upsert' ensures that if a summary for a date already exists, it's updated.
    const { error: upsertError } = await supabase
      .from('analytics_daily')
      .upsert(upsertData, { onConflict: 'date' });

    if (upsertError) {
      logger.error({ error: upsertError }, 'Error upserting daily summaries');
      throw upsertError;
    }

    logger.info({ count: upsertData.length }, 'Successfully upserted daily summaries');

    // --- 4. Delete processed page_views records ---
    const { error: deleteError } = await supabase
      .from('page_views')
      .delete()
      .lt('created_at', cleanupTimestamp);

    if (deleteError) {
      // This is a critical issue. Data was archived but not deleted.
      // Manual intervention might be required.
      logger.error({ error: deleteError }, 'CRITICAL: Error deleting archived page_views records');
      throw deleteError;
    }

    logger.info({ count: recordsToArchive.length }, 'Successfully deleted archived page_views records');

    res.status(200).json({
      success: true,
      message: `Cleanup successful. Archived and deleted ${recordsToArchive.length} records.`,
      recordsArchived: recordsToArchive.length,
      recordsDeleted: recordsToArchive.length,
      summariesUpdated: upsertData.length,
    });

  } catch (error) {
    logger.error(error, 'Unhandled error in cleanup-analytics handler');
    res.status(500).json({ success: false, message: 'Internal Server Error', details: error.message });
  }
}

export default requireAuth(handler);

