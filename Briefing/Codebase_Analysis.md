# Codebase Analysis: Frontend vs. Backend

Based on the provided file structure, here's a breakdown of the frontend and backend components of this Next.js application:

## Frontend

The frontend primarily consists of the user interface and client-side logic.

*   **`pages/` (excluding `pages/api`):** These files represent the different user-facing pages of the application (e.g., `index.js`, `checkout.js`, `thankyou.js`, `payment-status.js`). These are rendered on the client-side or server-side by Next.js to produce the HTML, CSS, and JavaScript for the browser.
*   **`components/`:** This directory contains reusable React components (e.g., `AdminLayout.js`, `SocialProof.js`) that build up the user interface.
*   **`public/`:** This folder holds static assets like images (`favicon.ico`, `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) and other public files (`robots.txt`, `social_noti.json`) that are served directly to the browser.
*   **`styles/`:** This directory contains the CSS modules and global stylesheets (`Checkout.module.css`, `Customers.module.css`, `globals.css`, `Home.module.css`) that define the visual appearance of the application.

## Backend

The backend handles server-side logic, API routes, database interactions, and external service integrations.

*   **`pages/api/`:** This is the core of the backend in a Next.js application. Files within this directory (e.g., `create-payment-session.js`, `hello.js`, `payment-callback.js`, and the `admin` sub-directory with `customers.js`, `dashboard.js`, `login.js`, `logout.js`, `settings.js`, `validate-session.js`) define API routes that run on the server. These routes handle requests from the frontend, interact with databases, and perform server-side operations.
*   **`lib/`:** This directory likely contains server-side utility functions and modules that are used by the API routes.
    *   `adminAuth.js`: Suggests authentication logic for admin functionalities, typically server-side.
    *   `mailjet.js`: Implies integration with an email service (Mailjet), which is a backend task.
    *   `supabase.js`: Indicates interaction with a Supabase backend, which involves database operations and authentication, usually handled server-side or through secure client-side calls to a backend.

## Shared/Configuration

*   **`next.config.mjs`, `eslint.config.mjs`, `jsconfig.json`, `package.json`, `package-lock.json`:** These are configuration files for the Next.js project, build tools, and dependencies. They are essential for both frontend and backend development and deployment.
*   **`.gitignore`, `README.md`, `CLAUDE.md`, `Briefing/`:** These are project-level files for version control, documentation, and project management.
