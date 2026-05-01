# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Hierarchical Barcode Generation:** When an order is created, the system now automatically generates unique barcode IDs for every individual item (Collie) and calculates the required number of Handling Units (Pallets), generating parent SSCC-style barcodes for them in the database.
- **Smart Manifest Scanning:** Upgraded the Lasterampe (Warehouse) scanner interface. The system now intelligently distinguishes between scanning a general order, a specific item (Collie), or a parent Pallet. Scanning a Pallet automatically marks all associated Collies as loaded simultaneously, significantly speeding up terminal operations.
- Added 'Varer & Palletering' section to the New Order form. Users can now add multiple detailed line items (e.g. Kegs, Cases) with quantities, dimensions, and weights. The system automatically calculates total items, total weight, total volume, and estimates the required EUR-pallet space.

- Added 'Annet' (Other) category for personnel schedule overrides and statuses across the platform.
- **Route Keys Dashboard Card:** Added a dedicated "Nødvendige Nøkler for Ruten" card to the active route view (`/dashboard/routes/[id]`). It dynamically scans all stops on the assigned route and alerts the driver to any physical keys they need to bring from the terminal before departing.

### Changed
- Moved the AnalyticsDashboard (places and users stats) to the right sidebar under the "start vakt" component in the Admin Dashboard layout.
- **Place Details UI Update:** Moved the "Hashtags" section from the bottom of the main content column to the top of the right-hand sidebar, positioning it directly above the "Logg" card for better visual balance on desktop screens.
- **Place Form Layout Refactor:** Removed the side-by-side grid layout for the "Full Adresse" and "Tidsbruk for levering" fields. They now stack vertically to ensure the address input has maximum horizontal space, improving readability on desktop monitors. Explicitly wrapped the 'Add' buttons for dynamic arrays in block elements to guarantee they drop to a new line below their labels.
- **Place Form UI Update:** The "Dørkode / Nøkkel" and "Kontaktpersoner" sections now default to being completely collapsed (empty arrays) when creating a new place, rather than showing an empty input field immediately. The "Legg til" (Add) buttons have also been styled consistently with a '+' icon and moved beneath the section labels for better visual flow.
- **Place Details UI Refactor:** Renamed the "Stedsinfo" heading to "Logg".
- **Place Details Layout:** Reordered the sections on the place details page so that the map and location information is displayed prominently above the keys and contact persons.
- **Empty State Handling (Places):** The place details view and the physical print layout will now automatically hide the "Dørkode / Nøkkel" and "Kontaktpersoner" sections if no valid information has been registered.
- **Door Code / Key Management for Places:** Added a dynamic "Dørkode / Nøkkel" field to the place form. Users can now add multiple keys or codes for a single place, categorizing them as "Nøkkel" or "Kode", and adding custom descriptions (e.g., "Hovedinngang"). Admins can toggle this feature and set default labels/placeholders in the organization settings.
- **Door Code Overview on Favorites Page:** The Favorites page now includes a dedicated "Nøkler" overview card at the top. This card aggregates and clearly displays all keys for the user's favorited places. It specifically filters out regular codes and only shows items categorized as "Nøkkel" alongside the place name (hiding the address for clarity).
- **Place Draft Auto-save:** Implemented a system that automatically saves the user's progress to their local device (localStorage) when creating a new place. This prevents data loss if the app is closed or refreshed before the place is successfully saved.
- **Duplicate Place Detection:** Added a safety check during place creation. If a user attempts to create a place with the exact same name or address as an existing one, they are now presented with a warning dialog. They can choose to cancel, navigate to the existing place to edit it, or force the creation of the duplicate.
- **Digital Vehicle Inspections UI:** Built the frontend form for drivers and mechanics to perform vehicle safety checks. Integrated "Pre-trip" and "Post-trip" inspection buttons directly into the active route view. Drivers can now log mileage, confirm safety checks (tires, brakes, etc.), and report damages with descriptions in real-time.
- **Loader Notes & Issue Reporting:** Implemented a real-time communication system for the loading ramp. Loaders can now add notes and flag critical issues (avvik) directly on a manifest. These alerts are instantly pushed to the assigned driver'''s route view and the administrator'''s real-time monitor dashboard, ensuring immediate visibility of loading delays or missing items.
- **Barcode/QR Code Label Printing:** Implemented a professional barcode label generation system for orders. Administrators can now generate and print individual physical labels for every item/pallet in an order (e.g., 5 labels for a 5-item order). Labels include the destination name, address, scannable Code128 barcode, and item sequence (e.g., "Kollinr: 2 / 5").
- **Place Navigation:** Updated the "Tilbake til oversikt" buttons on the detailed place view to navigate directly to the places list (`/dashboard/places`). Implemented anchor hash routing (`#place-[id]`) so the overview automatically scrolls back to the exact place card the user was previously viewing.
- **Place PDF Printing:** Redesigned the print layout for places to accommodate all associated images. The layout is now paginated: the first page displays the written information and the primary (starred) image, while subsequent pages dynamically generate a grid to display all remaining images alongside their captions without a hard limit.
- **Dashboard - Newest Place Card:** Added a new card to the dashboard (visible to both administrators and drivers) that displays the most recently registered place in the organization'''s database, providing a quick link to its details.
- **Admin Dashboard - Manifest/Lasterampe Card:** Added a new "Lasterampe" (Manifests) statistics card to the administrator dashboard. This card displays the overall loading progress, including the percentage of loaded items, the exact count of loaded vs. total items, and a summary of active vs. total manifests.
- **Driver Dashboard - Route Loading Progress:** The driver'''s dashboard now shows the real-time loading progress for their assigned route. A progress bar, item count, and status (e.g., "Loading," "Verified") are displayed on the "Your Route" card.
- **Testing Infrastructure:** Integrated Jest and React Testing Library for unit testing, and Playwright for end-to-end (E2E) testing.
- **Firebase Local Emulator Integration:** Configured the application and Project IDX environment to automatically connect to the Firebase Local Emulator Suite during development and testing, ensuring safe, isolated test environments without affecting production data.
- **Vehicle Loading & Manifest UI:** Built the `/dashboard/manifests` and `/dashboard/manifests/[id]` UI for loaders. Features include:
    - Real-time tracking of route loading progress.
    - Item-level barcode/QR code scanning to mark individual packages/pallets as loaded.
    - Manual override buttons (increment/decrement) for situations where scanning fails.
    - Automatic status updates for orders once all items are loaded.
    - Final verification workflow to lock the manifest before departure.
- **Order Creation Enhancements:** Added a `numberOfItems` field to the manual order creation form (`/dashboard/orders/new`). This data is now correctly linked to the Manifest system to ensure loaders scan the correct number of items per order.
- **Order Details View:** Created a dedicated details page (`/dashboard/orders/[id]`) to view the status, description, physical details, and routing information of individual orders.
- **GDPR Compliance (Work Logs Data Retention):** Implemented an automated background process (Cloud Function) that runs daily at midnight to permanently delete driver work logs (`workLogs` entries) that are older than 3 years.
- **GDPR Compliance (Audit Logging):** Implemented an audit trail for sensitive data access. The system now logs an `admin_view_worklog` event whenever an administrator views a driver'''s time stamps in the "Time Approvals" module. These logs are stored in a newly created, restricted `/logs` collection.
- **Proof of Delivery (POD) Driver UI:** Integrated a comprehensive Proof of Delivery modal into the active route view. 
    - When a driver completes a stop, they are now prompted to specify the delivery method (e.g., Handed to recipient, Left at door).
    - The UI dynamically enforces rules, such as requiring photo evidence if a package is left unattended.
    - Features built-in client-side image compression to save mobile data bandwidth.
    - Includes a dedicated flow for reporting damages or logging failed delivery attempts with specific reasons.
- **Verification Infrastructure (Phase 3 Backend):** Scaffolded the core database models and Firestore operations for the End-to-End Verification phase.
    - Added `loader` role to the system.
    - Implemented a robust `ProofOfDelivery` data model that exceeds standard requirements by including GPS accuracy logging, explicit delivery method categorization, categorized photo evidence (e.g., distinguishing between package-in-situ and door-number photos), and structured failure reasons.
    - Created database operations for creating `Orders` and linking them to a vehicle `Manifest`.
    - Implemented backend verification logic allowing a loader to scan and cryptographically sign off on a package being loaded onto a specific vehicle.
    - Created database schemas and operations for Digital Vehicle Inspections (pre/post-trip checks and damage reporting).
- **Multi-Day Timeline View:** Added a "Timeline" view to the workforce page, allowing administrators to visualize schedules over a week or month. This provides a clear overview of who is working, on vacation, or sick, making it easier to compare planned vs. actual hours.
- **Digital Contract Management:** Administrators can now upload and manage digital contracts for each driver. The system supports version history, allowing for a complete overview of a driver'''s contract changes over time.
- **Centralized HR Information:** The driver profile has been expanded to include a dedicated section for essential HR information, including emergency contact, next of kin, and other relevant personalia.
- **Administrative Notes:** A new private notes field has been added to the driver profile, allowing administrators to keep a record of important information and observations.
- **Gamification (Explorer Status):** Added a visual progress bar to the user profile dropdown (accessible by clicking the username in the sidebar). It calculates the driver'''s "Explorer Status" by dynamically comparing their historically completed stops against the total number of places registered to the organization.
- **Custom Vehicle Attributes:** Added a dynamic "Egendefinerte Egenskaper" (Custom Attributes) section to the vehicle registration form. Administrators can now define any number of custom key-value pairs (e.g., "Jekketralle: 2 stk", "Girkasse: Manuell") for a vehicle. These are displayed as stylish tags on the main fleet overview.
- **Trailer Support:** Added "Henger" (Trailer) as a primary vehicle type, and "Flakbil / Åpen Henger" (Flatbed) as a core capability toggle.
- **Physical Dimensions Tracking:** Administrators can now record a vehicle'''s exact Height, Width, and Length in meters. This crucial safety data is displayed prominently on the Fleet page.
- **Driver Route Context:** If a route is assigned to a vehicle with physical dimensions, those dimensions (Height, Width, Length) are now displayed directly in the top statistics bar of the driver'''s route view, ensuring they are aware of their constraints before driving.
- **Vehicle Note Fields:** Added dedicated text areas for supplementary notes regarding a vehicle'''s capacity (e.g., weight limits) and capabilities (e.g., included equipment). These notes render as distinct info boxes on the vehicle'''s card.
- **Route Templates:** Administrators can now save any configured route as a reusable "Template" (Mal). A new "Maler" tab on the Routes overview page displays all saved templates. Opening a template allows the user to quickly spawn a brand new, active route based on the template'''s stop sequence, addresses, and time settings.
- **Route Completion Confirmation:** Drivers are now required to explicitly type "Ferdig" into a confirmation dialog to complete a route, preventing accidental completions.
- **Route Locking:** Once a route is marked as completed, it becomes locked for the driver. Drivers cannot check/uncheck stops or edit the route anymore. Administrators retain full editing rights for corrections.
- **Real-time Messaging System:** Added a dedicated communication hub (`/dashboard/messages`) allowing administrators to broadcast messages to all drivers or all administrators. Drivers can send direct messages back to the administrative team.
- **Message Read Receipts & Unread Badges:** Implemented a real-time read receipt system. Senders can see when their messages have been read (single vs double checkmarks). A dynamic unread badge also appears in the sidebar for any user with new messages.
- **Advanced Admin Read Receipts:** Upgraded the messaging system for administrators sending broadcasts. Hovering over the read status icon now reveals a detailed "Hover Card" that explicitly lists the names of users who have read the message ("Lest av") and those who have not yet read it ("Venter på"), accurately filtered by the target audience (e.g., all drivers).
- **Message Deletion:** Added the ability to delete messages. Administrators can delete any message, while standard users can delete their own sent messages. Features a confirmation dialog.
- **Order Deletion:** Added the ability for administrators to delete orders from the orders list view, complete with a safeguard confirmation dialog.
- **Proof of Delivery Foundation (Location & Timestamps):** When a driver completes a stop, the application now requests the device'''s location. A timestamp and the GPS coordinates are securely saved to the database.
- **Enhanced Monitor Dashboard:** The Monitor page now displays the exact time a delivery was completed next to the checkmark, replacing the generic "Fullført" text. Additionally, a clickable "Vis kart" link appears, allowing administrators to open Google Maps pinned to the exact location where the driver was when they completed the stop.
- **External Workforce (Contractors):** Introduced a new system to register and manage hired external extras (Innleid). They receive a dedicated role with customized access, and administrators can log their specific agency contact information.
- **Workforce Statistics Dashboard:** Added a dynamic, date-based statistics overview to the Workforce page, providing administrators with an instant snapshot of personnel status (Working, Sick, Vacation, Off, and Contractors).
- **Vehicle Documents:** Added the ability to upload and manage documents (like registration and insurance certificates) directly on a vehicle'''s profile. An indicator was added to the fleet list view to show if a vehicle has attached documents.
- **3PS Integration:** Added the ability to mark a route as being driven by a Third-Party Supplier (3PS) and log the supplier'''s name in the route editor. The Monitor page correctly displays this information.
- **Vehicle Image Uploads:** Enabled uploading up to 8 compressed photos per vehicle in the Fleet Management module.
- **Driver Image Upload:** Enabled uploading a profile picture for drivers in the Workforce Management module. The picture is displayed in the personnel overview.
- **Period Schedule Overrides:** Added the ability to register schedule overrides (vacation, sick leave, etc.) for entire periods by specifying a start and end date, simplifying data entry for extended absences.
- **Upcoming Overrides Display:** The main workforce page now prominently displays a driver'''s upcoming schedule overrides (up to 3) directly on their profile card for quick visibility.
- **Fleet Management Module:** Added a complete system for administrators to register and manage the organization'''s vehicle fleet.
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
- **Offline Persistence:** Explicitly enabled Firestore'''s IndexedDB local cache to ensure the application remains readable and can queue writes even during network outages.
- **Monitor Page Statistics Card:** Added a "Dagens Status" (Today'''s Status) card to the top of the monitor page (`/dashboard/monitor`). This card provides a high-level overview of the day'''s operations, displaying the total number of routes, active routes, finished routes, total stops across all routes, and an overall progress bar calculating the total number of stops completed against the total number of stops.
- **Route Monitor Dashboard:** Created a new real-time dashboard for administrators (`/dashboard/monitor`) to track the progress of all active routes. It displays a visual progress bar, the current/next stop, and the assigned driver for each route.
- **Finished Route Color-Coding:** The main routes list page now uses real-time listeners to automatically change the color of a route'''s card to green ("Rute fullført") as soon as the assigned driver marks the final stop as complete.
- **Base Addresses for Routes:** Implemented the ability to set distinct Start and End addresses for a route. These act as the origin and destination points for the driving distance and time calculations.
- **Visual Time Intervals:** The time settings (Start, End, Break, Service) are now visualized as distinct, draggable "stops" within the route list, allowing for a more accurate representation of a driver'''s day.
- **Estimated Delivery Time per Place:** Added a field to the "Create/Edit Place" form to specify the estimated time spent at that location (e.g., 15 mins for loading). This time is displayed on the place card and is now factored into the total estimated time for any route including that place.
- **Persistent Route Edits:** Route modifications made by drivers (marking stops as completed, reordering stops, adding/removing stops) are now automatically saved to the database in real-time, preventing progress loss on page refresh.
- **Context-Aware Header:** The global search bar and "New" button now adapt based on the current page. When on the routes page, they search for and create routes instead of places.
- **Route Deletion:** Added the ability for admin users to delete routes directly from the routes overview page.
- **Update Notification:** Implemented a non-intrusive notification system that alerts users when a new version of the application is available.
- **Estimated Driving Time:** The detailed route view now includes the total estimated driving time, calculated by the backend using the Google Maps Directions API.
- **Redesigned Route Page Layout:** Completely overhauled the UI for the individual route page (`/dashboard/routes/[id]`) for improved clarity and usability.

### Changed
- **Place Image Modal UI:** Updated the styling of the close button and the image description caption in the image zoom modal to match the zoom controls (white background with black text) for a more consistent appearance.
- **Route Reassignment & Exception Handling:** Build robust workflows for handling operational exceptions:
    - **Driver Reassignment:** Enable administrators to quickly reassign an entire active route (and its associated vehicle manifest) to a different driver in the event of sudden illness or absence.
    - **Return-to-Depot (RTD) Workflow:** Implement a system for handling undelivered orders. When a driver marks an order as failed (e.g., "Mottaker ikke tilstede"), the system will automatically prompt the administrator to either re-queue the order as "Pending" for a future route or initiate a return-to-sender process.
    - **Terminal Receiving (Unloading):** Close the physical loop for returned goods. When a truck returns with undelivered packages, terminal workers (loaders) must have a dedicated scanning workflow to register these items back into the terminal's physical inventory. This guarantees a strict chain of custody and prevents packages from disappearing into a "black hole" between a failed delivery and a future reassignment.
    - **Admin Exception Dashboard:** Create a dedicated, highly visible view (e.g., "Avvik & Retur") for planners. This dashboard will exclusively list failed deliveries and returned goods that require immediate replanning or return-to-sender actions, ensuring these critical exceptions are never lost in the general pool of pending orders.
- **Return Logistics (Empties & Pickups):** Implement a robust workflow for handling goods collected by drivers during their routes (e.g., empty pallets, return packages, or scheduled pickups).
    - **Driver Registration (Pickup):** Allow drivers to log incoming items at a stop directly within the POD or a new "Pickup" interface, specifying the type and quantity of goods collected.
    - **Terminal Receiving (Unloading):** Extend the loader's manifest interface to include an "Unloading" or "Returns" phase. Loaders will verify and scan/register the collected goods back into the warehouse inventory when the vehicle returns, ensuring accountability for all returning assets.
- **Geofence Constraints for Stamping:** Drivers are now prevented from starting their shift ("Start vakt") if their current GPS location is outside the permitted radius of their assigned base location or the organization'''s main depot.
- **Customer Portal & Live Tracking (B2B/B2C):** Establish a seamless and transparent information flow directly to the end-customer, reducing "Where is my delivery?" support calls.
    - **Live Tracking Link:** Automatically generate and send (via SMS/Email) a secure tracking link to the recipient when their order is dispatched. This page will show an estimated arrival time window based on the driver's current progress along the route.
    - **Self-Serve POD Retrieval:** Allow B2B customers to securely access and download their own Proof of Delivery (POD) documentation, including signatures and timestamped photos, directly from a web portal without needing to contact customer service.
    - **Self-Serve Return Registration:** Empower customers to initiate returns or schedule pickups of empty goods (e.g., pallets) directly through their portal. This automatically generates a 'Pending Pickup' order in the administrator's queue, allowing planners to proactively route drivers for collection without requiring manual customer service intervention.
- **Dashboard Telemetry Links:** Added quick navigation links to the headers of the main dashboard telemetry cards (Workforce, Fleet, Orders), allowing administrators to quickly jump to the relevant management page.
- **Splash Screen:** Updated the splash screen to feature a bouncing logo and the slogan "Presisjon helt frem til døren".
- **Database Architecture Refactoring:** Addressed technical debt by dismantling the "God Object" in `src/lib/firebase/database.ts`. Extracted domain-specific database operations into separate repository files within `src/lib/db/` (e.g., `users.ts`, `places.ts`, `orders.ts`, `routes.ts`, `vehicles.ts`). The main `database.ts` file now serves cleanly as an aggregator.
- **Route Planning Workflow:** Updated the route planner interface to add pending orders instead of standalone places to routes. Selecting an order from the list automatically associates the corresponding place with the route. When saving the route, the orders are updated to contain the `routeId`.
- **Route Planner Enhancements:** Added a vehicle selection dropdown in the route edit interface to assign a specific vehicle from the organization'''s fleet. Order dimensions (weight, volume, form) and special requirement badges (ADR, Kjøl/Frys, Skjør) are now displayed on the route stops. 
- **Intelligent Capacity Checking:** Implemented real-time dynamic capacity warnings in the route planner. When a vehicle is assigned, the system continually calculates the cumulative weight, volume, and pallet count from all assigned orders and instantly warns the planner if the vehicle'''s safe limits are exceeded.
- **Intelligent Schedule Checking:** Implemented real-time dynamic warnings regarding driver availability in the route planner. The system now validates the assigned driver'''s registered working hours, weekly rotation, and absence schedule (e.g., sickness, vacation) against the specifically planned date for the route.
- **Admin Dashboard Separation:** Redesigned the admin experience by clearly separating the operational dashboard (`/dashboard`) from the management console (`/dashboard/admin`).
- **Admin Operational Dashboard:** The main dashboard for administrators now features a high-level operational overview, directly integrating real-time statistics from both the Workforce (Personnel working/sick/vacation) and Monitor (Routes & Stops progress) modules. It also includes their personal time-stamping card and pending invitations.
- **Admin Operational Dashboard Expansion:** Added real-time order statistics (Totalt, Venter, Lastet, Levert) directly to the main admin dashboard for a more complete operational overview.
- **Admin Management Console:** The `/dashboard/admin` page is now strictly dedicated to organizational settings, user/role management, and data import/export functionalities. The "Utestående Invitasjoner" (Pending Invitations) component was relocated here to fit the management context.
- **Maximum Width Constraints:** Removed aggressive "container" overrides across all major dashboard views (Workforce, Monitor, Fleet, Routes, Places) to ensure the interface does not stretch awkwardly on ultra-wide desktop monitors. The entire application now maxes out at a comfortable 1280px width (max-w-7xl) and remains perfectly centered.
- **Vehicle Form UI:** Significantly enhanced the visual hierarchy of the "Registrer Nytt Kjøretøy" (Register New Vehicle) dialog. Employed stark white cards, distinct header backgrounds, subtle drop shadows on inputs, and rounded interactive toggles to make data entry much clearer and easier on the eyes.
- **Route Notes Visibility:** "Viktig Ruteinformasjon" (Important Route Information) for drivers has been integrated directly into the top of the task list as a high-contrast amber box. This ensures it is immediately visible before they start their route.
- **Sidebar Navigation:** The "Meldinger" (Messages) link has been repositioned directly below "Ruter" in the sidebar for better workflow grouping.
- **Unified Action Button:** Streamlined the user interface by replacing local "Create New" buttons on various pages (like the Routes page and Fleet page) with a single, context-aware action button in the top right corner of the global header. This button automatically adapts its icon and action (e.g., "Nytt Kjøretøy", "Ny Rute", "Nytt personell") based on the current active view.
- **Contextual Global Search:** Upgraded the global search bar in the top navigation to be context-aware. When viewing the Fleet ("Kjøretøy") or Workforce ("Personell") pages, the search bar now automatically filters the respective lists on those pages, rather than redirecting the user to the generic Places search.
- **Global Search UI:** The global search bar logic has been improved. Navigating to the `/dashboard/manifests` or `/dashboard/messages` pages now removes any duplicate local search bars and utilizes the single global search bar in the header to instantly filter the local lists. 
- **Workforce Form Redesign:** Completely redesigned the "Edit Driver Profile" and "Register Vehicle" forms to use a clean, card-based layout, significantly improving readability and usability.
- **Workforce Print UI:** The "Plan (12 uker)" print button on the workforce overview is now conditionally rendered, appearing only if the driver has an active rotation schedule configured.
- **Workforce Status Text:** Updated the fallback status text for drivers on a rotation schedule without a specific daily plan to say "Bruker Turnusplan" instead of "Ingen plan satt".
- **Sidebar Navigation:** Wrapped the main sidebar navigation links in a scroll area to prevent overflow and ensure all items remain accessible on smaller screens.
- **Date Picker Reliability:** Replaced the custom Popover/Calendar component used for selecting dates across the entire application (including the main Workforce page) with a native HTML `<input type="date">` for improved reliability and vastly superior mobile support.
- **Driver Profile Image limit**: Limited the number of images a driver can upload to their profile to 1.
- **Driver Route View Permissions:** Refined the detailed route view (`/dashboard/routes/[id]`) to hide administrative controls from drivers. The "Tidsinnstillinger" (Time Settings), "Tildelt Sjåfør" (Assigned Driver) panels, and the "Lagre Rute" (Save Route) button are now exclusively visible to admin users. The route name input is also read-only for drivers. Drivers still retain the ability to add/remove stops, reorder them, and optimize the route.
- **Route Calculation Logic:** The backend Google Maps integration was updated to natively support calculating routes that begin and end at arbitrary base addresses, rather than solely relying on a saved Place ID.
- **Deployment Strategy:** Migrated the project from Firebase'''s classic static hosting to the modern App Hosting service.
- **Driver Assignment Display:** Improved the display for the assigned driver. If the current user does not have permission to change the driver, it now correctly shows the assigned driver'''s name or "Ikke tildelt" (Unassigned) instead of showing a disabled dropdown.
- **Manual Route Saving:** Replaced the unreliable auto-save functionality for the entire route structure with an explicit "Lagre Rute" (Save Route) button visible to all users. This ensures the backend route data is only updated when the user intends to save their final arrangement.

### Fixed
- **iOS Map Rendering Fix (Reverted):** Reverted experimental CSS 3D transforms and removed the `loading="lazy"` attribute from the Google Maps iframe on the place details page. The lazy loading attribute was causing the iframe to fail to initialize on certain iOS WebKit versions.
- **iOS Map Rendering Fix:** Fixed an issue where the Google Maps iframe on the place details page would not render on certain iOS devices (specifically older versions like iOS 16) by forcing hardware acceleration and absolute positioning.
- **Firestore Offline Persistence Error:** Fixed an issue where the IndexedDB transaction failed on offline persistence by configuring Firestore to use persistentSingleTabManager.
- **docs: update CHANGELOG for vehicle inspection feature**
- **Manifest Page Statistics:** Fixed an issue on the main manifests overview page (`/dashboard/manifests`) where the progress bar and item count were calculated incorrectly. The page now uses the same accurate `loadedItems` and `totalItems` calculation as the individual manifest detail page, ensuring consistency.
- **Cascade Deletion:** Fixed an issue where deleting a route would leave orphaned loading manifests. Deleting a route now automatically deletes any associated manifest from the database.
- **Null Reference Errors:** Fixed `Invalid document reference` errors in Firestore by ensuring the vehicle ID is validated before fetching. Graceful handling was added to both Route and Manifest views for routes without assigned vehicles.
- **Favorite Button Import:** Fixed an import error in `FavoriteButton` caused by refactoring the database file.
- **Vehicle Document Upload:** Fixed an issue where uploading documents/images to a new vehicle would fail due to an invalid Firestore document reference. The vehicle is now created first to secure an ID before file upload.
- **Manifest Route Linking:** Fixed an issue where newly created routes did not appear on the Lasterampe (Manifests) page. Creating a route now automatically generates a corresponding pending manifest.
- **Firestore Permissions:** Resolved permission-denied errors related to the new real-time messaging system and the revocation/deletion of pending invitations by administrators. Updated Firestore security rules to explicitly permit message deletion.
- **Monitor Page Rendering:** Fixed an issue where the completion state of routes (e.g., green styling, checkmarks) occasionally failed to render due to broken template literals.
- **Form Layout Fixes:** Corrected several layout and alignment issues in the driver profile form, particularly within the "Avvik & Ferie" card, ensuring it stacks properly on smaller screens.
- **Date Picker State Bug:** Fixed an issue where the selected date for an override in the driver profile was not being registered correctly by migrating to the native HTML date input.
- **Admin Dialog Freeze:** Fixed an issue where the screen would remain unclickable (frozen pointer events) after saving or closing the "Edit Driver Profile" dialog in the Admin Panel.
- **Calendar Layout Issue:** Corrected styling issues with the `react-day-picker` integration that caused the rotation start-date calendar to render incorrectly.
- **Driver Profile Save Error:** Fixed a backend error that occurred when saving a driver'''s profile by explicitly using `deleteField()` instead of setting fields to undefined.
- **Driver Profile Storage Permissions:** Updated Firebase Storage rules to allow administrators to upload profile pictures on behalf of drivers.
- **Mobile Route Item Display:** Corrected a layout bug in the detailed route view that caused the estimated delivery time badge for each place to be hidden on smaller mobile screens.
- **Dynamic Route Recalculation:** Fixed an issue where the total estimated route time failed to update instantly when a user manually dragged and dropped stops to reorder them. The UI now reliably recalculates driving distance and total duration upon every physical route alteration.
- **Android Touch Support:** Resolved a bug preventing drag-and-drop reordering of route items on Android devices by implementing a dedicated `TouchSensor` with an activation delay.
- **Optimization API Lock:** Corrected a bug in the backend `calculateRouteDistance` function where Google Maps was permanently instructed to "optimize" the route. It now correctly respects manual user ordering during a standard calculation and only invokes the optimization engine when the explicit "Optimer Rekkefølge" button is pressed.
- **Memory Leak in Route Calculation:** Resolved a memory leak caused by unresolved Promises in the debounce function for distance calculations on the route page.
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
- **Removed Redundant Quick Actions Card**: Removed the "Snarveier" card from the operational dashboard sidebar.

## [Future]

### Added
- **Place Opening Hours (Complex Implementation):** Implement a system to define opening hours for each delivery/pickup location.
    - **Phase A (Data):** Extend the `Place` model to store a 7-day schedule (open/close times or marked closed). Add this to the "Create/Edit Place" form.
    - **Phase B (Route Logic - High Complexity):** Upgrade the route planning interface to actively warn planners if a calculated ETA falls outside a location's opening hours.
        - *Complexity Note:* This requires significant backend changes. The `calculateRouteDistance` Cloud Function must be rewritten to return travel times for individual "legs" between stops, not just the total route time. The frontend must then perform sequential calculations: Route Start Time + Drive Time (Leg 1) + Stop 1 Est. Duration + Drive Time (Leg 2) = ETA Stop 2.
- **Admin Attendance Dashboard Card:** Add a new card to the Admin Operational Dashboard that displays daily attendance statistics, showing how many scheduled personnel have checked in, are currently present, and have checked out.
- **Workforce Statistics "Annet" Category:** Expand the Workforce Statistics Dashboard (which currently shows Working, Sick, Vacation, Off, and Contractors) to include a sixth category box for "Annet" (Other) to capture personnel with statuses that do not fit the main five.
- **Geofence-based Delivery Alerts:** Automatically calculate the distance between the planned stop'''s address and the driver'''s captured GPS location. If the distance exceeds a configurable threshold, an alert will be generated and displayed in real-time on the admin dashboard to flag potential delivery errors.

### Changed
- **Place Image Modal UI:** Updated the styling of the close button and the image description caption in the image zoom modal to match the zoom controls (white background with black text) for a more consistent appearance.
- **Workforce Management:** Implement a restriction preventing Administrators from approving their own work logs, requiring peer or owner review.
- **Advanced Route Management Strategy:** A new tiered approach for route planning will be implemented to enhance efficiency and automation.
    - **Tier 1: Route Archiving & Templates:** Finished routes will be archived for historical analysis. Planners will be able to save any route as a "Template" to quickly recreate recurring or similar routes.
    - **Tier 2: Order-Based Planning & Multi-Channel Intake:** An "Order" module will be introduced to manage incoming jobs. To ensure redundancy and flexibility, this module will support a dual-intake strategy:
        1.  **Manual Registration:** A comprehensive UI form for planners to manually input order details (type of goods, weight, exact dimensions, sender/receiver, special requirements like ADR or temperature control).
        2.  **API Integration (Future):** A robust, versioned API endpoint to automatically ingest orders from external Transport Management Systems (TMS), ERPs, or customer portals.
    Each order will act as the foundational unit for both manual and automated route assignment.
    - **Tier 3: Constraint-Based Automatic Generation:** An intelligent backend system will automatically generate optimized daily routes. This system will perform constraint-based matching, assigning orders not only based on location but also by matching the goods''' requirements to defined vehicle capabilities from the Fleet Management module. It will flag any jobs that cannot be assigned due to a lack of compatible vehicles.
    - **Tier 4: Manual Override & Ad-Hoc Routing:** Despite automation, the real world is unpredictable. Planners must always retain the ability to manually override automated assignments, drag-and-drop orders between vehicles mid-route, and create completely custom, ad-hoc routes from scratch without relying on the automated engine.

### Fixed
- Fixed an issue in `FleetPage` where pressing "Registrer kjøretøy" did nothing because `orgId` was missing in `VehicleForm`.

### Added
- **Fleet Management & Compliance:**
  - Added new fields to the `Vehicle` model to track `euControl`, `nextService`, and `tachographCalibration` deadlines.
  - Form inputs added to `VehicleForm` for registering these deadlines.
  - Implemented a completely new `VehicleDamageReport` entity to track reported damages and their resolution status independently.
  - Created a `VehicleDetailsModal` on the Fleet dashboard, accessed by clicking any vehicle card. This modal displays:
    - An overview of damages with ability to change status (reported, in progress, fixed).
    - Compliance dashboard showing the status of the vehicle's deadlines.
    - A 14-day chronological "Usage Log" showing which drivers have been utilizing the vehicle.
    - A "Generate PDF" feature allowing simple printing of the vehicle's status and damage report.
  - Linked driver vehicle inspections (Pre/Post-trip) directly to the damage reporting system: if a driver reports a damage during an inspection, it automatically creates a new `VehicleDamageReport` visible to admins.
