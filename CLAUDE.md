# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing
No specific test commands configured. Check for test files or add test setup if needed.

## Project Overview

This is a complete digital product sales platform for "KelasGPT" - a GPT-4 learning course platform in Malay language, designed specifically for the Malaysian market. The platform features a sales page, secure checkout system, payment processing, and administrative dashboard for managing a single digital product offering.

### Business Model
- Single digital product sales (no variations)
- Direct-to-consumer approach
- Automated delivery via email upon successful payment
- Malaysian market focus with FPX bank transfer payment method

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.3.4 with Pages Router
- **Frontend**: React 19, Vanilla CSS (no Tailwind)
- **Database**: Supabase for customer data and admin authentication
- **Payment**: SecurePay.my for Malaysian payment processing
- **Email**: Mailjet for product delivery and notifications
- **Hosting**: Vercel with Cloudflare CDN
- **Analytics**: Vercel Analytics

### Core Architecture

#### Database Layer (`/lib/`)
- `supabase.js` - Database client configuration using environment variables
- `mailjet.js` - Email service configuration (uses CommonJS module syntax)

#### Database Schema (Supabase)
Complete schema with the following main tables:
- **customers** - Customer data with payment status, UTM tracking, and metadata
- **orders** - Order management with product details and fulfillment tracking
- **payment_sessions** - Secure payment session management with gateway integration
- **admin** - Administrative users with role-based access control
- **email_logs** - Email delivery tracking and status monitoring
- **webhook_logs** - Webhook request logging for security and debugging
- **settings** - Dynamic configuration management

#### API Layer (`/pages/api/`)
- `create-payment-session.js` - Handles checkout form submission, customer validation, and SecurePay integration
- `payment-callback.js` - Processes SecurePay payment callbacks with signature validation
- Future API endpoints for admin functionality:
  - `POST /api/admin/login` - Admin authentication
  - `GET /api/admin/dashboard` - Dashboard data
  - `GET /api/admin/customers` - Customer list
  - `POST /api/admin/settings` - Update configuration

#### Frontend Pages (`/pages/`)
- `index.js` - Landing page with complete copywriting framework, SEO tags, and social proof
- `checkout.js` - Customer information form with Malaysian phone validation and security features
- `payment-status.js` - Payment result handling with redirect parameters
- `thankyou.js` - Success confirmation page
- `admin/` - Admin dashboard with customer management, analytics, and settings

#### Components (`/components/`)
- `SocialProof.js` - Displays rotating toast notifications from `/public/social_noti.json`

### Business Logic Patterns

#### Payment Flow (SecurePay Integration)
1. Customer completes checkout form with validation (name max 30 chars, Malaysian phone format `01[0-9]{8,9}`)
2. Honeypot spam protection and server-side validation
3. Customer saved to Supabase with `pending` status
4. SecurePay payment session created with SHA256 signature validation
5. Customer redirected to SecurePay payment gateway
6. Payment callback validates signature and updates status to `paid`/`failed`
7. Automated email delivery with product download link
8. Customer redirected to appropriate status page

#### Security Features
- **Payment Security**: SHA256 signature validation for all SecurePay webhooks
- **Anti-Bot Protection**: Honeypot fields and rate limiting
- **Data Protection**: Server-side validation, SQL injection prevention, XSS protection
- **Session Security**: Secure admin authentication and session management
- **Audit Trail**: Comprehensive logging of payments, emails, and webhooks

#### Social Proof System
- Data source: `social_noti.json` updated every 5 minutes from Supabase
- Display: Rotating banners with 4-second display + 4-second rest
- Customizable colors and fonts via admin settings
- Latest notifications displayed first

### Development Guidelines

#### Validation Requirements
- **Name**: Maximum 30 characters, required
- **Email**: Valid format, unique per customer
- **Phone**: Malaysian format `01[0-9]{8,9}` (10-11 digits)
- **Payment**: FPX bank transfer only via SecurePay.my

#### Security Best Practices
- All API keys stored in environment variables
- Never expose credentials to client-side code
- Validate all webhook signatures using SHA256
- Implement comprehensive error logging without sensitive data
- Use IP address validation for payment callbacks

#### Email Delivery
- Mailjet integration for product delivery
- SPF/DKIM/DMARC configuration required for deliverability
- Automated retry logic for failed deliveries
- Comprehensive delivery status tracking

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SECUREPAY_API_UID` - SecurePay merchant ID
- `SECUREPAY_AUTH_TOKEN` - SecurePay authentication token
- `SECUREPAY_API_BASE_URL_SANDBOX` - SecurePay sandbox URL (switch to production when live)
- `NEXT_PUBLIC_APP_URL` - Application base URL for callbacks
- `MJ_APIKEY_PUBLIC` - Mailjet public API key
- `MJ_APIKEY_PRIVATE` - Mailjet private API key

### Current Implementation Status
Based on TODO.md analysis:
- ✅ Basic payment flow implemented
- ✅ Customer data collection and validation
- ✅ SecurePay integration with signature validation
- ✅ Social proof notifications system
- ✅ Basic admin customer management
- ⚠️ Admin authentication system incomplete
- ⚠️ Email delivery system not fully implemented
- ⚠️ Rate limiting and advanced security measures pending
- ⚠️ Analytics and reporting features incomplete

### Module System
Uses mixed module systems: ES6 imports/exports for React components and CommonJS for Node.js modules like Mailjet.

### Styling
CSS Modules pattern used (`styles/Home.module.css`, `styles/Customers.module.css`) with component-scoped styling.