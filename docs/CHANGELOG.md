# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Vehicle Persistence Reliability**: Refactored the vehicle saving architecture to resolve issues where new or edited vehicles could not be saved.
    - Implemented a unified `saveVehicle` method to handle both creation and updates atomically.
    - Decoupled database logic from the `VehicleForm` UI component for cleaner data flow.
    - Improved error handling and user feedback during the save process on the Fleet Dashboard.

### Added
- **Explicit Vehicle Weight Tracking**: Added `emptyWeight` field to vehicle profiles for precise site access validation.
- **Persistent Label System**: Implemented a professional, route-independent labeling system for orders.
    - Labels focus on destination (Name, Address, Postal Code) and physical specs rather than transient route names.
    - Eliminates the need for re-printing labels when routes are changed or orders are reassigned.
    - Supports both **Barcode (Code 128)** and **QR-code** formats.
- **Organization-Level Label Settings**: Administrators can now customize their label infrastructure.
    - Choice between traditional Barcodes or omnidirectional QR codes.
    - Toggle for "VIDERE RettSted" branding on physical labels.
    - Real-time preview of label formats in the generation modal.
- **PWA Routing Optimization**: The application `manifest.json` now defines `/dashboard` as the `start_url` to bypass marketing landing pages and provide a true native app experience.
- **SEO & Search Indexing**:
    - Added comprehensive OpenGraph and Twitter meta tags to `src/app/about/page.tsx` for optimal social sharing.
    - Generated a `sitemap.xml` via `src/app/sitemap.ts` pointing to the public marketing pages.
    - Implemented a `robots.txt` that allows crawling of marketing pages while actively disallowing indexing of `/dashboard/` and auth routes.
- **Advanced Camera Scanner**: Integrated `@zxing/library` into the Manifest loading view (`/dashboard/manifests/[id]`). Users can now use their device's built-in camera (front or back) to rapidly scan barcodes/QR codes during the loading process with visual targeting UI and audio feedback.
- **Route Lifecycle Visualization:** Route cards now dynamically display their operational status (Klargjøres, Venter på rampen, Lastes, Underveis, Fullført) based on real-time manifest data.
- **Route Progress Visualization:** Replaced text-based badges with a sleek data-driven Progress Bar on route cards, showing exact completion metrics (e.g., "3/10 stopp").
- **Customizable Progress Component:** Enhanced the UI `Progress` component to support custom indicator colors via the `indicatorClassName` prop.

### Changed
- **Optimized Routing Engine**: Major overhaul of the constraint-based routing logic for increased reliability and accuracy.
    - **Fixed Weight Calculation**: Resolved a bug where 15,000 kg was erroneously added to all vehicle types. Now uses registered `emptyWeight` with fallback to type-based estimates (Van: 2.2t, Truck: 7.5t, etc.).
    - **Dynamic Depot Positioning**: The engine now utilizes the organization's `mainDepot` coordinates if defined, eliminating range errors for non-Oslo based organizations.
    - **Robust Location Handling**: Added support for both `coordinates` and `location` fields on places to ensure compatibility with imported data.
    - **Improved Diagnostics**: Enhanced internal logging and UI feedback to clearly explain why specific orders were skipped (e.g., "Range exceeded", "Capacity mismatch").
- **Optimized Mobile Scanner**: Significantly improved the camera scanner for iOS and other mobile devices.
    - Switched to `decodeFromConstraints` with `facingMode: environment` to ensure the rear camera is used by default.
    - Improved camera switching logic for better compatibility with Safari on iOS.
    - Added haptic feedback (vibration) and scan debouncing for a better user experience.
    - Expanded supported barcode formats and enabled `TRY_HARDER` mode for faster/more accurate scanning.
- **Super Admin Responsiveness:** Optimized the Super Admin dashboard (`/dashboard/super`) for mobile and tablet views. Fixed horizontal overflow by implementing responsive grids for organization stats, ensuring text truncation in dense tables, and refining the header layout for smaller screens.
- **Routing Engine UI Refinement:** Fixed vertical overflow and spacing issues on the Routing Engine page (`/dashboard/admin/routing-engine`). Improved the empty state layout with better padding and contained animations.
- **Robust Route Estimation:** Optimized the Routing Engine to prevent double-counting stop times and added validation to prevent invalid (NaN) duration values.
- **Improved Deletion UX:** Replaced the squeezed header delete icon with a clear "Slett Rute/Mal" button at the bottom of the card for better accessibility on mobile and high-density layouts.
- **Real-time Metric Recalculation:** The Routing Engine dashboard now automatically recalculates estimated time and distance when orders are removed from a suggestion.
- **PWA Update Notifier:** Added a "New Version Available" toast notification with one-click refresh, ensuring users always run the latest version of the application.
- **Automated API Documentation:** Configured `typedoc` with `typedoc-plugin-markdown` to automatically generate comprehensive API documentation from TSDocs in the `docs/api` directory.
- **User Manual Updates:** Added detailed instructions for the new Kameraskanner functionality to the internal manual.
- **Compliance & Risk Management (Phase 6 Completion):**
    - **Odometer Tracking (`kilometerstand`):** Vehicles now track and display real-time mileage. Drivers update the odometer reading during every pre/post-trip inspection.
    - **Tachograph Download Monitoring:** Implemented automated tracking for the 90-day vehicle tachograph download requirement. Includes color-coded visual alerts for overdue or approaching deadlines.
    - **Driver Card Monitoring:** Implemented 28-day download tracking for driver cards. Integrated directly into the Workforce dashboard with one-click "Registrer nedlasting" functionality for admins.
    - **Expanded Damage Reporting:** Driver inspections now support up to 4 photographic proofs of damage, automatically linked to the vehicle's permanent history.
- **GDPR Audit & Transparency:**
    - **Automated Access Logging:** Every instance of an administrator viewing sensitive personnel data (SSN, Salary) or exporting HR lists is now recorded.
    - **Audit Log Viewer:** Added a dedicated "Sikkerhetslogg" component to the Admin Dashboard, allowing authorized users to view the trail of critical system actions.
- **Hardened Security & Managed Onboarding (Phase 5 Completion):**
    - **Closed Public Registration:** Replaced the `/register` form with a "Manual Onboarding" notice, directing users to contact support for organization setup.
    - **Restricted Organization Creation:** Updated Firestore security rules to strictly allow only `super_admin` to create new top-level `organizations` documents.
    - **Super Admin Creation Logic:** Enhanced the Super Admin dashboard to properly initialize new organizations with default modules, timestamps, and legal versioning.
    - **MFA Implementation Plan:** Created a comprehensive roadmap (`docs/mfa-plan.md`) for introducing Multi-Factor Authentication across the platform.
- **Voluntary MFA Enrollment:** Added a new Security section to the User Profile (`/dashboard/profile`) allowing users to link a phone number for SMS-based two-factor authentication.
- **Avvikshåndtering (Danger Reports) Foundation:**
    - Established the `reports` Firestore collection rules to track hazards at delivery locations.
    - Added a dedicated `/dashboard/reports` page for admins and drivers to view and resolve issues.
- **Role System Expansion:**
    - **HMS Responsible (`hms_responsible`):** A new role that has access only to Places and the new dedicated HMS page. 
    - **Salesman (`salesman`):** A new role that has access only to Places. Restricted to editing basic info and a new temporary "Sales Message" field.
- **Dedicated HMS Navigation:**
    - Extracted the HMS Log and HMS Settings out of the generic Admin Dashboard.
    - Created a new, dedicated `/dashboard/hms` page for managing safety protocols.
- **TSDoc Standards & Coverage:** Established formal TSDoc instructions and achieved 100% documentation coverage for all major dashboard components and core library interfaces.
- **Owner Role & Executive Dashboard:**
    - **Executive Dashboard (`/dashboard/owner`):** Created a premium dashboard for business owners.
    - **Compliance KPIs:** Added real-time fleet and workforce compliance percentages to the executive overview.
- Added read count indicator for broadcast messages
- **Bulk Order Import Migration:** Moved order import functionality to the Orders page.
- **Hybrid Customer Numbering System:** Introduced manual/auto-generated numbering for Places.
- **Super Admin Dashboard:** Launched cockpit at `/dashboard/super` for platform-wide organization management.

### Fixed (Previous)
- **UI Overflow Issue on Routes Page**: Adjusted responsive sizing and flex properties on the empty state icons in `/dashboard/routes` to prevent vertical overflow on smaller screens. Added margin to the bottom of the container.
- **Firestore Array Timestamp Error**: Replaced `serverTimestamp()` with ISO strings (`new Date().toISOString()`) when updating nested fields inside the `orders` array within a Manifest.
- **Firestore Undefined Field Error**: Fixed an issue in `decrementManifestItemLoadedCount` where setting a property to `undefined` caused a crash. Replaced with the `delete` operator.
- **Manifest Scanner Matching**: Corrected a bug where the manual scanner input failed to match valid order IDs or collie IDs due to missing document ID properties and restricted queries.
- **Parsing Error in Routes:** Fixed a stray character on the first line of `src/app/dashboard/routes/page.tsx` and added missing imports.
- **Firestore Security Rules:** Corrected a malformed `list` rule for the `routes` collection and fixed the manifest query path in the route details page to resolve `permission-denied` errors.
- **Driver Assignment Consistency:** 
    - Updated the Routing Engine to correctly save the `driverName` when autogenerating routes.
    - Enhanced the Route Details page to look up missing driver names and provided a validated selection menu for manual assignment.
- **Module Gating & Real-time Propagation:** Fixed an issue where the "Avvik" (Danger Report) features were still visible to drivers after being disabled by an administrator. Implemented real-time organization listeners in the Sidebar and Places page to ensure instant UI updates.
- **Next.js 15 Migration & Build Stability:** Resolved all Promise-based API issues and type mismatches across the application. Verified with successful production builds.
- **Firestore Missing Index:** Added a composite index for the `audit_logs` collection to support high-performance filtering and ordering by orgId and timestamp.
- **Admin Dashboard Feature Restoration:** Fixed a regression where several administrative controls (Place field settings, Pending invitations) were temporarily removed during a documentation pass.
- **Admin Notification Overload:** Refactored unread message logic for administrative roles.
- **Build Failure (React 19):** Resolved peer dependency conflicts between React 19 and Tremor.
- **Place Form Draft Restoration:** Improved restoration of complex objects (GPS, HMS answers).
- **HMS Checklist Interaction:** Resolved double-toggle bug in checkboxes.
- **Owner Privilege Propagation:** Fixed issue where 'owner' role lacked admin privileges in specific views.
- **Maximum update depth fixes:** Resolved UI crashes in Collapsible, Switch, and Accordion components under React 19.

### Deployment Note (REQUIRED)
> [!IMPORTANT]
> **Manual Deployment Steps:**
> 1.  **Firestore Rules:** Run `firebase deploy --only firestore:rules` to activate new security logic.
> 2.  **Firestore Indexes:** Run `firebase deploy --only firestore:indexes` to support Audit Log queries.
> 3.  **Cloud Functions:** Run `firebase deploy --only functions` to apply updated `orgId` signature fixes.
> 4.  **Firebase Console:** Enable "Identity Platform" and "Phone MFA" in the Authentication settings to support the new security features.

## [0.1.0] - 2024-05-22

### Added
- **API Documentation:** Integrated `typedoc` for automatic Markdown documentation.
- **Advanced Fleet Compliance:** Workshop workflows, damage triage, and status manager.
- **Visual Compliance Dashboard:** Color-coded deadline tracking for EU-kontroll, etc.
- **Constraint-Based Routing Engine:** Capability, capacity, and time-window validation.
- **LMS (Learning Management System):** Course player and employee progress tracking.
- **Bulk Order Import:** CSV-based tool with auto-mapping.
- **Rapid "Scan-to-Receive":** Mobile ingestion interface for terminal workers.
- **Hierarchical Barcodes:** SSCC and collie tracking.
- Initial project scaffolding with Next.js 15, React 19, and Tailwind CSS.
- Basic Firebase configuration (Auth, Firestore, Storage).
- Architecture blueprints (`docs/blueprint.md`, `docs/domain.md`, `docs/engineering.md`, `docs/roles-and-permissions.md`, `docs/strategy.md`, `docs/ui-specification.md`).
- Core generic database functions for user profiles, organizations, and logging.
- `types.ts` defining the data model based on `docs/domain.md`.

### Fixed
- **Vehicle Creation Bug:** Fixed issue where registration failed.
- **iOS Map Rendering:** Resolved hardware acceleration issues.

## [Future]

### Added
- **Commercialization & SaaS Foundation (Phase 7):**
    - **Stripe Subscription Sync:** Automated lifecycle management via Firebase Stripe Extension.
    - **Feature Gating:** Strict access control based on subscription tier (Free, Pro, Enterprise).
    - **Billing Portal:** Integrated customer billing portal for invoice management.
- **Enhanced Sales Messaging Visibility:** Megaphone icon on PlaceCards.
- **Geofence-based Delivery Alerts:** Automatic flagging of deliveries outside radius.
- **API Intake:** Secure REST endpoint for external TMS/ERP order ingestion.
- **Tachograph Analysis:** Detailed reporting on driving/rest time regulation breaches.
- **Capacitor.js Integration:** True native mobile distribution (Phase 8).
