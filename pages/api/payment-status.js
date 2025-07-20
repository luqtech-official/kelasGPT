import { createLogger } from '../../lib/pino-logger';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const logger = createLogger(req);
  // Log all incoming requests to understand SecurePay's redirect behavior
  logger.info({ 
    method: req.method,
    body: req.body,
    query: req.query,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    timestamp: new Date().toISOString()
  }, `🔥 PAYMENT STATUS ENDPOINT ACCESSED 🔥`);

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
    
    logger.info({ 
      order_number, 
      payment_status, 
      merchant_reference_number, 
      amount,
      fpx_status_message,
      fpx_debit_auth_code,
      fullBody: req.body,
      transaction_amount: req.body.transaction_amount
    }, `SecurePay POST redirect received`);

    // Check if this is a cancellation and redirect to appropriate page
    const isCancellation = fpx_status_message?.includes('Cancel') || 
                          fpx_status_message?.includes('cancel') ||
                          fpx_debit_auth_code === '1C' ||
                          (payment_status === 'false' && fpx_debit_auth_code === '1C');
    
    logger.info({
      isCancellation,
      payment_status,
      fpx_debit_auth_code,
      fpx_status_message,
      order_number
    }, `🔍 CANCELLATION DETECTION`);
    
    if (isCancellation) {
      // Redirect to cancellation page
      const redirectUrl = `/payment/cancelled?order_number=${encodeURIComponent(order_number || '')}&payment_status=${encodeURIComponent(payment_status || '')}&merchant_reference_number=${encodeURIComponent(merchant_reference_number || '')}&amount=${encodeURIComponent(amount || '')}`;
      logger.info({ redirectUrl, order_number }, `🔀 REDIRECTING TO CANCELLATION PAGE`);
      return res.redirect(302, redirectUrl);
    } else {
      // Redirect to the actual payment status page with query parameters
      const redirectUrl = `/payment-status?order_number=${encodeURIComponent(order_number || '')}&payment_status=${encodeURIComponent(payment_status || '')}&merchant_reference_number=${encodeURIComponent(merchant_reference_number || '')}&amount=${encodeURIComponent(amount || '')}`;
      logger.info({ redirectUrl, order_number }, `🔀 REDIRECTING TO PAYMENT STATUS PAGE`);
      return res.redirect(302, redirectUrl);
    }
  }

  if (req.method === 'GET') {
    // Check if this is a status query by order_number
    if (req.query.order_number) {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('order_status, order_number, customer_id')
          .eq('order_number', req.query.order_number)
          .single();

        if (error || !order) {
          logger.warn({ order_number: req.query.order_number, error }, 'Order not found for status check');
          return res.status(404).json({ message: 'Order not found' });
        }

        logger.info({ order_number: req.query.order_number, status: order.order_status }, 'Order status check');
        return res.status(200).json({ 
          payment_status: order.order_status,
          order_number: order.order_number 
        });
        
      } catch (error) {
        logger.error({ error: error.message, order_number: req.query.order_number }, 'Error checking order status');
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
    
    // Handle GET requests by redirecting to the payment status page
    const queryString = new URLSearchParams(req.query).toString();
    const redirectUrl = `/payment-status${queryString ? `?${queryString}` : ''}`;
    
    logger.info({ redirectUrl, query: req.query }, `🔀 GET REDIRECT TO PAYMENT STATUS`);
    return res.redirect(302, redirectUrl);
  }

  // Method not allowed
  logger.error({ method: req.method }, `❌ METHOD NOT ALLOWED on payment-status`);
  return res.status(405).json({ message: 'Method Not Allowed' });
}
