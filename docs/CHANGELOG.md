# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added   
- **TSDoc Standards:** Established a formal "TSDoc System Instruction" to guide AI-generated documentation. This ensures high-quality, architect-level comments with code examples, type intelligence, and professional vibe checks for the entire codebase.
- **Owner Role Management:**
    - **Role Assignment:** Admins and Super Admins can now explicitly invite new users with the `owner` role.
    - **Role Promotion/Demotion:** Added the ability to upgrade existing users to `owner` or demote them back to `admin` directly from the user list in the Admin Dashboard.
    - **Security Rules Update:** Updated Firestore security rules to formally grant the `owner` role the same administrative read/write permissions as the `admin` role across all organizational collections (Places, Vehicles, Routes, etc.).
- **Owner Role & Executive Dashboard:**
    - **New `owner` Role:** Added a new high-level role (`owner`) designed for executives and finance departments. This role bypasses standard `admin` checks but also has access to exclusive views.
    - **Executive Dashboard (`/dashboard/owner`):** Created a premium, minimalist dashboard specifically for business owners. It aggregates key metrics (Users, Address Database, Fleet Size, Total Orders) without the clutter of daily operations.
    - **Subscription & API Management:** The new Owner dashboard includes placeholders and UI for managing the organization's SaaS subscription (Stripe integration planned for Phase 7) and generating API keys for external ERP/TMS software.
    - **Sidebar Integration:** Owners now have an exclusive "Bedriftsoversikt" link in the sidebar under Administration.
- **Super Admin Analytics & Management Enhancements:**
    - **Global Platform Statistics:** Expanded the global statistics counter in the Super Admin dashboard header. In addition to "Totale Brukere", it now cleanly lists the "Totale Steder" and "Fullførte Ruter" across the entire platform.
    - **Global Broadcast System:** Super Admins can now send a global "System Message" (Broadcast) to all users across all active organizations directly from the Super Admin panel. This uses a batched database operation to insert the message securely without compromising RBAC rules.
    - **Intelligent Module Plans:** The Plan dropdown (Free, Pro, Enterprise) now automatically configures the appropriate modules for the organization when selected.
    - **Billing & Subscription Context:** Introduced a foundation for SaaS plans (`Free`, `Pro`, `Enterprise`). Super Admins can now view and modify an organization's subscription plan directly from the dashboard.
    - **Real-time Quota Tracking:** Added real-time usage metrics to the Super Admin panel. It now fetches and displays the precise count of Users, Places, Vehicles, and Orders for each organization dynamically using `getCountFromServer` for fast aggregation.
    - **Organization Editing:** Super Admins can now quickly rename organizations and update their Organization Numbers directly from a modal without leaving the panel.
    - **Hard Delete (Danger Zone):** Added a protected action to permanently delete an organization. This requires typing the exact organization name to confirm the destructive action.
- **HMS Documentation Log & Export:**
    - **Audit Log:** Added a comprehensive HMS Documentation Log to the Admin Dashboard. It automatically tracks all delivery locations where safety checklists have been completed.
    - **Detailed Audit Trail:** Each log entry displays the place name, customer number, person who completed the checklist, and the timestamp.
    - **Dynamic Expansion:** Users can click on any log entry to view the full question-by-question answers and any specific safety comments.
    - **CSV Reporting:** Added a one-click "Export CSV" feature that generates a structured report of all HMS data for the organization, including dynamic columns for every safety question defined in the settings.
- **HMS Sjekkliste for Places:** Added a customizable safety checklist system for delivery locations.
    - **Admin Controls:** Admins can enable the feature, set a custom title, and manage an unlimited number of questions from the Admin Dashboard.
    - **Glove-Friendly UI:** The Place Form now features extra-large checkboxes designed for drivers wearing gloves.
    - **Optional Comments:** Admins can require or allow a final comment field for additional safety notes.
    - **Audit Trail:** The system permanently records who completed the checklist and when.
- Added read count indicator for broadcast messages
- **Bulk Order Import Migration:** Moved the order import functionality from the Admin panel to the Orders page for better accessibility. Added a dedicated "Bulk Import" dialog on the Orders page.
- **Real-time Fleet Maintenance Tracking:** Upgraded the `VehicleDetailsModal` to use a Firestore `onSnapshot` listener for damage reports. This ensures that cases reported by both drivers and admins appear instantly in the history list.
- **Hybrid Customer Numbering System:** 
    - Introduced `customerNumber` field to `Place` model.
    - Added Organization settings to toggle between manual and automatic customer numbering.
    - Implemented thread-safe auto-generation using Firestore transactions, supporting custom prefixes and starting sequences.
    - Added customer number badges to Place Cards for quick identification.
- **Super Admin Dashboard (App Owner Control):** Launched a centralized cockpit at `/dashboard/super` for the application owner to manage organizations and modular access.
- **Organization Context Switching:** Super Admins can now instantly "log in" as any organization to view data and verify settings from their perspective.
- **Multi-Tenancy Module Gating:** Implemented a robust feature-toggling system.
    - **Modular Organizations:** Organizations can now have specific modules (LMS, Fleet, Logistics, etc.) enabled or disabled.
    - **Intelligent Sidebar:** The navigation menu automatically adjusts based on the organization's active modules and the user's role.
    - **Driver Dashboard Gating:** The main dashboard for drivers now conditionally hides Logistics and Message sections based on organization setup.
    - **Workforce Gating:** The "Arbeidstid" punch-in card is now hidden if the workforce module is disabled.
    - **Global Statistics:** Super Admins can see total user counts across the entire platform.
- **New `super_admin` Role:** Introduced a high-level administrative role with cross-organization visibility and system-wide configuration rights.
- **Organization Status Management:** Super Admins can now toggle organization states between "Aktiv", "Prøveperiode" (Trial), and "Suspendert".

### Changed
- **Super Admin Search Context:** Removed the top-level main navigation search bar from the Super Admin panel to keep the interface clean, as global search is handled within the panel itself.
- **Super Admin UI Refactor:** Completely redesigned the Super Admin dashboard layout to be more compact and readable. Moved the search bar to the header, compressed the organization statistics into a horizontal bar, and redesigned the module toggles as compact pill-shaped badges.
- **Place Form Redesign:** Converted the "Grunnleggende informasjon", "Leveringsdetaljer", and "HMS Sjekkliste" sections in the place creation form to collapsible cards for better organization and consistency with the rest of the form.
- **Place Form UI Improvements:** 
    - Removed the small inline map pin icon from the address field.
    - Added a dedicated full-width (on mobile) "Hent min posisjon via GPS" button below the address field, placed alongside the geocoding button for better accessibility and touch targets.
- **Admin Dashboard UI Refactor:**
    - Wrapped "Brukere & Tilganger" in a collapsible card to reduce vertical space.
    - Moved "Hoveddepot & Geofencing" into a new dedicated "Timelister / Ansatte" card.
    - Linked "Timelister / Ansatte" card visibility to the `workforce` module setting.
    - Simplified the "Datahåndtering" card to focus solely on Leveringssteder export/import.
- **Responsive Message System:** Completely redesigned the messages page for mobile.
    - **Split-View Layout:** Implemented a WhatsApp-style view that switches between contact list and chat window on mobile.
    - **Scroll Performance:** Optimized layout to ensure independent scrolling for both contacts and messages without page-level overflow.
    - **Global Search Integration:** The messages contact list is now synced with the main dashboard search bar at the top of the screen.
- **Sidebar Architecture:** Refactored the sidebar to support dynamic module checks and enhanced role-based filtering for `super_admin`.
- **Logistics Menu Order:** Reorganized the Logistikk sidebar group into a more logical operational flow (Ordrer -> Ruter -> Auto-plan -> Lasterampe -> Overvåkning).
- **Organization Data Model:** Expanded the `Organization` interface to include `status` and `modules` configuration.

### Fixed
- **Place Form Draft Restoration:** Improved the draft system to correctly restore complex objects including HMS checklist answers, delivery windows, and GPS coordinates.
- **HMS Checklist Interaction:** Resolved a double-toggle bug in the HMS checklist on the Place Form. Standardized the interaction by properly linking `Label` elements to `Checkbox` components and preventing event propagation.
- **Owner Privilege Propagation:** Fixed an issue where users assigned the `owner` (Eier) role were not granted administrative privileges in the UI. Updated `AuthProvider`, `Sidebar`, and `AdminPage` to correctly identify `owner` as an administrative role.
- **Super Admin Owner View Access:** Fixed a routing bug where users with the `super_admin` role were incorrectly redirected away from the `/dashboard/owner` (Executive Dashboard) page.
- **Maximum update depth exceeded with Collapsible:** Fixed a UI crash related to Radix UI's Collapsible component. The issue was resolved by updating the `@radix-ui/react-collapsible` and `@radix-ui/react-accordion` dependencies to their latest versions to eliminate mismatched duplicate versions causing infinite loops in React 19.
- **Maximum update depth exceeded with Switch:** Fixed a UI crash related to Radix UI's Switch component. This was resolved by forcing an update to `@radix-ui/react-compose-refs` to eliminate duplicate and conflicting versions causing infinite loops under React 19, and updated `@radix-ui/react-switch` to the newest version compatible with it.
- **Admin Dashboard:** Fixed a bug in the "Inviter ny bruker" modal where typing in the email field would incorrectly update the name field. Renamed the "Inviter" button to "+ Ny bruker" for clarity.
- **Place Form Validation:** Fixed an issue where validation errors would appear immediately on page load and persist incorrectly due to local storage drafts overriding React Hook Form state.
- **Super Admin Operations:** Fixed permission rules and backend functions to allow Super Admins to correctly invite and delete users across organizations.
- **Place Form Log Persistence:** Fixed an issue where the user who created or edited a place was not being correctly saved or displayed in the activity log.
    - Added `updatedBy`, `updatedByName`, and `authorName` fields to the `Place` model.
    - Updated `PlaceForm` to correctly capture and save the current user's UID and Name during creation and updates.
    - Updated `PlaceDetailsPage` to display both the creator and the last editor in the Log section.
- **Fleet History Visibility Fix:** Updated the `getVehicleDamages` query to include an `orgId` filter, satisfying Firestore security rules and ensuring reports are visible to organization admins.
- **Fixed modules rendering** in admin dashboard according to org settings.
- **Fixed automatic read status** on messages when opening chat.
- **Fixed `getInvitations` cloud function**: Super Admins can now correctly fetch and view invitations, resolving the permission denied error on the admin dashboard.
- **Message System Robustness:** 
    - Added backwards compatibility for older messages without a `type` field.
    - Fixed `.toDate()` type errors by implementing a safe date conversion helper.
    - Added safe array checks for `readBy` and name fields to prevent crashes.
- **Role Propagation:** Updated message count and permission logic to correctly account for the new `super_admin` role across the entire application.

## [0.1.0] - 2024-05-22

### Added
- **API Documentation:** Integrated `typedoc` and `typedoc-plugin-markdown` to automatically generate Markdown-based documentation from internal TypeScript interfaces and libraries. Run `npm run docs` to build. Output is located in `docs/api`.
- **Advanced Fleet Compliance & Workshop Workflow:** Implemented a multi-stage status and document tracking system for the vehicle fleet.
    - **Quick Status Manager:** Added a `VehicleDetailsModal` allowing administrators to instantly toggle operational states (Klar, På rute, Parkert, Observasjon, Venter på verksted, På verksted) without full record editing.
    - **Automated Damage Triage:** Integrated `VehicleInspectionForm` with the fleet system. If a driver reports damage, the vehicle is automatically tagged as "Observasjon" and a structured `Damage Report` is created for admin review.
    - **Workshop Order Tracking:** Admins can upload workshop order receipts/confirmations. This action automatically triggers a "Venter på verksted" alert status, signaling the team that a repair date is set.
    - **Repair & Resolution Workflow:** Admins can upload final repair receipts to formally close damage reports. This action marks the report as "Utbedret" (Fixed) and returns the vehicle to "Klar" (Ready) status.
    - **Intelligent Status Coexistence:** The system supports overlapping states (e.g., a vehicle can be both "På rute" and under "Observasjon"), but enforces exclusivity for terminal states like "På verksted".
- **Visual Compliance Dashboard:** Enhanced the Fleet overview cards with color-coded deadline tracking for EU-kontroll, Service, and Tachograph calibration.
- **Complete Dashboard Statistics:** Expanded the Admin Dashboard stats to include all categories.
    - **Personnel:** Now displays "Fri" (Off) and "Annet" (Other) categories in addition to Working/Sick/Vacation.
    - **Fleet:** Now explicitly displays "Parkert" (Parked) vehicles.
- **Place Delivery Window Toggle:** Added a new "Begrens tid" (Limit time) toggle to the "Leveringsvindu" section in the Place Form.
    - This allows users to explicitly decide if a location has delivery time restrictions.
- **Fail-Safe Geocoding:** Implemented a multi-provider geocoding system for the Place Form.
    - Added Google Maps Geocoding as primary provider.
    - Added OpenStreetMap (Nominatim) as an automatic fallback.
- **Route Workload Balancing:** Upgraded the `ConstraintEngine` and Routing Dashboard to support workload distribution.
    - **Balanced Strategy:** Added a new "Fordel jevnt" toggle that distributes unassigned orders across all available drivers.
- **Supportive & Internal Tasks:** Added an "Intern Oppgave" (Internal Task) button to the Routing Dashboard for non-delivery routes.
- **Employee Progress Tracking (LMS):** Implemented a new "Ansattstatus" (Employee Status) view in the Learning Admin panel.
- **Enhanced Learning Portal Admin UI:** Redesigned the main learning dashboard for clearer differentiation between personal and admin tasks.
- **Intelligent Fleet & Physical Constraints:** Upgraded the `ConstraintEngine` and `VehicleForm` to support Trailers, Tractors, Environmental Zones, and site-specific physical limits (Height, Width, etc.).
- **Constraint-Based Routing Engine (Foundation):** Created `src/lib/routing-engine.ts` with vehicle, capability, and time-window validation.
- **Collapsible Opening Hours UI:** Redesigned the "Åpningstider" section in the Place Form into a focused collapsible card.
- **Schedule Copy Helper:** Added a "Bruk mandag på alle dager" shortcut to the opening hours registration.
- **Intelligent Route ETA & Opening Hours Validation:** Integrated time-window constraints into the route planning engine.
- **Place Opening Hours (Phase A):** Implemented a comprehensive scheduling system for delivery locations.
- **LMS Storage Integration:** Upgraded the Learning Management System to support direct file uploads to Firebase Storage.
- **Expanded Workforce Analytics:** Added a new "Annet" (Other) category box to the Workforce statistics dashboard.
- **Learning Management System (LMS) Foundation:** Launched a comprehensive training module with Læringsportal and Course Player.
- **Bulk Order Import:** Implemented a new CSV-based bulk import tool with auto-column mapping.
- **Attendance Statistics Card:** Added a new real-time tracking card to the Admin Dashboard for today's attendance.
- **Rapid "Scan-to-Receive" Workflow:** Implemented a high-speed mobile ingestion interface for terminal workers.
- **Dedicated Loader Dashboard:** Created a new, focused dashboard view specifically for the 'loader' role.
- **Hierarchical Barcode Generation:** Implemented automatic generation of unique barcodes for Collies and SSCC-style barcodes for Pallets.
- **Smart Manifest Scanning:** Upgraded the scanner interface to distinguish between Order, Collie, and Pallet barcodes.
- **Order 'Varer & Palletering':** Added detailed line item support and automatic pallet estimation to the New Order form.
- **Route Keys Dashboard Card:** Added a dynamic card that alerts drivers to specific keys needed for their assigned route.

### Fixed
- **Vehicle Creation Bug:** Fixed a critical issue where the "Registrer enhet" button failed to save new vehicles.
- **Fleet Compliance Indexing:** Fixed a bug where `euControl` and `nextService` dates were not correctly saved.
- **Firestore Sentinel Conflict:** Fixed a critical bug in `cleanObject` utility that broke `deleteField()` operations.
- **iOS Map Rendering:** Resolved hardware acceleration issues causing iframes to fail on certain mobile devices.
- **Place Form Numeric Validation:** Implemented robust preprocessing for numeric fields to handle regional decimal formats (commas).

### Removed
- **Redundant Navigation:** Removed duplicate "+ Ny Rute" and "Snarveier" cards to streamline the administrative experience.

## [Future]

### Added
- **Tachograph Download Tracking:** Implement a system to register and track when tachograph data was last downloaded for compliance.
- **Odometer Tracking (`kilometerstand`):** Implement a system for tracking vehicle mileage.
- **Geofence-based Delivery Alerts:** Automatically flag deliveries completed outside a configurable radius from the destination.
- **API Intake:** Secure REST endpoint for external TMS/ERP order ingestion.
- **Tachograph Analysis:** Detailed reporting on driving/rest time regulation breaches (Phase 6).
- **Commercialization:** Stripe payment integration and feature gating for modular SaaS distribution (Phase 7).
- **Capacitor.js Integration:** True native mobile distribution for iOS and Android (Phase 8).

### Fixed
- **Vehicle Form Persistence:** Refactor the "Ny enhet" form to be more robust.
- **Fleet Card Notifications:** Fix the issue where "ny sak/ service" notifications are not showing up correctly on the vehicle cards.