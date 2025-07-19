import { logTransaction } from "../../lib/logger";

export default async function handler(req, res) {
  // Log all incoming requests to understand SecurePay's redirect behavior
  await logTransaction('INFO', `Payment status endpoint accessed`, { 
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  if (req.method === 'POST') {
    // Handle POST redirect from SecurePay
    const { order_number, payment_status, merchant_reference_number, amount } = req.body;
    
    await logTransaction('INFO', `SecurePay POST redirect received`, { 
      order_number, 
      payment_status, 
      merchant_reference_number, 
      amount 
    });

    // Redirect to the actual payment status page with query parameters
    const redirectUrl = `/payment-status?order_number=${encodeURIComponent(order_number || '')}&payment_status=${encodeURIComponent(payment_status || '')}&merchant_reference_number=${encodeURIComponent(merchant_reference_number || '')}&amount=${encodeURIComponent(amount || '')}`;
    
    return res.redirect(302, redirectUrl);
  }

  if (req.method === 'GET') {
    // Handle GET requests by redirecting to the payment status page
    const queryString = new URLSearchParams(req.query).toString();
    const redirectUrl = `/payment-status${queryString ? `?${queryString}` : ''}`;
    
    return res.redirect(302, redirectUrl);
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method Not Allowed' });
}