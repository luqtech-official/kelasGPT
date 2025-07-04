# Complete Supabase Schema Reference with Business Context

## Overview
This document provides comprehensive field-by-field descriptions for the Supabase database schema used in the Malaysian Digital Product Sales Platform. Each field includes its purpose, business context, data type, constraints, and usage patterns.

---

## 1. `public.admin` Table
**Purpose**: Manages administrative users who can access the backend dashboard to monitor sales, manage customers, and configure platform settings.

### Fields:

#### `admin_id` (uuid, Primary Key)
- **Type**: `uuid NOT NULL DEFAULT uuid_generate_v4()`
- **Purpose**: Unique identifier for each administrator account
- **Business Context**: Auto-generated UUID that serves as the primary key for admin records
- **Usage**: Referenced in foreign key relationships and session management

#### `username` (text, Unique)
- **Type**: `text NOT NULL UNIQUE`
- **Purpose**: Login credential for administrator access
- **Business Context**: Used for admin authentication on `/admin/login` page
- **Constraints**: Must be unique across all admin accounts
- **Usage**: Primary identification field for admin login

#### `password_hash` (text)
- **Type**: `text NOT NULL`
- **Purpose**: Securely stores hashed version of admin password
- **Business Context**: Never stores plain text passwords; uses secure hashing algorithm
- **Security**: Critical for authentication security
- **Usage**: Compared against hashed input during login attempts

#### `last_login_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: Tracks when administrator last accessed the system
- **Business Context**: Used for security monitoring and session management
- **Usage**: Updated each time admin successfully logs in

#### `session_data` (jsonb)
- **Type**: `jsonb`
- **Purpose**: Stores session-related information and preferences
- **Business Context**: May include dashboard preferences, temporary data, or session tokens
- **Format**: JSON object with flexible structure
- **Usage**: Maintains admin session state across requests

#### `email` (character varying)
- **Type**: `character varying`
- **Purpose**: Administrator's email address for notifications and communication
- **Business Context**: Used for sending system alerts, error notifications, and important updates
- **Usage**: Target for automated admin notifications

#### `role` (character varying)
- **Type**: `character varying DEFAULT 'admin'`
- **Purpose**: Defines access level and permissions for the administrator
- **Business Context**: Supports role-based access control with different permission levels
- **Allowed Values**: 'super_admin', 'admin', 'support', 'viewer'
- **Default**: 'admin'
- **Usage**: Determines which admin dashboard sections are accessible

---

## 2. `public.customers` Table
**Purpose**: Central repository for all customer information, tracking purchases and customer journey data for the digital product sales platform.

### Fields:

#### `customer_id` (uuid, Primary Key)
- **Type**: `uuid NOT NULL DEFAULT uuid_generate_v4()`
- **Purpose**: Unique identifier for each customer
- **Business Context**: Auto-generated UUID that links customer to orders and other related data
- **Usage**: Foreign key reference in orders, email_logs, and payment_sessions tables

#### `full_name` (character varying)
- **Type**: `character varying NOT NULL`
- **Purpose**: Customer's complete name as entered during checkout
- **Business Context**: Used in email communications and order confirmations
- **Constraints**: Maximum 30 characters as per PRD requirements
- **Usage**: Personalization in emails and admin customer management

#### `email_address` (text, Unique)
- **Type**: `text NOT NULL UNIQUE`
- **Purpose**: Customer's email address for product delivery and communications
- **Business Context**: Primary communication channel; used for digital product delivery
- **Constraints**: Must be unique (one account per email) and valid email format
- **Usage**: Product delivery emails, order confirmations, and customer identification

#### `phone_number` (character varying)
- **Type**: `character varying NOT NULL`
- **Purpose**: Customer's phone number for verification and contact
- **Business Context**: Malaysian format validation (010-019 prefix, 10-11 digits)
- **Constraints**: Must follow Malaysian phone number format
- **Usage**: Customer verification and potential support contact

#### `payment_status` (payment_status_enum)
- **Type**: `payment_status_enum NOT NULL DEFAULT 'pending'`
- **Purpose**: Current payment status for the customer's order
- **Business Context**: Tracks payment lifecycle from initiation to completion
- **Allowed Values**: 'pending', 'paid', 'failed', 'refunded'
- **Default**: 'pending'
- **Usage**: Determines if customer should receive product delivery email

#### `created_at` (timestamp with time zone)
- **Type**: `timestamp with time zone NOT NULL DEFAULT now()`
- **Purpose**: When the customer record was first created
- **Business Context**: Tracks customer acquisition timing for analytics
- **Usage**: Reporting, analytics, and customer lifecycle tracking

#### `updated_at` (timestamp with time zone)
- **Type**: `timestamp with time zone NOT NULL DEFAULT now()`
- **Purpose**: Last modification time of customer record
- **Business Context**: Automatically updated by trigger on any record change
- **Usage**: Audit trail and data synchronization

#### `ip_address` (inet)
- **Type**: `inet`
- **Purpose**: Customer's IP address during checkout
- **Business Context**: Security measure for fraud detection and geographic analysis
- **Usage**: Security monitoring, rate limiting, and analytics

#### `user_agent` (text)
- **Type**: `text`
- **Purpose**: Browser/device information from checkout session
- **Business Context**: Technical details about customer's device and browser
- **Usage**: Security validation and technical support

#### `acquisition_source` (character varying)
- **Type**: `character varying`
- **Purpose**: High-level source of customer acquisition
- **Business Context**: Tracks where customers are coming from (organic, paid, referral)
- **Usage**: Marketing attribution and channel analysis

#### `acquisition_campaign` (character varying)
- **Type**: `character varying`
- **Purpose**: Specific marketing campaign that brought the customer
- **Business Context**: Detailed campaign tracking for ROI analysis
- **Usage**: Campaign performance measurement

#### `referrer_url` (text)
- **Type**: `text`
- **Purpose**: The URL customer came from before arriving at sales page
- **Business Context**: Tracks traffic sources and customer journey
- **Usage**: Marketing analysis and conversion path optimization

#### `utm_source` (character varying)
- **Type**: `character varying`
- **Purpose**: UTM parameter tracking traffic source
- **Business Context**: Standard marketing attribution parameter
- **Usage**: Marketing campaign analysis and attribution

#### `utm_medium` (character varying)
- **Type**: `character varying`
- **Purpose**: UTM parameter tracking marketing medium
- **Business Context**: Identifies channel type (email, social, cpc, etc.)
- **Usage**: Channel performance analysis

#### `utm_campaign` (character varying)
- **Type**: `character varying`
- **Purpose**: UTM parameter tracking specific campaign
- **Business Context**: Identifies individual marketing campaigns
- **Usage**: Campaign ROI measurement

#### `utm_term` (character varying)
- **Type**: `character varying`
- **Purpose**: UTM parameter tracking search terms
- **Business Context**: Primarily for paid search campaign tracking
- **Usage**: Keyword performance analysis

#### `utm_content` (character varying)
- **Type**: `character varying`
- **Purpose**: UTM parameter tracking content variation
- **Business Context**: A/B test tracking and ad variation identification
- **Usage**: Content optimization and A/B test analysis

#### `email_verified` (boolean)
- **Type**: `boolean DEFAULT false`
- **Purpose**: Whether customer's email address has been verified
- **Business Context**: Ensures email deliverability and reduces bounce rates
- **Default**: false
- **Usage**: Email delivery optimization and customer verification

#### `notes` (text)
- **Type**: `text`
- **Purpose**: Administrative notes about the customer
- **Business Context**: Free-form text for admin team to record important information
- **Usage**: Customer service, special circumstances, or admin reminders

#### `metadata` (jsonb)
- **Type**: `jsonb DEFAULT '{}'`
- **Purpose**: Flexible storage for additional customer data
- **Business Context**: Extensible field for future features or custom data
- **Default**: Empty JSON object
- **Usage**: Custom attributes, feature flags, or additional customer properties

---

## 3. `public.email_logs` Table
**Purpose**: Comprehensive tracking of all email communications sent to customers, including delivery status, opens, clicks, and error handling.

### Fields:

#### `log_id` (uuid, Primary Key)
- **Type**: `uuid NOT NULL DEFAULT uuid_generate_v4()`
- **Purpose**: Unique identifier for each email log entry
- **Business Context**: Tracks individual email sending attempts and their outcomes
- **Usage**: Primary key for email audit trail

#### `customer_id` (uuid, Foreign Key)
- **Type**: `uuid`
- **Purpose**: Links email log to specific customer
- **Business Context**: Associates email communications with customer records
- **Foreign Key**: References `public.customers(customer_id)`
- **Usage**: Customer communication history and support

#### `order_id` (uuid, Foreign Key)
- **Type**: `uuid`
- **Purpose**: Links email log to specific order (if applicable)
- **Business Context**: Associates transactional emails with orders
- **Foreign Key**: References `public.orders(order_id)`
- **Usage**: Order-related email tracking

#### `email_type` (character varying)
- **Type**: `character varying NOT NULL`
- **Purpose**: Categorizes the type of email sent
- **Business Context**: Distinguishes between welcome, delivery, confirmation, etc.
- **Usage**: Email performance analysis by type

#### `recipient_email` (character varying)
- **Type**: `character varying NOT NULL`
- **Purpose**: Email address where the message was sent
- **Business Context**: Actual recipient address (may differ from customer email)
- **Usage**: Delivery tracking and bounce analysis

#### `subject` (character varying)
- **Type**: `character varying`
- **Purpose**: Email subject line
- **Business Context**: Tracks what subject was used for each email
- **Usage**: Subject line optimization and email identification

#### `status` (character varying)
- **Type**: `character varying NOT NULL DEFAULT 'queued'`
- **Purpose**: Current delivery status of the email
- **Business Context**: Tracks email through delivery pipeline
- **Default**: 'queued'
- **Usage**: Email delivery monitoring and failure analysis

#### `provider` (character varying)
- **Type**: `character varying DEFAULT 'mailjet'`
- **Purpose**: Email service provider used for sending
- **Business Context**: Identifies which email service handled the message
- **Default**: 'mailjet'
- **Usage**: Provider performance comparison and troubleshooting

#### `provider_message_id` (character varying)
- **Type**: `character varying`
- **Purpose**: Unique identifier from email provider
- **Business Context**: External reference for tracking with email provider
- **Usage**: Provider-specific tracking and support

#### `provider_response` (jsonb)
- **Type**: `jsonb`
- **Purpose**: Complete response from email provider API
- **Business Context**: Detailed provider response for debugging
- **Usage**: Technical troubleshooting and API response analysis

#### `sent_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When email was successfully sent
- **Business Context**: Actual send time for delivery performance analysis
- **Usage**: Send time analysis and customer communication timing

#### `delivered_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When email was delivered to recipient's inbox
- **Business Context**: Confirmation of successful delivery
- **Usage**: Delivery time analysis and success rate calculation

#### `opened_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When customer first opened the email
- **Business Context**: Customer engagement tracking
- **Usage**: Open rate analysis and customer engagement metrics

#### `clicked_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When customer clicked links in the email
- **Business Context**: Measures email effectiveness and customer action
- **Usage**: Click-through rate analysis and email performance

#### `error_code` (character varying)
- **Type**: `character varying`
- **Purpose**: Error code if email sending failed
- **Business Context**: Standardized error identification for troubleshooting
- **Usage**: Error analysis and delivery issue resolution

#### `error_message` (text)
- **Type**: `text`
- **Purpose**: Detailed error message if sending failed
- **Business Context**: Human-readable error description
- **Usage**: Technical troubleshooting and error resolution

#### `retry_count` (integer)
- **Type**: `integer DEFAULT 0`
- **Purpose**: Number of times email sending was retried
- **Business Context**: Tracks retry attempts for failed emails
- **Default**: 0
- **Usage**: Retry logic and failure analysis

#### `next_retry_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When next retry attempt should occur
- **Business Context**: Schedules automated retry attempts
- **Usage**: Retry queue management and automated recovery

#### `created_at` (timestamp with time zone)
- **Type**: `timestamp with time zone DEFAULT now()`
- **Purpose**: When the email log record was created
- **Business Context**: Initial logging timestamp
- **Usage**: Log creation tracking and audit trail

---

## 4. `public.orders` Table
**Purpose**: Complete order information including product details, pricing, payment status, and fulfillment tracking for each customer purchase.

### Fields:

#### `order_id` (uuid, Primary Key)
- **Type**: `uuid NOT NULL DEFAULT uuid_generate_v4()`
- **Purpose**: Unique identifier for each order
- **Business Context**: Auto-generated UUID linking order to customer and payments
- **Usage**: Primary key for order tracking and references

#### `customer_id` (uuid, Foreign Key)
- **Type**: `uuid NOT NULL`
- **Purpose**: Links order to specific customer
- **Business Context**: Associates purchase with customer record
- **Foreign Key**: References `public.customers(customer_id)`
- **Usage**: Customer order history and relationship tracking

#### `order_number` (text, Unique)
- **Type**: `text NOT NULL UNIQUE`
- **Purpose**: Human-readable, unique order identifier
- **Business Context**: Customer-facing order reference for support and tracking
- **Constraints**: Must be unique across all orders
- **Usage**: Customer service, order lookup, and external references

#### `order_date` (timestamp with time zone)
- **Type**: `timestamp with time zone NOT NULL DEFAULT now()`
- **Purpose**: When the order was placed
- **Business Context**: Official order timestamp for reporting and analytics
- **Usage**: Sales reporting, revenue tracking, and order sequencing

#### `total_amount` (numeric)
- **Type**: `numeric NOT NULL`
- **Purpose**: Total order amount (legacy field)
- **Business Context**: Maintained for backward compatibility
- **Usage**: Historical order value tracking

#### `created_at` (timestamp with time zone)
- **Type**: `timestamp with time zone NOT NULL DEFAULT now()`
- **Purpose**: When order record was created in database
- **Business Context**: Technical timestamp for data tracking
- **Usage**: Database audit trail and record creation tracking

#### `updated_at` (timestamp with time zone)
- **Type**: `timestamp with time zone NOT NULL DEFAULT now()`
- **Purpose**: Last modification time of order record
- **Business Context**: Automatically updated by trigger on changes
- **Usage**: Data synchronization and change tracking

#### `product_id` (uuid)
- **Type**: `uuid`
- **Purpose**: Identifier for the specific product purchased
- **Business Context**: Links order to product catalog (single product currently)
- **Usage**: Product tracking and inventory management

#### `product_name` (character varying)
- **Type**: `character varying NOT NULL DEFAULT 'Digital Product'`
- **Purpose**: Name of the product purchased
- **Business Context**: Human-readable product identification
- **Default**: 'Digital Product'
- **Usage**: Order display, receipts, and customer communications

#### `product_version` (character varying)
- **Type**: `character varying`
- **Purpose**: Version of the product delivered
- **Business Context**: Tracks product updates and ensures correct version delivery
- **Usage**: Version control and customer support

#### `product_price` (numeric)
- **Type**: `numeric NOT NULL DEFAULT 0.00`
- **Purpose**: Base price of the product
- **Business Context**: Original product price before discounts
- **Default**: 0.00
- **Usage**: Pricing analysis and discount calculations

#### `discount_amount` (numeric)
- **Type**: `numeric DEFAULT 0`
- **Purpose**: Amount of discount applied to order
- **Business Context**: Tracks promotional discounts and offers
- **Default**: 0
- **Usage**: Discount tracking and promotional analysis

#### `final_amount` (numeric)
- **Type**: `numeric NOT NULL DEFAULT 0.00`
- **Purpose**: Final amount charged to customer
- **Business Context**: Actual payment amount after discounts
- **Default**: 0.00
- **Usage**: Payment processing and revenue tracking

#### `currency_code` (character)
- **Type**: `character DEFAULT 'MYR'`
- **Purpose**: Currency code for the order
- **Business Context**: Malaysian Ringgit as default currency
- **Default**: 'MYR'
- **Usage**: Multi-currency support and financial reporting

#### `order_status` (character varying)
- **Type**: `character varying DEFAULT 'pending'`
- **Purpose**: Current status of the order
- **Business Context**: Tracks order through fulfillment process
- **Default**: 'pending'
- **Usage**: Order management and customer status updates

#### `payment_method` (character varying)
- **Type**: `character varying DEFAULT 'fpx'`
- **Purpose**: Payment method used for the order
- **Business Context**: Malaysian FPX bank transfer as primary method
- **Default**: 'fpx'
- **Usage**: Payment analysis and method performance tracking

#### `payment_gateway` (character varying)
- **Type**: `character varying DEFAULT 'securepay'`
- **Purpose**: Payment gateway used for processing
- **Business Context**: Securepay.my as primary Malaysian payment processor
- **Default**: 'securepay'
- **Usage**: Gateway performance analysis and troubleshooting

#### `gateway_transaction_id` (character varying)
- **Type**: `character varying`
- **Purpose**: Transaction ID from payment gateway
- **Business Context**: External reference for payment tracking
- **Usage**: Payment reconciliation and gateway support

#### `order_source` (character varying)
- **Type**: `character varying DEFAULT 'website'`
- **Purpose**: Source where order was placed
- **Business Context**: Tracks order origin for analytics
- **Default**: 'website'
- **Usage**: Channel analysis and source attribution

#### `email_sent` (boolean)
- **Type**: `boolean DEFAULT false`
- **Purpose**: Whether product delivery email was sent
- **Business Context**: Tracks fulfillment status
- **Default**: false
- **Usage**: Fulfillment tracking and customer service

#### `email_sent_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When product delivery email was sent
- **Business Context**: Timestamp for delivery completion
- **Usage**: Fulfillment timing and customer service

#### `refund_status` (character varying)
- **Type**: `character varying DEFAULT 'none'`
- **Purpose**: Current refund status of the order
- **Business Context**: Tracks refund requests and processing
- **Default**: 'none'
- **Usage**: Refund management and financial tracking

#### `refund_amount` (numeric)
- **Type**: `numeric`
- **Purpose**: Amount refunded to customer
- **Business Context**: Partial or full refund tracking
- **Usage**: Financial reconciliation and refund reporting

#### `refund_reason` (text)
- **Type**: `text`
- **Purpose**: Reason for refund request
- **Business Context**: Customer service and refund analysis
- **Usage**: Refund pattern analysis and customer service

#### `refund_processed_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When refund was processed
- **Business Context**: Completion timestamp for refund
- **Usage**: Refund timeline tracking and reporting

#### `order_notes` (text)
- **Type**: `text`
- **Purpose**: Administrative notes about the order
- **Business Context**: Free-form text for special circumstances
- **Usage**: Customer service notes and order management

---

## 5. `public.payment_sessions` Table
**Purpose**: Manages secure payment sessions and tracks payment flow from initiation through completion, including gateway integration data.

### Fields:

#### `session_id` (uuid, Primary Key)
- **Type**: `uuid NOT NULL DEFAULT uuid_generate_v4()`
- **Purpose**: Unique identifier for each payment session
- **Business Context**: Links payment attempt to customer and order
- **Usage**: Session management and payment tracking

#### `customer_id` (uuid, Foreign Key)
- **Type**: `uuid`
- **Purpose**: Links payment session to customer
- **Business Context**: Associates payment attempt with customer record
- **Foreign Key**: References `public.customers(customer_id)`
- **Usage**: Customer payment history and session management

#### `order_id` (uuid, Foreign Key)
- **Type**: `uuid`
- **Purpose**: Links payment session to specific order
- **Business Context**: Associates payment attempt with order
- **Foreign Key**: References `public.orders(order_id)`
- **Usage**: Order payment tracking and fulfillment

#### `session_token` (character varying, Unique)
- **Type**: `character varying NOT NULL UNIQUE`
- **Purpose**: Secure token for payment session identification
- **Business Context**: Prevents session tampering and unauthorized access
- **Constraints**: Must be unique across all sessions
- **Usage**: Payment gateway integration and security

#### `checkout_data` (jsonb)
- **Type**: `jsonb NOT NULL`
- **Purpose**: Complete checkout form data and session details
- **Business Context**: Stores all checkout information for session
- **Usage**: Payment processing and session recovery

#### `session_status` (character varying)
- **Type**: `character varying DEFAULT 'active'`
- **Purpose**: Current status of the payment session
- **Business Context**: Tracks session lifecycle
- **Default**: 'active'
- **Usage**: Session management and cleanup

#### `gateway_session_id` (character varying)
- **Type**: `character varying`
- **Purpose**: Session ID from payment gateway
- **Business Context**: External reference for gateway tracking
- **Usage**: Gateway integration and payment tracking

#### `gateway_payment_url` (text)
- **Type**: `text`
- **Purpose**: Payment URL provided by gateway
- **Business Context**: Customer redirect URL for payment
- **Usage**: Payment flow and customer redirection

#### `gateway_callback_data` (jsonb)
- **Type**: `jsonb`
- **Purpose**: Complete callback data from payment gateway
- **Business Context**: Raw gateway response for audit and troubleshooting
- **Usage**: Payment verification and debugging

#### `ip_address` (inet)
- **Type**: `inet NOT NULL`
- **Purpose**: IP address of customer initiating payment
- **Business Context**: Security measure for fraud detection
- **Usage**: Security monitoring and fraud prevention

#### `user_agent` (text)
- **Type**: `text`
- **Purpose**: Browser information from payment session
- **Business Context**: Device and browser tracking for security
- **Usage**: Security validation and technical support

#### `created_at` (timestamp with time zone)
- **Type**: `timestamp with time zone DEFAULT now()`
- **Purpose**: When payment session was created
- **Business Context**: Session initiation timestamp
- **Usage**: Session lifecycle tracking and analytics

#### `expires_at` (timestamp with time zone)
- **Type**: `timestamp with time zone NOT NULL`
- **Purpose**: When payment session expires
- **Business Context**: Prevents indefinite session usage
- **Usage**: Session cleanup and security

#### `completed_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When payment session was completed
- **Business Context**: Session completion timestamp
- **Usage**: Payment completion tracking and analytics

#### `attempts` (integer)
- **Type**: `integer DEFAULT 0`
- **Purpose**: Number of payment attempts for this session
- **Business Context**: Tracks repeated payment attempts
- **Default**: 0
- **Usage**: Fraud detection and payment analysis

#### `last_attempt_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: Timestamp of most recent payment attempt
- **Business Context**: Tracks timing of payment attempts
- **Usage**: Payment behavior analysis and fraud detection

#### `checksum` (character varying)
- **Type**: `character varying`
- **Purpose**: Security checksum for session validation
- **Business Context**: Prevents session tampering and ensures integrity
- **Usage**: Security validation and anti-fraud measures

---

## 6. `public.settings` Table
**Purpose**: Centralized configuration management for platform settings, allowing dynamic changes without code deployment.

### Fields:

#### `setting_id` (uuid, Primary Key)
- **Type**: `uuid NOT NULL DEFAULT uuid_generate_v4()`
- **Purpose**: Unique identifier for each setting
- **Business Context**: Primary key for settings management
- **Usage**: Settings identification and management

#### `setting_key` (character varying, Unique)
- **Type**: `character varying NOT NULL UNIQUE`
- **Purpose**: Unique identifier for the setting
- **Business Context**: Human-readable key for setting identification
- **Constraints**: Must be unique across all settings
- **Usage**: Settings retrieval and configuration management

#### `setting_value` (jsonb)
- **Type**: `jsonb NOT NULL`
- **Purpose**: The actual setting value or configuration
- **Business Context**: Flexible storage for any configuration type
- **Usage**: Configuration values and complex settings

#### `setting_type` (character varying)
- **Type**: `character varying NOT NULL`
- **Purpose**: Type or category of the setting
- **Business Context**: Organizes settings by functionality
- **Usage**: Settings categorization and validation

#### `description` (text)
- **Type**: `text`
- **Purpose**: Human-readable description of the setting
- **Business Context**: Documentation for administrators
- **Usage**: Settings documentation and admin interface

#### `is_public` (boolean)
- **Type**: `boolean DEFAULT false`
- **Purpose**: Whether setting can be accessed publicly
- **Business Context**: Controls access to sensitive settings
- **Default**: false
- **Usage**: Access control and security

#### `updated_at` (timestamp with time zone)
- **Type**: `timestamp with time zone DEFAULT now()`
- **Purpose**: When setting was last modified
- **Business Context**: Tracks configuration changes
- **Usage**: Change tracking and audit trail

#### `updated_by` (uuid, Foreign Key)
- **Type**: `uuid`
- **Purpose**: Which admin user updated the setting
- **Business Context**: Tracks who made configuration changes
- **Foreign Key**: References `public.admin(admin_id)`
- **Usage**: Change attribution and audit trail

---

## 7. `public.webhook_logs` Table
**Purpose**: Comprehensive logging of all webhook requests from external services, particularly payment gateway callbacks, for security and troubleshooting.

### Fields:

#### `webhook_id` (uuid, Primary Key)
- **Type**: `uuid NOT NULL DEFAULT uuid_generate_v4()`
- **Purpose**: Unique identifier for each webhook request
- **Business Context**: Primary key for webhook tracking
- **Usage**: Webhook identification and audit trail

#### `provider` (character varying)
- **Type**: `character varying NOT NULL`
- **Purpose**: Service provider sending the webhook
- **Business Context**: Identifies webhook source (securepay, mailjet, etc.)
- **Usage**: Provider-specific processing and analysis

#### `event_type` (character varying)
- **Type**: `character varying NOT NULL`
- **Purpose**: Type of event being reported
- **Business Context**: Categorizes webhook events for processing
- **Usage**: Event routing and processing logic

#### `request_headers` (jsonb)
- **Type**: `jsonb`
- **Purpose**: Complete HTTP headers from webhook request
- **Business Context**: Security validation and debugging information
- **Usage**: Security verification and troubleshooting

#### `request_body` (jsonb)
- **Type**: `jsonb`
- **Purpose**: Complete payload from webhook request
- **Business Context**: Event data and processing information
- **Usage**: Event processing and audit trail

#### `request_signature` (character varying)
- **Type**: `character varying`
- **Purpose**: Security signature from webhook provider
- **Business Context**: Validates webhook authenticity
- **Usage**: Security verification and fraud prevention

#### `signature_valid` (boolean)
- **Type**: `boolean`
- **Purpose**: Whether the webhook signature was validated
- **Business Context**: Security check result
- **Usage**: Security monitoring and fraud detection

#### `ip_address` (inet)
- **Type**: `inet`
- **Purpose**: IP address of webhook sender
- **Business Context**: Security validation and geographic tracking
- **Usage**: IP validation and security monitoring

#### `processing_status` (character varying)
- **Type**: `character varying DEFAULT 'pending'`
- **Purpose**: Current processing status of the webhook
- **Business Context**: Tracks webhook through processing pipeline
- **Default**: 'pending'
- **Usage**: Processing management and error tracking

#### `processed_at` (timestamp with time zone)
- **Type**: `timestamp with time zone`
- **Purpose**: When webhook processing was completed
- **Business Context**: Processing completion timestamp
- **Usage**: Performance analysis and processing tracking

#### `response_status` (integer)
- **Type**: `integer`
- **Purpose**: HTTP status code returned to webhook sender
- **Business Context**: Response status for provider tracking
- **Usage**: Response analysis and provider relationship

#### `response_body` (jsonb)
- **Type**: `jsonb`
- **Purpose**: Response payload sent back to webhook provider
- **Business Context**: Complete response for audit trail
- **Usage**: Response tracking and debugging

#### `error_message` (text)
- **Type**: `text`
- **Purpose**: Error message if webhook processing failed
- **Business Context**: Detailed error information for troubleshooting
- **Usage**: Error analysis and debugging

#### `retry_count` (integer)
- **Type**: `integer DEFAULT 0`
- **Purpose**: Number of times webhook processing was retried
- **Business Context**: Tracks retry attempts for failed webhooks
- **Default**: 0
- **Usage**: Retry logic and failure analysis

#### `created_at` (timestamp with time zone)
- **Type**: `timestamp with time zone DEFAULT now()`
- **Purpose**: When webhook was first received
- **Business Context**: Initial receipt timestamp
- **Usage**: Webhook timing and audit trail

---

## Business Context Summary

This database schema supports a Malaysian digital product sales platform with the following key business functions:

1. **Customer Management**: Complete customer lifecycle from acquisition through purchase
2. **Order Processing**: Full order management with payment tracking and fulfillment
3. **Payment Integration**: Secure payment processing with Securepay.my gateway
4. **Email Communications**: Automated email delivery and tracking
5. **Administrative Control**: Secure admin access with role-based permissions
6. **Analytics & Reporting**: Comprehensive data tracking for business insights
7. **Security & Compliance**: Audit trails, security logging, and fraud prevention
8. **Configuration Management**: Dynamic settings without code deployment

The schema is designed for a single digital product business model with Malaysian market focus, emphasizing security, auditability, and scalability.