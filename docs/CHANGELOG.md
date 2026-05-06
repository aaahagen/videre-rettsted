# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added   
- Added read count indicator for broadcast messages
- **Bulk Order Import Migration:** Moved the order import functionality from the Admin panel to the Orders page for better accessibility. Added a dedicated "Bulk Import" dialog on the Orders page.
- **Real-time Fleet Maintenance Tracking:** Upgraded the `VehicleDetailsModal` to use a Firestore `onSnapshot` listener for damage reports. This ensures that cases reported by both drivers and admins appear instantly in the history list.
- **Hybrid Customer Numbering System:** 
    - Introduced `customerNumber` field to `Place` model.
    - Added Organization settings to toggle between manual and automatic customer numbering.
    - Implemented thread-safe auto-generation using Firestore transactions, supporting custom prefixes and starting sequences.
    - Added customer number badges to Place Cards for quick identification.

### Changed
- **Admin Dashboard UI Refactor:**
    - Wrapped "Brukere & Tilganger" in a collapsible card to reduce vertical space.
    - Moved "Hoveddepot & Geofencing" into a new dedicated "Timelister / Ansatte" card.
    - Linked "Timelister / Ansatte" card visibility to the `workforce` module setting.
    - Simplified the "Datahåndtering" card to focus solely on Leveringssteder export/import.

### Fixed
- **Fleet History Visibility Fix:** Updated the `getVehicleDamages` query to include an `orgId` filter, satisfying Firestore security rules and ensuring reports are visible to organization admins.
- Fixed modules rendering in admin dashboard according to org settings
- Fixed automatic read status on messages when opening chat
- **Fixed `getInvitations` cloud function**: Super Admins can now correctly fetch and view invitations, resolving the permission denied error on the admin dashboard.

### Added
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
- **Responsive Message System:** Completely redesigned the messages page for mobile.
    - **Split-View Layout:** Implemented a WhatsApp-style view that switches between contact list and chat window on mobile.
    - **Scroll Performance:** Optimized layout to ensure independent scrolling for both contacts and messages without page-level overflow.
    - **Global Search Integration:** The messages contact list is now synced with the main dashboard search bar at the top of the screen.
- **Sidebar Architecture:** Refactored the sidebar to support dynamic module checks and enhanced role-based filtering for `super_admin`.
- **Logistics Menu Order:** Reorganized the Logistikk sidebar group into a more logical operational flow (Ordrer -> Ruter -> Auto-plan -> Lasterampe -> Overvåkning).
- **Organization Data Model:** Expanded the `Organization` interface to include `status` and `modules` configuration.

### Fixed
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
