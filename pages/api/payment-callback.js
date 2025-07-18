import { supabase, logEmail, updateEmailStatus } from "../../lib/supabase";
import crypto from 'crypto';
import mailjet from '../../lib/mailjet';
import { createLogger } from '../../lib/pino-logger';
import { getProductSettings } from "../../lib/settings";
import { updatePaymentStatusValidated, PAYMENT_STATES } from "../../lib/paymentStatus";

export default async function handler(req, res) {
  const logger = createLogger(req);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // SecurePay sends data in query parameters, not body
  const callbackData = req.query;
  
  // Log the raw callback data to understand SecurePay's actual format
  logger.info({ 
    body: req.body,
    query: req.query,
    headers: req.headers,
    method: req.method
  }, `Raw callback data received`);
  
  // Validate required callback data fields
  if (!callbackData || typeof callbackData !== 'object') {
    logger.error({ callbackData }, 'Invalid callback data received');
    return res.status(400).json({ message: 'Invalid callback data' });
  }

  // Extract parameters using SecurePay's actual parameter names
  const { 
    order_number, 
    payment_status, 
    merchant_reference_number, 
    amount,
    checksum
  } = callbackData;

  // Validate required fields (using checksum instead of signature)
  if (!order_number || !payment_status || !merchant_reference_number || !amount || !checksum) {
    logger.error({ 
      order_number: !!order_number, 
      payment_status: !!payment_status, 
      merchant_reference_number: !!merchant_reference_number, 
      amount: !!amount, 
      checksum: !!checksum,
      rawData: callbackData,
      allKeys: Object.keys(callbackData)
    }, 'Missing required callback fields');
    return res.status(400).json({ message: 'Missing required callback fields' });
  }

  logger.info({ callbackData }, `Received SecurePay callback for order ${order_number}`);

  try {
    // --- IMPORTANT: Signature Validation ---
    const checksumToken = process.env.SECUREPAY_CHECKSUM_TOKEN;
    
    // Create signature data from callback parameters in alphabetical order (matching request format)
    const callbackDataForValidation = { ...req.query };
    const receivedSignature = callbackDataForValidation.checksum;
    delete callbackDataForValidation.checksum; // Remove checksum from data before validation
    
    // Sort parameters alphabetically and join with pipe delimiter
    const sortedKeys = Object.keys(callbackDataForValidation).sort();
    const signatureString = sortedKeys.map(key => callbackDataForValidation[key]).join('|');
    
    // Use HMAC-SHA256 with checksum token (matching request algorithm)
    const expectedSignature = crypto.createHmac('sha256', checksumToken).update(signatureString).digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(receivedSignature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      logger.error({ 
        received: receivedSignature, 
        expected: expectedSignature,
        signatureString,
        sortedKeys
      }, `Invalid signature in callback for order ${order_number}`);
      return res.status(400).json({ message: 'Invalid signature.' });
    }

    logger.info(`Signature validated for order ${order_number}`);

    // --- Signature is valid, proceed with business logic ---
    // Handle SecurePay's actual payment status format (lowercase "true")
    const isPaymentSuccessful = payment_status === 'true' || payment_status === 'True' || payment_status === true || payment_status === 'success';
    
    if (isPaymentSuccessful) {
      logger.info(`Payment for order ${order_number} was successful.`);
      
      // ✅ FIXED: Use validated payment status update (SQL ambiguity resolved)
      const statusUpdateResult = await updatePaymentStatusValidated(
        logger,
        order_number, 
        PAYMENT_STATES.PAID, 
        merchant_reference_number
      );

      if (!statusUpdateResult.success) {
        // Handle duplicate callback gracefully
        if (statusUpdateResult.validationError && statusUpdateResult.error.includes('Invalid transition')) {
          logger.warn({ statusUpdateResult }, `Duplicate payment callback for already processed order: ${order_number}`);
          return res.status(200).json({ message: 'Order already processed successfully' });
        }
        
        logger.error({ statusUpdateResult }, `Critical database update error for order ${order_number}`);
        return res.status(500).json({ message: 'Database update failed' });
      }

      logger.info({
        previousStatus: statusUpdateResult.data.previous_status,
        newStatus: statusUpdateResult.data.new_status,
        customerId: statusUpdateResult.data.customer_id
      }, `Database updated atomically for successful order ${order_number}`);

      // Get order details for email
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`order_id, customer_id, customers (full_name, email_address)`)
        .eq('order_number', order_number)
        .single();

      if (orderError || !order) {
        logger.error({ error: orderError }, `Order not found for email sending: ${order_number}`);
        // Payment processed successfully, but can't send email - this is OK
        return res.status(200).json({ message: 'Payment processed, email sending failed' });
      }

      // --- Send transactional email with Mailjet ---
      let emailLogId = null;
      try {
        const customerName = order.customers.full_name;
        const customerEmail = order.customers.email_address;
        
        // Get product settings for email
        const productSettings = await getProductSettings();

        // Log email attempt
        const emailLogResult = await logEmail({
          email_type: 'purchase_confirmation',
          recipient_email: customerEmail,
          recipient_name: customerName,
          order_number: order_number,
          status: 'sending',
          provider: 'mailjet',
          template_id: process.env.MJ_TEMPLATE_ID_PURCHASE_CONFIRMATION,
          created_at: new Date().toISOString()
        });

        if (emailLogResult.data && emailLogResult.data[0]) {
          emailLogId = emailLogResult.data[0].id;
        }

        const emailRequest = mailjet.post('send', { 'version': 'v3.1' }).request({
          Messages: [{
            From: { Email: process.env.MJ_SENDER_EMAIL, Name: "KelasGPT" },
            To: [{ Email: customerEmail, Name: customerName }],
            TemplateID: parseInt(process.env.MJ_TEMPLATE_ID_PURCHASE_CONFIRMATION),
            TemplateLanguage: true,
            Subject: `Thank you for your purchase, ${customerName}!`,
            Variables: { 
              customer_name: customerName, 
              order_number: order_number,
              product_name: productSettings.productName,
              product_price: productSettings.productPrice,
              download_link: productSettings.productDownloadLink
            }
          }]
        });

        const emailResponse = await emailRequest;
        
        // Update email status to sent
        if (emailLogId) {
          await updateEmailStatus(emailLogId, 'sent');
        }
        
        logger.info(`Purchase confirmation email sent to ${customerEmail} for order ${order_number}`);

      } catch (emailError) {
        // Update email status to failed
        if (emailLogId) {
          await updateEmailStatus(emailLogId, 'failed', emailError.message);
        }
        
        logger.error({ 
          statusCode: emailError.statusCode, 
          response: emailError.response?.data 
        }, `Mailjet API Error for order ${order_number}`);
        // Continue - payment was successful even if email failed
      }

    } else {
      // --- Handle failed payment ---
      logger.warn(`Payment for order ${order_number} failed or was cancelled.`);
      
      // Check if this is a user cancellation vs other failure
      const isCancellation = callbackData.fpx_status_message?.includes('Cancel') || 
                            callbackData.fpx_status_message?.includes('cancel') ||
                            callbackData.fpx_debit_auth_code === '1C';
      
      const newStatus = isCancellation ? PAYMENT_STATES.CANCELLED : PAYMENT_STATES.FAILED;
      
      logger.info({
        isCancellation,
        newStatus,
        fpx_status_message: callbackData.fpx_status_message,
        fpx_debit_auth_code: callbackData.fpx_debit_auth_code
      }, `Cancellation detection for order ${order_number}`);
      
      // ✅ FIXED: Use validated payment status update (SQL ambiguity resolved)
      const statusUpdateResult = await updatePaymentStatusValidated(
        logger,
        order_number, 
        newStatus
      );

      if (!statusUpdateResult.success) {
        logger.error({ statusUpdateResult }, `Error updating failed payment status for order ${order_number}`);
        return res.status(500).json({ message: 'Database update failed for failed payment' });
      }

      logger.info({
        previousStatus: statusUpdateResult.data.previous_status,
        newStatus: statusUpdateResult.data.new_status
      }, `Payment status updated atomically for failed order ${order_number}`);
    }

    logger.info(`Callback processing completed successfully for order ${order_number}`);
    res.status(200).json({ message: 'Callback received and processed successfully' });

  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }, `Unhandled error in callback for order ${order_number}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
