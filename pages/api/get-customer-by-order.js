import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { order_number } = req.query;

  if (!order_number) {
    return res.status(400).json({ message: 'Order number is required' });
  }

  try {
    // Fetch customer data by joining orders and customers tables
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_number,
        customers!inner (
          customer_id,
          full_name,
          email_address,
          phone_number
        )
      `)
      .eq('order_number', order_number)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return customer data
    const customerData = {
      customerId: data.customers.customer_id,
      fullName: data.customers.full_name,
      email: data.customers.email_address,
      phone: data.customers.phone_number
    };

    res.status(200).json({ success: true, customer: customerData });

  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}