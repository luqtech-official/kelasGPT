# Manual Editing Guide for KelasGPT Platform

**Last Updated**: 2025-07-05  
**Platform Status**: Production-Ready Digital Product Sales Platform

This guide provides a comprehensive mapping of all files in the KelasGPT codebase, organized by functional areas to help you quickly locate and modify the specific components you need.

---

## 1. Sales Page & Landing Experience

If you need to modify the main sales page content, layout, or its direct functionalities:

### **UI & Content:**
- **`pages/index.js`**: Complete sales landing page with extensive copywriting framework, dynamic pricing from settings, SEO optimization, and social proof integration
- **`styles/Home.module.css`**: Comprehensive sales page styling with responsive design, hero sections, feature cards, and mobile optimization

### **SEO & Metadata:**
- **`pages/index.js`**: Contains `<Head>` component with complete SEO meta tags (title, description, Open Graph, Twitter cards)
- **`pages/_document.js`**: Custom document structure with Malay language (`lang="ms"`), Google Fonts preloading (Inter & Plus Jakarta Sans)
- **`public/favicon.ico`**: Main favicon for browser tabs
- **`public/robots.txt`**: SEO configuration that disallows admin directory crawling
- **Additional Icons**: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

### **Social Proof System:**
- **`components/SocialProof.js`**: React component with react-hot-toast integration, displays rotating notifications every 8 seconds (4s display + 4s rest)
- **`public/social_noti.json`**: JSON data source for social proof notifications (manually updated, contains sample customer data)

### **Navigation & CTA:**
- **`pages/index.js`**: "Buy Now" button with Next.js Link component routing to checkout page

---

## 2. Checkout & Payment System

For changes related to the customer checkout form, payment session creation, payment status, or the thank you page:

### **Checkout Form UI & Client-Side Logic:**
- **`pages/checkout.js`**: Complete checkout form with Malaysian phone validation (`01[0-9]{8,9}`), honeypot protection, real-time validation, and SecurePay integration
- **`styles/Checkout.module.css`**: Mobile-first checkout form styling with dark mode support, security badges, and responsive design

### **Payment Session Creation (Backend API):**
- **`pages/api/create-payment-session.js`**: Comprehensive checkout handler with server-side validation, SecurePay API integration, HMAC-SHA256 signature generation, customer/order creation in Supabase, and comprehensive error handling
- **`lib/supabase.js`**: Supabase client with service role key, provides CRUD operations for customers and orders with proper error handling
- **`lib/logger.js`**: Transaction logging system with severity levels (INFO, WARN, ERROR) writing to `transaction.log`

### **Payment Status & Confirmation Pages:**
- **`pages/payment-status.js`**: Payment result handling page that processes SecurePay callback parameters and displays appropriate status messages
- **`pages/thankyou.js`**: Success confirmation page in Malay language with order details and next steps
- **`styles/Home.module.css`**: Styling for both payment status and thank you pages

---

## 3. Payment Processing (Callbacks & Webhooks)

Modifications concerning how the application receives and processes payment confirmations from SecurePay:

### **Payment Callback API:**
- **`pages/api/payment-callback.js`**: Critical webhook handler that receives SecurePay callbacks, validates SHA256 signatures, updates payment status in Supabase, triggers email delivery, and handles comprehensive error scenarios
- **`lib/supabase.js`**: Database operations for updating customer/order status
- **`lib/mailjet.js`**: Email service integration using CommonJS module syntax for sending purchase confirmation emails
- **`lib/logger.js`**: Comprehensive logging for all callback events and processing status

---

## 4. Administrative Dashboard

For any changes to the admin panel, including login, customer management, settings, or dashboard overview:

### **Admin UI Components:**
- **`pages/admin/index.js`**: Real-time analytics dashboard with revenue calculations, customer metrics, conversion rates, weekly growth tracking, and recent activity feed
- **`pages/admin/login.js`**: Admin authentication interface with client-side validation, session management, and secure form handling
- **`pages/admin/customers.js`**: Advanced customer management with search, filtering, pagination, payment status tracking, and CSV export functionality
- **`pages/admin/settings.js`**: Dynamic configuration management UI for product settings, email configuration, and social proof customization
- **`components/AdminLayout.js`**: Shared authenticated layout component with navigation, session validation, logout functionality, and consistent styling

### **Admin Styling:**
- **`styles/Customers.module.css`**: Admin table styling with pagination, responsive design, and data visualization
- **`styles/Home.module.css`**: General styling used across admin pages for consistency

### **Admin Backend API Routes:**
- **`pages/api/admin/login.js`**: Session-based authentication with SHA256 password hashing and secure session management
- **`pages/api/admin/dashboard.js`**: Real-time analytics provider with revenue calculations, customer metrics, and growth tracking
- **`pages/api/admin/customers.js`**: Advanced customer management API with search, filtering, pagination, and CSV export capabilities
- **`pages/api/admin/settings.js`**: Dynamic configuration management with validation, cache clearing, and fallback handling
- **`pages/api/admin/validate-session.js`**: Session validation middleware for protected routes
- **`pages/api/admin/logout.js`**: Session cleanup and secure cookie clearing

### **Admin Authentication & Authorization:**
- **`lib/adminAuth.js`**: Core authentication middleware with session validation, cookie management, and automatic expiry handling

---

## 5. Shared Libraries & Utilities

These files provide core functionalities used across multiple parts of the application:

### **Database & External Services:**
- **`lib/supabase.js`**: Centralized Supabase client with service role key, provides CRUD operations for customers, orders, and admin operations with proper error handling
- **`lib/mailjet.js`**: Email service integration with template support for purchase confirmation emails
- **`lib/settings.js`**: Dynamic configuration management with 5-minute caching, fallback defaults, and cache invalidation for product settings

### **Security & Monitoring:**
- **`lib/adminAuth.js`**: Session-based authentication middleware with cookie validation and automatic expiry
- **`lib/logger.js`**: File-based transaction logging system with structured data and severity levels

---

## 6. Project Configuration & Build Setup

These files control the overall project setup, dependencies, and build process:

### **Core Configuration:**
- **`package.json`**: Project metadata with Next.js 15.3.4, React 19, Supabase, Mailjet, and react-hot-toast dependencies
- **`next.config.mjs`**: Next.js configuration with React strict mode and Mailjet API key exposure for client-side usage
- **`jsconfig.json`**: JavaScript configuration with path aliases (`@/*` pointing to root directory)

### **Code Quality & Standards:**
- **`eslint.config.mjs`**: ESLint configuration using Next.js core web vitals preset for code quality
- **`.gitignore`**: Git ignore patterns including `transaction.log`, environment files, and build artifacts

### **Application Logs:**
- **`transaction.log`**: Application logs showing payment session creation activities and transaction history (ignored by Git)

---

## 7. Styling & Design System

The platform uses CSS Modules for component-scoped styling:

### **Global Styles:**
- **`styles/globals.css`**: Design system with CSS variables, modern reset, typography setup using Inter and Plus Jakarta Sans fonts, and responsive breakpoints

### **Component-Specific Styles:**
- **`styles/Home.module.css`**: Comprehensive sales page styling with hero sections, feature cards, and mobile optimization
- **`styles/Checkout.module.css`**: Mobile-first checkout form styling with dark mode support and security badges
- **`styles/Customers.module.css`**: Admin table styling with pagination and responsive data visualization

---

## 8. Documentation & Guidelines

These files provide context, requirements, and implementation guidance:

### **Project Documentation:**
- **`CLAUDE.md`**: Comprehensive project documentation with architecture overview, business logic patterns, implementation status, and technical specifications
- **`README.md`**: Standard Next.js project documentation (boilerplate)

### **Briefing Documentation:**
- **`Briefing/Manual_Editing_Guide.md`**: This comprehensive file structure guide
- **`Briefing/PRD.md`**: Product Requirements Document outlining business model and technical architecture
- **`Briefing/TODO.md`**: Updated project task tracking with accurate implementation status
- **`Briefing/Codebase_Analysis.md`**: Technical analysis documentation
- **`Briefing/prod-migration-notes.md`**: Production deployment notes and considerations

### **Technical Integration Guides:**
- **`Briefing/DocForLLM.SecurePay MY API Guideline Updated.md`**: Comprehensive SecurePay integration documentation
- **`Briefing/supabase-public-schema.md`**: Database schema definition
- **`Briefing/supabase public schema context.md`**: Business context for database design

### **Design & Content Guidelines:**
- **`Briefing/Copywriting demo.md`**: Content framework and messaging guidelines
- **`Briefing/Checkout Form Style Design.md`**: UI design specifications for checkout experience

---

## 9. Next.js Framework Files

Essential Next.js framework files for application structure:

### **Core Framework:**
- **`pages/_app.js`**: Standard Next.js app wrapper importing global styles and enabling app-wide functionality
- **`pages/_document.js`**: Custom document structure with Malay language support and Google Fonts preloading

### **API Structure:**
- **`pages/api/hello.js`**: Standard Next.js API health check endpoint
- **`pages/api/customers.js`**: Basic customer CRUD operations endpoint
- **`pages/api/payment/`**: Empty directory for future payment-related endpoints

---

## 10. Environment & Deployment

### **Configuration Management:**
- Environment variables are managed through Vercel deployment settings
- **Required Variables**: Supabase credentials, SecurePay API keys, Mailjet configuration
- **Security**: All sensitive credentials stored in environment variables, never in client-side code

### **Deployment Setup:**
- **Platform**: Vercel with automatic GitHub integration
- **Domain**: Custom domain with SSL certificate
- **Analytics**: Vercel Analytics enabled for traffic monitoring
- **Performance**: Edge functions for API routes

---

## 🔧 **Quick Reference for Common Tasks**

### **Content Updates:**
- Sales page copy: `pages/index.js`
- Social proof data: `public/social_noti.json`
- Email templates: `lib/mailjet.js`

### **Payment Configuration:**
- SecurePay settings: `pages/api/create-payment-session.js`
- Webhook handling: `pages/api/payment-callback.js`
- Payment validation: Both files above

### **Admin Features:**
- Dashboard metrics: `pages/api/admin/dashboard.js`
- Customer management: `pages/admin/customers.js`
- Settings configuration: `pages/admin/settings.js`

### **Styling Changes:**
- Main sales page: `styles/Home.module.css`
- Checkout form: `styles/Checkout.module.css`
- Admin interface: `styles/Customers.module.css`
- Global styles: `styles/globals.css`

---

## ⚠️ **Important Notes**

1. **Database Operations**: All database interactions use Supabase service role key via `lib/supabase.js`
2. **Security**: Payment webhooks use SHA256 signature validation for security
3. **Logging**: All transactions are logged to `transaction.log` for audit purposes
4. **Caching**: Settings are cached for 5 minutes to improve performance
5. **Environment**: All sensitive configuration stored in environment variables
6. **Mobile-First**: All styling follows mobile-first responsive design principles

This guide reflects the current production-ready state of the KelasGPT platform with comprehensive features for Malaysian digital product sales.