# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Pricing Page**: Created a new page at `/pricing` to display SaaS subscription plans and a one-time source code licensing option.
- The pricing page includes details on different tiers, pricing information, and a section explaining the security of payments handled by Stripe.
- Linked the "Kom i gang" and "Start nå" buttons on the `/about` page to the new pricing page.

### Changed
- **Separated Landing Page from App**: The marketing landing page has been moved from the root route (`/`) to `/about`. The root route now acts as the main app entry point, directing logged-in users to the dashboard and logged-out users to the login page for a more streamlined user experience.
- **Refactored Authentication Flow**: Replaced the server-side `middleware.ts` and session cookie mechanism with a purely client-side authentication management system. This is handled by a new `AuthProvider` component that uses `react-firebase-hooks` to listen to auth state changes and manages route protection via client-side redirects. This resolves complex synchronization issues between the server and client.
- **Updated Place Creator Attribution**: The system now stores and displays the full name (or internal number) of the user who created a place, rather than just their ID. This is fetched from the user's profile at the time of creation.
- **Refined Admin Dashboard Monitoring**: Simplified the analytics dashboard to reliably show total users and total places in a unified, robust card view, removing fragile log dependencies.
- **Improved Admin User Management**:
    - Changed the user actions menu trigger from "three dots" icon to a clear "Endre" button.
    - Updated the "Create User" form label to "Navn eller internnummer" for clarity.
    - Added security guidance text to the invitation section advising the use of fictitious emails.
- **Default Image Handling**: When saving a place without images, a default placeholder (`ingen.jpg`) is now automatically assigned. When editing such a place, the placeholder is automatically hidden in the form so users can easily add new images.
- **Image Display Updates**: Places with no images or only the placeholder now explicitly show "Ingen bilder foreløpig" in the details view.
- **Increased Image Limit**: Increased the maximum number of images per place from 6 to 8.
- **Accessibility Fix**: Added visually hidden titles to all image dialogs to comply with ARIA standards and resolve console errors.
- Refactored the Admin panel code for better maintainability, moving content to a dedicated component.
- Updated Firestore security rules to support administrative actions on user documents.
- Refactored Firebase initialization into a modular structure within `src/lib/firebase`.
- Updated the data model to include an `organizationId` in user and place documents.
- Enhanced the `useAuth` hook to provide more comprehensive user authentication state and organization details.

### Fixed
- **Allow Logged-in Users on Public Pages**: Modified the authentication provider to allow logged-in users to visit public pages like `/about` and `/pricing` without being automatically redirected to their dashboard.
- **Resolved Login Loops and Hangs**: The new client-side `AuthProvider` fixes all previous issues where the user would get stuck in a redirect loop, see an infinite spinner, or be sent back to the login page after a successful login.
- **Resolved broken search functionality**: Connected the header search input to the dashboard content using a centralized state store.
- **Fixed permission errors when fetching the user list in the admin panel.**
- **Resolved an issue where administrators were redirected to their own dashboard when clicking an invite link while logged in.**
- Resolved an issue where unauthenticated users could briefly see dashboard content before being redirected.
- Corrected the redirection logic after login to ensure users are sent to the main dashboard page.
- Ensured that the "Add New Place" button is only visible to admin users.
- **Fixed typo in `about` page component.**
- **Fixed 404 Flash on Load**: Implemented a dedicated loading page (`src/app/page.tsx`) for the root path to handle authentication checks and redirection gracefully, preventing a brief 404 error flash.
- **Fixed Invitation Race Condition**: Prevented premature redirects in the invitation flow and switched to real-time listeners for user profiles. This ensures new users are correctly associated with their organization immediately upon registration.
- **Fixed Sidebar Organization Loading**: Implemented a real-time listener for organization data in the sidebar to prevent it from "hanging" or failing to load for newly invited users.
- **Fixed Admin Analytics Updates**: Updated the admin analytics dashboard to use real-time listeners, ensuring user and place counts update immediately upon deletion or creation.

### Removed
- **Removed Middleware and Session Management**: Deleted `middleware.ts`, `src/lib/session.ts`, and the `/api/session` route as part of the move to client-side authentication handling.
- **Removed Redundant Admin Panel Card**: Removed the generic "Adminpanel" introduction card to streamline the dashboard layout.
- Removed placeholder data and integrated live data fetching from Firestore.
