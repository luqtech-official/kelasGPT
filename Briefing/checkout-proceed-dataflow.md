# Checkout Process Data Flow: From "Proceed" to Payment Completion

This document details the comprehensive data flow, processes, validations, and API interactions that occur when a customer clicks the "Proceed" button on the checkout page until the payment is completed.

## 1. Checkout Page (`pages/checkout.js`) - User Interaction & Initial Request

**Process:**
The customer fills out the name, email, and phone number fields on the checkout page. Upon clicking the "Proceed" button, the `handleSubmit` function is triggered.

**Data Flow:**
*   **Input Data:** `name`, `email`, `phone` (from form fields), and a hidden `honeypot` field.
*   **State Management:**
    *   `loading` state is set to `true` to disable the button and show a processing indicator.
    *   `error` state is cleared.

**Logic & Validation (Client-Side):**
*   `event.preventDefault()`: Prevents the default form submission behavior.
*   `FormData` and `Object.fromEntries`: Collects form input into a JavaScript object.
*   Basic HTML5 form validations (`required`, `type="email"`, `maxLength`, `pattern`) are applied directly on the input fields, providing immediate feedback to the user before submission.

**API Call:**
*   A `POST` request is initiated to the `/api/create-payment-session` endpoint.
*   The collected form data (`name`, `email`, `phone`, `honeypot`) is sent as a JSON payload in the request body.

**Response Handling:**
*   The client-side code awaits the response from `/api/create-payment-session`.
*   If `response.ok` is `false` (an error occurred on the server), the error message from the server is extracted and displayed to the user, and `loading` is set back to `false`.
*   If `response.ok` is `true`:
    *   The response JSON is parsed.
    *   If `result.payment_url` is present, the user is redirected to this URL (which points to the SecurePay payment gateway).
    *   Otherwise (e.g., in a simulated success scenario), the user is redirected to the `/thankyou` page.
*   `catch` block: Catches any network or unexpected errors during the fetch operation, sets the `error` state, and resets `loading`.

## 2. Create Payment Session API (`pages/api/create-payment-session.js`) - Backend Processing & Gateway Integration

**Process:**
This API endpoint receives the customer's details, performs server-side validations, saves customer and order data to the database, and then initiates a payment session with the SecurePay gateway.

**Data Flow:**
*   **Request Body:** `name`, `email`, `phone`, `honeypot`.
*   **Internal Data:** `orderNumber` (generated), `productSettings` (retrieved from `lib/settings.js`), `customerId` (from Supabase), SecurePay API credentials and URLs (from environment variables).

**Validations & Logic:**
*   **Method Check:** Ensures the request method is `POST`.
*   **Honeypot Check:** If the `honeypot` field is filled, it's considered a bot, logged, and a `400 Bad Request` is returned.
*   **Server-Side Input Validation:**
    *   `name`: Checked for presence and `maxLength` (30 characters).
    *   `email`: Checked for presence and a valid email format using a regex.
    *   `phone`: Checked for presence and a valid Malaysian phone number format (`^01[0-9]{8,9}$`) using a regex.
    *   Invalid inputs result in a `400 Bad Request` and are logged.
*   **`logTransaction`:** Extensive logging is used throughout the process to track the flow, errors, and key data points.
*   **`getPaymentSettings()`:** Retrieves product details (name, price, description) from `lib/settings.js`. As per previous changes, this now *always* returns the `DEFAULT_SETTINGS` and does not interact with Supabase.
*   **Double Submission Check:** Queries the `customers` table in Supabase to see if an `email_address` already exists. If it does, a `409 Conflict` status is returned, preventing duplicate entries for the same email.

**Database Interactions (Supabase):**
*   **Customer Creation:**
    *   `addCustomer` function is called to insert customer data into the `customers` table.
    *   Fields saved: `full_name`, `email_address`, `phone_number`, `payment_status` (initial `pending`), `ip_address`, `user_agent`.
    *   The `customer_id` from the newly created record is retrieved.
*   **Order Creation:**
    *   `addOrder` function is called to insert order data into the `orders` table.
    *   Fields saved: `customer_id`, `order_number`, `total_amount`, `product_name`, `product_price`, `final_amount`, `currency_code` (MYR), `order_status` (initial `pending`), `payment_method` (fpx), `payment_gateway` (securepay), `order_source` (website).

**SecurePay Gateway Integration:**
*   **Environment Variables:** Retrieves necessary credentials and URLs (`SECUREPAY_API_UID`, `SECUREPAY_AUTH_TOKEN`, `SECUREPAY_API_BASE_URL_SANDBOX`, `NEXT_PUBLIC_APP_URL`) for SecurePay.
*   **Checksum Generation:**
    *   A critical security step. A string is constructed by concatenating specific payload fields (buyer_email, buyer_name, buyer_phone, callback_url, order_number, product_description, redirect_url, transaction_amount, uid) delimited by `|` (pipe). The fields are ordered alphabetically as per SecurePay documentation.
    *   `crypto.createHmac('sha256', checksumToken).update(checksumData).digest('hex')` is used to generate an HMAC-SHA256 checksum. This ensures the integrity and authenticity of the request to SecurePay.
*   **Payload Construction:** An object containing all required parameters for SecurePay's payment session creation API is built.
*   **API Call to SecurePay:**
    *   A `POST` request is made to the SecurePay `/apis/payments` endpoint.
    *   `Content-Type`: `application/x-www-form-urlencoded`.
    *   **Authentication:** `Authorization: Basic <base64_encoded_uid:authToken>` is used for authentication as per SecurePay's requirements.
    *   The payload (excluding `uid` and `token` which are in the Basic Auth header) is URL-encoded and sent in the request body.
*   **SecurePay Response Handling:**
    *   The API waits for SecurePay's response.
    *   Error handling: Checks `response.ok`, parses error messages from SecurePay, and logs them.
    *   Success: Parses the JSON response from SecurePay.
    *   **`payment_url` Validation:** Crucially, it validates that the `payment_url` is present in SecurePay's successful response. If not, it indicates an invalid response.
*   **Final Response to Client:** If the SecurePay session is successfully created and a `payment_url` is received, this URL is sent back to the client (`pages/checkout.js`) as a JSON response.

## 3. Payment Gateway Interaction (SecurePay)

**Process:**
Upon receiving the `payment_url` from the `create-payment-session` API, the customer's browser is redirected to the SecurePay payment gateway. The customer interacts directly with SecurePay's interface to complete the payment.

**Data Flow:**
*   **Redirection:** The browser navigates to the `payment_url`.
*   **User Input:** Customer enters payment details (e.g., credit card info, bank login for FPX) on SecurePay's secure page.
*   **SecurePay Processing:** SecurePay processes the payment with the bank/financial institution.
*   **Callback:** After payment processing, SecurePay sends a server-to-server `POST` request (callback) to the `callback_url` provided during session creation (`/api/payment-callback`). This callback contains the final payment status and transaction details.
*   **Redirect:** SecurePay then redirects the customer's browser to the `redirect_url` (`/payment-status`), allowing the customer to see the outcome of their payment.

## 4. Payment Callback API (`pages/api/payment-callback.js`) - Post-Payment Processing & Fulfillment

**Process:**
This API endpoint is a webhook that receives the payment status from SecurePay. It validates the callback, updates the database, and triggers post-payment actions like sending a confirmation email.

**Data Flow:**
*   **Request Body:** Contains `order_number`, `payment_status`, `merchant_reference_number` (SecurePay's transaction ID), `amount`, and `signature` from SecurePay.

**Validations & Logic:**
*   **Method Check:** Ensures the request method is `POST`.
*   **Callback Data Validation:** Checks for the presence of all required fields in the callback payload.
*   **`logTransaction`:** Extensive logging for tracking callback receipt, validation, and processing.
*   **Signature Validation (CRITICAL SECURITY STEP):**
    *   A string is constructed using the `SECUREPAY_AUTH_TOKEN` and key callback data (`authToken + order_number + payment_status + merchant_reference_number + amount`).
    *   `crypto.createHash('sha256').update(signatureString).digest('hex')` is used to generate an expected SHA256 hash.
    *   This `expectedSignature` is compared with the `signature` received in the callback. If they don't match, it indicates a tampered or invalid callback, and a `400 Bad Request` is returned. This prevents fraudulent updates.
*   **Payment Status Check:** Determines if the payment was successful based on `payment_status` (can be `'true'`, `true`, or `'success'`).

**Database Interactions (Supabase):**
*   **Order and Customer Retrieval:** For successful payments, the API fetches the `order_id`, `customer_id`, `full_name`, and `email_address` from the `orders` and `customers` tables using the `order_number`.
*   **Parallel Database Updates (for successful payments):**
    *   `orders` table: `order_status` is updated to `'paid'`, `gateway_transaction_id` is set to `merchant_reference_number`, and `updated_at` is set.
    *   `customers` table: `payment_status` is updated to `'paid'` and `updated_at` is set.
*   **Database Update (for failed payments):**
    *   `orders` table: `order_status` is updated to `'failed'`.

**Post-Payment Actions (for successful payments):**
*   **Email Sending (Mailjet):**
    *   `getProductSettings()` is called again to retrieve product details for the email content.
    *   A purchase confirmation email is sent to the customer using the Mailjet API.
    *   The email includes dynamic variables like `customer_name`, `order_number`, `product_name`, `product_price`, and `download_link`.
    *   Email sending errors are logged but do not prevent the overall callback processing from succeeding (as the payment and database updates are primary).

**Final Response to SecurePay:**
*   A `200 OK` response is returned to SecurePay, acknowledging that the callback was received and processed successfully. This is crucial for SecurePay to mark the transaction as complete on their end.

## 5. Payment Status Page (`pages/payment-status.js`) - User Confirmation

**Process:**
After the payment gateway processes the payment and sends the callback, it redirects the customer's browser to the `/payment-status` page. This page typically displays a success or failure message to the user.

**Data Flow:**
*   The page might receive query parameters from the payment gateway (e.g., `status`, `order_number`) to display relevant information.
*   It might also fetch the latest order status from the database to ensure consistency.

This concludes the detailed data flow from the checkout page to payment completion.