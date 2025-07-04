# Project To-Do List

Based on the Product Requirements Document (PRD), here's a comprehensive to-do list for the Digital Product Sales Platform:

## 1. Sales Page (index.js)
- [ ] Complete copywriting framework implementation.
- [x] Implement SEO meta tags (title, description).
- [x] Implement Open Graph meta tags for social media sharing.
- [x] Ensure custom favicon is correctly implemented and displayed.
- [x] Verify "Buy Now" button correctly links to the checkout page.
- [ ] Implement social proof notifications (display logic, timing, ordering).
- [ ] Ensure mobile-responsive design is fully functional across devices.

## 2. Checkout System (checkout.js, api/create-payment-session.js)
- [x] Implement customer data collection form fields (Full name, Email, Phone number).
- [x] Implement client-side validation for form fields.
- [x] Implement server-side input validation for all fields.
- [x] Implement hidden honeypot field for bot prevention.
- [ ] Implement rate limiting per IP address for checkout submissions.
- [x] Implement SQL injection prevention measures for all database interactions.
- [x] Implement double-submission prevention for checkout form.
- [x] Develop logic for creating secure payment session with unique order number.
- [x] Implement redirection to Securepay.my payment gateway.
- [x] Develop secure payment callback processing (api/payment-callback.js).
- [x] Implement updating payment status in database.
- [ ] Implement sending product delivery email upon successful payment.
- [x] Implement redirection to thank you page (thankyou.js).

## 3. Administrative Dashboard (admin/index.js, admin/login.js, admin/settings.js, admin/customers.js)
- [ ] Implement single administrator account access control.
- [x] Implement secure login with session management.
- [ ] Implement automatic redirect to login page if not authenticated.
- [ ] Document manual password reset via Supabase.
- [ ] **Main Dashboard (`/admin/main`):**
    - [ ] Display daily session statistics.
    - [ ] Display unique visitor counts.
    - [ ] Display daily customer purchases.
    - [ ] Implement revenue tracking display.
    - [ ] Display recent activity overview.
- [x] **Settings Page (`/admin/setting`):**
    - [ ] Implement sales page configuration options.
    - [x] Implement social notification banner settings (colors, fonts).
    - [ ] Implement email template customization.
    - [ ] Implement product link management.
- [x] **Customer Management (`/admin/customer`):**
    - [x] Implement tabular view of all customers.
    - [x] Implement customer details display.
    - [x] Implement payment status tracking.
    - [x] Implement search and filter capabilities.
    - [ ] Implement export functionality.

## 4. Payment Processing Integration (api/payment/callback.js)
- [ ] Configure Securepay.my for FPX bank transfer method only.
- [x] Implement additional checksum validation for Securepay.my.
- [x] Implement webhook signature verification.
- [ ] Implement IP address validation for callbacks.
- [x] Implement sender verification through signature validation.
- [x] Ensure immediate HTTP 200 response to webhooks.
- [x] Implement asynchronous payment processing.
- [x] Implement error logging and admin notifications for payment processing.
- [ ] Implement idempotent payment session creation.
- [x] Implement payment gateway signature validation.
- [ ] Implement check for existing unpaid sessions.
- [x] Implement logic to update payment status only if currently unpaid.
- [x] Log all payment events.
- [ ] Send confirmation email upon successful payment.

## 5. Social Proof Notifications
- [ ] Develop mechanism to update `social_noti.json` file every 5 minutes from Supabase.
- [x] Implement display logic for rotating banners at top of sales page.
- [x] Implement timing: 4 seconds per banner, 4 seconds rest between banners.
- [x] Implement ordering: Latest notifications first (by timestamp).
- [ ] Integrate customization from admin settings for banner and font colors.

## 6. Automated Email Delivery (lib/mailjet.js)
- [x] Integrate Mailjet API for email sending.
- [ ] Ensure SPF/DKIM/DMARC configuration for deliverability (external task, but crucial).
- [ ] Trigger email sending by successful payment webhook.
- [ ] Implement error handling and retry logic for email delivery.
- [ ] Implement admin notification on email delivery failures.
- [ ] Personalize email with customer details.
- [ ] Include product download link (Google Drive shared link).
- [ ] Include welcome message and instructions.

## 7. Security Requirements
- [x] Ensure all sensitive API keys are stored in environment variables.
- [x] Verify no credentials are exposed to client-side code.
- [x] Implement server-side validation for all user inputs.
- [x] Implement SQL injection prevention measures.
- [ ] Implement XSS (Cross-Site Scripting) protection.
- [x] Implement webhook signature verification.
- [ ] Implement IP address validation for payment callbacks.
- [x] Implement secure session management.
- [ ] Implement payment status verification before processing.
- [x] Implement audit trail for all payment events.
- [x] Implement admin session management.
- [x] Implement secure authentication for administrative functions.
- [ ] Implement rate limiting on all public endpoints.
- [x] Implement bot detection and prevention.
- [x] Implement user agent validation.
- [x] Implement comprehensive error logging (without sensitive data).
- [ ] Implement admin email notifications for critical errors.
- [x] Implement payment callback logging.
- [ ] Implement failed login attempt tracking.
- [ ] Implement performance monitoring.

## 8. Technical Specifications
- [x] **Database Schema (Supabase):**
    - [x] Create `Customer` table with specified fields.
    - [ ] Create `Admin` table with specified fields.
    - [ ] Create `Social Notifications` table with specified fields.
- [x] **API Endpoints:**
    - [x] `POST /api/checkout` - Implement and test.
    - [x] `POST /api/payment/callback` - Implement and test.
    - [ ] `POST /api/admin/login` - Implement and test.
    - [ ] `GET /api/admin/dashboard` - Implement and test.
    - [ ] `GET /api/admin/customers` - Implement and test.
    - [ ] `POST /api/admin/settings` - Implement and test.

## 9. SEO & Performance
- [x] Implement meta title and description tags.
- [x] Implement Open Graph tags for social sharing.
- [ ] Implement structured data markup.
- [ ] Generate XML sitemap.
- [x] Configure `robots.txt` (excluding admin pages).
- [ ] Implement image optimization via Cloudflare CDN.
- [ ] Optimize JavaScript bundle size.
- [ ] Optimize CSS.
- [ ] Implement lazy loading where appropriate.
- [ ] Utilize Vercel Edge Functions for dynamic content where beneficial.

## 10. Content Management
- [ ] Finalize sales page copywriting.
- [ ] Create email templates.
- [ ] Define error messages.
- [x] Finalize thank you page content.
- [ ] Ensure dynamic content (social proof, customer dashboard, real-time payment status) is correctly displayed and updated.

## 11. Development & Deployment
- [x] Ensure GitHub repository is set up for version control.
- [ ] Configure Vercel automatic deployment from GitHub.
- [x] Implement environment variable management.
- [ ] Conduct thorough manual testing and quality assurance.
- [x] Adhere to code standards: intuitive comments, consistent naming, error handling, security best practices.
- [ ] **Testing Strategy:**
    - [ ] Conduct manual testing by developer.
    - [ ] Conduct payment flow testing with test transactions.
    - [ ] Verify admin functionality.
    - [ ] Conduct email delivery testing.
    - [ ] Conduct security vulnerability assessment.

## 12. Maintenance & Support
- [ ] Establish procedures for monitoring payment callback logs.
- [ ] Establish procedures for updating social notifications data.
- [ ] Establish procedures for managing product delivery links.
- [ ] Establish procedures for handling customer support inquiries.
- [ ] Verify Supabase automatic backups are configured.
- [ ] Ensure environment configuration backup procedures are in place.
- [ ] Maintain code repository.
- [ ] Document manual disaster recovery procedures.

## 13. Success Metrics & Monitoring Tools
- [ ] Set up monitoring for daily unique visitors.
- [ ] Set up monitoring for conversion rate (visitors to customers).
- [ ] Set up monitoring for payment success rate.
- [ ] Set up monitoring for email delivery success rate.
- [ ] Set up monitoring for page load performance.
- [ ] Set up monitoring for admin dashboard response times.
- [ ] Utilize Vercel Analytics for traffic data.
- [ ] Utilize Supabase logs for database operations.
- [ ] Utilize payment gateway transaction logs.
- [ ] Utilize email delivery reports from Mailjet.