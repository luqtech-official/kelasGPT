import { createLogger } from '../../../lib/pino-logger';
import { updatePaymentStatusValidated, PAYMENT_STATES } from '../../../lib/paymentStatus';

export default async function handler(req, res) {
  const logger = createLogger(req);
  
  // Helper function to extract order_number from referer
  function extractFromReferer(referer) {
    if (!referer) return null;
    try {
      const url = new URL(referer);
      return url.searchParams.get('order_number') || 
             url.pathname.match(/order[_-](\w+)/i)?.[1];
    } catch {
      return null;
    }
  }

  // ENHANCED LOGGING: Capture everything SecurePay sends
  logger.info({
    method: req.method,
    body: req.body,
    query: req.query,
    url: req.url,
    referer: req.headers.referer,
    refererParsed: req.headers.referer ? (() => {
      try { return new URL(req.headers.referer).searchParams.toString(); } catch { return null; }
    })() : null,
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    contentType: req.headers['content-type'],
    allHeaderKeys: Object.keys(req.headers || {}),
    bodyKeys: Object.keys(req.body || {}),
    queryKeys: Object.keys(req.query || {})
  }, `COMPLETE cancellation request data`);

  // Try to extract order_number from multiple sources
  const bodyOrderNumber = req.body?.order_number;
  const queryOrderNumber = req.query?.order_number;
  const refererOrderNumber = extractFromReferer(req.headers.referer);
  
  logger.info({ 
    bodyOrderNumber,
    queryOrderNumber, 
    refererOrderNumber,
    bodyData: req.body,
    queryData: req.query
  }, `Order number extraction attempts`);

  if (req.method === 'POST') {
    // Handle POST redirect from SecurePay for cancelled payments
    const { order_number, payment_status, merchant_reference_number, amount } = req.body;
    
    logger.info({ 
      order_number, 
      payment_status, 
      merchant_reference_number, 
      amount,
      fullQuery: req.query
    }, `SecurePay cancel POST redirect received`);

    // Update payment status in database for cancelled payments
    if (order_number) {
      logger.info(`Starting database update for cancelled order: ${order_number}`);
      
      const statusUpdateResult = await updatePaymentStatusValidated(
        logger,
        order_number, 
        PAYMENT_STATES.CANCELLED,
        merchant_reference_number
      );
      
      if (!statusUpdateResult.success) {
        logger.error({ statusUpdateResult, order_number }, `Database update FAILED for cancelled order: ${order_number}`);
        // Continue with redirect even if database update fails
      } else {
        logger.info(`Database update SUCCESS for cancelled order: ${order_number}`);
      }
    }

    // Redirect to the actual payment cancelled page with query parameters
    const redirectUrl = `/payment/cancelled?order_number=${encodeURIComponent(order_number || '')}&payment_status=${encodeURIComponent(payment_status || '')}&merchant_reference_number=${encodeURIComponent(merchant_reference_number || '')}&amount=${encodeURIComponent(amount || '')}`;
    
    return res.redirect(302, redirectUrl);
  }

  if (req.method === 'GET') {
    // Handle GET requests by redirecting to the payment cancelled page
    const queryString = new URLSearchParams(req.query).toString();
    const redirectUrl = `/payment/cancelled${queryString ? `?${queryString}` : ''}`;
    
    return res.redirect(302, redirectUrl);
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method Not Allowed' });
}
