# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

### Changed
- Refactored the Admin panel code for better maintainability, moving content to a dedicated component.
- Updated Firestore security rules to support administrative actions on user documents.
- Refactored Firebase initialization into a modular structure within `src/lib/firebase`.
- Updated the data model to include an `organizationId` in user and place documents.
- Enhanced the `useAuth` hook to provide more comprehensive user authentication state and organization details.

### Fixed
- **Fixed permission errors when fetching the user list in the admin panel.**
- **Resolved an issue where administrators were redirected to their own dashboard when clicking an invite link while logged in.**
- Resolved an issue where unauthenticated users could briefly see dashboard content before being redirected.
- Corrected the redirection logic after login to ensure users are sent to the main dashboard page.
- Ensured that the "Add New Place" button is only visible to admin users.

### Removed
- Removed placeholder data and integrated live data fetching from Firestore.
