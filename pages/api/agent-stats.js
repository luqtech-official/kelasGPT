import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Optional: Add simple secret key auth if "manual access" implies some protection
  // const { secret } = req.query;
  // if (secret !== process.env.ADMIN_SECRET) ... (Skipping for now as per instructions)

  const { agentId } = req.query;

  try {
    // 1. Fetch orders that have "Agent" in notes
    // We fetch necessary columns to compute stats
    let query = supabase
      .from('orders')
      .select('order_notes, payment_status, final_amount, created_at')
      .ilike('order_notes', '%Agent%'); // Filter early

    const { data: orders, error } = await query;

    if (error) throw error;

    // 2. Process and Aggregate Data
    const agentStats = {};

    orders.forEach(order => {
      // Regex to extract Agent ID: "Agent <AGENT_ID>"
      // Case insensitive match
      const match = order.order_notes?.match(/Agent\s+(\w+)/i);
      
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
            totalRevenue: 0
          };
        }

        const stats = agentStats[extractedId];
        const status = order.payment_status?.toLowerCase();

        if (status === 'paid' || status === 'success') {
          stats.paid += 1;
          stats.totalRevenue += (order.final_amount || 0);
        } else if (status === 'pending') {
          stats.pending += 1;
        } else {
          // cancelled, failed, abandoned, etc.
          stats.failed += 1;
        }
      }
    });

    // 3. Convert to array and sort
    const results = Object.values(agentStats).sort((a, b) => b.paid - a.paid);

    return res.status(200).json({ 
      success: true, 
      data: results,
      filter: agentId ? agentId.toUpperCase() : 'ALL'
    });

  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
