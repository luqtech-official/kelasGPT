# Digital Product Sales Platform
## Product Requirements Document (PRD)

---

## 1. Project Overview

### 1.1 Purpose
This project involves building a complete digital product sales platform designed specifically for the Malaysian market. The platform will feature a sales page, secure checkout system, payment processing, and administrative dashboard to manage a single digital product offering.

### 1.2 Target Market
- **Geographic Focus**: Malaysia (both locals and foreigners residing in Malaysia)
- **Product Type**: Single digital product with no variations
- **Compliance**: No strict GDPR requirements due to Malaysian focus

### 1.3 Business Model
- Single digital product sales
- Direct-to-consumer approach
- Automated delivery via email upon successful payment

---

## 2. Technical Architecture

### 2.1 Infrastructure Stack
The platform will be built using cost-effective, scalable solutions:

- **Hosting**: Vercel (Free/Hobby Plan)
- **Database**: Supabase (Free Tier) - Customer data and admin authentication
- **CDN**: Cloudflare (Free Tier) - Image optimization and delivery
- **Payment Gateway**: Securepay.my - Malaysian payment processing via API
- **Email Service**: Mailjet (Free Tier) - Product delivery emails
- **Configuration**: Environment variables (.env) for API keys and credentials

### 2.2 Technology Stack
- **Framework**: Next.js (React-based)
- **Markup**: HTML5
- **Styling**: Vanilla CSS (No Tailwind CSS)
- **Libraries**: Lightweight Next.js/JavaScript libraries only
- **Analytics**: Vercel Analytics

---

## 3. Core Features & Functionality

### 3.1 Sales Page
The main customer-facing landing page that showcases the digital product.

**Requirements:**
- Complete copywriting framework implementation
- Search Engine Optimization (SEO) tags
- Open Graph meta tags for social media sharing
- Custom favicon
- "Buy Now" button leading to checkout page
- Social proof notifications (see Section 3.5)
- Mobile-responsive design

### 3.2 Checkout System
Secure form for capturing customer information and processing payments.

**Customer Data Collection:**
- Full name (mandatory, max 30 characters)
- Email address (mandatory, validated format)
- Phone number (mandatory, Malaysian format: 010-019 prefix, 10-11 digits)

**Security Features:**
- Hidden honeypot field for bot prevention
- Server-side input validation
- Rate limiting per IP address
- SQL injection prevention
- Double-submission prevention

**Payment Flow:**
1. Customer completes checkout form
2. System validates all inputs server-side
3. Creates secure payment session with unique order number
4. Redirects to Securepay.my payment gateway
5. Processes payment callback securely
6. Updates payment status in database
7. Sends product delivery email
8. Redirects to thank you page

### 3.3 Administrative Dashboard
Secure backend interface for managing the platform and monitoring sales.

**Access Control:**
- Single administrator account
- Secure login with session management
- Automatic redirect to login page if not authenticated
- Manual password reset via Supabase (no automated system)

**Dashboard Sections:**

#### 3.3.1 Main Dashboard (`/admin/main`)
- Daily session statistics
- Unique visitor counts
- Daily customer purchases
- Revenue tracking
- Recent activity overview

#### 3.3.2 Settings Page (`/admin/setting`)
- Sales page configuration options
- Social notification banner settings (colors, fonts)
- Email template customization
- Product link management

#### 3.3.3 Customer Management (`/admin/customer`)
- Tabular view of all customers
- Customer details display
- Payment status tracking
- Search and filter capabilities
- Export functionality

### 3.4 Payment Processing Integration

**Securepay.my Configuration:**
- FPX bank transfer method only
- Additional checksum validation
- Webhook signature verification
- IP address validation for callbacks

**Security Measures:**
- Sender verification through signature validation
- Immediate HTTP 200 response to webhooks
- Asynchronous payment processing
- Error logging and admin notifications
- Idempotent payment session creation

**Payment Flow Security:**
1. Validate payment gateway signature
2. Check for existing unpaid sessions
3. Update payment status only if currently unpaid
4. Log all payment events
5. Send confirmation email upon success

### 3.5 Social Proof Notifications
Dynamic banner system displaying recent customer activity.

**Implementation:**
- Data source: `social_noti.json` file (updated every 5 minutes from Supabase)
- Display: Rotating banners at top of sales page
- Timing: 4 seconds per banner, 4 seconds rest between banners
- Ordering: Latest notifications first (by timestamp)
- Customization: Banner and font colors configurable in admin settings

### 3.6 Automated Email Delivery
Immediate product delivery system upon successful payment.

**Email Components:**
- Personalized customer details
- Product download link (Google Drive shared link)
- Welcome message and instructions
- No expiration or download limits

**Technical Requirements:**
- Mailjet API integration
- SPF/DKIM/DMARC configuration for deliverability
- Triggered by successful payment webhook
- Error handling and retry logic
- Admin notification on delivery failures

---

## 4. Security Requirements

### 4.1 Data Protection
- All sensitive API keys stored in environment variables
- No credentials exposed to client-side code
- Server-side validation for all user inputs
- SQL injection prevention measures
- XSS (Cross-Site Scripting) protection

### 4.2 Payment Security
- Webhook signature verification
- IP address validation for payment callbacks
- Secure session management
- Payment status verification before processing
- Audit trail for all payment events

### 4.3 Access Control
- Admin session management
- Secure authentication for administrative functions
- Rate limiting on all public endpoints
- Bot detection and prevention
- User agent validation

### 4.4 Monitoring & Logging
- Comprehensive error logging (without sensitive data)
- Admin email notifications for critical errors
- Payment callback logging
- Failed login attempt tracking
- Performance monitoring

---

## 5. Technical Specifications

### 5.1 Database Schema (Supabase)
**Customer Table:**
- Customer ID (primary key)
- Full name
- Email address
- Phone number
- Order number
- Payment status
- Created timestamp
- Updated timestamp
- IP address (for security)
- User agent (for security)

**Admin Table:**
- Admin ID
- Username
- Password hash
- Last login timestamp
- Session data

**Social Notifications Table:**
- Notification ID
- Customer name (anonymized)
- Purchase timestamp
- Display status

### 5.2 API Endpoints
- `POST /api/checkout` - Process checkout form
- `POST /api/payment/callback` - Handle payment webhooks
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/customers` - Customer list
- `POST /api/admin/settings` - Update configuration

### 5.3 File Structure
```
/pages
  /admin
    index.js (dashboard)
    login.js
    settings.js
    customers.js
  /api
    /admin
    /payment
  checkout.js
  thankyou.js
  index.js (sales page)
/components
/styles
/public
  social_noti.json
  robots.txt
```

---

## 6. SEO & Performance

### 6.1 Search Engine Optimization
- Meta title and description tags
- Open Graph tags for social sharing
- Structured data markup
- XML sitemap generation
- Robots.txt configuration (excluding admin pages)

### 6.2 Performance Optimization
- Image optimization via Cloudflare CDN
- Minimal JavaScript bundle size
- CSS optimization
- Lazy loading where appropriate
- Vercel Edge Functions for dynamic content

---

## 7. Content Management

### 7.1 Static Content
- Sales page copywriting (complete framework)
- Email templates
- Error messages
- Thank you page content

### 7.2 Dynamic Content
- Social proof notifications
- Customer dashboard data
- Real-time payment status updates

---

## 8. Development & Deployment

### 8.1 Development Workflow
- GitHub repository for version control
- Vercel automatic deployment from GitHub
- Environment variable management
- Manual testing and quality assurance

### 8.2 Code Standards
- Intuitive and descriptive comments for all functions
- Consistent naming conventions
- Error handling throughout the application
- Security best practices implementation

### 8.3 Testing Strategy
- Manual testing by developer
- Payment flow testing with test transactions
- Admin functionality verification
- Email delivery testing
- Security vulnerability assessment

---

## 9. Maintenance & Support

### 9.1 Ongoing Tasks
- Monitor payment callback logs
- Update social notifications data
- Manage product delivery links
- Handle customer support inquiries

### 9.2 Backup & Recovery
- Supabase automatic backups
- Environment configuration backup
- Code repository maintenance
- Manual disaster recovery procedures

---

## 10. Success Metrics

### 10.1 Key Performance Indicators
- Daily unique visitors
- Conversion rate (visitors to customers)
- Payment success rate
- Email delivery success rate
- Page load performance
- Admin dashboard response times

### 10.2 Monitoring Tools
- Vercel Analytics for traffic data
- Supabase logs for database operations
- Payment gateway transaction logs
- Email delivery reports from Mailjet

---

## 11. Future Considerations

### 11.1 Scalability
- Database optimization as customer base grows
- CDN performance monitoring
- Payment processing volume limits
- Email sending limits

### 11.2 Feature Enhancements (Not Required Initially)
- Multiple product support
- Advanced customer segmentation
- Automated marketing campaigns
- Enhanced analytics dashboard
- Mobile application
- Advanced accessibility features

---

*This PRD serves as the comprehensive guide for developing a secure, efficient, and user-friendly digital product sales platform tailored for the Malaysian market.*