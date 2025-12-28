import { supabase } from '../../lib/supabase';
import { getProductSettings } from '../../lib/settings';
import rateLimit from '../../lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(req, res) {
  // Disable caching for this dynamic API endpoint
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Verify Environment Variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('CRITICAL: Supabase environment variables are missing.');
    return res.status(500).json({ 
      success: false, 
      message: 'Configuration Error: Missing API Keys in Production.',
      hint: 'Please check Vercel Environment Variables.' 
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Rate Limiting: 10 requests per minute per IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await limiter.check(res, 10, ip);
  } catch {
    return res.status(429).json({ message: 'Rate limit exceeded' });
  }

  const { agentId } = req.query;

  try {    // Get Commission Settings
    const settings = await getProductSettings();
    const commissionRate = settings.commisionPerUnit || 10; // Default to 10 if missing

    // 1. Fetch orders that have "Agent" in notes
    // We fetch necessary columns to compute stats
    let query = supabase
      .from('orders')
      .select('order_notes, order_status, final_amount, created_at')
      .ilike('order_notes', '%Agent%'); // Filter early

    const { data: orders, error } = await query;

    if (error) throw error;

    // 2. Process and Aggregate Data
    const agentStats = {};

    if (orders && orders.length > 0) {
      orders.forEach(order => {
        // Safety check for null notes (though ilike filters them, double check)
        if (!order.order_notes) return;

        // Regex to extract Agent ID: "Agent <AGENT_ID>"
        // Case insensitive match
        const match = order.order_notes.match(/Agent\s+(\w+)/i);

        if (match && match[1]) {
          const extractedId = match[1].toUpperCase();

          // If filtering by specific agentId, skip others
          if (agentId && extractedId !== agentId.toUpperCase()) {
            return;
          }

          if (!agentStats[extractedId]) {
            agentStats[extractedId] = {
              agentId: extractedId,
              paid: 0,
              pending: 0,
              failed: 0,
              totalCommission: 0
            };
          }

          const stats = agentStats[extractedId];
          const status = order.order_status?.toLowerCase() || 'unknown';

          if (status === 'paid' || status === 'success') {
            stats.paid += 1;
            // Calculate commission: Count * Rate
            stats.totalCommission += commissionRate;
          } else if (status === 'pending') {
            stats.pending += 1;
          } else {
            // cancelled, failed, abandoned, etc.
            stats.failed += 1;
          }
        }
      });
    }

    // 3. Convert to array and sort
    const results = Object.values(agentStats).sort((a, b) => b.paid - a.paid);

    return res.status(200).json({
      success: true,
      data: results,
      filter: agentId ? agentId.toUpperCase() : 'ALL',
      count: results.length
    });

  } catch (error) {
    console.error('Error fetching agent stats:', error.message, error.details || error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
