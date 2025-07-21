import { supabase, logEmail, updateEmailStatus } from "../../../lib/supabase";
import mailjet from '../../../lib/mailjet';
import { requireAuthWithCSRF } from "../../../lib/adminAuth";
import { getProductSettings } from "../../../lib/settings";

async function resendEmailHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {

    const { order_number } = req.body;

    if (!order_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order number is required' 
      });
    }

    // Get customer and order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          full_name,
          email_address,
          customer_id
        )
      `)
      .eq('order_number', order_number)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if customer has paid status
    if (order.customers.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only resend emails for paid customers' 
      });
    }

    const customerName = order.customers.full_name;
    const customerEmail = order.customers.email_address;

    // Get product settings for email
    const productSettings = await getProductSettings();

    // Log email resend attempt
    let createUTCTimestamp;
    try {
      ({ createUTCTimestamp } = await import('../../../lib/timezone-utils.js'));
    } catch (importError) {
      console.warn('Failed to import timezone-utils in resend-email, using fallback', { error: importError.message });
      createUTCTimestamp = () => new Date().toISOString();
    }
    
    const emailLogResult = await logEmail({
      email_type: 'purchase_confirmation_resend',
      recipient_email: customerEmail,
      recipient_name: customerName,
      order_number: order_number,
      customer_id: order.customers.customer_id,
      order_id: order.order_id,
      status: 'sending',
      provider: 'mailjet',
      template_id: process.env.MJ_TEMPLATE_ID_PURCHASE_CONFIRMATION,
      created_at: createUTCTimestamp()
    });

    let emailLogId = null;
    if (emailLogResult.data && emailLogResult.data[0]) {
      emailLogId = emailLogResult.data[0].id;
    }

    try {
      // Send email with Mailjet
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

      return res.status(200).json({
        success: true,
        message: `Email resent successfully to ${customerEmail}`,
        email_log_id: emailLogId
      });

    } catch (emailError) {
      // Update email status to failed
      if (emailLogId) {
        await updateEmailStatus(emailLogId, 'failed', emailError.message);
      }

      console.error('Mailjet API Error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailError.message
      });
    }

  } catch (error) {
    console.error('Resend email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

export default requireAuthWithCSRF(resendEmailHandler);