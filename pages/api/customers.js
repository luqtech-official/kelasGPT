import { addCustomer, getCustomer, getCustomers, updateCustomer, deleteCustomer } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const newCustomer = await addCustomer(req.body);
      res.status(201).json({ success: true, customer: newCustomer });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { customer_id } = req.query;
      let data;
      if (customer_id) {
        data = await getCustomer(customer_id);
      } else {
        data = await getCustomers();
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { customer_id } = req.query;
      if (!customer_id) {
        return res.status(400).json({ success: false, message: 'customer_id is required for PUT request' });
      }
      const updatedCustomer = await updateCustomer(customer_id, req.body);
      res.status(200).json({ success: true, customer: updatedCustomer });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { customer_id } = req.query;
      if (!customer_id) {
        return res.status(400).json({ success: false, message: 'customer_id is required for DELETE request' });
      }
      await deleteCustomer(customer_id);
      res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}