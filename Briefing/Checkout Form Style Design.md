The overall design philosophy is Modern, Clean, and Trust-Focused. It prioritizes clarity, ease of use, and building user confidence, especially on mobile devices.

1. Color Palette
The palette is minimal and purposeful, with support for both light and dark modes.

Backgrounds:

Light Mode: A very light gray (#f9fafb) for the main page background gives it a soft feel, preventing the pure white cards from feeling stark.

Dark Mode: A deep, near-black (#111827) provides a high-contrast, modern dark theme.

Content Cards:

Light Mode: Pure white (#ffffff) for the main content containers (.formWrapper, .summaryWrapper).

Dark Mode: A dark gray (#1f2937) is used for cards, which stands out against the darker page background.

Text:

Primary Text: A dark gray (#111827 in light mode) for titles and important text.

Secondary Text: A lighter gray (#6b7280) is used for subtitles and helper text (.subtitle, .formLabel) to create a clear visual hierarchy.

Dark Mode Text: Text colors are inverted, using light grays (#d1d5db, #9ca3af) for readability.

Accent & State Colors:

Primary Action (Blue): A vibrant blue (#2563eb) is used for primary buttons and active states (like the focused input border and floating labels). This color draws the user's attention to the most important actions.

Success/Security (Green): A gentle green (#16a34a for the icon, #f0fdf4 for the badge background) is used to communicate security and trust, as seen in the .securityBadge.

2. Typography
We are using a single, highly-legible font family to maintain consistency.

Font Family: Inter (--font-inter) is used throughout. It's a modern sans-serif font designed for screen readability, which is perfect for UI design.

Hierarchy:

Page Titles (.title): Large and bold (font-size: 1.75rem on mobile, 2.25rem on desktop; font-weight: bold).

Subtitles (.subtitle): Regular weight and smaller size (1rem) to support the main title.

Form Labels (.formLabel): Start at a normal size and shrink (scale(0.85)) when floated.

Body/Input Text: A standard 1rem font size is used for all inputs and paragraphs for optimal readability.

3. Layout & Spacing
The layout is mobile-first and uses a consistent spacing system.

Structure: It uses a flex column on mobile and a grid on desktop. The flex-direction: column-reverse on mobile is a key mobile-centric choice, showing the reassuring order summary before the form.

Spacing: Generous and consistent padding (1.5rem to 2rem in cards) and gaps (1.5rem to 2rem in the grid) create a clean, uncluttered layout that's easy to scan.

4. Core UI Components
Cards (.formWrapper, .summaryWrapper): These are the primary content containers. Their style is defined by:

A soft background color (white or dark gray).

Generous corner rounding (border-radius: 12px).

A subtle box-shadow to lift them off the page and add depth.

5. Interactive Elements
Interactions are designed to be smooth and provide clear feedback.

Input Fields (.formInput):

Floating Label/Icon: The most distinct feature. The icon and label animate up and shrink when the field is active. This is achieved with CSS transforms and the :has() selector.

Focus State: When an input is focused, the border color changes to the primary blue, and a soft blue box-shadow appears. This provides clear visual feedback to the user.

Buttons (.submitButton):

Style: A solid, high-contrast background (the primary blue), bold white text, and rounded corners.

Interaction: A subtle transform: scale(1.02) on hover gives the button a satisfying "pop," encouraging clicks. The color darkens slightly for a clear hover state.

Disabled State: The button becomes gray and loses its hover effect, clearly indicating that it cannot be clicked.