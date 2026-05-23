# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added   
- **PWA Update Notifier:** Added a "New Version Available" toast notification with one-click refresh, ensuring users always run the latest version of the application.
- **Automated API Documentation:** Configured `typedoc` with `typedoc-plugin-markdown` to automatically generate comprehensive API documentation from TSDocs in the `docs/api` directory.
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
    - **Place Card UI Upgrades:**
        - Cards now highlight in red if they have an open, unresolved danger report.
        - Added a "Meld Avvik" button directly on the card for quick reporting.
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

### Changed
- **Next.js 15 Implementation:** Completed the transition to async APIs for `params` and `searchParams` across all dashboard routes.
- **Enhanced Type Safety:** Refined internal interfaces (e.g., `Vehicle`, `WorkLog`) to better support strict TypeScript checks and TSDoc generation.
- **Documentation Pyramid Update:** Refreshed `engineering.md`, `domain.md`, and `strategy.md` to reflect Next.js 15 architecture, specialized roles, and new Phase 6 features.
- **UI Specification:** Authored `docs/ui-specification.md` to serve as a mandatory reference for all page refactors, preventing accidental feature loss.
- **Super Admin UI Refactor:** Completely redesigned the Super Admin dashboard layout to be more compact.
- **Place Form Redesign:** Converted creation form sections to collapsible cards.
- **Responsive Message System:** Redesigned messages page for mobile with split-view layout.
- **Admin Dashboard Mobile Optimization:** Refactored the user management list into a stacked layout for small screens to improve accessibility and readability.

### Fixed
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
