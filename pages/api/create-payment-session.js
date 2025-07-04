import { supabase } from "../../lib/supabase";
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, phone, honeypot } = req.body;

  // Honeypot check
  if (honeypot) {
    console.warn("Honeypot field filled, likely a bot.");
    return res.status(400).json({ message: "Bot detected" });
  }

  // Server-side validation
  if (!name || name.length > 30) {
    return res.status(400).json({ message: "Invalid name" });
  }
  if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  // Malaysian phone number format: 010-019 prefix, 10-11 digits
  if (!phone || !/^01[0-9]{8,9}$/.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  try {
    // Check for double submission (simple check based on email for now)
    const { data: existingCustomer, error: existingError } = await supabase
      .from("customers")
      .select("email_address")
      .eq("email_address", email)
      .single();

    if (existingCustomer) {
      return res.status(409).json({ message: "Email already submitted" });
    }

    // Generate a unique order ID for this transaction
    const orderNumber = `ORD-${Date.now()}`;

    // Save customer data to Supabase with initial pending status
    const { data: customerData, error: customerError } = await supabase.from("customers").insert([
      {
        full_name: name,
        email_address: email,
        phone_number: phone,
        order_number: orderNumber,
        payment_status: "pending",
        ip_address: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        user_agent: req.headers["user-agent"],
      },
    ]);

    if (customerError) {
      console.error("Error saving customer to Supabase:", customerError);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // SecurePay Integration
    const uid = process.env.SECUREPAY_API_UID;
    const authToken = process.env.SECUREPAY_AUTH_TOKEN;
    const baseUrl = process.env.SECUREPAY_API_BASE_URL_SANDBOX; // Use sandbox for testing

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-status`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback`;

    // SecurePay requires amount as a string with two decimal places
    const amount = "99.00"; // Assuming a fixed product price for now

    // Generate the signature for request verification
    const signatureString = `${authToken}${orderNumber}${amount}${name}${email}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    const payload = {
      uid: uid,
      transaction_amount: amount,
      order_number: orderNumber,
      buyer_name: name,
      buyer_email: email,
      product_description: `Payment for order ${orderNumber}`,
      redirect_url: redirectUrl,
      callback_url: callbackUrl,
      signature: signature,
      buyer_phone: phone,
    };

    const response = await fetch(`${baseUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('SecurePay API Error:', errorData);
        // If SecurePay fails, we should ideally update the customer status in Supabase to reflect this
        return res.status(response.status).json({ message: 'Failed to create payment session', error: errorData });
    }

    const data = await response.json();
    
    res.status(200).json({ payment_url: data.payment_url });

  } catch (error) {
    console.error('Checkout API error:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}