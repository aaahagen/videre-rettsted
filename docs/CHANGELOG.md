# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Vehicle Creation Bug:** Fixed a critical issue where the "Registrer enhet" button failed to save new vehicles. The form now correctly distinguishes between new document creation (using `undefined` for empty fields) and existing document updates (using Firestore `deleteField()` sentinels). Also resolved a double-save race condition during the initial vehicle registration.

### Added
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

### Changed
- **Terminology Refinement:** Standardized "Leveringsvindu" (Delivery window) across the app to replace "Åpningstider" for better context.
- **Dashboard UI Refresh:** Implemented layered contrast and semantic logic striping for a more professional, "glance-first" interface.
- **Place Details Layout:** Reordered sections to prioritize map and location info, hiding empty fields to reduce visual noise.
- **Route Planning Strategy:** Updated documentation to reflect "Open Access" policy for locations without registered constraints.
- **Cascading Order Deletion:** Implemented atomic transactions to clean up manifests and routes when an order is deleted.

### Fixed
- **Fleet Compliance Indexing:** Fixed a bug where `euControl` and `nextService` dates were not correctly saved to the `Vehicle` model.
- **Firestore Sentinel Conflict:** Fixed a critical bug in `cleanObject` utility that broke `deleteField()` operations during vehicle updates.
- **iOS Map Rendering:** Resolved hardware acceleration issues causing iframes to fail on certain mobile devices.
- **Place Form Numeric Validation:** Implemented robust preprocessing for numeric fields to handle regional decimal formats (commas).

### Removed
- **Redundant Navigation:** Removed duplicate "+ Ny Rute" and "Snarveier" cards to streamline the administrative experience.

## [Future]

### Added
- **Tachograph Download Tracking:** Implement a system to register and track when tachograph data was last downloaded for compliance.
- **Odometer Tracking (`kilometerstand`):** Implement a system for tracking vehicle mileage. This includes adding a `kilometerstand` field to the vehicle model, displaying it on fleet cards, and creating a prompt for drivers to update the reading upon clocking out.
- **Geofence-based Delivery Alerts:** Automatically flag deliveries completed outside a configurable radius from the destination.
- **API Intake:** Secure REST endpoint for external TMS/ERP order ingestion.
- **Tachograph Analysis:** Detailed reporting on driving/rest time regulation breaches (Phase 6).
- **Commercialization:** Stripe payment integration and feature gating for modular SaaS distribution (Phase 7).
- **Capacitor.js Integration:** True native mobile distribution for iOS and Android (Phase 8).

### Fixed
- **Vehicle Form Persistence:** Refactor the "Ny enhet" form to be more robust, potentially preventing accidental closure when clicking outside, or persisting draft data to prevent data loss.
- **Fleet Card Notifications:** Fix the issue where "ny sak/ service" (new issue/service) notifications are not showing up correctly on the vehicle cards.
