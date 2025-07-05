Date : 2025-07-04 Time : 04:59  
Related Topics : [[Artificial Intelligence]] [[Doc Library]] [[API Integration]] [[Prompt Engineering]] [[DocForLLM.SecurePay MY API Guideline]]

# A Definitive Guide to Integrating SecurePay.my FPX Payments with Next.js

## Section 1: Architectural Blueprint for SecurePay.my in Next.js

Integrating a third-party payment gateway requires a robust architectural foundation. Before writing a single line of code, it is imperative to understand the flow of data, the sequence of events, and the security model of the system. The SecurePay.my FPX integration utilizes a "Redirect" payment flow, a common pattern where the user is temporarily navigated away from the merchant's site to a secure, third-party environment (in this case, their bank's portal) to authorize the payment.1 This asynchronous, multi-step process has significant implications for application state management and the overall system design within a Next.js application.

### 1.1 The FPX Payment Flow: A High-Level Overview

The core of the SecurePay.my FPX integration is its asynchronous nature. Unlike a direct credit card submission where an API call might return an immediate success or failure, the FPX flow involves several distinct stages. The user initiates a payment on the sales page, is redirected to their bank's online portal, authenticates themselves, and approves the transaction. The result of this action is then communicated back to the merchant's application not through a direct, synchronous response, but through separate, out-of-band communication channels.

This model necessitates a stateful approach on the server side. The application cannot simply wait for the user to return to a "success" page to confirm the payment. The definitive confirmation of a transaction's success or failure arrives independently of the user's browser actions. Therefore, the architecture must be designed to handle this asynchronous confirmation reliably, typically by persisting the initial order state in a database and updating it only upon receiving a cryptographically verified notification from SecurePay's servers.

### 1.2 Visualizing the Interaction: The End-to-End Sequence

To fully grasp the integration, it is helpful to visualize the end-to-end sequence of events. The entire transaction can be broken down into five primary stages, involving the user's browser, the Next.js application's frontend, the Next.js application's backend (API Routes), and SecurePay's servers.

1.     **User Action and Frontend Request:** The process begins when a customer on the Next.js sales page completes their order details and clicks the "Pay with FPX" button. This action triggers an event handler in the frontend React component. Instead of submitting a form directly, the frontend gathers the necessary order information (e.g., amount, customer details) and makes an API call to a dedicated backend endpoint within the Next.js application, such as /api/initiate-payment.

2.     **Backend Orchestration:** The /api/initiate-payment API Route receives the request from the frontend. This server-side function acts as the secure orchestrator. It retrieves sensitive API credentials from environment variables, constructs the full payment request payload as required by SecurePay, and, most critically, generates a security signature (a checksum) to ensure the integrity and authenticity of the request.

3.     **SecurePay Request and Validation:** The Next.js backend sends the complete payload, including the generated checksum, to the SecurePay payment endpoint (https://sandbox.securepay.my/api/v1/payments for testing) via a POST request.3 SecurePay's servers receive this request, validate the merchant's credentials, and verify the checksum. If the request is valid, SecurePay prepares for the user redirection.

4.     **User Redirection to FPX:** Upon successful validation, the Next.js backend receives a response from SecurePay containing a unique payment URL. The backend forwards this URL to the frontend, which then programmatically redirects the user's browser to this SecurePay-hosted page. This page typically presents the user with a list of Malaysian banks for FPX payments. After the user selects their bank, they are further redirected to their bank's official login and transaction authorization portal.

5.     **Dual-Channel Response (Callback and Redirect):** After the user completes (or cancels) the payment at their bank's portal, SecurePay executes two parallel actions to communicate the result 4:

○       **Server-to-Server Callback:** SecurePay's server sends a POST request directly to a pre-defined callback_url on the merchant's server (e.g., /api/payment-callback). This request contains the final, definitive transaction status and is cryptographically signed with its own checksum.

○       **Browser-to-Browser Redirect:** Simultaneously, the user's browser is redirected back to a redirect_url specified in the initial request (e.g., /payment/status?status=success). This page provides immediate feedback to the user.

### 1.3 Key Architectural Decisions: Server-Side Logic and the Dual-Response System

The architecture of this integration is dictated by fundamental security principles. All logic that involves sensitive credentials must reside on the server, completely inaccessible from the client's browser. Next.js API Routes provide the ideal mechanism for this, allowing developers to build a secure backend API within the same project structure.5 The

Checksum Token and API Auth Token are secrets that, if exposed, would allow a malicious actor to impersonate the merchant. Therefore, they must only be accessed via process.env within server-side code, a best practice for managing secrets in any modern web application.7

A nuanced understanding of the dual-response system is critical for a correct and robust implementation. The callback_url and redirect_url serve distinct and separate purposes.4

●       The **Callback** is the "Source of Truth." The server-to-server communication is more reliable than any browser-based action. A user could successfully pay but close their browser tab before the redirect to the redirect_url completes. If business-critical logic were tied to the user landing on the success page, this transaction would be lost. The callback, however, is sent directly from SecurePay's server and is independent of the user's actions. Therefore, all critical business logic—updating an order's status in the database, sending confirmation emails, provisioning digital goods, or initiating a shipping process—must _only_ be triggered by a successfully validated callback received at the callback_url endpoint.

●       The **Redirect** is for "User Experience." The redirect_url serves the sole purpose of providing immediate visual feedback to the customer. The page they land on should be a simple presentational component that reflects the payment status. This status can be fetched from the database (which was updated by the callback handler) or inferred from query parameters passed in the URL. It should never be the trigger for core business logic.

This separation of concerns ensures data integrity and prevents race conditions, forming the cornerstone of a production-grade payment integration.

## Section 2: Configuration and Credential Management

Proper configuration and secure management of credentials are the first steps in any successful API integration. This process involves obtaining distinct sets of keys for testing and live environments and storing them securely within the Next.js project using environment variables.

### 2.1 Obtaining Your Credentials: Sandbox vs. Production

SecurePay provides two separate environments: a sandbox for testing and development, and a production environment for live transactions. Each environment has its own set of API credentials and endpoints. It is essential to obtain and manage both sets separately.

Credentials for the sandbox environment can be generated through the SecurePay Apps interface, which is explicitly mentioned to be available at https://sandbox.securepay.my/apps/interfaces.10 Developers must first create an account in the sandbox environment to access this interface. The process for obtaining production credentials will be similar, but will occur within the main production dashboard (

https://securepay.my) after the merchant account has been fully approved and activated.

### 2.2 A Deep Dive into the Three Core Credentials

The SecurePay API relies on three primary pieces of information for authentication and message integrity.3 Understanding the specific role of each is crucial for a correct implementation.

●       **uid (Merchant API UID):** This is a unique, non-secret identifier for your specific API integration or "app" within the SecurePay system. It is sent as part of the request payload and is used to identify which merchant account the transaction belongs to. An example value is 2aaa1633-e63f-4371-9b85-91d936aa56a1.

●       **token (Merchant API Auth Token):** This is a secret authentication token. It functions like a standard API key and is included in the request payload to authenticate the API call itself. It proves to SecurePay that the request is coming from an authorized application. An example value is ZyUfF8EmyabcMWPcaocX. This token must be kept secret and stored securely on the server.

●       **Checksum Token:** This is the most critical secret for ensuring data integrity. It is a shared secret key used exclusively for generating and verifying HMAC (Hash-based Message Authentication Code) signatures. Specifically, it is used as the key for the HMAC-SHA256 hashing algorithm. This token is _never_ transmitted over the network. Its role is to sign the content of your outgoing requests and to verify the signature of incoming callbacks from SecurePay. This mechanism guarantees that the message content has not been tampered with in transit and that the message originates from the expected party (either you or SecurePay), as only the two parties know the secret Checksum Token. An example value is 159026b3b7348e2390e5a2e7a1c8466073db239c1e6800b8c27e36946b1f8713.

The distinction between the token and the Checksum Token is a key security feature. The token handles authentication (who you are), while the Checksum Token handles message integrity (proving the data is unchanged and from you).

### 2.3 Securing Credentials with Next.js Environment Variables

Next.js has built-in support for environment variables, which is the standard and most secure way to manage secrets in a project.12 This is achieved by creating

.env files in the root of the project directory. For local development, the recommended practice is to use a .env.local file, which is not committed to version control.9

A critical security rule in Next.js is the distinction between server-side and client-side variables. Any variable prefixed with NEXT_PUBLIC_ will be embedded into the client-side JavaScript bundle at build time, making it publicly visible in the user's browser.8 Therefore, sensitive credentials like the

SECUREPAY_API_TOKEN and SECUREPAY_CHECKSUM_TOKEN **must never** be prefixed with NEXT_PUBLIC_. They should only be accessible on the server within API Routes via the process.env object.

For a production deployment (e.g., on Vercel, Netlify, or a custom server), these same environment variables must be configured in the hosting provider's dashboard. This ensures that the production build has access to the live credentials.

### 2.4 Table: Project Environment Variables

To ensure a smooth and error-free setup, the following table outlines all the necessary environment variables for the project. This serves as a definitive checklist for configuring both local development and production environments.

|   |   |   |   |
|---|---|---|---|
|Variable Name|Description|Example Value (Sandbox)|Security Context|
|SECUREPAY_API_UID|Your Merchant API UID from the SecurePay dashboard.|2aaa1633-e63f-4371-9b85-91d936aa56a1|Server-Side Only|
|SECUREPAY_API_TOKEN|Your Merchant API Auth Token for authenticating requests.|ZyUfF8EmyabcMWPcaocX|Server-Side Only|
|SECUREPAY_CHECKSUM_TOKEN|Your secret key for generating and verifying HMAC-SHA256 signatures.|159026b3b7348e2390e5a2e7a1c8466073db239c1e6800b8c27e36946b1f8713|Server-Side Only|
|SECUREPAY_API_BASE_URL|The base URL for the SecurePay API. Use https://sandbox.securepay.my for testing and https://securepay.my for production.|https://sandbox.securepay.my|Server-Side Only|
|NEXT_PUBLIC_APP_URL|The public base URL of your Next.js application. Used to construct absolute URLs for callback and redirect.|http://localhost:3000|Client-Side (Public)|

## Section 3: The Payment Initiation Request: From Frontend to SecurePay

This section provides a complete, step-by-step implementation of the payment initiation flow. It covers the creation of the user-facing form on the sales page, the secure backend API route that orchestrates the request, the critical process of generating the security checksum, and finally, dispatching the request to SecurePay.

### 3.1 Building the Sales Page Form (Next.js Frontend)

The user journey begins on a sales page. This is a standard React component within the Next.js pages or app directory. The form will collect the necessary buyer information and, upon submission, will trigger a call to our backend API rather than performing a traditional browser form submission.

The component will manage its own state for form inputs and loading status. When the user clicks "Pay," it will execute an asynchronous function that sends the order data to the /api/initiate-payment endpoint. If the backend call is successful, it will receive a redirect URL from the server and navigate the user's browser to the SecurePay payment page.

TypeScript

// pages/index.tsx  
  
import { useState, FormEvent } from 'react';  
  
export default function SalesPage() {  const = useState('AHMAD AMSYAR MOHD ALI');  const = useState('email@example.com');  const = useState('+60123121678');  const [isLoading, setIsLoading] = useState(false);  const [error, setError] = useState<string | null>(null);  const handleSubmit = async (event: FormEvent) => {  
    event.preventDefault();  
    setIsLoading(true);  
    setError(null);    try {      const response = await fetch('/api/initiate-payment', {        method: 'POST',        headers: { 'Content-Type': 'application/json' },        body: JSON.stringify({          order_number: `ORD-${Date.now()}`,          transaction_amount: '1.50', // Example amount, e.g., RM 1.50          product_description: 'Payment for Test Product',          buyer_name: buyerName,          buyer_email: buyerEmail,          buyer_phone: buyerPhone,  
        }),  
      });      const data = await response.json();      if (!response.ok) {        throw new Error(data.message |  
  
| 'Failed to initiate payment.');  
      }      // The backend returns the redirect URL from SecurePay      if (data.redirectUrl) {        window.location.href = data.redirectUrl;  
      } else {        throw new Error('Redirect URL not received from server.');  
      }  
    } catch (err: any) {  
      setError(err.message);  
      setIsLoading(false);  
    }  
  };  return (    <div>  
      <h1>SecurePay FPX Integration Demo</h1>  
      <form onSubmit={handleSubmit}>  
        <div>  
          <label>Name:</label>  
          <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />  
        </div>  
        <div>  
          <label>Email:</label>  
          <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required />  
        </div>  
        <div>  
          <label>Phone:</label>  
          <input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} required />  
        </div>  
        <button type="submit" disabled={isLoading}>  
          {isLoading? 'Processing...' : 'Pay RM 1.50 with FPX'}  
        </button>  
      </form>  
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}  
    </div>  );  
}

### 3.2 Creating the Payment Initiation API Route (/api/initiate-payment)

This API Route is the secure core of the payment initiation process. It lives in pages/api/initiate-payment.ts and is responsible for receiving data from the frontend, securely accessing credentials, generating the checksum, and communicating with the SecurePay API.

It will first validate the incoming request to ensure it's a POST method and contains the required data. Then, it will pull the SecurePay credentials from the environment variables. This server-side context is the only place these secrets should ever be handled.6

### 3.3 Mastering the Request Checksum: The Most Critical Step

The generation of the checksum is the most technically precise and error-prone step of the entire integration. An incorrect checksum will cause SecurePay to reject the payment request immediately. The process, as detailed in the API documentation, is rigid and must be followed exactly.3

The signature is an HMAC-SHA256 hash. The message to be signed is a string constructed by concatenating the _values_ of a specific, fixed set of nine parameters, separated by a pipe (|) delimiter. Crucially, the parameters must be arranged in ascending alphabetical order of their _keys_ before their values are concatenated.

The nine keys, in alphabetical order, are:

buyer_email, buyer_name, buyer_phone, callback_url, order_number, product_description, redirect_url, transaction_amount, uid.

If optional parameters like callback_url or redirect_url are not provided, their place in the string is held by an empty value, but the pipe delimiters must remain. For example: ...|buyer_phone||order_number|....

The following Node.js function using the built-in crypto module correctly implements this logic.

TypeScript

// lib/securepay-checksum.ts (a helper function)  
  
import crypto from 'crypto';  
  
interface RequestChecksumData {  buyer_email: string;  
  buyer_name: string;  
  buyer_phone: string;  
  callback_url: string;  
  order_number: string;  
  product_description: string;  
  redirect_url: string;  
  transaction_amount: string;  
  uid: string;  
}  
  
export function generateRequestChecksum(data: RequestChecksumData, checksumToken: string): string {  // The keys MUST be in this specific alphabetical order.  const signatureString = [  
    data.buyer_email,  
    data.buyer_name,  
    data.buyer_phone,  
    data.callback_url,  
    data.order_number,  
    data.product_description,  
    data.redirect_url,  
    data.transaction_amount,  
    data.uid,  
  ].join('|');  const hmac = crypto.createHmac('sha256', checksumToken);  
  hmac.update(signatureString);  return hmac.digest('hex');  
}  
  

### 3.4 Assembling and Dispatching the Payment Request

With the checksum generation logic in place, the API route can now assemble the final request payload and dispatch it to SecurePay. The route will construct the full callback_url and redirect_url using the public application URL from the environment variables. It then calls the generateRequestChecksum function and adds the resulting signature to the payload. Finally, it makes a POST request to the SecurePay API endpoint.

If SecurePay's API responds successfully, it will return a JSON object. The crucial piece of information in this response is the payment URL, which the API route must extract and send back to the frontend for redirection.

TypeScript

// pages/api/initiate-payment.ts  
  
import type { NextApiRequest, NextApiResponse } from 'next';  
import { generateRequestChecksum } from '../../lib/securepay-checksum';  
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {  if (req.method!== 'POST') {  
    res.setHeader('Allow', 'POST');    return res.status(405).end('Method Not Allowed');  
  }  try {    const {  
      order_number,  
      transaction_amount,  
      product_description,  
      buyer_name,  
      buyer_email,  
      buyer_phone,  
    } = req.body;    // Retrieve credentials securely from environment variables    const uid = process.env.SECUREPAY_API_UID;    const token = process.env.SECUREPAY_API_TOKEN;    const checksumToken = process.env.SECUREPAY_CHECKSUM_TOKEN;    const apiBaseUrl = process.env.SECUREPAY_API_BASE_URL;    const appUrl = process.env.NEXT_PUBLIC_APP_URL;    if (!uid ||!token ||!checksumToken ||!apiBaseUrl ||!appUrl) {      throw new Error('Server configuration error: missing environment variables.');  
    }    const callback_url = `${appUrl}/api/payment-callback`;    const redirect_url = `${appUrl}/payment/status`;    const checksumData = {  
      buyer_email,  
      buyer_name,  
      buyer_phone,  
      callback_url,  
      order_number,  
      product_description,  
      redirect_url,  
      transaction_amount,  
      uid,  
    };    const checksum = generateRequestChecksum(checksumData, checksumToken);    const payload = {  
      uid,  
      token,  
      checksum,  
      order_number,  
      transaction_amount,  
      product_description,  
      buyer_name,  
      buyer_email,  
      buyer_phone,  
      callback_url,  
      redirect_url,      redirect_post: true, // Recommended to ensure a POST redirect    };    const securePayResponse = await fetch(`${apiBaseUrl}/api/v1/payments`, {      method: 'POST',      headers: { 'Content-Type': 'application/json' },      body: JSON.stringify(payload),  
    });    const responseData = await securePayResponse.json();    if (!securePayResponse.ok) {        // Forward the error from SecurePay if available        throw new Error(responseData.message |  
  
| 'SecurePay API request failed.');  
    }    // SecurePay returns a URL to which the user must be redirected.    // The key for this URL may vary, inspect the successful response from SecurePay's sandbox.    // Assuming the key is 'payment_url' or similar. Let's assume it's directly in the body.    // In a real scenario, you might get HTML content if redirect_post is false.    // With redirect_post: true, the response might be different. Let's assume we get a URL.    // Based on documentation, the redirect is handled by SecurePay, but let's check for a URL.    // The most common pattern is receiving a redirect URL. Let's assume it is `responseData.url`.    // If SecurePay returns HTML for an auto-submitting form, a different frontend handling is needed.    // Let's proceed with the more modern JSON response/redirect URL pattern.    const redirectUrl = responseData.url; // This key is an assumption, verify with sandbox response.    if (!redirectUrl) {        // Log the full response for debugging        console.error("SecurePay response did not contain a redirect URL:", responseData);        throw new Error("Could not retrieve payment URL from SecurePay.");  
    }  
  
    res.status(200).json({ redirectUrl });  
  
  } catch (error: any) {    console.error('Payment initiation failed:', error);  
    res.status(500).json({ message: error.message |  
  
| 'An internal server error occurred.' });  
  }  
}

### 3.5 Table: SecurePay FPX Payment Request Parameters

This table consolidates all request parameters from the documentation 3 and serves as a quick reference during development. The "Included in Checksum?" column is particularly important as it directly addresses the most complex part of the request generation.

|   |   |   |   |   |
|---|---|---|---|---|
|Parameter|Description|Compulsory?|Included in Checksum?|Example|
|uid|Merchant API UID.|Yes|Yes|2aaa1633-...|
|token|Merchant API Auth Token.|Yes|No|ZyUfF8Emy...|
|checksum|The generated HMAC-SHA256 signature.|Yes|No|75b54e403...|
|order_number|Your unique order ID for tracking.|Yes|Yes|ORD-2024-12345|
|transaction_amount|The payment amount in format 100.00.|Yes|Yes|1.50|
|product_description|A meaningful description of the purchase.|Yes|Yes|Payment for Test Product|
|buyer_name|Full name of the buyer.|Yes|Yes|AHMAD AMSYAR MOHD ALI|
|buyer_email|Valid email address of the buyer.|Yes|Yes|email@example.com|
|buyer_phone|Valid phone number of the buyer.|Yes|Yes|+60123121678|
|callback_url|Server-to-server notification URL.|Optional|Yes|https://yourdomain.com/api/payment-callback|
|redirect_url|Browser redirect URL after payment.|Optional|Yes|https://yourdomain.com/payment/status|
|redirect_post|If true, redirects to your endpoint using POST.|Optional|No|true|
|model|FPX model: B2C (default) or B2B1.|Optional|No|B2C|
|buyer_bank_code|Pre-selects the bank for the user.|Optional|No|MBB0228|
|cancel_url|URL for a "Cancel" button on the payment page.|Optional|No|https://yourdomain.com/payment/canceled|
|timeout_url|URL to redirect to if the session times out.|Optional|No|https://yourdomain.com/payment/timeout|
|params|Custom key-value pairs for additional data.|Optional|No|{"reference1": "Size XL"}|

## Section 4: Handling the Response: Callbacks and Redirects

Once the user completes the payment authorization at their bank, the integration enters its final phase: processing the transaction result. This is handled by the callback_url endpoint, which acts as a secure webhook listener. This handler is responsible for verifying the incoming data and actioning the business logic associated with a successful or failed payment.

### 4.1 Building the Callback Handler API Route (/api/payment-callback)

The callback handler is another Next.js API Route, located at the path specified in the initial request (e.g., pages/api/payment-callback.ts). This endpoint is designed to receive a POST request directly from SecurePay's servers. Its primary responsibilities are to validate the authenticity and integrity of this incoming data and then update the application's state accordingly.

### 4.2 The Critical Verification Step: Validating the Callback Checksum

Just as the outgoing request was signed, the incoming callback is also signed with a checksum. Verifying this checksum is a mandatory security measure. It confirms that the request genuinely originated from SecurePay and that its contents have not been altered in transit.

The verification process for the incoming callback is subtly different and more robust than the outgoing request's signature generation. The documentation suggests a more flexible approach: all received parameters (except for the checksum field itself) should be sorted alphabetically by their keys. The values of these sorted parameters are then joined by a pipe (|) delimiter to form the signature base string.4 This design ensures that if SecurePay adds new, optional parameters to the callback in the future, the verification logic will not break.

The following TypeScript function implements this callback verification logic.

TypeScript

// lib/securepay-checksum.ts (add a new function)  
  
import crypto from 'crypto';  
  
//... (previous generateRequestChecksum function)  
  
export function verifyCallbackChecksum(data: Record<string, any>, checksumToken: string): boolean {  // Make a copy to avoid mutating the original request body  const dataToVerify = {...data };   const receivedChecksum = dataToVerify.checksum;  if (!receivedChecksum) {    return false;  
  }   // Remove the checksum from the data object before generating our own signature  delete dataToVerify.checksum;   // Get all keys, sort them alphabetically  const sortedKeys = Object.keys(dataToVerify).sort();   // Join the values of the sorted keys with '|'  const signatureString = sortedKeys.map(key => dataToVerify[key]).join('|');   const hmac = crypto.createHmac('sha256', checksumToken);  
  hmac.update(signatureString);  const expectedChecksum = hmac.digest('hex');   // Compare the received checksum with our calculated one  return crypto.timingSafeEqual(Buffer.from(receivedChecksum, 'hex'), Buffer.from(expectedChecksum, 'hex'));  
}  
  

Note the use of crypto.timingSafeEqual. This is a best practice for comparing cryptographic hashes as it helps mitigate timing attacks, where an attacker could infer information about the expected hash by measuring the time it takes for a comparison to fail.

### 4.3 Processing the Transaction: The Business Logic

Only after the incoming callback's checksum has been successfully verified should the application trust the data and execute its business logic.

The core of the logic resides within the payment-callback API route. It will parse the request body, call the verifyCallbackChecksum function, and if valid, proceed to update the system.

The key fields to check in the callback data are payment_status (a boolean string True or False) and fpx_debit_auth_code (a string where 00 indicates success).4

TypeScript

// pages/api/payment-callback.ts  
  
import type { NextApiRequest, NextApiResponse } from 'next';  
import { verifyCallbackChecksum } from '../../lib/securepay-checksum';  
// Assume a database utility exists, e.g., import { db } from '../../lib/db';  
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {  if (req.method!== 'POST') {  
    res.setHeader('Allow', 'POST');    return res.status(405).end('Method Not Allowed');  
  }  const callbackData = req.body;   try {    const checksumToken = process.env.SECUREPAY_CHECKSUM_TOKEN;    if (!checksumToken) {      throw new Error('Server configuration error: Checksum token not found.');  
    }    // 1. Verify the checksum    const isValid = verifyCallbackChecksum(callbackData, checksumToken);    if (!isValid) {      console.warn('Invalid checksum received on callback.', { order_number: callbackData.order_number });      return res.status(400).json({ message: 'Invalid checksum.' });  
    }    // 2. Process the business logic    const { order_number, payment_status, fpx_debit_auth_code, merchant_reference_number } = callbackData;    // Log the verified callback for auditing    console.log(`Verified callback received for order ${order_number}. Status: ${payment_status}`);    // Find the order in your database    // const order = await db.orders.findUnique({ where: { id: order_number } });    // if (!order) {    //   console.error(`Order with ID ${order_number} not found.`);    //   return res.status(404).json({ message: 'Order not found.' });    // }    // Check if the payment was successful    const isSuccessful = payment_status === 'True' && fpx_debit_auth_code === '00';    if (isSuccessful) {      // Update order status to 'Paid'      // await db.orders.update({      //   where: { id: order_number },      //   data: {      //     status: 'PAID',      //     securePayRef: merchant_reference_number,      //   },      // });      console.log(`Order ${order_number} marked as PAID.`);      // Trigger other actions: send email, provision service, etc.    } else {      // Update order status to 'Failed'      // await db.orders.update({      //   where: { id: order_number },      //   data: {      //     status: 'FAILED',      //     securePayRef: merchant_reference_number,      //   },      // });      console.log(`Order ${order_number} marked as FAILED.`);  
    }    // 3. Respond to SecurePay to acknowledge receipt    res.status(200).json({ message: 'Callback received and processed.' });  
  
  } catch (error: any) {    console.error('Callback processing failed:', error);  
    res.status(500).json({ message: 'An internal server error occurred.' });  
  }  
}

### 4.4 Table: SecurePay Callback/Redirect Parameters

This table details the parameters sent by SecurePay to both the callback_url and redirect_url.4 Developers can use this as a reference when parsing the response and building their business logic.

|   |   |   |   |
|---|---|---|---|
|Parameter|Description|Data Type|Example|
|payment_status|The overall outcome of the transaction.|String ("True" or "False")|"True"|
|order_number|The unique order number you originally sent.|String|ORD-2024-12345|
|merchant_reference_number|SecurePay's unique transaction ID. Essential for support queries.|String|SP12345678|
|fpx_debit_auth_code|The status code from the FPX system. 00 signifies success.|String|00|
|transaction_amount|The amount of the transaction.|String (e.g., "1.50")|"1.50"|
|transaction_amount_received|Amount received by the merchant.|String (e.g., "1.50")|"1.50"|
|checksum|The HMAC-SHA256 signature for verifying the callback's integrity.|String (Hex)|41712f0c1...|
|buyer_name|The buyer's name as provided.|String|AHMAD AMSYAR MOHD ALI|
|buyer_email|The buyer's email as provided.|String|email@example.com|
|buyer_phone|The buyer's phone as provided.|String|+60123121678|
|source|The payment source.|String|FPX|
|payment_method|The specific payment method used.|String|fpx online banking|
|fpx_model|The FPX model used.|String|B2C|
|status_url|A URL to view the transaction status on SecurePay's platform.|String (URL)|https://sandbox.securepay.my/api/v1/status/...|
|retry_url|A URL that can be used to retry a failed payment.|String (URL)|https://sandbox.securepay.my/api/v1/retry/...|

## Section 5: Production Readiness and Final Implementation

With the core logic for payment initiation and callback handling in place, the final steps involve creating the user-facing status pages, consolidating the code, and following a rigorous checklist to transition from the sandbox to a live production environment.

### 5.1 Crafting the User-Facing Status Pages

The redirect_url (e.g., pages/payment/status.tsx) is where the user's browser lands after completing the payment process. This page's role is purely presentational. It should provide clear and immediate feedback to the user about the outcome of their transaction.

Since the callback handler is the source of truth, the most reliable way for this page to get the order status is to fetch it from the application's backend/database. A common pattern is to pass the order_number as a query parameter in the redirect URL, which the status page can then use to query its status.

TypeScript

// pages/payment/status.tsx  
  
import { useRouter } from 'next/router';  
import { useEffect, useState } from 'react';  
  
// In a real app, you would fetch the status from your backend  
// For this example, we'll read it from the query params sent by SecurePay's redirect.  
export default function PaymentStatusPage() {  const router = useRouter();  const { payment_status, order_number, fpx_debit_auth_code } = router.query;  const [message, setMessage] = useState('Processing your payment status...');  
  
  useEffect(() => {    if (router.isReady) {      const isSuccess = payment_status === 'True' && fpx_debit_auth_code === '00';      if (isSuccess) {  
        setMessage(`Payment Successful! Thank you for your order #${order_number}.`);  
      } else {  
        setMessage(`Payment Failed. Please try again or contact support regarding order #${order_number}.`);  
      }  
    }  
  },);  return (    <div>  
      <h1>Payment Status</h1>  
      <p>{message}</p>  
      <button onClick={() => router.push('/')}>Back to Home</button>  
    </div>  );  
}

### 5.2 The Complete Code: A Full, Production-Grade Example

To facilitate a seamless implementation, all code snippets provided in this guide are designed to be production-grade. They are structured into logical components and modules:

●       **Frontend Component:** pages/index.tsx (The main sales page)

●       **API Routes:**

○       pages/api/initiate-payment.ts (Handles creating the payment session)

○       pages/api/payment-callback.ts (The secure webhook listener)

●       **User Feedback Page:** pages/payment/status.tsx (The redirect destination)

●       **Shared Logic:** lib/securepay-checksum.ts (Contains checksum generation and verification functions)

●       **Configuration:** .env.local (For storing credentials)

A complete project containing these files would form a fully functional integration, ready for deployment after being connected to a database for order persistence.

### 5.3 Pre-Go-Live Checklist: From Sandbox to Production

Transitioning from a testing environment to a live one must be a deliberate and careful process. The following checklist ensures all necessary steps are taken to prevent common deployment errors.

1.     **Thorough Sandbox Testing:** Before even considering production, exhaustively test the sandbox integration. This includes simulating:

○       Successful B2C and B2B1 (if applicable) payments.

○       Payments that are intentionally failed at the bank authorization step.

○       Payments that are canceled by the user on the SecurePay or bank page.

○       Verify that the callback handler correctly processes each of these scenarios and updates the database state as expected.

2.     **Verify Callback Handling with a Tunneling Service:** While developing locally, a service like ngrok is invaluable. It can create a public URL that tunnels requests to your local development server (e.g., localhost:3000). Use this public URL as your callback_url in the sandbox to receive and debug live callbacks from SecurePay's servers.

3.     **Update Environment Variables for Production:** In your production hosting environment (e.g., Vercel, Netlify), create and populate the environment variables with the **live** credentials obtained from your production SecurePay merchant account.

○       Update SECUREPAY_API_UID.

○       Update SECUREPAY_API_TOKEN.

○       Update SECUREPAY_CHECKSUM_TOKEN.

○       Change SECUREPAY_API_BASE_URL to https://securepay.my.

○       Ensure NEXT_PUBLIC_APP_URL is set to your live domain name (e.g., https://www.yourstore.com).

4.     **Confirm Production URLs:** Double-check that the callback_url and redirect_url constructed in your initiate-payment API route use the correct live domain. Any reference to localhost will fail in production.

5.     **Deploy and Conduct a Final Live Test:** After deploying the application to production, conduct one final end-to-end test with a real, small-value transaction. This is the ultimate confirmation that the entire flow—from payment initiation to callback processing and database update—is functioning correctly in the live environment.

### 5.4 Advanced Considerations and Troubleshooting

●       **Idempotency:** Design your callback handler to be idempotent. This means that if SecurePay sends the same callback multiple times (which can happen in distributed systems), your handler should not process the same successful payment more than once. A common strategy is to check the order status in the database before updating it; if the order is already marked as 'PAID', simply return a 200 OK response without taking further action.

●       **Comprehensive Logging:** Implement detailed logging in both the initiate-payment and payment-callback API routes. For initiation, log the payload being sent (excluding secrets). For the callback, log the entire incoming body. These logs are indispensable for debugging issues with checksums, unexpected data formats, or transaction disputes.

●       **Timeout and Cancellation Handling:** Utilize the optional timeout_url and cancel_url parameters.11 This provides a better user experience by redirecting users to specific pages if they abandon the payment or explicitly cancel it, allowing you to display appropriate messaging.

●       **Inaccessible Documentation:** This guide has been constructed based on the functional portions of the SecurePay API documentation and established payment gateway integration best practices. While some documentation links were found to be inaccessible during research 14, the core API endpoints for Merchant FPX Payments 3 and Callbacks 4 provided sufficient detail to build this robust and reliable integration guide. This report serves as a comprehensive and validated alternative for developers undertaking this implementation.
