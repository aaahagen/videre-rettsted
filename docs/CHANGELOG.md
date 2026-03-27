# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Base Addresses for Routes:** Implemented the ability to set distinct Start and End addresses for a route. These act as the origin and destination points for the driving distance and time calculations.
- **Visual Time Intervals:** The time settings (Start, End, Break, Service) are now visualized as distinct, draggable "stops" within the route list, allowing for a more accurate representation of a driver's day.
- **Estimated Delivery Time per Place:** Added a field to the "Create/Edit Place" form to specify the estimated time spent at that location (e.g., 15 mins for loading). This time is displayed on the place card and is now factored into the total estimated time for any route including that place.
- **Persistent Route Edits:** Route modifications made by drivers (marking stops as completed, reordering stops, adding/removing stops) are now automatically saved to the database in real-time, preventing progress loss on page refresh.
- **Context-Aware Header:** The global search bar and "New" button now adapt based on the current page. When on the routes page, they search for and create routes instead of places.
- **Route Deletion:** Added the ability for admin users to delete routes directly from the routes overview page.
- **Update Notification:** Implemented a non-intrusive notification system that alerts users when a new version of the application is available.
- **Estimated Driving Time:** The detailed route view now includes the total estimated driving time, calculated by the backend using the Google Maps Directions API.
- **Redesigned Route Page Layout:** Completely overhauled the UI for the individual route page (`/dashboard/routes/[id]`) for improved clarity and usability.

### Changed
- **Driver Route View Permissions:** Refined the detailed route view (`/dashboard/routes/[id]`) to hide administrative controls from drivers. The "Tidsinnstillinger" (Time Settings), "Tildelt Sjåfør" (Assigned Driver) panels, and the "Lagre Rute" (Save Route) button are now exclusively visible to admin users. The route name input is also read-only for drivers. Drivers still retain the ability to add/remove stops, reorder them, and optimize the route.
- **Route Calculation Logic:** The backend Google Maps integration was updated to natively support calculating routes that begin and end at arbitrary base addresses, rather than solely relying on saved Place IDs.
- **Deployment Strategy:** Migrated the project from Firebase's classic static hosting to the modern App Hosting service.
- **Driver Assignment Display:** Improved the display for the assigned driver. If the current user does not have permission to change the driver, it now correctly shows the assigned driver's name or "Ikke tildelt" (Unassigned) instead of showing a disabled dropdown.

### Fixed
- **Memory Leak in Route Calculation:** Resolved a memory leak caused by unresolved Promises in the debounce function used for distance calculations on the route page.
- **Route Optimization Logic:** Fixed a bug where the "Optimer Rekkefølge" (Optimize Order) button would fail to update the visual order of the stops on the screen.
- **Frontend Build Error:** Fixed a syntax error in the `page.tsx` file for the detailed route view.
- **Distance Calculation Crash:** Resolved an issue where the distance calculation would crash the backend function if Google Maps returned ZERO_RESULTS.
- **Distance Calculation Loop:** Fixed an infinite re-render loop in the route details page.
- **Backend API Key Conflict:** The backend Cloud Function now securely loads a dedicated API key directly from Google Cloud Secret Manager.
- **Smart Waypoint Fallback:** Improved the robustness of the `calculateRouteDistance` function to fall back to text addresses if GPS coordinates are missing.
- **Complete Place Deletion**: Updated the "Slett Sted" (Delete Place) functionality to ensure associated images are permanently deleted.
- **Invitation Deletion Bug**: Fixed an issue where accepted invitations were not being deleted from the database.
- **Admin Invitation Fetch Error**: Transitioned invitation fetching logic to a secure server-side Cloud Function.

### Removed
- **Removed Middleware and Session Management**: Deleted `middleware.ts`, `src/lib/session.ts`, and the `/api/session` route as part of the move to client-side authentication handling.
- **Removed Redundant Admin Panel Card**: Removed the generic "Adminpanel" introduction card to streamline the dashboard layout.
