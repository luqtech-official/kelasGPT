import { logTransaction } from "../../../lib/logger";
import { updatePaymentStatusValidated, PAYMENT_STATES } from "../../../lib/paymentStatus";

export default async function handler(req, res) {
  // Log all incoming requests to understand SecurePay's timeout redirect behavior
  await logTransaction('INFO', `Payment timeout endpoint accessed`, { 
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  if (req.method === 'POST') {
    // Handle POST redirect from SecurePay for timeout payments
    const { order_number, payment_status, merchant_reference_number, amount } = req.body;
    
    await logTransaction('INFO', `SecurePay timeout POST redirect received`, { 
      order_number, 
      payment_status, 
      merchant_reference_number, 
      amount,
      fullQuery: req.query
    });

    // Update payment status in database for timeout payments
    if (order_number) {
      await logTransaction('INFO', `Updating payment status to expired for order: ${order_number}`);
      
      const statusUpdateResult = await updatePaymentStatusValidated(
        order_number, 
        PAYMENT_STATES.EXPIRED,
        merchant_reference_number
      );
      
      if (!statusUpdateResult.success) {
        await logTransaction('ERROR', `Failed to update timeout payment status: ${order_number}`, statusUpdateResult);
        // Continue with redirect even if database update fails
      } else {
        logger.info(`Successfully updated payment status to expired: ${order_number}`);
      }
    }

    // Redirect to the actual payment timeout page with query parameters
    const redirectUrl = `/payment/timeout?order_number=${encodeURIComponent(order_number || '')}&payment_status=${encodeURIComponent(payment_status || '')}&merchant_reference_number=${encodeURIComponent(merchant_reference_number || '')}&amount=${encodeURIComponent(amount || '')}`;
    
    return res.redirect(302, redirectUrl);
  }

  if (req.method === 'GET') {
    // Handle GET requests by redirecting to the payment timeout page
    const queryString = new URLSearchParams(req.query).toString();
    const redirectUrl = `/payment/timeout${queryString ? `?${queryString}` : ''}`;
    
    return res.redirect(302, redirectUrl);
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method Not Allowed' });
}