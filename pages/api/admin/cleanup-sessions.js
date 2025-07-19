import { supabase } from '../../../lib/supabase';
import { createLogger } from '../../../lib/pino-logger';
import { requireAuth } from '../../../lib/adminAuth';
import { updatePaymentStatusBulk, PAYMENT_STATES } from '../../../lib/paymentStatus';

export default async function handler(req, res) {
  const logger = createLogger(req);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Require admin authentication
    const authResult = await requireAuth(req, res);
    if (!authResult.success) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    logger.info({ admin: authResult.admin.username }, 'Starting atomic session cleanup process');

    // Define time thresholds
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // ✅ NEW: Step 1 - Find pending orders older than 30 minutes (to abandon)
    const { data: pendingCustomers, error: pendingError } = await supabase
      .from('customers')
      .select('customer_id, email_address, created_at')
      .eq('payment_status', PAYMENT_STATES.PENDING)
      .lt('created_at', thirtyMinutesAgo.toISOString());

    if (pendingError) {
      logger.error({ error: pendingError }, 'Error finding pending customers for abandonment');
      return res.status(500).json({ message: 'Error during session cleanup - pending query' });
    }

    // ✅ NEW: Step 2 - Find abandoned orders older than 24 hours (to expire)
    const { data: abandonedCustomers, error: abandonedError } = await supabase
      .from('customers')
      .select('customer_id, email_address, created_at')
      .eq('payment_status', PAYMENT_STATES.ABANDONED)
      .lt('created_at', oneDayAgo.toISOString());

    if (abandonedError) {
      logger.error({ error: abandonedError }, 'Error finding abandoned customers for expiration');
      return res.status(500).json({ message: 'Error during session cleanup - abandoned query' });
    }

    let recentAbandonedCount = 0;
    let expiredCount = 0;

    // ✅ NEW: Process pending → abandoned atomically
    if (pendingCustomers && pendingCustomers.length > 0) {
      const customerIds = pendingCustomers.map(c => c.customer_id);
      
      logger.info({ customerIds: customerIds.slice(0, 5), totalCount: customerIds.length }, `Processing ${customerIds.length} pending customers for abandonment`);

      const abandonResult = await updatePaymentStatusBulk(logger, customerIds, PAYMENT_STATES.ABANDONED);
      
      if (abandonResult.success) {
        recentAbandonedCount = abandonResult.count;
        logger.info(`Successfully marked ${recentAbandonedCount} orders as abandoned`);
      } else {
        logger.error({ error: abandonResult.error }, 'Bulk abandonment update failed');
        return res.status(500).json({ 
          message: 'Error during session cleanup - abandonment failed',
          error: abandonResult.error 
        });
      }
    }

    // ✅ NEW: Process abandoned → expired atomically
    if (abandonedCustomers && abandonedCustomers.length > 0) {
      const customerIds = abandonedCustomers.map(c => c.customer_id);
      
      logger.info({ customerIds: customerIds.slice(0, 5), totalCount: customerIds.length }, `Processing ${customerIds.length} abandoned customers for expiration`);

      const expireResult = await updatePaymentStatusBulk(logger, customerIds, PAYMENT_STATES.EXPIRED);
      
      if (expireResult.success) {
        expiredCount = expireResult.count;
        logger.info(`Successfully marked ${expiredCount} orders as expired`);
      } else {
        logger.error({ error: expireResult.error }, 'Bulk expiration update failed');
        return res.status(500).json({ 
          message: 'Error during session cleanup - expiration failed',
          error: expireResult.error 
        });
      }
    }

    // Log cleanup results
    const totalProcessed = recentAbandonedCount + expiredCount;

    logger.info({ admin: authResult.admin.username, recentAbandonedCount, expiredCount, totalProcessed, thresholds: { abandonmentThreshold: thirtyMinutesAgo.toISOString(), expirationThreshold: oneDayAgo.toISOString() } }, 'Atomic session cleanup completed successfully');

    // Return cleanup summary
    res.status(200).json({
      success: true,
      message: 'Session cleanup completed successfully',
      summary: {
        recentAbandoned: recentAbandonedCount,
        expired: expiredCount,
        totalProcessed,
        method: 'atomic_bulk_updates'
      },
      details: {
        pendingCustomersFound: pendingCustomers?.length || 0,
        abandonedCustomersFound: abandonedCustomers?.length || 0,
        abandonmentThreshold: thirtyMinutesAgo.toISOString(),
        expirationThreshold: oneDayAgo.toISOString()
      },
      timestamp: now.toISOString()
    });

  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }, 'Unexpected error during atomic session cleanup');
    
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error during cleanup',
      error: error.message 
    });
  }
}
