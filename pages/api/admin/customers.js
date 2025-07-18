import { supabase } from "../../../lib/supabase";
import { requireAuth } from "../../../lib/adminAuth";

async function handler(req, res) {
  if (req.method === 'GET') {
    return getCustomers(req, res);
  } else if (req.method === 'POST') {
    return updateCustomer(req, res);
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}

async function getCustomers(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      export: exportData = false
    } = req.query;

    // Validate and sanitize inputs
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
      .from('customers')
      .select(`
        customer_id,
        full_name,
        email_address,
        phone_number,
        payment_status,
        created_at,
        updated_at,
        ip_address,
        user_agent,
        acquisition_source,
        notes,
        metadata
      `);

    // Add search filters
    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      query = query.or(`
        full_name.ilike.%${searchTerm}%,
        email_address.ilike.%${searchTerm}%,
        phone_number.ilike.%${searchTerm}%
      `);
    }

    // Add status filter
    if (status !== 'all') {
      query = query.eq('payment_status', status);
    }

    // Add sorting
    const validSortFields = ['created_at', 'full_name', 'email_address', 'payment_status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortField, sortDirection);

    // For export, get all matching records
    if (exportData === 'true') {
      const { data: exportCustomers, error: exportError } = await query;
      
      if (exportError) {
        throw exportError;
      }

      // Convert to CSV format
      const csvData = convertToCSV(exportCustomers);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      return res.status(200).send(csvData);
    }

    // For regular pagination, get count first
    const { count: totalCount, error: countError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: customers, error: customersError } = await query;

    if (customersError) {
      throw customersError;
    }

    // Calculate additional metrics
    const totalPages = Math.ceil(totalCount / limitNum);
    
    // Get filtered count for search results
    let filteredCount = totalCount;
    if (search.trim() || status !== 'all') {
      let countQuery = supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        countQuery = countQuery.or(`
          full_name.ilike.%${searchTerm}%,
          email_address.ilike.%${searchTerm}%,
          phone_number.ilike.%${searchTerm}%
        `);
      }

      if (status !== 'all') {
        countQuery = countQuery.eq('payment_status', status);
      }

      const { count: filtered, error: filteredError } = await countQuery;
      
      if (!filteredError) {
        filteredCount = filtered;
      }
    }

    // Add calculated fields
    const enhancedCustomers = customers.map(customer => ({
      ...customer,
      final_amount: customer.payment_status === 'paid' ? 99.00 : 0,
      order_number: `ORD-${new Date(customer.created_at).getTime()}`,
      masked_ip: customer.ip_address ? maskIPAddress(customer.ip_address) : null
    }));

    res.status(200).json({
      success: true,
      data: {
        customers: enhancedCustomers,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(filteredCount / limitNum),
          totalCount,
          filteredCount,
          limit: limitNum,
          hasNextPage: pageNum < Math.ceil(filteredCount / limitNum),
          hasPreviousPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customers API error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function updateCustomer(req, res) {
  try {
    const { customer_id, notes, payment_status } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    // Validate payment status if provided
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (payment_status && !validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Valid options: ${validStatuses.join(', ')}`
      });
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (payment_status) {
      updateData.payment_status = payment_status;
    }

    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update(updateData)
      .eq('customer_id', customer_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('Update customer API error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to mask IP addresses for privacy
function maskIPAddress(ip) {
  if (!ip) return null;
  
  if (ip.includes(':')) {
    // IPv6 - mask last 4 groups
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + ':XXXX:XXXX:XXXX:XXXX';
  } else {
    // IPv4 - mask last octet
    const parts = ip.split('.');
    return parts.slice(0, 3).join('.') + '.XXX';
  }
}

// Helper function to convert customers to CSV
function convertToCSV(customers) {
  if (!customers || customers.length === 0) {
    return 'No data available';
  }

  const headers = [
    'Customer ID',
    'Full Name', 
    'Email',
    'Phone',
    'Payment Status',
    'Created At',
    'IP Address',
    'Acquisition Source',
    'Notes'
  ];

  const csvRows = [
    headers.join(','),
    ...customers.map(customer => [
      customer.customer_id,
      `"${customer.full_name}"`,
      customer.email_address,
      customer.phone_number,
      customer.payment_status,
      customer.created_at,
      maskIPAddress(customer.ip_address) || '',
      customer.acquisition_source || '',
      `"${(customer.notes || '').replace(/"/g, '""')}"`
    ].join(','))
  ];

  return csvRows.join('\n');
}

export default requireAuth(handler);