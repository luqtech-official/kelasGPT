require('dotenv').config({ path: '.env.local' });
// Fallback if .env.local isn't found or standard .env
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncAgentStats() {
  console.log('Starting Agent Stats Sync...');

  // 1. Get all agents
  const { data: agents, error: agentError } = await supabase
    .from('agents')
    .select('*');

  if (agentError) {
    console.error('Error fetching agents:', agentError);
    return;
  }

  console.log(`Found ${agents.length} agents.`);

  for (const agent of agents) {
    console.log(`\nChecking Agent: ${agent.agent_name} (${agent.agent_id})`);

    // 2. Calculate Actual Stats from Orders
    // STRICT FILTER: Only count orders where the customer actually paid (order_status = 'paid')
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('commission_earned, payout_status')
      .eq('agent_id', agent.agent_id)
      .eq('order_status', 'paid'); // <--- CRITICAL FIX

    if (orderError) {
      console.error(`  Error fetching orders for ${agent.agent_id}:`, orderError);
      continue;
    }

    let actualPending = 0;
    let actualPaid = 0;
    let actualSalesCount = orders.length;

    orders.forEach(o => {
      const comm = Number(o.commission_earned) || 10; // Default to 10 if null/missing
      if (o.payout_status === 'paid') {
        actualPaid += comm;
      } else {
        actualPending += comm; // 'unpaid' or null or 'pending'
      }
    });

    const currentPending = Number(agent.pending_settlement) || 0;
    const currentPaid = Number(agent.comm_paid) || 0;
    const currentSalesCount = Number(agent.total_sales_count) || 0;

    console.log(`  [Current] Pending: ${currentPending}, Paid: ${currentPaid}, Sales: ${currentSalesCount}`);
    console.log(`  [Actual ] Pending: ${actualPending}, Paid: ${actualPaid}, Sales: ${actualSalesCount}`);

    // 3. Update if mismatch
    if (currentPending !== actualPending || currentPaid !== actualPaid || currentSalesCount !== actualSalesCount) {
      console.log('  MISMATCH DETECTED! Updating...');
      
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          pending_settlement: actualPending,
          comm_paid: actualPaid,
          total_sales_count: actualSalesCount,
          updated_at: new Date().toISOString()
        })
        .eq('agent_id', agent.agent_id);

      if (updateError) {
        console.error('  Failed to update agent:', updateError);
      } else {
        console.log('  ✅ Agent stats synced successfully.');
      }
    } else {
      console.log('  ✅ Stats match. No update needed.');
    }
  }

  console.log('\nSync Complete.');
}

syncAgentStats();
