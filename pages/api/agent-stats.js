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
    // 1. Fetch Agents
    let query = supabase
      .from('agents')
      .select('agent_id, is_active')
      .eq('is_active', true);

    if (agentId) {
      query = query.eq('agent_id', agentId.toUpperCase().trim());
    }

    const { data: agents, error: agentError } = await query;
    if (agentError) throw agentError;

    if (!agents || agents.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0 });
    }

    // 2. Fetch all successful orders for these agents
    const agentIds = agents.map(a => a.agent_id);
    const { data: allOrders, error: orderError } = await supabase
      .from('orders')
      .select('agent_id, commission_earned, order_status')
      .in('agent_id', agentIds);

    if (orderError) throw orderError;

    // 3. Aggregate stats in memory
    const formattedResults = agents.map(agent => {
      const agentOrders = allOrders.filter(o => o.agent_id === agent.agent_id);
      
      let paidCount = 0;
      let pendingCount = 0;
      let failedCount = 0;
      let totalCommission = 0;

      agentOrders.forEach(o => {
          if (o.order_status === 'paid') {
              paidCount++;
              totalCommission += Number(o.commission_earned) || 10;
          } else if (o.order_status === 'pending') {
              pendingCount++;
          } else if (o.order_status === 'failed' || o.order_status === 'cancelled') {
              failedCount++;
          }
      });

      return {
        agentId: agent.agent_id,
        paid: paidCount,
        pending: pendingCount,
        failed: failedCount,
        totalCommission: totalCommission
      };
    });

    // If no specific agentId, sort by performance
    if (!agentId) {
        formattedResults.sort((a, b) => b.paid - a.paid);
    }

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