import { createLogger } from '../../../lib/pino-logger';
import { updatePaymentStatusValidated, PAYMENT_STATES } from '../../../lib/paymentStatus';

export default async function handler(req, res) {
  const logger = createLogger(req);
  // Log all incoming requests to understand SecurePay's timeout redirect behavior
  logger.info({ 
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers
  }, `Payment timeout endpoint accessed`);

  if (req.method === 'POST') {
    // Handle POST redirect from SecurePay for timeout payments
    const { order_number, payment_status, merchant_reference_number, amount } = req.body;
    
    logger.info({ 
      order_number, 
      payment_status, 
      merchant_reference_number, 
      amount,
      fullQuery: req.query
    }, `SecurePay timeout POST redirect received`);

    // Update payment status in database for timeout payments
    if (order_number) {
      logger.info(`Updating payment status to expired for order: ${order_number}`);
      
      const statusUpdateResult = await updatePaymentStatusValidated(
        logger,
        order_number, 
        PAYMENT_STATES.EXPIRED,
        merchant_reference_number
      );
      
      if (!statusUpdateResult.success) {
        logger.error({ statusUpdateResult }, `Failed to update timeout payment status: ${order_number}`);
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
