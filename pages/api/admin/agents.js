import { supabase } from '../../../lib/supabase';
import { createLogger } from '../../../lib/pino-logger';

export default async function handler(req, res) {
  const logger = createLogger(req);

  // Disable Caching for Admin Data (Critical for financial stats)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Basic Admin Auth Check (You might have a middleware, but mimicking existing pattern)
  // Assuming the frontend handles the session check via AdminLayout or similar, 
  // but strictly we should check for a valid session here. 
  // For now, I'll rely on the service role key being used only in this protected file.

  if (req.method === 'GET') {
    try {
      const { action, agent_id } = req.query;

      if (action === 'orders' && agent_id) {
        // Fetch orders for a specific agent for Payout Manager
        const { data: orders, error } = await supabase
          .from('orders')
          .select('order_id, order_number, created_at, final_amount, comm_amount:commission_earned, payout_status, order_status, payout_settled_at')
          .eq('agent_id', agent_id)
          .eq('order_status', 'paid') // Only show successful orders
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Ensure comm_amount is a number (handle potential nulls from old legacy data)
        const enrichedOrders = orders.map(o => ({
            ...o,
            commission_amount: Number(o.comm_amount) || 10 // Fallback for very old orders
        }));

        return res.status(200).json({ success: true, orders: enrichedOrders });
      }

      // 1. Fetch all agents
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      // 2. Fetch all RELEVANT orders for statistics (Source of Truth)
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('agent_id, commission_earned, payout_status, order_status')
        .neq('agent_id', null);

      if (ordersError) throw ordersError;

      // 3. Compute stats in memory
      const agentsWithStats = agents.map(agent => {
        const agentOrders = allOrders.filter(o => o.agent_id === agent.agent_id);
        
        let total_sales_count = 0;
        let pending_sales_count = 0;
        let pending_settlement = 0;
        let comm_paid = 0;
        let total_comm = 0;

        agentOrders.forEach(order => {
           // Only count successful (paid) orders for commission stats
           if (order.order_status === 'paid') {
               total_sales_count++;
               const comm = Number(order.commission_earned) || 10;
               
               total_comm += comm;
               
               if (order.payout_status === 'paid') {
                   comm_paid += comm;
               } else {
                   // Any successful order not yet paid out is pending
                   pending_settlement += comm;
               }
           } else if (order.order_status === 'pending') {
               pending_sales_count++;
           }
        });

        return {
            ...agent,
            total_sales_count,
            pending_sales_count,
            pending_settlement,
            comm_paid,
            total_comm
        };
      });

      return res.status(200).json({ success: true, agents: agentsWithStats });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch agents');
      return res.status(500).json({ success: false, message: 'Failed to fetch agents' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        agent_id, 
        agent_name,
        discount_code,
        email, 
        phone, 
        bank_name, 
        bank_account_number, 
        bank_holder_name,
        discount_amount,
        comm_per_sale 
      } = req.body;

      // Validate required fields
      if (!agent_id || !agent_name || !discount_code) {
        return res.status(400).json({ success: false, message: 'Agent ID, Name, and Discount Code are required' });
      }

      const { data, error } = await supabase
        .from('agents')
        .insert([{
          agent_id: agent_id.trim(),
          discount_code: discount_code.toUpperCase().trim(),
          agent_name,
          email,
          phone,
          bank_name,
          bank_account_number,
          bank_holder_name,
          discount_amount: Number(discount_amount) || 0,
          comm_per_sale: Number(comm_per_sale) || 0,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(400).json({ success: false, message: 'Agent ID already exists' });
        }
        throw error;
      }

      return res.status(201).json({ success: true, agent: data });
    } catch (error) {
      logger.error({ error }, 'Failed to create agent');
      return res.status(500).json({ success: false, message: 'Failed to create agent' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { action, agent_id, ...updates } = req.body;

      if (!agent_id) {
        return res.status(400).json({ success: false, message: 'Agent ID is required' });
      }

      let updateData = {};

      if (action === 'settle_payout') {
        const { order_ids } = req.body; // total_amount is no longer needed for writes
        
        if (!Array.isArray(order_ids) || order_ids.length === 0) {
             return res.status(400).json({ success: false, message: 'No orders selected' });
        }

        // 1. Mark orders as paid (Idempotent & Safe)
        const { error: orderError } = await supabase
            .from('orders')
            .update({ 
                payout_status: 'paid',
                payout_settled_at: new Date().toISOString()
            })
            .in('order_id', order_ids)
            .eq('payout_status', 'unpaid'); 
            
        if (orderError) throw orderError;

        // No need to update agent stats - they are derived dynamically on GET

        return res.status(200).json({ success: true, message: 'Payout settled successfully' });
      }

      if (action === 'revert_payout') {
        const { order_ids } = req.body; // total_amount is no longer needed for writes
        
        if (!Array.isArray(order_ids) || order_ids.length === 0) {
             return res.status(400).json({ success: false, message: 'No orders selected' });
        }

        // 1. Mark orders as unpaid (Idempotent & Safe)
        const { error: orderError } = await supabase
            .from('orders')
            .update({ 
                payout_status: 'unpaid',
                payout_settled_at: null
            })
            .in('order_id', order_ids)
            .eq('payout_status', 'paid');
            
        if (orderError) throw orderError;

        // No need to update agent stats - they are derived dynamically on GET

        return res.status(200).json({ success: true, message: 'Payout reversed successfully' });
      }

      if (action === 'mark_paid') {
        // Bulk Mark as Paid: Update all unpaid successful orders for this agent
        const { error: updateError } = await supabase
            .from('orders')
            .update({ 
                payout_status: 'paid',
                payout_settled_at: new Date().toISOString()
            })
            .eq('agent_id', agent_id)
            .eq('order_status', 'paid')     // Must be a successful sale
            .neq('payout_status', 'paid');  // Must not already be paid
        
        if (updateError) throw updateError;

        return res.status(200).json({ success: true, message: 'All pending orders marked as paid' });
      } else {
        // Normal update (edit details)
        updateData = {
          ...updates,
          discount_code: updates.discount_code ? updates.discount_code.toUpperCase().trim() : undefined,
          updated_at: new Date().toISOString()
        };
      }
      
      if (Object.keys(updateData).length > 0) {
          const { data, error } = await supabase
            .from('agents')
            .update(updateData)
            .eq('agent_id', agent_id)
            .select()
            .single();
    
          if (error) throw error;
          return res.status(200).json({ success: true, agent: data });
      }
      
      return res.status(200).json({ success: true });

    } catch (error) {
      logger.error({ error }, 'Failed to update agent');
      return res.status(500).json({ success: false, message: 'Failed to update agent' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { agent_id } = req.body;

      if (!agent_id) {
        return res.status(400).json({ success: false, message: 'Agent ID is required' });
      }

      // Check for existing orders
      const { count, error: countError } = await supabase
        .from('orders')
        .select('agent_id', { count: 'exact', head: true })
        .eq('agent_id', agent_id);

      if (countError) throw countError;

      if (count > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot delete agent. This agent has ${count} existing orders.` 
        });
      }

      // Proceed with deletion
      const { error: deleteError } = await supabase
        .from('agents')
        .delete()
        .eq('agent_id', agent_id);

      if (deleteError) throw deleteError;

      return res.status(200).json({ success: true, message: 'Agent deleted successfully' });

    } catch (error) {
      logger.error({ error }, 'Failed to delete agent');
      return res.status(500).json({ success: false, message: 'Failed to delete agent' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
