# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Expanded Place Imagery**: Increased the maximum number of allowed photos per Place from 8 to 15.
- **Structured & Reorderable HMS Checklists**: Admins can now add subheadings to group HMS questions and rearrange the entire list using drag-and-drop functionality in the HMS settings.
- **HMS Result Visibility**: Drivers can now see completed HMS checklists directly in the detailed Place view, including a full date/time stamp and investigator name.
- **Manual Route Planning**: Integrated a comprehensive order and stop management system into the Route Details page.
    - Planners can now manually assign/unassign orders to specific routes.
    - Ability to add ad-hoc stops (Places) to a route without associated orders.
    - Automatic synchronization between Route, Orders, and Manifests during manual planning.
- **Intelligent Vehicle Coupling**: The routing engine now supports complex vehicle combinations.
    - **Tractor & Semi-trailer**: Automatically pairs tractors with compatible semi-trailers.
    - **Swap-body Support**: Links rigid trucks with swap-body configurations to appropriate units.
    - **Aggregated Capacity**: Weight, volume, and pallet limits are now calculated based on the total combined capacity of the power unit and trailer.
- **Explicit Vehicle Weight Tracking**: Added `emptyWeight` field to vehicle profiles for precise site access validation.
- **Persistent Label System**: Implemented a professional, route-independent labeling system for orders.
- **Organization-Level Label Settings**: Administrators can now customize their label infrastructure.
- **PWA Routing Optimization**: The application `manifest.json` now defines `/dashboard` as the `start_url`.
- **Advanced Camera Scanner**: Integrated `@zxing/library` into the Manifest loading view.

### Changed
- **UI Layout Standardization**: Migrated all dashboard pages to a consistent left-aligned layout (`p-4 sm:p-6 lg:p-8 space-y-8`).
    - Removed `max-w-7xl mx-auto` centering to improve usability on large screens and match the `Places` page design.
    - Updated Pages: Routes, Fleet, Orders, Monitor, Workforce, Admin, Learning, and Routing Engine.
- **New Route Workflow**: Updated the "New Route" creation flow to redirect users directly to the planning interface for immediate order assignment.
- **Optimized Routing Engine**: Major overhaul of the constraint-based routing logic.
    - **Fixed Weight Calculation**: Uses registered `emptyWeight` with fallback to type-based estimates.
    - **Dynamic Depot Positioning**: Utilizes the organization's `mainDepot` coordinates.
    - **Robust Location Handling**: Support for both `coordinates` and `location` fields.
- **Optimized Mobile Scanner**: Significantly improved camera scanning reliability on iOS.

### Fixed
- **PlaceCard Button Alignment**: Refactored the `PlaceCard` footer to use a consistent `grid-cols-2` layout, ensuring "Fyll ut HMS" and "Meld Avvik" buttons align perfectly with "Se mer" and "Naviger" buttons regardless of state.
- **Security Rule Permissions**: Resolved "Missing or insufficient permissions" error in the Learning Portal by allowing users to read and update their own `courseAssignments`.
- **Vehicle Persistence Reliability**: Refactored the vehicle saving architecture to resolve issues where new or edited vehicles could not be saved.
- **UI Navigation**: Added "Avbryt" buttons to creation forms (e.g., New Route) to prevent users from getting stuck.
- **UI Overflow Issue on Routes Page**: Adjusted responsive sizing for smaller screens.
- **Firestore Array Timestamp Error**: Corrected handling of ISO strings in nested arrays.

### Deployment Note (REQUIRED)
> [!IMPORTANT]
> **Manual Deployment Steps:**
> 1.  **Firestore Rules:** Run `firebase deploy --only firestore:rules` to activate new security logic (Already performed).
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
- **Enhanced Sales Messaging Visibility**: Megaphone icon on PlaceCards.
- **Geofence-based Delivery Alerts**: Automatic flagging of deliveries outside radius.
- **API Intake**: Secure REST endpoint for external TMS/ERP order ingestion.
- **Tachograph Analysis**: Detailed reporting on driving/rest time regulation breaches.
- **Capacitor.js Integration**: True native mobile distribution (Phase 8).
