import { requireAuth } from '../../../lib/adminAuth';
import { getCustomersWithPaymentStatus, getCustomerWithPaymentStatus } from '../../../lib/paymentStatus';
import { updatePaymentStatusValidated, getValidNextStates, PAYMENT_STATES } from '../../../lib/paymentStatus';
import { supabase, getEmailStatusForCustomers } from '../../../lib/supabase';
import { createLogger } from '../../../lib/pino-logger';

export default async function handler(req, res) {
  const logger = createLogger(req);
  // Require admin authentication
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      // ✅ NEW: Use view with computed payment status
      const { data: customers, error } = await getCustomersWithPaymentStatus(logger);
      
      if (error) {
        console.error('Error fetching customers:', error);
        return res.status(500).json({ message: 'Error fetching customers' });
      }

      // Get email statuses for all customers
      const emailStatuses = await getEmailStatusForCustomers(customers || []);

      // Enhanced customer data with email status and valid transitions
      const enhancedCustomers = (customers || []).map(customer => {
        const emailStatus = emailStatuses[customer.email_address];
        const validNextStates = getValidNextStates(customer.payment_status);
        
        return {
          customer_id: customer.customer_id,
          full_name: customer.full_name,
          email_address: customer.email_address,
          phone_number: customer.phone_number,
          payment_status: customer.payment_status,
          computed_payment_status: customer.computed_payment_status, // From database view
          latest_order_number: customer.latest_order_number, // From database view
          created_at: customer.created_at,
          updated_at: customer.updated_at,
          ip_address: customer.ip_address,
          user_agent: customer.user_agent,
          acquisition_source: customer.acquisition_source,
          acquisition_campaign: customer.acquisition_campaign,
          referrer_url: customer.referrer_url,
          utm_source: customer.utm_source,
          utm_medium: customer.utm_medium,
          utm_campaign: customer.utm_campaign,
          utm_term: customer.utm_term,
          utm_content: customer.utm_content,
          email_verified: customer.email_verified,
          notes: customer.notes,
          metadata: customer.metadata,
          // Enhanced fields
          email_status: emailStatus ? {
            status: emailStatus.status,
            sent_at: emailStatus.created_at,
            delivered_at: emailStatus.delivered_at,
            error_message: emailStatus.error_message
          } : null,
          valid_next_states: validNextStates, // What statuses admin can change to
          consistency_check: customer.payment_status === customer.computed_payment_status, // Data consistency
          // Computed fields for admin interface
          total_amount: 0, // Will be computed from orders
          final_amount: customer.payment_status === 'paid' ? 197.00 : 0, // Use actual product price
          orders: [] // Will be populated below
        };
      });

      // Get order information for each customer
      for (const customer of enhancedCustomers) {
        try {
          const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customer.customer_id)
            .order('created_at', { ascending: false });
            
          if (!orderError && orders) {
            customer.orders = orders;
            customer.total_amount = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
            
            // Use the latest order's amount for final_amount if exists
            if (orders.length > 0) {
              customer.final_amount = customer.payment_status === 'paid' ? parseFloat(orders[0].total_amount) || 197.00 : 0;
            }
          }
        } catch (orderError) {
          console.error(`Error fetching orders for customer ${customer.customer_id}:`, orderError);
          // Continue without order data
        }
      }

      logger.info({ admin: authResult.admin.username, customerCount: enhancedCustomers.length }, `Admin fetched ${enhancedCustomers.length} customers`);

      res.status(200).json({
        success: true,
        data: enhancedCustomers,
        meta: {
          total: enhancedCustomers.length,
          consistent_records: enhancedCustomers.filter(c => c.consistency_check).length,
          inconsistent_records: enhancedCustomers.filter(c => !c.consistency_check).length
        }
      });

    } catch (error) {
      console.error('Customers API error:', error);
      logger.error({ admin: authResult.admin.username, error: error.message }, 'Admin customers fetch failed');
      
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { customer_id, notes, payment_status } = req.body;

      if (!customer_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Customer ID is required' 
        });
      }

      // Get customer info first
      const { data: customer, error: customerError } = await getCustomerWithPaymentStatus(logger, customer_id);
      
      if (customerError || !customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Customer not found' 
        });
      }

      let updateData = {
        updated_at: new Date().toISOString()
      };

      // Handle notes update
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      // ✅ NEW: Handle payment status update atomically
      if (payment_status && payment_status !== customer.payment_status) {
        logger.info({ admin: authResult.admin.username, customerId: customer_id, customerEmail: customer.email_address, fromStatus: customer.payment_status, toStatus: payment_status, latestOrderNumber: customer.latest_order_number }, `Admin attempting to change payment status`);

        if (!customer.latest_order_number) {
          return res.status(400).json({
            success: false,
            message: 'Cannot update payment status: No order found for this customer'
          });
        }

        // Use atomic payment status update with admin override
        const statusUpdateResult = await updatePaymentStatusValidated(
          logger,
          customer.latest_order_number,
          payment_status,
          null, // no transaction ID for admin updates
          true  // admin override to bypass state validation
        );

        if (!statusUpdateResult.success) {
          logger.error({ admin: authResult.admin.username, customerId: customer_id, orderNumber: customer.latest_order_number, error: statusUpdateResult.error }, 'Admin payment status update failed');
          
          return res.status(400).json({
            success: false,
            message: `Payment status update failed: ${statusUpdateResult.error}`
          });
        }

        logger.info({ admin: authResult.admin.username, customerId: customer_id, orderNumber: customer.latest_order_number, previousStatus: statusUpdateResult.data.previous_status, newStatus: statusUpdateResult.data.new_status }, `Admin payment status update successful`);
      }

      // Update customer notes if provided
      if (notes !== undefined) {
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({ notes: notes, updated_at: new Date().toISOString() })
          .eq('customer_id', customer_id)
          .select()
          .single();

        if (updateError) {
          logger.error({ admin: authResult.admin.username, customerId: customer_id, error: updateError }, 'Customer notes update failed');
          throw updateError;
        }
      }

      // Get updated customer data
      const { data: updatedCustomer, error: fetchError } = await getCustomerWithPaymentStatus(logger, customer_id);
      
      if (fetchError) {
        throw fetchError;
      }

      logger.info({ admin: authResult.admin.username, customerId: customer_id, updatedFields: Object.keys(updateData).concat(payment_status ? ['payment_status'] : []) }, `Admin updated customer successfully`);

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer
      });

    } catch (error) {
      console.error('Update customer API error:', error);
      logger.error({ admin: authResult.admin.username, error: error.message }, 'Admin customer update failed');
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update customer' 
      });
    }
  }

  else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

// Helper function to get available status transitions
export function getAvailableStatuses(currentStatus) {
  const validNext = getValidNextStates(currentStatus);
  
  // Add current status to allow "no change"
  return [currentStatus, ...validNext].filter((status, index, arr) => 
    arr.indexOf(status) === index // Remove duplicates
  );
}
