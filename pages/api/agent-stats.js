import { supabase } from '../../lib/supabase';
import rateLimit from '../../lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(req, res) {
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Rate Limiting: 15 requests per minute per IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await limiter.check(res, 15, ip);
  } catch {
    return res.status(429).json({ message: 'Rate limit exceeded' });
  }

  const { agentId } = req.query;

  try {
    // Query the agents table directly for pre-aggregated stats
    // Note: We ONLY select public performance fields, never private info like bank details.
    let query = supabase
      .from('agents')
      .select('agent_id, total_sales_count, pending_sales_count, failed_sales_count, total_comm, is_active')
      .eq('is_active', true);

    if (agentId) {
      query = query.eq('agent_id', agentId.toUpperCase().trim());
    } else {
        // If no agentId is provided, we limit results to avoid over-exposure if this is public
        // agenttrackersp.js uses this to list everyone.
        query = query.order('total_sales_count', { ascending: false }).limit(100);
    }

    const { data: agents, error } = await query;

    if (error) throw error;

    // Format data to match the previous API response structure for frontend compatibility
    const formattedResults = (agents || []).map(agent => ({
      agentId: agent.agent_id,
      paid: agent.total_sales_count || 0,
      pending: agent.pending_sales_count || 0,
      failed: agent.failed_sales_count || 0,
      totalCommission: agent.total_comm || 0
    }));

    return res.status(200).json({
      success: true,
      data: formattedResults,
      filter: agentId ? agentId.toUpperCase() : 'ALL',
      count: formattedResults.length
    });

  } catch (error) {
    console.error('Error fetching agent stats:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}