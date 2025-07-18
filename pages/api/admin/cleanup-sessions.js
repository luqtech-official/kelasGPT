import { supabase } from '../../../lib/supabase';
import { logTransaction } from '../../../lib/logger';
import { requireAuth } from '../../../lib/adminAuth';

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

    await logTransaction('INFO', 'Starting session cleanup process', { admin: authResult.admin.username });

    // Define time thresholds
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Step 1: Mark recent pending orders (15-30 minutes old) as 'abandoned'
    const { data: recentAbandoned, error: recentError } = await supabase
      .from('customers')
      .update({ 
        payment_status: 'abandoned',
        updated_at: now.toISOString()
      })
      .eq('payment_status', 'pending')
      .lt('created_at', thirtyMinutesAgo.toISOString())
      .select('customer_id, email_address, created_at');

    if (recentError) {
      await logTransaction('ERROR', 'Error marking recent orders as abandoned', recentError);
      return res.status(500).json({ message: 'Error during session cleanup' });
    }

    // Step 2: Mark old abandoned orders (24+ hours old) as 'expired'
    const { data: expiredOrders, error: expiredError } = await supabase
      .from('customers')
      .update({ 
        payment_status: 'expired',
        updated_at: now.toISOString()
      })
      .eq('payment_status', 'abandoned')
      .lt('created_at', oneDayAgo.toISOString())
      .select('customer_id, email_address, created_at');

    if (expiredError) {
      await logTransaction('ERROR', 'Error marking old orders as expired', expiredError);
      return res.status(500).json({ message: 'Error during session cleanup' });
    }

    // Step 3: Update corresponding orders table
    if (recentAbandoned && recentAbandoned.length > 0) {
      const customerIds = recentAbandoned.map(c => c.customer_id);
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          order_status: 'abandoned',
          updated_at: now.toISOString()
        })
        .in('customer_id', customerIds);

      if (orderUpdateError) {
        await logTransaction('ERROR', 'Error updating orders to abandoned status', orderUpdateError);
      }
    }

    if (expiredOrders && expiredOrders.length > 0) {
      const customerIds = expiredOrders.map(c => c.customer_id);
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          order_status: 'expired',
          updated_at: now.toISOString()
        })
        .in('customer_id', customerIds);

      if (orderUpdateError) {
        await logTransaction('ERROR', 'Error updating orders to expired status', orderUpdateError);
      }
    }

    // Log cleanup results
    const recentCount = recentAbandoned ? recentAbandoned.length : 0;
    const expiredCount = expiredOrders ? expiredOrders.length : 0;

    await logTransaction('INFO', 'Session cleanup completed', {
      recentAbandonedCount: recentCount,
      expiredCount: expiredCount,
      totalProcessed: recentCount + expiredCount
    });

    // Return cleanup summary
    res.status(200).json({
      message: 'Session cleanup completed successfully',
      summary: {
        recentAbandoned: recentCount,
        expired: expiredCount,
        totalProcessed: recentCount + expiredCount
      },
      timestamp: now.toISOString()
    });

  } catch (error) {
    await logTransaction('ERROR', 'Unexpected error during session cleanup', { 
      message: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ message: 'Internal Server Error' });
  }
}