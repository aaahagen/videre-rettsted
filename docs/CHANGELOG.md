# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Real-time Messaging System:** Added a dedicated communication hub (`/dashboard/messages`) allowing administrators to broadcast messages to all drivers or all administrators. Drivers can send direct messages back to the administrative team.
- **Read Receipts & Unread Badges:** Implemented a real-time read receipt system. Senders can see when their messages have been read (single vs double checkmarks). A dynamic unread badge also appears in the sidebar for any user with new messages.
- **Proof of Delivery Foundation (Location & Timestamps):** When a driver completes a stop, the application now requests the device's location. A timestamp and the GPS coordinates are securely saved to the database.
- **Enhanced Monitor Dashboard:** The Monitor page now displays the exact time a delivery was completed next to the checkmark, replacing the generic "Fullført" text. Additionally, a clickable "Vis kart" link appears, allowing administrators to open Google Maps pinned to the exact location where the driver was when they completed the stop.
- **External Workforce (Contractors):** Introduced a new system to register and manage hired external extras (Innleid). They receive a dedicated role with customized access, and administrators can log their specific agency contact information.
- **Workforce Statistics Dashboard:** Added a dynamic, date-based statistics overview to the Workforce page, providing administrators with an instant snapshot of personnel status (Working, Sick, Vacation, Off, and Contractors).
- **Vehicle Documents:** Added the ability to upload and manage documents (like registration and insurance certificates) directly on a vehicle's profile. An indicator was added to the fleet list view to show if a vehicle has attached documents.
- **3PS Integration:** Added the ability to mark a route as being driven by a Third-Party Supplier (3PS) and log the supplier's name in the route editor. The Monitor page correctly displays this information.
- **Vehicle Image Uploads:** Enabled uploading up to 8 compressed photos per vehicle in the Fleet Management module.
- **Driver Image Upload:** Enabled uploading a profile picture for drivers in the Workforce Management module. The picture is displayed in the personnel overview.
- **Period Schedule Overrides:** Added the ability to register schedule overrides (vacation, sick leave, etc.) for entire periods by specifying a start and end date, simplifying data entry for extended absences.
- **Upcoming Overrides Display:** The main workforce page now prominently displays a driver's upcoming schedule overrides (up to 3) directly on their profile card for quick visibility.

- **Fleet Management Module:** Added a complete system for administrators to register and manage the organization's vehicle fleet.
    - **Vehicle Profiles:** Created database structures and UI to capture detailed vehicle properties including type (truck, van, car), fuel type, dimensions, capacity (weight, volume, pallets), and special capabilities (refrigeration, tail-lift, ADR, trailer coupling).
    - **Fleet Overview Page:** Added `/dashboard/fleet` for admins to view, add, edit, and delete vehicles.
- **Workforce Management Module:** Added a comprehensive system for managing driver profiles and work schedules.
    - **Driver Profiles:** Extended user data to include standard working hours, certifications (e.g., ADR, Truck), and special skills. Admin UI updated to allow editing these profiles.
    - **Advanced Scheduling Engine:** Implemented a robust scheduling system supporting standard working hours, single-day overrides (vacation, sick leave, custom hours), and a fully customizable multi-week rotation (Turnusplan) system.
    - **Personnel Overview Page:** Added `/dashboard/workforce` allowing admins to select a date and instantly see the calculated working status of every driver based on the scheduling engine rules.
    - **12-Week Plan Printout:** Built a dedicated, print-optimized page (`/dashboard/workforce/print`) that generates a professional 12-week schedule grid for any selected driver.
- **Monitor Page Enhancements:**
    - **Collapsible Route Details:** The route cards on the monitor page can now be clicked to expand/collapse the full list of stops, saving screen space.
    - **Smart Stop Hiding:** When collapsed, the card intelligently hides completed and distant upcoming stops, summarizing them with text (e.g., "... 5 gjenstående stopp skjult ...").
    - **Direct Place Links:** Place names within the monitor route view are now clickable links leading directly to the place details page.
    - **Vehicle Display:** Route cards now prominently display the assigned vehicle alongside the assigned driver.
    - **Clear Completion State:** Route cards now have a static color header (red for active, green for finished) and display a clear "Rute ferdigstilt" message when 100% complete.
- **Offline Persistence:** Explicitly enabled Firestore's IndexedDB local cache to ensure the application remains readable and can queue writes even during network outages.

- **Monitor Page Statistics Card:** Added a "Dagens Status" (Today's Status) card to the top of the monitor page (`/dashboard/monitor`). This card provides a high-level overview of the day's operations, displaying the total number of routes, active routes, finished routes, total stops across all routes, and an overall progress bar calculating the total number of stops completed against the total number of stops.
- **Route Monitor Dashboard:** Created a new real-time dashboard for administrators (`/dashboard/monitor`) to track the progress of all active routes. It displays a visual progress bar, the current/next stop, and the assigned driver for each route.
- **Finished Route Color-Coding:** The main routes list page now uses real-time listeners to automatically change the color of a route's card to green ("Rute fullført") as soon as the assigned driver marks the final stop as complete.
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
- **Unified Action Button:** Streamlined the user interface by replacing local "Create New" buttons on various pages (like the Routes page and Fleet page) with a single, context-aware action button in the top right corner of the global header. This button automatically adapts its icon and action (e.g., "Nytt Kjøretøy", "Ny Rute", "Nytt personell") based on the current active view.
- **Contextual Global Search:** Upgraded the global search bar in the top navigation to be context-aware. When viewing the Fleet ("Kjøretøy") or Workforce ("Personell") pages, the search bar now automatically filters the respective lists on those pages, rather than redirecting the user to the generic Places search.

- **Workforce Form Redesign:** Completely redesigned the "Edit Driver Profile" and "Register Vehicle" forms to use a clean, card-based layout, significantly improving readability and usability.
- **Workforce Print UI:** The "Plan (12 uker)" print button on the workforce overview is now conditionally rendered, appearing only if the driver has an active rotation schedule configured.
- **Workforce Status Text:** Updated the fallback status text for drivers on a rotation schedule without a specific daily plan to say "Bruker Turnusplan" instead of "Ingen plan satt".
- **Sidebar Navigation:** Wrapped the main sidebar navigation links in a scroll area to prevent overflow and ensure all items remain accessible on smaller screens.
- **Date Picker Reliability:** Replaced the custom Popover/Calendar component used for selecting dates across the entire application (including the main Workforce page) with a native HTML `<input type="date">` for improved reliability and vastly superior mobile support.
- **Driver Profile Image limit**: Limited the number of images a driver can upload to their profile to 1.
- **Driver Route View Permissions:** Refined the detailed route view (`/dashboard/routes/[id]`) to hide administrative controls from drivers. The "Tidsinnstillinger" (Time Settings), "Tildelt Sjåfør" (Assigned Driver) panels, and the "Lagre Rute" (Save Route) button are now exclusively visible to admin users. The route name input is also read-only for drivers. Drivers still retain the ability to add/remove stops, reorder them, and optimize the route.
- **Route Calculation Logic:** The backend Google Maps integration was updated to natively support calculating routes that begin and end at arbitrary base addresses, rather than solely relying on saved Place IDs.
- **Deployment Strategy:** Migrated the project from Firebase's classic static hosting to the modern App Hosting service.
- **Driver Assignment Display:** Improved the display for the assigned driver. If the current user does not have permission to change the driver, it now correctly shows the assigned driver's name or "Ikke tildelt" (Unassigned) instead of showing a disabled dropdown.
- **Manual Route Saving:** Replaced the unreliable auto-save functionality for the entire route structure with an explicit "Lagre Rute" (Save Route) button visible to all users. This ensures the backend route data is only updated when the user intends to save their final arrangement.

### Fixed
- **Form Layout Fixes:** Corrected several layout and alignment issues in the driver profile form, particularly within the "Avvik & Ferie" card, ensuring it stacks properly on smaller screens.
- **Date Picker State Bug:** Fixed an issue where the selected date for an override in the driver profile was not being registered correctly by migrating to the native HTML date input.
- **Admin Dialog Freeze:** Fixed an issue where the screen would remain unclickable (frozen pointer events) after saving or closing the "Edit Driver Profile" dialog in the Admin Panel.
- **Calendar Layout Issue:** Corrected styling issues with the `react-day-picker` integration that caused the rotation start-date calendar to render incorrectly.
- **Driver Profile Save Error:** Fixed a backend error that occurred when saving a driver's profile by explicitly using `deleteField()` instead of setting fields to undefined.
- **Driver Profile Storage Permissions:** Updated Firebase Storage rules to allow administrators to upload profile pictures on behalf of drivers.
- **Mobile Route Item Display:** Corrected a layout bug in the detailed route view that caused the estimated delivery time badge for each place to be hidden on smaller mobile screens.
- **Dynamic Route Recalculation:** Fixed an issue where the total estimated route time failed to update instantly when a user manually dragged and dropped stops to reorder them. The UI now reliably recalculates driving distance and total duration upon every physical route alteration.
- **Android Touch Support:** Resolved a bug preventing drag-and-drop reordering of route items on Android devices by implementing a dedicated `TouchSensor` with an activation delay.
- **Optimization API Lock:** Corrected a bug in the backend `calculateRouteDistance` function where Google Maps was permanently instructed to "optimize" the route. It now correctly respects manual user ordering during a standard calculation and only invokes the optimization engine when the explicit "Optimer Rekkefølge" button is pressed.
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

## [Future]

### Added
- **Fleet Management System:** A comprehensive module for registering and tracking all vehicles within an organization.
    - **Vehicle Profiles:** Create detailed profiles for each vehicle, including type, loading capacity (weight, volume), fuel type, physical dimensions, and special capabilities (e.g., refrigeration, tail-lift). This data will directly inform the constraint-based route matching engine.
    - **Maintenance & Service Tracking:** Log service history and set reminders for future maintenance deadlines to ensure fleet compliance and operational readiness.
    - **Digital Vehicle Inspections & Damage Reporting:** Allow drivers or mechanics to conduct digital inspections and log new damages with photos and notes, creating a full damage history for each vehicle.
    - **Document Management:** Upload and manage essential vehicle documents like registration, insurance certificates, and inspection reports.
- **Vehicle Loading & Manifest System:** A new system to verify that the correct items are loaded onto the correct vehicle before a route begins.
    - **New "Loader" Role:** A restricted user role for warehouse staff who only have permission to access the loading interface.
    - **Manifest Verification:** A dedicated screen will display all items assigned to a route. Loaders will scan each item's barcode, changing its status from "Pending" to "Loaded" and preventing incorrect items from being loaded.
- **Comprehensive Proof of Delivery (POD) System:** Upon completing a stop, drivers will be able to capture a full suite of POD information, creating a permanent, auditable record for each delivery.
    - **Photo Capture:** Reuse the existing camera and image compression functionality to take one or more photos as visual proof.
    - **Signature Capture:** Allow recipients to sign directly on the driver's device, with the signature saved as an image.
    - **Barcode Scanning:** Use the device's camera to scan package barcodes, linking specific items to the delivery confirmation.
    - **Damage & Note Reporting:** Provide a text field for drivers to report any issues, damages, or other important delivery notes.
- **Geofence-based Delivery Alerts:** Automatically calculate the distance between the planned stop's address and the driver's captured GPS location. If the distance exceeds a configurable threshold, an alert will be generated and displayed in real-time on the admin dashboard to flag potential delivery errors.

### Changed
- **Advanced Route Management Strategy:** A new tiered approach for route planning will be implemented to enhance efficiency and automation.
    - **Tier 1: Route Archiving & Templates:** Finished routes will be archived for historical analysis. Planners will be able to save any route as a "Template" to quickly recreate recurring or similar routes.
    - **Tier 2: Order-Based Planning with Advanced Goods Definition:** An "Order" module will be introduced, allowing for the import of jobs. Each job/order will support detailed properties, including size, weight, form (e.g., pallet, package, liquid), and special handling requirements like temperature control, hazardous materials (ADR), or required legal documentation.
    - **Tier 3: Constraint-Based Automatic Generation:** An intelligent backend system will automatically generate optimized daily routes. This system will perform constraint-based matching, assigning orders not only based on location but also by matching the goods' requirements to defined vehicle capabilities from the Fleet Management module. It will flag any jobs that cannot be assigned due to a lack of compatible vehicles.
