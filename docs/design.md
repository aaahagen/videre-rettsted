# Design System

This document outlines the design system for the application, including color palette, typography, and layout guidelines.

## Style & UX Guidelines

- **Primary Color:** Deep blue (`#1A237E`), reflecting trust, reliability, and professionalism.
- **Background Color:** Very light blue-gray (`#F0F4F8`), providing a clean, neutral, and non-distracting backdrop for complex data.
- **Accent Color:** A vibrant, functional color (e.g., yellow-gold `#FFC107` or a bright green) to be used sparingly for primary call-to-actions, status indicators, and highlighting key interactive elements.
- **Font:** A highly legible, modern sans-serif font like 'Poppins' or 'Inter' should be used consistently for both headlines and body text to ensure clarity on all screen sizes.
- **Design Philosophy:** Mobile-first, high-contrast, and function-oriented. Every element must serve a purpose. Touch targets must be a minimum of 44x44 pixels. UI should provide clear feedback with subtle transitions.

### Layout

- **Dashboard:** Role-based. For drivers, it's an operational hub. For admins, it's a management console. The main content area of all dashboard pages should now be full-width to maximize space and reduce unnecessary margins.
- **Spacing:** Consistent padding should be applied to all dashboard pages to ensure a uniform look and feel. The class `p-4 sm:p-6 lg:p-8` should be used for the main content container on all pages to ensure consistency.
