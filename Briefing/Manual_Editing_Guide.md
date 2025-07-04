# Manual Editing Guide: Modular Components

This guide outlines the key files associated with different modular components of the application. When making manual edits, refer to this guide to identify the relevant files that might need modification.

---

## 1. Sales Page (Homepage)

If you need to modify the main sales page content, layout, or its direct functionalities:

-   **UI & Content:**
    -   `pages/index.js`: The main React component for the sales page, containing the structure, text, and integration of other components like SocialProof.
    -   `styles/Home.module.css`: CSS module for styling the sales page elements.
-   **SEO & Metadata:**
    -   `pages/index.js`: Contains `<Head>` component for SEO meta tags (title, description, Open Graph).
    -   `public/favicon.ico`: The favicon displayed in the browser tab.
    -   `public/og-image.png`: The Open Graph image used for social media sharing.
-   **Social Proof Integration:**
    -   `components/SocialProof.js`: The React component responsible for fetching and displaying social proof notifications.
    -   `public/social_noti.json`: The JSON file that serves as the data source for social proof notifications.
-   **"Buy Now" Button:**
    -   `pages/index.js`: The button element and its `Link` component pointing to the checkout page.

---

## 2. Checkout System

For changes related to the customer checkout form, payment session creation, or the thank you page:

-   **Checkout Form UI & Client-Side Logic:**
    -   `pages/checkout.js`: The React component for the checkout form, handling user input, client-side validation, and initiating the payment session API call.
    -   `styles/Home.module.css`: Styling for the checkout form elements.
-   **Payment Session Creation (Backend API):**
    -   `pages/api/create-payment-session.js`: The Next.js API route that receives checkout data, performs server-side validation, interacts with SecurePay API, and saves customer data to Supabase.
    -   `lib/supabase.js`: Supabase client initialization used for database interactions.
-   **Thank You Page:**
    -   `pages/thankyou.js`: The React component for the post-payment thank you message.
    -   `styles/Home.module.css`: Styling for the thank you page.
-   **Payment Status Page (Redirect from SecurePay):**
    -   `pages/payment-status.js`: The page where users are redirected after completing payment on SecurePay's site. It displays a message based on URL parameters.

---

## 3. Payment Processing (Callbacks & Webhooks)

Modifications concerning how the application receives and processes payment confirmations from SecurePay:

-   **Payment Callback API:**
    -   `pages/api/payment-callback.js`: The critical Next.js API route that receives webhooks from SecurePay, validates signatures, updates payment status in Supabase, and triggers post-payment actions like email delivery.
    -   `lib/supabase.js`: Supabase client initialization for updating customer/order status.
    -   `lib/mailjet.js`: Mailjet client initialization for sending transactional emails.

---

## 4. Administrative Dashboard

For any changes to the admin panel, including login, customer management, settings, or dashboard overview:

-   **Admin UI Components:**
    -   `pages/admin/index.js`: The main admin dashboard overview page.
    -   `pages/admin/login.js`: The admin login page.
    -   `pages/admin/customers.js`: The customer management page (listing, search, filter, export).
    -   `pages/admin/settings.js`: The platform settings configuration page.
    -   `components/AdminLayout.js`: The shared layout component for all admin pages, providing navigation and consistent styling.
    -   `styles/Home.module.css`: General styling used across some admin pages.
    -   `styles/Customers.module.css`: Specific styling for the customer management table.
-   **Admin Backend API Routes:**
    -   `pages/api/admin/login.js`: Handles admin authentication.
    -   `pages/api/admin/dashboard.js`: Provides data for the admin dashboard overview.
    -   `pages/api/admin/customers.js`: Handles fetching, searching, filtering, and exporting customer data for the admin panel.
    -   `pages/api/admin/settings.js`: Manages reading and updating platform settings.
    -   `pages/api/admin/validate-session.js`: API route to validate an admin's session.
    -   `pages/api/admin/logout.js`: Handles admin logout.
-   **Admin Authentication & Authorization:**
    -   `lib/adminAuth.js`: Contains utility functions for validating admin sessions and middleware for protecting API routes.
    -   `lib/supabase.js`: Supabase client initialization for admin-related database interactions.

---

## 5. Shared Libraries & Utilities

These files provide core functionalities used across multiple parts of the application:

-   `lib/supabase.js`: Centralized Supabase client setup. Any changes to how the application connects to or interacts with Supabase should start here.
-   `lib/mailjet.js`: Centralized Mailjet client setup. Used for sending emails.
-   `lib/adminAuth.js`: Core logic for admin session management and authentication.

---

## 6. Project Configuration & General Files

These files control the overall project setup, dependencies, and build process:

-   `next.config.mjs`: Next.js specific configurations.
-   `package.json`: Project metadata and dependencies.
-   `package-lock.json`: Exact dependency versions.
-   `eslint.config.mjs`: ESLint configuration for code linting.
-   `jsconfig.json`: JavaScript language service configuration (for VS Code, etc.).
-   `.gitignore`: Specifies files and directories to be ignored by Git.
-   `README.md`: Project overview and setup instructions.

---

## 7. Documentation & Guidelines

These files provide context, requirements, and additional guidance:

-   `Guideline Doc/DocForLLM.SecurePay MY API Guideline.md`: Detailed guide on SecurePay integration.
-   `Guideline Doc/PRD.md`: Product Requirements Document, outlining features and technical architecture.
-   `Guideline Doc/supabase public schema context.md`: Business context for the Supabase database schema.
-   `Guideline Doc/supabase-public-schema.md`: The raw Supabase database schema definition.
-   `Guideline Doc/TODO.md`: The project's current to-do list.
-   `Guideline Doc/Manual_Editing_Guide.md`: This very guide!
