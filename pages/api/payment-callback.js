import { supabase } from "../../lib/supabase";
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const callbackData = req.body;

    console.log('Received SecurePay Callback:', callbackData);

    // --- IMPORTANT: Signature Validation ---
    const { order_number, payment_status, merchant_reference_number, amount, signature } = callbackData;
    const authToken = process.env.SECUREPAY_AUTH_TOKEN;

    const signatureString = `${authToken}${order_number}${payment_status}${merchant_reference_number}${amount}`;
    const expectedSignature = crypto.createHash('sha256').update(signatureString).digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid signature in callback.');
      return res.status(400).json({ message: 'Invalid signature.' });
    }

    // --- Signature is valid, proceed with business logic ---

    let newPaymentStatus;
    if (payment_status === 'true') {
      newPaymentStatus = 'paid';
      console.log(`Payment for order ${order_number} was successful.`);
      // TODO: Implement Mailjet email delivery here
    } else {
      newPaymentStatus = 'failed';
      console.log(`Payment for order ${order_number} failed or was cancelled.`);
    }

    // Update the customer's payment status in Supabase
    const { data, error } = await supabase
      .from('customers')
      .update({ payment_status: newPaymentStatus })
      .eq('order_number', order_number);

    if (error) {
      console.error('Error updating payment status in Supabase:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    res.status(200).json({ message: 'Callback received and processed successfully' });

  } catch (error) {
    console.error('Callback Handling Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
