# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing
No automated test commands configured. Manual testing procedures are documented in the testing section.

## Project Overview

This is a complete digital product sales platform for "KelasGPT" - a GPT-4 learning course platform in Malay language, designed specifically for the Malaysian market. The platform features a sales page, secure checkout system, payment processing via SecurePay.my, email delivery via Mailjet, and comprehensive administrative dashboard for managing digital product sales.

### Business Model
- Single digital product sales (KelasGPT AI learning course)
- Direct-to-consumer B2C approach with FPX bank transfer payments
- Automated product delivery via email upon successful payment
- Malaysian market focus with localized payment methods
- Price: RM197.00 (configurable via admin settings)

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.3.4 with Pages Router
- **Frontend**: React 19, CSS Modules (no Tailwind)
- **Database**: Supabase for customer data, orders, admin authentication, and settings
- **Payment Gateway**: SecurePay.my for Malaysian FPX bank transfer processing
- **Email Service**: Mailjet for automated product delivery and notifications
- **Hosting**: Vercel with automatic deployment
- **Analytics**: Vercel Analytics
- **UI Components**: react-hot-toast for notifications

### Core Architecture

#### Database Layer (`/lib/`)
- `supabase.js` - Database client with service role key for backend operations
- `mailjet.js` - Email service integration using CommonJS module syntax
- `adminAuth.js` - Authentication middleware with session management for admin routes
- `logger.js` - Transaction logging system with severity levels (INFO, WARN, ERROR)
- `settings.js` - Dynamic configuration management with caching for product settings

#### Database Schema (Supabase)
Complete production schema with the following main tables:

**customers** - Customer data with payment tracking and analytics
- customer_id (uuid, primary key)
- full_name, email_address (unique), phone_number
- payment_status (enum: pending, paid, failed)
- created_at, updated_at, ip_address, user_agent
- UTM tracking fields (utm_source, utm_medium, utm_campaign, etc.)
- metadata (jsonb) for additional data storage

**orders** - Order management with product details and payment tracking
- order_id (uuid), customer_id (foreign key)
- order_number (unique), order_date, total_amount
- product details (name, price, version)
- payment_method (default: fpx), payment_gateway (default: securepay)
- gateway_transaction_id, order_status, email_sent tracking

**payment_sessions** - Secure payment session management
- session_id (uuid), session_token (unique)
- checkout_data (jsonb), session_status
- gateway integration fields and security checksums

**admin** - Administrative users with role-based access
- admin_id (uuid), username (unique), password_hash
- session_data (jsonb), last_login_at
- role (super_admin, admin, support, viewer)

**settings** - Dynamic configuration management
- setting_key (unique), setting_value (jsonb)
- Used for product configuration, pricing, and system settings

**email_logs** - Email delivery tracking and monitoring
- Email type, recipient, status, provider (Mailjet)
- Delivery timestamps, error tracking, retry logic

**webhook_logs** - Webhook request logging for security and debugging
- Provider, event_type, request_headers/body
- Signature validation, processing status, responses

#### API Layer (`/pages/api/`)

**Core Payment APIs:**
- `create-payment-session.js` - Handles checkout form submission with comprehensive validation
  - Server-side validation (name max 30 chars, Malaysian phone format `01[0-9]{8,9}`)
  - Honeypot spam protection and double-submission prevention
  - SecurePay integration with HMAC-SHA256 signature generation
  - Customer and order creation in Supabase
- `payment-callback.js` - Processes SecurePay payment callbacks
  - SHA256 signature validation for security
  - Payment status updates and email delivery trigger
  - Comprehensive error handling and logging

**Admin API Endpoints:**
- `POST /api/admin/login` - Session-based authentication with password hashing
- `GET /api/admin/validate-session` - Session validation middleware
- `POST /api/admin/logout` - Session cleanup
- `GET /api/admin/dashboard` - Real-time analytics with revenue calculations
- `GET/POST /api/admin/customers` - Customer management with search and filtering
- `GET/POST /api/admin/settings` - Dynamic configuration management

#### Frontend Pages (`/pages/`)
- `index.js` - Landing page with complete copywriting framework
  - Dynamic product pricing from settings
  - SEO meta tags and Open Graph implementation
  - Social proof integration
- `checkout.js` - Customer information form with advanced validation
  - Malaysian phone validation pattern
  - Honeypot protection and real-time validation
  - Dynamic product information display
- `payment-status.js` - Payment result handling with callback parameters
- `thankyou.js` - Success confirmation page
- `admin/` directory:
  - `index.js` - Analytics dashboard with real-time metrics
  - `customers.js` - Customer management interface
  - `settings.js` - Configuration management UI
  - `login.js` - Admin authentication interface

#### Components (`/components/`)
- `SocialProof.js` - Displays rotating toast notifications
  - Fetches data from `/public/social_noti.json`
  - 4-second display + 4-second rest cycle
  - Uses react-hot-toast for notifications
- `AdminLayout.js` - Authenticated admin layout with navigation and session management

### Business Logic Patterns

#### Payment Flow (SecurePay Integration)
1. **Customer Form Submission**: Checkout form with comprehensive validation
   - Name validation (max 30 characters)
   - Email format validation with uniqueness check
   - Malaysian phone format validation (`01[0-9]{8,9}`)
   - Honeypot spam protection
2. **Database Operations**: Parallel customer and order creation
3. **Payment Session Creation**: SecurePay API integration
   - HMAC-SHA256 signature generation with alphabetically ordered parameters
   - Basic Authentication using UID:AUTH_TOKEN
   - Form-encoded request payload (not JSON)
4. **Payment Gateway Redirect**: User redirected to SecurePay for FPX bank selection
5. **Webhook Processing**: Secure callback handling
   - SHA256 signature validation using auth token
   - Payment status updates in database
   - Automated email delivery via Mailjet
6. **Status Page Redirect**: User feedback with transaction results

#### Security Implementation
- **Payment Security**: SHA256 signature validation for all SecurePay webhooks
- **Anti-Bot Protection**: Honeypot fields and server-side validation
- **Session Security**: Admin authentication with secure session management
- **Data Protection**: SQL injection prevention, XSS protection
- **Audit Trail**: Comprehensive logging via transaction.log file
- **Input Validation**: Server-side validation for all user inputs

#### Social Proof System
- **Data Source**: `/public/social_noti.json` (manually updated)
- **Display Logic**: Rotating notifications every 8 seconds (4s display + 4s rest)
- **Integration**: react-hot-toast for bottom-center positioning
- **Content**: Recent customer purchases with localized messaging

#### Email Delivery System
- **Provider**: Mailjet with template-based emails
- **Trigger**: Successful payment callback processing
- **Template Variables**: Customer name, order number, product details, download link
- **Error Handling**: Comprehensive logging with retry capability
- **Delivery Tracking**: Email logs table for monitoring

### Development Guidelines

#### Validation Requirements
- **Name**: Maximum 30 characters, required field
- **Email**: Valid format validation with database uniqueness check
- **Phone**: Malaysian format `01[0-9]{8,9}` (10-11 digits total)
- **Payment**: FPX bank transfer only via SecurePay.my

#### Security Best Practices
- All API keys stored in environment variables (never client-side)
- HMAC-SHA256 signature validation for payment webhooks
- Session-based admin authentication with automatic expiry
- Comprehensive transaction logging without sensitive data exposure
- Server-side validation for all user inputs

#### Module System and Code Patterns
- **ES6 Modules**: Used for React components and frontend code
- **CommonJS**: Used for Node.js backend modules (Mailjet, logger)
- **CSS Modules**: Component-scoped styling pattern
- **Async/Await**: Consistent asynchronous operation handling
- **Error Handling**: Try-catch blocks with comprehensive logging

### Environment Variables Required

**Core Application:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for backend operations
- `NEXT_PUBLIC_APP_URL` - Application base URL for callbacks and redirects

**SecurePay Integration:**
- `SECUREPAY_API_UID` - SecurePay merchant API UID
- `SECUREPAY_AUTH_TOKEN` - SecurePay authentication token
- `SECUREPAY_CHECKSUM_TOKEN` - SecurePay checksum token for HMAC-SHA256 signatures
- `SECUREPAY_API_BASE_URL_SANDBOX` - SecurePay sandbox URL (e.g., https://sandbox.securepay.my)

**Email Service (Mailjet):**
- `MJ_APIKEY_PUBLIC` - Mailjet public API key
- `MJ_APIKEY_PRIVATE` - Mailjet private API key
- `MJ_SENDER_EMAIL` - Verified sender email address
- `MJ_TEMPLATE_ID_PURCHASE_CONFIRMATION` - Mailjet template ID for purchase emails

### SecurePay Integration Details

#### Authentication Method
- **Type**: Basic Authentication (UID:AUTH_TOKEN)
- **Content-Type**: `application/x-www-form-urlencoded` (not JSON)
- **API Endpoint**: `/apis/payments` (appended to base URL)

#### Signature Generation (HMAC-SHA256)
Parameters in alphabetical order for checksum:
1. buyer_email
2. buyer_name  
3. buyer_phone
4. callback_url
5. order_number
6. product_description
7. redirect_url
8. transaction_amount
9. uid

Values joined with pipe delimiter (`|`) and signed with checksum token.

#### Callback Validation
- **Signature Format**: SHA256 hash of `${authToken}${order_number}${payment_status}${merchant_reference_number}${amount}`
- **Validation**: Timing-safe comparison to prevent timing attacks
- **Response**: Always return HTTP 200 to acknowledge receipt

### Database Operations Architecture

**Centralized Pattern via `/lib/supabase.js`:**
- `addCustomer(customerData)` - Customer creation with validation
- `getCustomer(customerId)` - Retrieve customer by ID
- `getCustomers()` - Fetch all customers for admin
- `updateCustomer(customerId, updates)` - Payment status updates
- `addOrder(orderData)` - Order creation linked to customers
- Service role key usage to bypass Row Level Security (RLS)

**Settings Management via `/lib/settings.js`:**
- `getProductSettings()` - Cached product configuration
- `getPaymentSettings()` - Payment-specific settings with string conversion
- `formatPrice(price, currency)` - Consistent price formatting
- `clearSettingsCache()` - Cache invalidation for updates

### Admin System Architecture

#### Authentication System
- **Method**: Session-based authentication with SHA256 password hashing
- **Sessions**: Stored in admin.session_data (JSONB)
- **Middleware**: `requireAuth()` wrapper for protected endpoints
- **Expiry**: Automatic session cleanup with configurable timeouts

#### Dashboard Functionality
- **Real-time Metrics**: Customer counts, revenue calculations, conversion rates
- **Revenue Calculation**: Dynamic product pricing × paid customer count
- **Time-based Analytics**: Today vs total, week-over-week growth
- **Recent Activity**: Last 10 paid customers with relative timestamps
- **Status Breakdown**: Payment status distribution (paid, pending, failed)

#### Customer Management
- **CRUD Operations**: Full customer lifecycle management
- **Search & Filter**: Email, name, and status filtering
- **Payment Tracking**: Status updates and transaction monitoring
- **Data Export**: CSV export capability (implementation ready)

#### Settings Management
- **Dynamic Configuration**: Product pricing, descriptions, download links
- **Cache Management**: 5-minute cache with automatic invalidation
- **Admin Interface**: Web-based configuration updates
- **Fallback Values**: Default settings for system reliability

### Current Implementation Status

**✅ Completed Features:**
- Complete payment processing with SecurePay integration
- Customer data collection and comprehensive validation
- HMAC-SHA256 signature validation for security
- Social proof notifications system with react-hot-toast
- Full admin authentication and session management
- Real-time admin dashboard with analytics
- Customer management with search and filtering
- Dynamic settings configuration system
- Email delivery system with Mailjet integration
- Comprehensive transaction logging system
- Database schema with proper relationships and constraints
- CSS Modules styling with responsive design
- SEO optimization with meta tags and Open Graph

**⚠️ Pending Implementation:**
- Rate limiting for API endpoints
- IP address validation for payment callbacks
- Automated social_noti.json updates from database
- CSV export functionality for customer data
- Email template customization interface
- Performance monitoring and alerting

### File Structure

```
/pages/
  ├── api/
  │   ├── admin/
  │   │   ├── customers.js         (Customer CRUD operations)
  │   │   ├── dashboard.js         (Analytics and metrics)
  │   │   ├── login.js             (Admin authentication)
  │   │   ├── logout.js            (Session cleanup)
  │   │   ├── settings.js          (Configuration management)
  │   │   └── validate-session.js  (Session validation)
  │   ├── create-payment-session.js (Payment initiation)
  │   ├── customers.js             (Basic customer operations)
  │   ├── hello.js                 (API health check)
  │   └── payment-callback.js      (SecurePay webhook handler)
  ├── admin/
  │   ├── customers.js             (Customer management UI)
  │   ├── index.js                 (Admin dashboard)
  │   ├── login.js                 (Login interface)
  │   └── settings.js              (Settings management UI)
  ├── _app.js                      (Next.js app wrapper)
  ├── _document.js                 (Custom document structure)
  ├── checkout.js                  (Checkout form)
  ├── index.js                     (Landing page)
  ├── payment-status.js            (Payment result page)
  └── thankyou.js                  (Success confirmation)

/components/
  ├── AdminLayout.js               (Admin interface layout)
  └── SocialProof.js               (Social proof notifications)

/lib/
  ├── adminAuth.js                 (Authentication middleware)
  ├── logger.js                    (Transaction logging system)
  ├── mailjet.js                   (Email service integration)
  ├── settings.js                  (Configuration management)
  └── supabase.js                  (Database operations)

/styles/
  ├── Checkout.module.css          (Checkout page styling)
  ├── Customers.module.css         (Admin customer management)
  ├── Home.module.css              (Global component styles)
  └── globals.css                  (Application-wide styles)

/public/
  ├── robots.txt                   (SEO crawler instructions)
  └── social_noti.json             (Social proof data source)

/Briefing/                         (Project documentation)
/transaction.log                   (Application logs)
```

### Performance and Security Features

#### Caching Strategy
- **Settings Cache**: 5-minute cache for product configuration
- **Database Queries**: Optimized with select projections and indexing
- **Static Assets**: Vercel Edge CDN for global distribution

#### Security Measures
- **Payment Validation**: Multiple signature verification layers
- **Session Security**: HttpOnly cookies with secure flags
- **Input Sanitization**: Server-side validation for all user inputs
- **Error Handling**: Secure error messages without data exposure
- **Audit Logging**: Comprehensive transaction and security event logging

#### Monitoring and Debugging
- **Transaction Logs**: File-based logging with structured data
- **Error Tracking**: Comprehensive error capture and reporting
- **Performance Metrics**: Database query monitoring
- **Payment Tracking**: Full audit trail for financial transactions

### Testing and Quality Assurance

#### Manual Testing Procedures
1. **Payment Flow Testing**: End-to-end transaction testing with SecurePay sandbox
2. **Admin Functionality**: Dashboard, customer management, and settings validation
3. **Security Testing**: Input validation, authentication, and authorization checks
4. **Email Delivery**: Mailjet integration and template rendering verification
5. **Cross-browser Testing**: Chrome, Firefox, Safari, Mobile browsers

#### Code Quality Standards
- **ESLint Integration**: Next.js configuration for code quality
- **Error Handling**: Comprehensive try-catch blocks with logging
- **Input Validation**: Server-side validation for all user inputs
- **Security Practices**: No sensitive data in client-side code
- **Performance**: Optimized database queries and caching strategies

### Deployment and Production Notes

#### Vercel Configuration
- **Automatic Deployment**: GitHub integration with main branch
- **Environment Variables**: Production values configured in Vercel dashboard
- **Analytics**: Vercel Analytics enabled for traffic monitoring
- **Edge Functions**: API routes deployed to Vercel Edge Network

#### Production Environment Setup
1. **Database**: Supabase production instance with proper RLS policies
2. **Payment Gateway**: SecurePay production credentials and endpoints
3. **Email Service**: Mailjet production account with verified sender domain
4. **Domain Configuration**: Custom domain with SSL certificate
5. **Monitoring**: Error tracking and performance monitoring setup

This comprehensive documentation serves as the definitive guide for understanding, maintaining, and extending the KelasGPT sales platform.
