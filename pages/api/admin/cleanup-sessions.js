import { supabase } from '../../../lib/supabase';
import { logTransaction } from '../../../lib/logger';
import { requireAuth } from '../../../lib/adminAuth';
import { updatePaymentStatusBulk, PAYMENT_STATES } from '../../../lib/paymentStatus';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Require admin authentication
    const authResult = await requireAuth(req, res);
    if (!authResult.success) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await logTransaction('INFO', 'Starting atomic session cleanup process', { 
      admin: authResult.admin.username 
    });

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
      await logTransaction('ERROR', 'Error finding pending customers for abandonment', pendingError);
      return res.status(500).json({ message: 'Error during session cleanup - pending query' });
    }

    // ✅ NEW: Step 2 - Find abandoned orders older than 24 hours (to expire)
    const { data: abandonedCustomers, error: abandonedError } = await supabase
      .from('customers')
      .select('customer_id, email_address, created_at')
      .eq('payment_status', PAYMENT_STATES.ABANDONED)
      .lt('created_at', oneDayAgo.toISOString());

    if (abandonedError) {
      await logTransaction('ERROR', 'Error finding abandoned customers for expiration', abandonedError);
      return res.status(500).json({ message: 'Error during session cleanup - abandoned query' });
    }

    let recentAbandonedCount = 0;
    let expiredCount = 0;

    // ✅ NEW: Process pending → abandoned atomically
    if (pendingCustomers && pendingCustomers.length > 0) {
      const customerIds = pendingCustomers.map(c => c.customer_id);
      
      await logTransaction('INFO', `Processing ${customerIds.length} pending customers for abandonment`, {
        customerIds: customerIds.slice(0, 5), // Log first 5 for debugging
        totalCount: customerIds.length
      });

      const abandonResult = await updatePaymentStatusBulk(customerIds, PAYMENT_STATES.ABANDONED);
      
      if (abandonResult.success) {
        recentAbandonedCount = abandonResult.count;
        await logTransaction('INFO', `Successfully marked ${recentAbandonedCount} orders as abandoned`);
      } else {
        await logTransaction('ERROR', 'Bulk abandonment update failed', abandonResult.error);
        return res.status(500).json({ 
          message: 'Error during session cleanup - abandonment failed',
          error: abandonResult.error 
        });
      }
    }

    // ✅ NEW: Process abandoned → expired atomically
    if (abandonedCustomers && abandonedCustomers.length > 0) {
      const customerIds = abandonedCustomers.map(c => c.customer_id);
      
      await logTransaction('INFO', `Processing ${customerIds.length} abandoned customers for expiration`, {
        customerIds: customerIds.slice(0, 5), // Log first 5 for debugging
        totalCount: customerIds.length
      });

      const expireResult = await updatePaymentStatusBulk(customerIds, PAYMENT_STATES.EXPIRED);
      
      if (expireResult.success) {
        expiredCount = expireResult.count;
        await logTransaction('INFO', `Successfully marked ${expiredCount} orders as expired`);
      } else {
        await logTransaction('ERROR', 'Bulk expiration update failed', expireResult.error);
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
    await logTransaction('ERROR', 'Unexpected error during atomic session cleanup', { 
      message: error.message, 
      stack: error.stack 
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error during cleanup',
      error: error.message 
    });
  }
}