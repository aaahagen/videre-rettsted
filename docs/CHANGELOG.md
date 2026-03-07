# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- **Resolved Login Loops and Hangs**: The new client-side `AuthProvider` fixes all previous issues where the user would get stuck in a redirect loop, see an infinite spinner, or be sent back to the login page after a successful login.
- **Resolved broken search functionality**: Connected the header search input to the dashboard content using a centralized state store.
- **Fixed permission errors when fetching the user list in the admin panel.**
- **Resolved an issue where administrators were redirected to their own dashboard when clicking an invite link while logged in.**
- Resolved an issue where unauthenticated users could briefly see dashboard content before being redirected.
- Corrected the redirection logic after login to ensure users are sent to the main dashboard page.
- Ensured that the "Add New Place" button is only visible to admin users.

### Removed
- **Removed Middleware and Session Management**: Deleted `middleware.ts`, `src/lib/session.ts`, and the `/api/session` route as part of the move to client-side authentication handling.
- **Removed Redundant Admin Panel Card**: Removed the generic "Adminpanel" introduction card to streamline the dashboard layout.
- Removed placeholder data and integrated live data fetching from Firestore.

### Added
- **Admin-Only Link to Landing Page**: A link to the new `/about` (landing page) has been added to the sidebar, visible only to admin users.
- **User Search in Admin Panel**: Added a search bar to the "Administrer Brukere" card, allowing admins to quickly filter users by name or email.
- **Admin Dashboard Statistics**: Added an overview card in the Admin Panel displaying real-time counts of total places and users.
- **Delete Place Functionality**: Admins can now delete places from the place details page. This action requires typing a specific confirmation sentence ("Jeg er ansvarlig og vil slette dette stedet...").
- **PDF Print Support**: Implemented "Print as PDF" functionality. Users can now print individual places or all their favorites at once. The print layout is optimized for A4 paper and includes images.
- **Delete Organization Functionality**: Implemented a "Delete Organization" button in the Admin Dashboard with a strict 4-step confirmation process and text verification ("Jeg vil for alltid slette hele organisasjonen..."). This permanently removes all data, users, and the organization itself.
- **Data Export & Backup**: Added functionality in the Admin Dashboard to export all place data as JSON and backup all images as a ZIP file. The JSON includes references to the backup folder names for easy reconciliation.
- **Customizable Place Fields**: Added a second text field to place details. Both text fields now have customizable labels and placeholders manageable via the Admin Panel.
- **Organization Settings**: New section in Admin Dashboard to configure labels for "Beskrivelse & Instruksjoner 1" and "Beskrivelse & Instruksjoner 2".
- **Functional Global Search**: Implemented a real-time search bar in the dashboard header that filters places by name, address, description, and hashtags.
- **Mobile-Optimized Admin Panel**: Redesigned the admin user management interface with a card-based layout for mobile devices, improved touch targets, and responsive dialogs.
- **User Naming Control**: Admins can now assign a name when inviting a new user and edit names of existing users within the organization.
- **Full administrative user management**: Admins can now change user roles, toggle account status (Active/Paused), and delete users directly from the admin panel.
- **Role-Based Access Control (RBAC)**: Restricted the Admin panel to users with the 'admin' role. Drivers (Sjåfør) no longer see the admin link in the sidebar and are redirected if attempting to access the page directly.
- **Enhanced Image Viewer**: Added a dedicated close button (X) to the full-screen image dialog for better usability.
- **Improved Invitation Flow**: The invitation page now automatically logs out a currently signed-in user if they are not the intended recipient of the invitation, preventing registration errors.
- Implemented real-time user list in the admin dashboard using Firestore `onSnapshot`.
- Created a dedicated `/invite` page for new users to complete their registration.
- Added a "Remember Me" checkbox on the login page with Firebase Auth persistence control.
- Added a field for administrator name during organization registration.
- Implemented a clipboard fallback for the invitation link in the admin dashboard.
- Implemented profile picture upload functionality.
- Created `storage.rules` for Firebase Storage to restrict access to authenticated users and manage profile picture uploads.
- Implemented a password confirmation field on the registration page to ensure users enter their intended password correctly.
- Added "Forgot Password" functionality.
- Implemented alphabetical sorting (A-Z) for the user list in the admin dashboard.
- Added a loading skeleton for the user list in the admin dashboard.
- Empty state for the dashboard when no places have been added.
- Empty state for the favorites page.
- **Implemented a full-screen image viewer in the place details page using a dialog.**
- **Added a star-shaped toggle on the dashboard to filter between all places and favorites.**
- **Automatic alphabetical sorting (A-Z) of places on the dashboard.**
- Added a toast notification system for user feedback.
