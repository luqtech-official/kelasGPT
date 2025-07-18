import { supabase, logEmail, updateEmailStatus } from "../../lib/supabase";
import crypto from 'crypto';
import mailjet from '../../lib/mailjet';
import { logTransaction } from "../../lib/logger";
import { getProductSettings } from "../../lib/settings";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const callbackData = req.body;
  
  // Validate required callback data fields
  if (!callbackData || typeof callbackData !== 'object') {
    await logTransaction('ERROR', 'Invalid callback data received', { callbackData });
    return res.status(400).json({ message: 'Invalid callback data' });
  }

  const { order_number, payment_status, merchant_reference_number, amount, signature } = callbackData;

  // Validate required fields
  if (!order_number || !payment_status || !merchant_reference_number || !amount || !signature) {
    await logTransaction('ERROR', 'Missing required callback fields', { 
      order_number: !!order_number, 
      payment_status: !!payment_status, 
      merchant_reference_number: !!merchant_reference_number, 
      amount: !!amount, 
      signature: !!signature 
    });
    return res.status(400).json({ message: 'Missing required callback fields' });
  }

  await logTransaction('INFO', `Received SecurePay callback for order ${order_number}`, callbackData);

  try {
    // --- IMPORTANT: Signature Validation ---
    const authToken = process.env.SECUREPAY_AUTH_TOKEN;
    const signatureString = `${authToken}${order_number}${payment_status}${merchant_reference_number}${amount}`;
    const expectedSignature = crypto.createHash('sha256').update(signatureString).digest('hex');

    if (expectedSignature !== signature) {
      await logTransaction('ERROR', `Invalid signature in callback for order ${order_number}`, { received: signature, expected: expectedSignature });
      return res.status(400).json({ message: 'Invalid signature.' });
    }

    await logTransaction('INFO', `Signature validated for order ${order_number}`);

    // --- Signature is valid, proceed with business logic ---
    // Handle different payment status formats (string 'true', boolean true, or 'success')
    const isPaymentSuccessful = payment_status === 'true' || payment_status === true || payment_status === 'success';
    
    if (isPaymentSuccessful) {
      await logTransaction('INFO', `Payment for order ${order_number} was successful.`);
      
      // --- Update database records and send email ---
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`order_id, customer_id, customers (full_name, email_address)`)
        .eq('order_number', order_number)
        .single();

      if (orderError || !order) {
        await logTransaction('ERROR', `Order not found for order_number: ${order_number}`, orderError);
        return res.status(200).json({ message: 'Callback processed, but order not found.' });
      }

      // Run database updates in parallel
      const [orderUpdateResult, customerUpdateResult] = await Promise.all([
        supabase
          .from('orders')
          .update({ order_status: 'paid', gateway_transaction_id: merchant_reference_number, updated_at: new Date().toISOString() })
          .eq('order_number', order_number),
        supabase
          .from('customers')
          .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
          .eq('customer_id', order.customer_id)
      ]);

      // Check for database update errors and handle them properly
      if (orderUpdateResult.error || customerUpdateResult.error) {
        await logTransaction('ERROR', `Critical database update error for order ${order_number}`, { 
          orderError: orderUpdateResult.error, 
          customerError: customerUpdateResult.error 
        });
        
        // Return error response - don't send email if database updates failed
        return res.status(500).json({ message: 'Database update failed' });
      }

      await logTransaction('INFO', `Database updated for successful order ${order_number}`);

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
        
        await logTransaction('INFO', `Purchase confirmation email sent to ${customerEmail} for order ${order_number}`);

      } catch (emailError) {
        // Update email status to failed
        if (emailLogId) {
          await updateEmailStatus(emailLogId, 'failed', emailError.message);
        }
        
        await logTransaction('ERROR', `Mailjet API Error for order ${order_number}`, { statusCode: emailError.statusCode, response: emailError.response.data });
      }

    } else {
      // --- Handle failed payment ---
      await logTransaction('WARN', `Payment for order ${order_number} failed or was cancelled.`);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ order_status: 'failed' })
        .eq('order_number', order_number);

      if (updateError) {
        await logTransaction('ERROR', `Error updating failed order status for ${order_number}`, updateError);
      }
    }

    res.status(200).json({ message: 'Callback received and processed successfully' });

  } catch (error) {
    await logTransaction('ERROR', `Unhandled error in callback for order ${order_number}`, { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
