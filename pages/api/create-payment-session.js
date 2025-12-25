import { addCustomer, addOrder, supabase } from "../../lib/supabase";
import crypto from 'crypto';
import { createLogger } from '../../lib/pino-logger';
import { getPaymentSettings } from "../../lib/settings";
import { getDiscountAmount } from "../../lib/discount-codes"; // Import discount validator

export default async function handler(req, res) {
  const logger = createLogger(req);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, phone, honeypot, discountCode } = req.body; // Extract discountCode

  // Honeypot check
  if (honeypot) {
    logger.warn({ body: req.body }, 'Honeypot field filled, likely a bot.');
    return res.status(400).json({ message: "Bot detected" });
  }

  // Server-side validation
  if (!name || name.length > 30) {
    logger.warn({ body: req.body }, 'Invalid name validation');
    return res.status(400).json({ message: "Invalid name" });
  }
  if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    logger.warn({ body: req.body }, 'Invalid email validation');
    return res.status(400).json({ message: "Invalid email" });
  }
  if (!phone || !/^01[0-9]{8,9}$/.test(phone)) {
    logger.warn({ body: req.body }, 'Invalid phone validation');
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const orderNumber = `ORD-${Date.now()}`;

  try {
    logger.info({ email, name, discountCode }, `Starting payment session creation for order ${orderNumber}`);

    // Get product settings
    const productSettings = await getPaymentSettings();
    let productPriceNum = parseFloat(productSettings.productPrice);
    
    // --- DISCOUNT LOGIC START ---
    let finalAmount = productPriceNum;
    let appliedDiscount = 0;
    let orderNotes = "";

    if (discountCode) {
      // Re-validate code on server side
      const discountValue = getDiscountAmount(discountCode);
      if (discountValue > 0) {
        appliedDiscount = discountValue;
        finalAmount = Math.max(0, productPriceNum - discountValue); // Ensure no negative price
        orderNotes = `Applied Code: ${discountCode.toUpperCase()}`;
        
        logger.info({ 
          orderNumber, 
          discountCode, 
          originalPrice: productPriceNum, 
          discountValue, 
          finalAmount 
        }, "Discount code applied successfully");
      } else {
        logger.warn({ orderNumber, discountCode }, "Invalid discount code provided during checkout");
        // We continue with original price if code is invalid, rather than failing
      }
    }
    // --- DISCOUNT LOGIC END ---

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
      logger.error({ error: customerError }, 'Error saving customer to Supabase');
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!customerResult || customerResult.length === 0) {
      logger.error({ customerResult }, 'Customer creation returned no data');
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const customerId = customerResult[0].customer_id;
    logger.info({ customerId }, `Customer created successfully for order ${orderNumber}`);

    // Save order data using dynamic final amount
    const orderDataToInsert = {
      customer_id: customerId,
      order_number: orderNumber,
      total_amount: productPriceNum, // Original price
      product_name: productSettings.productName,
      product_price: productPriceNum,
      final_amount: finalAmount, // Discounted price
      discount_amount: appliedDiscount, // Record the discount
      order_notes: orderNotes, // Record the code used
      currency_code: "MYR",
      order_status: "pending",
      payment_method: "fpx",
      payment_gateway: "securepay",
      order_source: "website",
    };
    const { data: orderResult, error: orderError } = await addOrder(orderDataToInsert);

    if (orderError) {
      logger.error({ error: orderError }, `Error saving order to Supabase for order ${orderNumber}`);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    logger.info(`Order created successfully for order ${orderNumber}`);

    // SecurePay Integration
    const uid = process.env.SECUREPAY_API_UID;
    const authToken = process.env.SECUREPAY_AUTH_TOKEN;
    const baseUrl = process.env.SECUREPAY_API_BASE_URL_SANDBOX;
    const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''); // Remove trailing slash
    const redirectUrl = `${baseAppUrl}/api/payment-status`;
    const callbackUrl = `${baseAppUrl}/api/payment-callback`;
    const cancelUrl = `${baseAppUrl}/api/payment/cancelled?order_number=${orderNumber}`;
    const timeoutUrl = `${baseAppUrl}/api/payment/timeout?order_number=${orderNumber}`;
    
    // IMPORTANT: Use the final discounted amount formatted as string
    const transactionAmount = finalAmount.toFixed(2); 
    
    const checksumToken = process.env.SECUREPAY_CHECKSUM_TOKEN;
    
    // Validate environment variables
    if (!uid || !authToken || !checksumToken || !baseUrl || !process.env.NEXT_PUBLIC_APP_URL) {
      logger.error({ uid: !!uid, authToken: !!authToken, checksumToken: !!checksumToken, baseUrl: !!baseUrl, appUrl: !!process.env.NEXT_PUBLIC_APP_URL }, `Missing SecurePay environment variables for order ${orderNumber}`);
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
      transactionAmount, // transaction_amount (DISCOUNTED)
      uid              // uid
    ].join('|');

    const checksum = crypto.createHmac('sha256', checksumToken).update(checksumData).digest('hex');

    // Log checksum details for debugging
    logger.info({ 
      checksumDataLength: checksumData.length,
      checksum: checksum.substring(0, 8) + '...',
      uidLength: uid.length,
      orderNumber,
      amount: transactionAmount,
      name,
      email
    }, `Checksum generation for order ${orderNumber}`);

    const payload = {
      uid,
      token: authToken,
      checksum: checksum,
      order_number: orderNumber,
      transaction_amount: transactionAmount, // Use discounted amount
      product_description: productSettings.productDescription || `Payment for order ${orderNumber}`,
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone,
      callback_url: callbackUrl,
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      timeout_url: timeoutUrl,
      redirect_post: true, // Recommended in documentation
    };

    const apiUrl = `${baseUrl}/apis/payments`;
    logger.info({ apiUrl, payloadKeys: Object.keys(payload) }, `Making SecurePay API request for order ${orderNumber}`);

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

    logger.info({ 
      payloadChecksum: checksum.substring(0, 8) + '...',
      fullPayload: payloadWithoutAuth,
      authMethod: 'Basic Auth',
      apiUrl
    }, `SecurePay request with Basic Auth for order ${orderNumber}`);

    let responseText;
    try {
        responseText = await response.text();
    } catch (readError) {
        logger.error({ readError: readError.message }, `Failed to read SecurePay response for order ${orderNumber}`);
        return res.status(500).json({ message: 'Failed to read payment gateway response' });
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = JSON.parse(responseText);
        } catch (parseError) {
            errorData = { rawResponse: responseText, parseError: parseError.message };
        }
        logger.error({ status: response.status, errorData }, `SecurePay API Error for order ${orderNumber}`);
        return res.status(response.status).json({ message: 'Failed to create payment session', error: errorData });
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        logger.error({ responseText, parseError: parseError.message }, `SecurePay API returned non-JSON response for order ${orderNumber}`);
        return res.status(500).json({ message: 'Invalid response from payment gateway' });
    }

    // Validate that payment_url exists in response
    if (!data.payment_url) {
        logger.error({ responseData: data }, `SecurePay API response missing payment_url for order ${orderNumber}`);
        return res.status(500).json({ message: 'Invalid payment session response' });
    }

    logger.info(`Successfully created SecurePay session for order ${orderNumber}. Redirecting user.`);
    
    res.status(200).json({ payment_url: data.payment_url });

  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }, `Unhandled error in checkout for order ${orderNumber}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}