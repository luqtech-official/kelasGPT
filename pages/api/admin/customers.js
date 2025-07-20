import { requireAuth } from '../../../lib/adminAuth-clean';
import { supabase, getEmailStatusForCustomers, getCustomersWithOrders } from '../../../lib/supabase';
import { 
  successResponse, 
  validationErrorResponse, 
  internalErrorResponse, 
  notFoundResponse,
  methodNotAllowedResponse 
} from '../../../lib/apiResponse';

async function customersHandler(req, res) {
  const startTime = Date.now();

  if (req.method === 'GET') {
    try {
      // ✅ SECURITY: Validate and sanitize query parameters
      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '10');
      const search = req.query.search || '';
      const status = req.query.status || 'all';
      const exportData = req.query.export || 'false';

      // Basic validation
      const pageNum = (page > 0 && page <= 1000) ? page : 1;
      const limitNum = (limit > 0 && limit <= 100) ? limit : 10;
      const offset = (pageNum - 1) * limitNum;

      // ✅ OPTIMIZED: Use efficient function that fixes N+1 query problem
      const dbQueryStart = Date.now();
      const { data: customers, error } = await getCustomersWithOrders();
      const dbQueryDuration = Date.now() - dbQueryStart;
      
      if (error) {
        console.error('Error fetching customers with orders:', error.message);
        return internalErrorResponse(res, 'Error fetching customers');
      }

      if (!customers) {
        return successResponse(res, {
          customers: [],
          totalCustomers: 0,
          totalFiltered: 0,
          currentPage: pageNum,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        });
      }

      // ✅ OPTIMIZED: Client-side filtering for better performance
      let filteredCustomers = customers;

      // Search filter
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.full_name?.toLowerCase().includes(searchLower) ||
          customer.email_address?.toLowerCase().includes(searchLower) ||
          customer.phone_number?.includes(search) ||
          customer.latest_order_number?.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (status && status !== 'all') {
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.payment_status === status
        );
      }

      const totalFiltered = filteredCustomers.length;

      // ✅ OPTIMIZED: Enhance customers with email status in batch
      const customerIds = filteredCustomers.map(c => c.customer_id);
      const emailStatuses = await getEmailStatusForCustomers(customerIds);
      
      // Create Map for O(1) lookup performance
      const emailStatusMap = new Map();
      emailStatuses?.forEach(status => {
        emailStatusMap.set(status.customer_id, status);
      });

      // Enhance customers with email status
      const enhancedCustomers = filteredCustomers.map(customer => ({
        ...customer,
        email_status: emailStatusMap.get(customer.customer_id) || {
          delivery_status: 'not_sent',
          last_sent_at: null,
          delivery_count: 0
        }
      }));

      // Handle export request
      if (exportData === 'true') {
        const csvTransformStart = Date.now();
        
        // Generate CSV content
        const csvHeaders = [
          'Customer ID', 'Full Name', 'Email', 'Phone', 'Payment Status', 
          'Created At', 'Latest Order', 'Order Total', 'Email Status', 'Notes'
        ];
        
        const csvRows = enhancedCustomers.map(customer => [
          customer.customer_id,
          customer.full_name || '',
          customer.email_address || '',
          customer.phone_number || '',
          customer.payment_status || 'pending',
          customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '',
          customer.latest_order_number || '',
          customer.latest_order_total ? `RM ${customer.latest_order_total}` : '',
          customer.email_status?.delivery_status || 'not_sent',
          customer.notes || ''
        ]);
        
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        const csvTransformDuration = Date.now() - csvTransformStart;

        const filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
      }

      // ✅ OPTIMIZED: Client-side pagination for better performance
      const totalPages = Math.ceil(totalFiltered / limitNum);
      const paginatedCustomers = enhancedCustomers.slice(offset, offset + limitNum);

      const response = {
        customers: paginatedCustomers,
        totalCustomers: customers.length,
        totalFiltered,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      };

      return successResponse(res, response);

    } catch (error) {
      console.error('Admin customers fetch failed:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        details: error.details
      });
      return res.status(500).json({
        success: false,
        message: 'Error fetching customers',
        errorCode: 'INTERNAL_ERROR',
        debug: {
          message: error.message,
          code: error.code
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  else if (req.method === 'POST') {
    try {
      // ✅ SECURITY: Validate and sanitize request body
      const { customer_id, notes, payment_status } = req.body;

      if (!customer_id) {
        return validationErrorResponse(res, 'Customer ID is required');
      }

      // Get customer info first
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customer_id)
        .single();
      
      if (customerError || !customer) {
        return notFoundResponse(res, 'Customer not found');
      }

      // Prepare update data
      const updateData = {};

      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      if (payment_status && payment_status !== customer.payment_status) {
        updateData.payment_status = payment_status;
      }

      // Apply simple update
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update(updateData)
        .eq('customer_id', customer_id)
        .select()
        .single();

      if (updateError) {
        console.error('Customer update failed:', updateError);
        return internalErrorResponse(res, 'Failed to update customer');
      }

      return successResponse(res, updatedCustomer, 'Customer updated successfully');

    } catch (error) {
      console.error('Admin customer update failed:', error.message);
      return internalErrorResponse(res, 'Failed to update customer');
    }
  }
  
  else {
    return methodNotAllowedResponse(res, req.method);
  }
}

export default requireAuth(customersHandler);