# Checkout Page Constraints

This document outlines the constraints implemented on the checkout page (`pages/checkout.js`) and their respective purposes.

## Form Fields

### 1. Honeypot Field (`honeypot`)
*   **Constraint:** Hidden input field.
*   **Purpose:** To prevent automated spam submissions. Bots often fill out all fields, including hidden ones, which can then be detected.

### 2. Name Field (`name`)
*   **Constraint:**
    *   `maxLength="30"`: Limits the maximum number of characters to 30.
    *   `required`: The field must not be empty.
*   **Purpose:**
    *   To ensure names are concise and fit within typical database or display limits.
    *   To ensure essential user information is provided.

### 3. Email Field (`email`)
*   **Constraint:**
    *   `type="email"`: Enforces a valid email address format (e.g., includes '@' and a domain).
    *   `required`: The field must not be empty.
*   **Purpose:**
    *   To ensure a correctly formatted email address for communication and account creation.
    *   To ensure essential user information is provided.

### 4. Phone Number Field (`phone`)
*   **Constraint:**
    *   `type="tel"`: Specifies the input is a telephone number.
    *   `pattern="^01[0-9]{8,9}$"`: Enforces a specific regular expression pattern. This pattern requires the number to start with "01" followed by either 8 or 9 digits.
    *   `title="Please enter a valid Malaysian phone number, without the Country Code"`: Provides a hint to the user about the expected format.
    *   `required`: The field must not be empty.
*   **Purpose:**
    *   To ensure a valid Malaysian phone number format for contact and verification purposes.
    *   To guide the user on the expected input format.
    *   To ensure essential user information is provided.

## Form Submission

### 1. Submit Button State
*   **Constraint:** The submit button (`type="submit"`) is `disabled` when the `loading` state is `true`.
*   **Purpose:** To prevent multiple submissions while the form is being processed, improving user experience and preventing duplicate actions.

### 2. Error Display
*   **Constraint:** An error message (`<p className={styles.errorMessage}>{error}</p>`) is displayed if the `error` state variable contains a value.
*   **Purpose:** To provide immediate feedback to the user if there's an issue during form submission (e.g., API call failure, validation error from the backend).
