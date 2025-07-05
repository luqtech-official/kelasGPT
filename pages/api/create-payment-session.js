import { addCustomer, addOrder, supabase } from "../../lib/supabase";
import crypto from 'crypto';
import { logTransaction } from "../../lib/logger";
import { getPaymentSettings } from "../../lib/settings";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, phone, honeypot } = req.body;

  // Honeypot check
  if (honeypot) {
    await logTransaction('WARN', 'Honeypot field filled, likely a bot.', req.body);
    return res.status(400).json({ message: "Bot detected" });
  }

  // Server-side validation
  if (!name || name.length > 30) {
    await logTransaction('WARN', 'Invalid name validation', req.body);
    return res.status(400).json({ message: "Invalid name" });
  }
  if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    await logTransaction('WARN', 'Invalid email validation', req.body);
    return res.status(400).json({ message: "Invalid email" });
  }
  if (!phone || !/^01[0-9]{8,9}$/.test(phone)) {
    await logTransaction('WARN', 'Invalid phone validation', req.body);
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const orderNumber = `ORD-${Date.now()}`;

  try {
    await logTransaction('INFO', `Starting payment session creation for order ${orderNumber}`, { email, name });

    // Get product settings
    const productSettings = await getPaymentSettings();
    await logTransaction('INFO', `Using product settings for order ${orderNumber}`, { 
      productName: productSettings.productName, 
      productPrice: productSettings.productPrice 
    });

    // Check for double submission
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("email_address")
      .eq("email_address", email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      await logTransaction('ERROR', `Error checking duplicate customer for email: ${email}`, checkError);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (existingCustomer) {
      await logTransaction('WARN', `Duplicate submission attempt for email: ${email}`);
      return res.status(409).json({ message: "Email already submitted" });
    }

    // Save customer data
    const customerDataToInsert = {
      full_name: name,
      email_address: email,
      phone_number: phone,
      payment_status: "pending",
      ip_address: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      user_agent: req.headers["user-agent"],
    };
    const { data: customerResult, error: customerError } = await addCustomer(customerDataToInsert);

    if (customerError) {
      await logTransaction('ERROR', 'Error saving customer to Supabase', customerError);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!customerResult || customerResult.length === 0) {
      await logTransaction('ERROR', 'Customer creation returned no data', { customerResult });
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const customerId = customerResult[0].customer_id;
    await logTransaction('INFO', `Customer created successfully for order ${orderNumber}`, { customerId });

    // Save order data using dynamic product settings
    const productPriceNum = parseFloat(productSettings.productPrice);
    const orderDataToInsert = {
      customer_id: customerId,
      order_number: orderNumber,
      total_amount: productPriceNum,
      product_name: productSettings.productName,
      product_price: productPriceNum,
      final_amount: productPriceNum,
      currency_code: "MYR",
      order_status: "pending",
      payment_method: "fpx",
      payment_gateway: "securepay",
      order_source: "website",
    };
    const { data: orderResult, error: orderError } = await addOrder(orderDataToInsert);

    if (orderError) {
      await logTransaction('ERROR', `Error saving order to Supabase for order ${orderNumber}`, orderError);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    await logTransaction('INFO', `Order created successfully for order ${orderNumber}`);

    // SecurePay Integration
    const uid = process.env.SECUREPAY_API_UID;
    const authToken = process.env.SECUREPAY_AUTH_TOKEN;
    const baseUrl = process.env.SECUREPAY_API_BASE_URL_SANDBOX;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-status`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback`;
    const amount = productSettings.productPrice; // Use dynamic price
    
    const checksumToken = process.env.SECUREPAY_CHECKSUM_TOKEN;
    
    // Validate environment variables
    if (!uid || !authToken || !checksumToken || !baseUrl || !process.env.NEXT_PUBLIC_APP_URL) {
      await logTransaction('ERROR', `Missing SecurePay environment variables for order ${orderNumber}`, { uid: !!uid, authToken: !!authToken, checksumToken: !!checksumToken, baseUrl: !!baseUrl, appUrl: !!process.env.NEXT_PUBLIC_APP_URL });
      return res.status(500).json({ message: "Payment gateway configuration error" });
    }

    // New approach: HMAC-SHA256 checksum with pipe delimiters in alphabetical order
    // From documentation: buyer_email, buyer_name, buyer_phone, callback_url, order_number, product_description, redirect_url, transaction_amount, uid
    const checksumData = [
      email,           // buyer_email
      name,            // buyer_name
      phone,           // buyer_phone
      callbackUrl,     // callback_url
      orderNumber,     // order_number
      productSettings.productDescription || `Payment for order ${orderNumber}`, // product_description
      redirectUrl,     // redirect_url
      amount,          // transaction_amount
      uid              // uid
    ].join('|');

    const checksum = crypto.createHmac('sha256', checksumToken).update(checksumData).digest('hex');

    // Log checksum details for debugging
    await logTransaction('INFO', `Checksum generation for order ${orderNumber}`, { 
      checksumDataLength: checksumData.length,
      checksum: checksum.substring(0, 8) + '...',
      uidLength: uid.length,
      orderNumber,
      amount,
      name,
      email
    });

    const payload = {
      uid,
      token: authToken,
      checksum: checksum,
      order_number: orderNumber,
      transaction_amount: amount,
      product_description: productSettings.productDescription || `Payment for order ${orderNumber}`,
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone,
      callback_url: callbackUrl,
      redirect_url: redirectUrl,
      redirect_post: true, // Recommended in documentation
    };

    const apiUrl = `${baseUrl}/apis/payments`;
    await logTransaction('INFO', `Making SecurePay API request for order ${orderNumber}`, { apiUrl, payloadKeys: Object.keys(payload) });

    // Use Basic Authentication as per SecurePay documentation
    const authString = Buffer.from(`${uid}:${authToken}`).toString('base64');
    
    // Remove uid and token from payload since they go in auth header
    const { uid: _, token: __, ...payloadWithoutAuth } = payload;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: new URLSearchParams(payloadWithoutAuth),
    });

    await logTransaction('INFO', `SecurePay request with Basic Auth for order ${orderNumber}`, { 
      payloadChecksum: checksum.substring(0, 8) + '...',
      fullPayload: payloadWithoutAuth,
      authMethod: 'Basic Auth',
      apiUrl
    });

    let responseText;
    try {
        responseText = await response.text();
    } catch (readError) {
        await logTransaction('ERROR', `Failed to read SecurePay response for order ${orderNumber}`, { readError: readError.message });
        return res.status(500).json({ message: 'Failed to read payment gateway response' });
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = JSON.parse(responseText);
        } catch (parseError) {
            errorData = { rawResponse: responseText, parseError: parseError.message };
        }
        await logTransaction('ERROR', `SecurePay API Error for order ${orderNumber}`, { status: response.status, errorData });
        return res.status(response.status).json({ message: 'Failed to create payment session', error: errorData });
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        await logTransaction('ERROR', `SecurePay API returned non-JSON response for order ${orderNumber}`, { responseText, parseError: parseError.message });
        return res.status(500).json({ message: 'Invalid response from payment gateway' });
    }

    // Validate that payment_url exists in response
    if (!data.payment_url) {
        await logTransaction('ERROR', `SecurePay API response missing payment_url for order ${orderNumber}`, { responseData: data });
        return res.status(500).json({ message: 'Invalid payment session response' });
    }

    await logTransaction('INFO', `Successfully created SecurePay session for order ${orderNumber}. Redirecting user.`)
    
    res.status(200).json({ payment_url: data.payment_url });

  } catch (error) {
    await logTransaction('ERROR', `Unhandled error in checkout for order ${orderNumber}`, { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Internal Server Error" });
  }
}