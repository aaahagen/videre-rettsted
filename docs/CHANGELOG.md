# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Update Notification:** Implemented a non-intrusive notification system that alerts users when a new version of the application is available. A small banner appears at the top of the screen, allowing users to reload the page at their convenience to get the latest features and bug fixes. This prevents issues with stale, cached versions of the app on mobile devices and desktops.
- **Estimated Driving Time:** The detailed route view now includes the total estimated driving time, calculated by the backend using the Google Maps Directions API. The frontend displays this in a human-readable format (e.g., "1 t 23 min").
- **Redesigned Route Page Layout:** Completely overhauled the UI for the individual route page (`/dashboard/routes/[id]`) for improved clarity and usability. The new design features a top card for primary route info (name, stops, distance, time), a dedicated card for driver assignment, and a two-column layout for adding/viewing stops.

### Changed
- **Driver Assignment Display:** Improved the display for the assigned driver. If the current user does not have permission to change the driver, it now correctly shows the assigned driver's name or "Ikke tildelt" (Unassigned) instead of showing a disabled dropdown.

### Fixed
- **Route Optimization Logic:** Fixed a bug where the "Optimer Rekkefølge" (Optimize Order) button would correctly report that the route was optimized but would fail to update the visual order of the stops on the screen. The underlying optimization logic was working, but the component's state was not being set correctly with the new, optimized order. This has been resolved, and the list now visually updates immediately after optimization.
- **Frontend Build Error:** Fixed a syntax error (a missing closing brace `}`) in the `page.tsx` file for the detailed route view, which was causing the `npm run build` command to fail.
- **Distance Calculation Crash:** Resolved an issue where the distance calculation would crash the backend function (TypeError: Cannot read properties of undefined (reading 'legs')) if Google Maps returned ZERO_RESULTS (e.g., if coordinates were invalid or too far apart). It now gracefully throws a clear error message.
- **Distance Calculation Loop:** Fixed an infinite re-render loop in the route details page caused by incorrect dependency arrays in the `useMemo` and `useEffect` hooks used for the debounced distance calculation.
- **Backend API Key Conflict:** Resolved an issue where the backend Cloud Function was using an API key with HTTP referrer restrictions (which Google Maps Directions API rejects for server-side calls). The function now securely loads a dedicated, unrestricted backend API key directly from Google Cloud Secret Manager.
- **Smart Waypoint Fallback:** Improved the robustness of the `calculateRouteDistance` function. If a place on a route was saved without precise GPS coordinates (defaulting to 0,0), the backend will now automatically fall back to passing the place's text address to the Google Maps API for automatic geocoding, preventing "ZERO_RESULTS" errors for text-only places.

- **Broken Route Management Workflow:** Fixed the non-functional and unintuitive route creation process. The new, fully functional system allows users to create a route, add/remove places, and have the distance calculated automatically, as originally intended.
- **Syntax Error on New Route Page:** Corrected a JavaScript syntax error (`missing {`) in the `try...catch` block on the `/dashboard/routes/new` page.
- **Complete Place Deletion**: Updated the "Slett Sted" (Delete Place) functionality to ensure that when a place is deleted from the database, all associated images stored in Firebase Storage are also permanently deleted. This prevents orphaned files from consuming storage space over time.
- **Invitation Deletion Bug**: Fixed an issue where accepted invitations were not being deleted from the database because new users lacked the admin permissions required by Firestore rules to perform the deletion. The new `acceptInvitation` Cloud Function resolves this.
- **Admin Invitation Fetch Error**: Resolved the "Kunne ikke hente invitasjoner" error in the Admin Panel by transitioning the invitation fetching logic from a direct client-side query (which was blocked by strict Firestore rules) to a secure server-side Cloud Function.
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
- **Fixed Invitation Race Condition**: Prevented premature redirects in the invitation flow and and switched to real-time listeners for user profiles. This ensures new users are correctly associated with their organization immediately upon registration.
- **Fixed Sidebar Organization Loading**: Implemented a real-time listener for organization data in the sidebar to prevent it from "hanging" or failing to load for newly invited users.
- **Fixed Admin Analytics Updates**: Updated the admin analytics dashboard to use real-time listeners, ensuring user and place counts update immediately upon deletion or creation.

### Removed
- **Removed Middleware and Session Management**: Deleted `middleware.ts`, `src/lib/session.ts`, and the `/api/session` route as part of the move to client-side authentication handling.
- **Removed Redundant Admin Panel Card**: Removed the generic "Adminpanel" introduction card to streamline the dashboard layout.
- Removed placeholder data and integrated live data fetching from Firestore.
