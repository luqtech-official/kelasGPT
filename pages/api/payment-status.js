import { logTransaction } from "../../lib/logger";

export default async function handler(req, res) {
  // Log all incoming requests to understand SecurePay's redirect behavior
  await logTransaction('INFO', `🔥 PAYMENT STATUS ENDPOINT ACCESSED 🔥`, { 
    method: req.method,
    body: req.body,
    query: req.query,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    timestamp: new Date().toISOString()
  });

  if (req.method === 'POST') {
    // Handle POST redirect from SecurePay - data comes in request body
    const { 
      order_number, 
      payment_status, 
      merchant_reference_number, 
      transaction_amount,
      fpx_status_message, 
      fpx_debit_auth_code 
    } = req.body;
    
    // Use transaction_amount as the amount for consistency
    const amount = transaction_amount;
    
    await logTransaction('INFO', `SecurePay POST redirect received`, { 
      order_number, 
      payment_status, 
      merchant_reference_number, 
      amount,
      fpx_status_message,
      fpx_debit_auth_code,
      fullBody: req.body,
      transaction_amount: req.body.transaction_amount
    });

    // Check if this is a cancellation and redirect to appropriate page
    const isCancellation = fpx_status_message?.includes('Cancel') || 
                          fpx_status_message?.includes('cancel') ||
                          fpx_debit_auth_code === '1C' ||
                          (payment_status === 'false' && fpx_debit_auth_code === '1C');
    
    await logTransaction('INFO', `🔍 CANCELLATION DETECTION`, {
      isCancellation,
      payment_status,
      fpx_debit_auth_code,
      fpx_status_message,
      order_number
    });
    
    if (isCancellation) {
      // Redirect to cancellation page
      const redirectUrl = `/payment/cancelled?order_number=${encodeURIComponent(order_number || '')}&payment_status=${encodeURIComponent(payment_status || '')}&merchant_reference_number=${encodeURIComponent(merchant_reference_number || '')}&amount=${encodeURIComponent(amount || '')}`;
      await logTransaction('INFO', `🔀 REDIRECTING TO CANCELLATION PAGE`, { redirectUrl, order_number });
      return res.redirect(302, redirectUrl);
    } else {
      // Redirect to the actual payment status page with query parameters
      const redirectUrl = `/payment-status?order_number=${encodeURIComponent(order_number || '')}&payment_status=${encodeURIComponent(payment_status || '')}&merchant_reference_number=${encodeURIComponent(merchant_reference_number || '')}&amount=${encodeURIComponent(amount || '')}`;
      await logTransaction('INFO', `🔀 REDIRECTING TO PAYMENT STATUS PAGE`, { redirectUrl, order_number });
      return res.redirect(302, redirectUrl);
    }
  }

  if (req.method === 'GET') {
    // Handle GET requests by redirecting to the payment status page
    const queryString = new URLSearchParams(req.query).toString();
    const redirectUrl = `/payment-status${queryString ? `?${queryString}` : ''}`;
    
    await logTransaction('INFO', `🔀 GET REDIRECT TO PAYMENT STATUS`, { redirectUrl, query: req.query });
    return res.redirect(302, redirectUrl);
  }

  // Method not allowed
  await logTransaction('ERROR', `❌ METHOD NOT ALLOWED on payment-status`, { method: req.method });
  return res.status(405).json({ message: 'Method Not Allowed' });
}