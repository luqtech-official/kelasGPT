Date : 2025-07-04   Time : 04:59<br>Related Topics    :  [[Artificial Intelligence]] [[PRD Prompt Rule]] [[Vibe Coding]] [[Doc Library]]

---

# Integrating SecurePay.my with Your Next.js Application (Detailed Guide for Junior Developers)

This guide provides a complete, step-by-step walkthrough for integrating the SecurePay Malaysia payment gateway into your Next.js application. We will break down every component and parameter, explaining the "what," "how," and "why" of each step.

## 1. Prerequisites

Before you begin, ensure you have the following:

- A **SecurePay Merchant Account**. If you don't have one, you can register on the [SecurePay website](https://securepay.my/ "null"). You will need to go through their verification process.
    
- Your **Merchant API UID** and **Auth Token**. These are your secret credentials for authenticating with the SecurePay API. You can generate these from your SecurePay merchant dashboard once your account is approved. Treat these like passwords.
    
- A **Next.js application**. If you're starting from scratch, create a new one by running `npx create-next-app@latest` in your terminal.
    
- **Node.js** installed on your development machine.
    

## 2. Project Setup & Environment Variables

For security, you must never write your API credentials directly in your code. We use environment variables to keep them safe.

1. In the root directory of your Next.js project, create a file named `.env.local`. This file is special in Next.js and is used for loading environment variables locally.
    
2. Add your SecurePay credentials and other configuration to this file.
    

```
# .env.local

# --- SecurePay Credentials ---
# Get these from your SecurePay Merchant Dashboard
SECUREPAY_API_UID="YOUR_MERCHANT_API_UID"
SECUREPAY_AUTH_TOKEN="YOUR_MERCHANT_AUTH_TOKEN"

# --- SecurePay API Endpoints ---
# Use the sandbox URLs for testing. Switch to production when you go live.
SECUREPAY_API_BASE_URL_SANDBOX="https://sandbox.securepay.my/api"
SECUREPAY_API_BASE_URL_PRODUCTION="https://securepay.my/api"

# --- Your Application's URL ---
# This is the base URL of your own web application.
# It's used to construct the redirect and callback URLs.
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**VERY IMPORTANT:** The `.env.local` file should **never** be committed to Git or any version control system. Add `.env.local` to your `.gitignore` file to prevent accidentally exposing your secrets.

```
# .gitignore

.env.local
```

## 3. Backend: Creating API Routes

In Next.js, API routes are server-side code that lives in the `pages/api/` directory. They allow you to build a backend directly within your Next.js app. We need two API routes:

1. `/api/create-payment-session`: To securely communicate with SecurePay and create a payment link.
    
2. `/api/payment-callback`: To receive a notification from SecurePay's servers after a payment is completed.
    

### 3.1. API Route: Creating a Payment Session

This endpoint will receive payment details from your frontend, add your secret credentials, and ask SecurePay to create a payment session.

Create a new file at `pages/api/create-payment-session.js`.

```
// pages/api/create-payment-session.js
import crypto from 'crypto';

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 2. Get data from the frontend request body
    const { amount, orderId, buyerName, buyerEmail } = req.body;

    // 3. Basic validation to ensure we have the necessary data
    if (!amount || !orderId || !buyerName || !buyerEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 4. Load your secret credentials from environment variables
    const uid = process.env.SECUREPAY_API_UID;
    const authToken = process.env.SECUREPAY_AUTH_TOKEN;
    const baseUrl = process.env.SECUREPAY_API_BASE_URL_SANDBOX; // Change to production URL when live

    // 5. Construct the payload with all required parameters
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-status`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback`;

    // 6. Generate the signature for request verification
    // The signature is a SHA256 hash of a specific string.
    // String format: authToken + orderId + amount + buyerName + buyerEmail
    const signatureString = `${authToken}${orderId}${amount}${buyerName}${buyerEmail}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    const payload = {
      uid: uid,
      transaction_amount: amount,
      order_number: orderId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      product_description: `Payment for order ${orderId}`,
      redirect_url: redirectUrl,
      callback_url: callbackUrl,
      signature: signature,
      // You can add other optional parameters here as needed
    };

    // 7. Send the request to SecurePay
    const response = await fetch(`${baseUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 8. Handle the response from SecurePay
    if (!response.ok) {
        const errorData = await response.json();
        console.error('SecurePay API Error:', errorData);
        // Send a descriptive error back to the frontend
        return res.status(response.status).json({ message: 'Failed to create payment session', error: errorData });
    }

    const data = await response.json();
    
    // 9. Send the payment URL back to the frontend
    // The payment URL is in the 'payment_url' field of the response
    res.status(200).json({ payment_url: data.payment_url });

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
```

#### **Payment Session Parameters Explained**

Here is a detailed breakdown of each field in the `payload` object sent to SecurePay:

|Parameter|Required|Description|Example|
|---|---|---|---|
|`uid`|Yes|Your Merchant API UID from the SecurePay dashboard.|`"2aaa1633-e63f-4371-9b85-91d936aa56a1"`|
|`transaction_amount`|Yes|The amount to be charged, as a string with two decimal places.|`"10.50"`|
|`order_number`|Yes|A **unique** ID for this transaction from your system. This is crucial for tracking.|`"ORDER-1678886400"`|
|`buyer_name`|Yes|The full name of the customer.|`"John Doe"`|
|`buyer_email`|Yes|The customer's email address.|`"john.doe@example.com"`|
|`product_description`|Yes|A brief description of what is being purchased.|`"Payment for order ORDER-123"`|
|`redirect_url`|Yes|The URL where the user will be sent back to your site after the payment attempt.|`"https://yoursite.com/payment-status"`|
|`callback_url`|Yes|The URL on your server that SecurePay will send a `POST` request to with the final transaction status. This is the most reliable way to confirm payment.|`"https://yoursite.com/api/payment-callback"`|
|`signature`|Yes|A SHA256 hash used to verify the request. See the code above for the generation logic.|`"a1b2c3d4..."`|
|`buyer_phone`|No|The customer's phone number.|`"+60123456789"`|
|`currency`|No|The currency code. Defaults to `MYR` (Malaysian Ringgit).|`"MYR"`|
|`cancel_url`|No|A URL the user is redirected to if they click a "Cancel" button on the payment page.|`"https://yoursite.com/cart"`|
|`timeout_url`|No|A URL the user is redirected to if the payment page session expires.|`"https://yoursite.com/payment-timeout"`|

### 3.2. API Route: Handling the Payment Callback

This is a critical endpoint. It's a "webhook" that SecurePay's servers call directly to tell your server the final, confirmed status of a payment. This is more reliable than the user's browser redirect.

Create a new file at `pages/api/payment-callback.js`.

```
// pages/api/payment-callback.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const callbackData = req.body;

    console.log('Received SecurePay Callback:', callbackData);

    // --- IMPORTANT: Signature Validation ---
    // You MUST validate the signature to ensure the callback is genuinely from SecurePay.
    const { order_number, payment_status, merchant_reference_number, amount, signature } = callbackData;
    const authToken = process.env.SECUREPAY_AUTH_TOKEN;

    // 1. Create the signature string from the received data
    // Format: authToken + order_number + payment_status + merchant_reference_number + amount
    const signatureString = `${authToken}${order_number}${payment_status}${merchant_reference_number}${amount}`;

    // 2. Hash your generated string
    const expectedSignature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // 3. Compare your hash with the signature from the callback
    if (expectedSignature !== signature) {
      console.error('Invalid signature in callback.');
      // If signatures don't match, it's a fraudulent request. Do not process it.
      return res.status(400).json({ message: 'Invalid signature.' });
    }

    // --- Signature is valid, proceed with business logic ---

    // 4. Find the order in your database using the order_number
    // and update its status based on the payment_status.

    if (payment_status === 'true') { // Note: status might be a string
      console.log(`Payment for order ${order_number} was successful.`);
      // Update your database: Mark order as "PAID".
      // Fulfill the order: e.g., grant access to a digital product, start the shipping process.
    } else {
      console.log(`Payment for order ${order_number} failed or was cancelled.`);
      // Update your database: Mark order as "FAILED".
    }

    // 5. Respond to SecurePay with a 200 OK status.
    // This acknowledges that you have successfully received the callback.
    // If you don't send a 200, SecurePay might try to send the callback again.
    res.status(200).json({ message: 'Callback received and processed successfully' });

  } catch (error) {
    console.error('Callback Handling Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
```

#### **Callback Parameters Explained**

|Parameter|Description|Example|
|---|---|---|
|`order_number`|The unique order ID you sent in the initial request.|`"ORDER-1678886400"`|
|`payment_status`|The status of the payment. A string: `"true"` for success, `"false"` for failure.|`"true"`|
|`merchant_reference_number`|A unique transaction ID generated by SecurePay.|`"MXKJI1601182203"`|
|`amount`|The final amount paid.|`"10.50"`|
|`signature`|A SHA256 hash for you to validate the authenticity of the callback.|`"a1b2c3d4..."`|
|`buyer_name`|The buyer's name.|`"John Doe"`|
|`buyer_email`|The buyer's email.|`"john.doe@example.com"`|
|`source`|The payment method used.|`"FPX"`|

## 4. Frontend: Triggering the Payment

Now, let's create the user interface. This can be a simple button on your product or checkout page.

Update `pages/index.js` (or your relevant checkout page).

```
// pages/index.js
import { useState } from 'react';

export default function HomePage() {
  // 'loading' state prevents the user from clicking the button multiple times
  const [loading, setLoading] = useState(false);
  // 'error' state displays any errors to the user
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Call your own backend API route, not SecurePay directly
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 2. Send the payment details in the request body
        body: JSON.stringify({
          amount: '10.50', // This should be dynamic based on the user's cart
          orderId: `ORDER-${Date.now()}`, // Generate a unique order ID for this transaction
          buyerName: 'John Doe', // Get this from your user's profile or a form
          buyerEmail: 'john.doe@example.com', // Get this from your user's profile or a form
        }),
      });

      if (!response.ok) {
        // If the backend returned an error, show it to the user
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment session');
      }

      // 3. Get the payment URL from the successful backend response
      const data = await response.json();

      // 4. Redirect the user to the SecurePay payment page to complete the payment
      window.location.href = data.payment_url;

    } catch (err) {
      // 5. Catch any errors and display them
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>SecurePay Integration Demo</h1>
      <p>Click the button below to test the payment flow.</p>
      <button 
        onClick={handlePayment} 
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        {loading ? 'Processing...' : 'Pay Now (RM 10.50)'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '15px' }}>Error: {error}</p>}
    </div>
  );
}
```

## 5. Frontend: Handling the Redirect from SecurePay

After the user attempts payment, they are sent to the `redirect_url` you specified. This page should give the user immediate feedback, but remember, **it is not the source of truth for payment confirmation.** The server-to-server callback is.

Create a new file at `pages/payment-status.js`.

```
// pages/payment-status.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PaymentStatusPage() {
  const router = useRouter();
  // The 'query' object contains the URL parameters from the redirect
  // e.g., /payment-status?status=true&order_number=...
  const { query } = router;
  const [message, setMessage] = useState('Processing your payment status...');

  // This effect runs when the component loads and the query parameters are available
  useEffect(() => {
    // Check the documentation for the exact query parameters SecurePay sends.
    // We'll assume they send a 'status' parameter.
    if (query.status) {
      if (query.status === 'true') {
        setMessage(`Payment successful! Thank you for your order #${query.order_number}. We are processing it now.`);
      } else {
        setMessage(`Payment failed or was cancelled for order #${query.order_number}. Please try again.`);
      }
    } else if (Object.keys(query).length > 0) {
      // Handle cases where status might not be present but other params are
      setMessage('Thank you for your payment attempt. We are confirming the final status with the bank.');
    }
  }, [query]); // The effect re-runs if the query parameters change

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Payment Status</h1>
      <p>{message}</p>
      <a href="/" style={{ color: 'blue' }}>Go back to Home</a>
    </div>
  );
}
```

## 6. Security Best Practices: A Recap for Juniors

- **Never Trust the Frontend:** Any data coming from the user's browser can be manipulated. All important logic, like calculating prices and validating payments, must happen on the server (in your API routes).
    
- **Validate Callbacks with Signatures:** This is the most important security step. It proves the message is from SecurePay and not an attacker trying to get free products. If you don't validate the signature, your integration is not secure.
    
- **Keep Secrets Secret:** Use `.env.local` and add it to `.gitignore`. Never, ever write your `API_UID` or `AUTH_TOKEN` in your frontend code or commit them to Git.
    
- **Use Unique Order IDs:** Always generate a new, unique `order_number` for every payment attempt. This prevents a user from accidentally being charged twice for the same thing.
    

You now have a complete and detailed guide to integrating SecurePay. By following these steps, even a junior developer can build a secure and functional payment flow in a Next.js application.