import { requireAuth, requireAuthWithCSRF } from '../../../lib/adminAuth';
import { getCustomersWithPaymentStatus, getCustomerWithPaymentStatus } from '../../../lib/paymentStatus';
import { updatePaymentStatusValidated, getValidNextStates, PAYMENT_STATES } from '../../../lib/paymentStatus';
import { supabase, getEmailStatusForCustomers, getCustomersWithOrders, updateCustomerAtomic } from '../../../lib/supabase';
import { createLogger } from '../../../lib/pino-logger';
import { validateCustomersQuery, validateCustomerUpdate } from '../../../lib/validation';
import { 
  successResponse, 
  validationErrorResponse, 
  internalErrorResponse, 
  notFoundResponse, 
  operationFailedResponse,
  methodNotAllowedResponse 
} from '../../../lib/apiResponse';

async function customersHandler(req, res) {
  const logger = createLogger(req);

  if (req.method === 'GET') {
    try {
      // ✅ SECURITY: Validate and sanitize query parameters
      const validation = validateCustomersQuery(req.query);
      
      if (!validation.isValid) {
        logger.warn({ 
          admin: req.admin.username, 
          validationErrors: validation.errors, 
          queryParams: req.query 
        }, 'Admin customers GET request validation failed');
        
        return validationErrorResponse(res, 'Invalid query parameters', validation.errors);
      }

      const { page: pageNum, limit: limitNum, search, status, export: exportData } = validation.data;
      const offset = (pageNum - 1) * limitNum;

      // ✅ OPTIMIZED: Use efficient function that fixes N+1 query problem
      const { data: customers, error } = await getCustomersWithOrders(logger);
      
      if (error) {
        logger.error({ admin: req.admin.username, error: error.message }, 'Error fetching customers with orders');
        return internalErrorResponse(res, 'Error fetching customers');
      }

      // Get email statuses for all customers
      const emailStatuses = await getEmailStatusForCustomers(customers || []);

      // Enhanced customer data with email status and valid transitions
      let enhancedCustomers = (customers || []).map(customer => {
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
          // ✅ OPTIMIZED: Order data already populated efficiently
          total_amount: customer.total_amount, // Already computed
          final_amount: customer.final_amount, // Already computed  
          orders: customer.orders // Already populated
        };
      });

      // Apply filtering
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        enhancedCustomers = enhancedCustomers.filter(customer => 
          customer.full_name.toLowerCase().includes(searchLower) ||
          customer.email_address.toLowerCase().includes(searchLower) ||
          customer.phone_number.includes(search) ||
          (customer.latest_order_number && customer.latest_order_number.includes(search))
        );
      }

      if (status !== 'all') {
        enhancedCustomers = enhancedCustomers.filter(customer => 
          customer.payment_status === status
        );
      }

      const totalFiltered = enhancedCustomers.length;

      // Handle export request
      if (exportData === 'true') {
        // For export, return all filtered data as CSV
        const csvData = enhancedCustomers.map(customer => ({
          'Full Name': customer.full_name,
          'Email': customer.email_address,
          'Phone': customer.phone_number,
          'Status': customer.payment_status,
          'Order Number': customer.latest_order_number || '',
          'Amount': customer.final_amount ? `RM ${customer.final_amount.toFixed(2)}` : 'RM 0.00',
          'Date': new Date(customer.created_at).toLocaleString('en-MY'),
          'IP Address': customer.ip_address || ''
        }));

        const csvHeaders = Object.keys(csvData[0] || {}).join(',');
        const csvRows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
        const csvContent = [csvHeaders, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=customers-${new Date().toISOString().split('T')[0]}.csv`);
        return res.status(200).send(csvContent);
      }

      // Apply pagination for normal requests
      const paginatedCustomers = enhancedCustomers.slice(offset, offset + limitNum);

      // Build pagination metadata
      const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(totalFiltered / limitNum),
        totalCount: totalFiltered,
        filteredCount: totalFiltered,
        hasNextPage: pageNum < Math.ceil(totalFiltered / limitNum),
        hasPreviousPage: pageNum > 1,
        pageSize: limitNum
      };

      logger.info({ admin: req.admin.username, customerCount: paginatedCustomers.length, totalFiltered, currentPage: pageNum }, `Admin fetched ${paginatedCustomers.length} customers (page ${pageNum})`);

      return successResponse(res, {
        customers: paginatedCustomers,
        pagination: pagination
      }, 'Customers fetched successfully', 200, {
        total: enhancedCustomers.length,
        consistent_records: enhancedCustomers.filter(c => c.consistency_check).length,
        inconsistent_records: enhancedCustomers.filter(c => !c.consistency_check).length
      });

    } catch (error) {
      logger.error({ admin: req.admin.username, error: error.message }, 'Admin customers fetch failed');
      return internalErrorResponse(res, 'Internal server error');
    }
  }

  else if (req.method === 'POST') {
    try {
      // ✅ SECURITY: Validate and sanitize request body
      const validation = validateCustomerUpdate(req.body);
      
      if (!validation.isValid) {
        logger.warn({ 
          admin: req.admin.username, 
          validationErrors: validation.errors, 
          requestBody: req.body 
        }, 'Admin customers POST request validation failed');
        
        return validationErrorResponse(res, 'Invalid request data', validation.errors);
      }

      const { customer_id, notes, payment_status } = validation.data;

      // Get customer info first
      const { data: customer, error: customerError } = await getCustomerWithPaymentStatus(logger, customer_id);
      
      if (customerError || !customer) {
        return notFoundResponse(res, 'Customer');
      }

      // ✅ ATOMIC: Use transaction-safe update for all operations
      const updateData = {};
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      if (payment_status && payment_status !== customer.payment_status) {
        logger.info({ admin: req.admin.username, customerId: customer_id, customerEmail: customer.email_address, fromStatus: customer.payment_status, toStatus: payment_status, latestOrderNumber: customer.latest_order_number }, `Admin attempting atomic payment status change`);

        if (!customer.latest_order_number) {
          return operationFailedResponse(res, 'Cannot update payment status: No order found for this customer');
        }

        updateData.payment_status = payment_status;
        updateData.order_number = customer.latest_order_number;
        updateData.admin_override = true;
      }

      // Perform atomic update of all changes
      if (Object.keys(updateData).length > 0) {
        const atomicResult = await updateCustomerAtomic(logger, customer_id, updateData);
        
        if (!atomicResult.data || !atomicResult.data.success) {
          logger.error({ admin: req.admin.username, customerId: customer_id, error: atomicResult.data?.error || atomicResult.error }, 'Atomic customer update failed');
          
          const errorMessage = `Update failed: ${atomicResult.data?.error || atomicResult.error || 'Unknown error'}`;
          return operationFailedResponse(res, errorMessage);
        }

        logger.info({ admin: req.admin.username, customerId: customer_id, updatedFields: Object.keys(updateData), previousPaymentStatus: atomicResult.data.previous_payment_status, newPaymentStatus: atomicResult.data.new_payment_status }, `Admin atomic customer update successful`);
      }

      // Get updated customer data
      const { data: updatedCustomer, error: fetchError } = await getCustomerWithPaymentStatus(logger, customer_id);
      
      if (fetchError) {
        throw fetchError;
      }

      logger.info({ admin: req.admin.username, customerId: customer_id, updatedFields: Object.keys(updateData) }, `Admin updated customer successfully`);

      return successResponse(res, updatedCustomer, 'Customer updated successfully');

    } catch (error) {
      logger.error({ admin: req.admin.username, error: error.message }, 'Admin customer update failed');
      return internalErrorResponse(res, 'Failed to update customer');
    }
  }

  else {
    return methodNotAllowedResponse(res, ['GET', 'POST']);
  }
}

// Export with CSRF protection for POST requests
export default function handler(req, res) {
  if (req.method === 'GET') {
    // GET requests only need authentication
    return requireAuth(customersHandler)(req, res);
  } else {
    // POST/PUT/DELETE requests need CSRF protection
    return requireAuthWithCSRF(customersHandler)(req, res);
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
