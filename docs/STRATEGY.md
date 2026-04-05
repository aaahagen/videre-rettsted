
# Development Strategy & Roadmap

This document outlines the phased implementation plan for future features. The goal is to build new functionality in a logical order that minimizes technical conflicts and delivers value incrementally.

## Phase 1: Foundational Enhancements & Core Data Models (Completed)

The goal of this phase is to establish the foundational data structures and add high-value, standalone features that improve daily operations and communication.

1.  ~~**Core Fleet Management:** Create the database structure and UI for `Vehicle Profiles`.~~ (Completed)
2.  ~~**Workforce Management & Driver Profiles:** Create the database structure and UI for `Driver Profiles` to manage workforce details (e.g., working hours, certifications, skills, and advanced rotation schedules).~~ (Completed)
3.  ~~**Authentication & Security Enhancements:**~~ (To be implemented in Phase 1.5/2)
    *   ~~**Multi-Factor Authentication (MFA):** Implement mandatory MFA for all users with an "Admin" role to enhance security.~~
    *   ~~**Super-Admin Login:** Enable "Sign in with Google" as an exclusive, convenient login method for the Super-Admin account.~~
    *   ~~**Standard User Login:** Maintain the secure email-and-password system for all regular (non-admin) users.~~
4.  ~~**Monitor Page UI/UX Refinements:**~~ (Completed)
    *   ~~Added direct links to places.~~
        *   ~~Simplified status indicators.~~
        *   ~~Added expand/collapse functionality to route cards.~~
        *   ~~*Note: Real-time exact timestamps for each stop are still pending a data model update to the Route completion array.*~~ (Completed)
5.  ~~**Driver Location & Timestamps:** Capture GPS location and timestamps for an audit trail for every stop.~~ (Completed)
6.  ~~**Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.~~ (Completed)
7.  ~~**Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.~~ (Completed)
8.  ~~**Driver Gamification:** Implement a visual progress bar reflecting the driver's actual exploration of the organization's delivery network.~~ (Completed)

## Phase 2: Advanced Workforce Management & HR Integration

This phase expands on the initial workforce module, introducing comprehensive HR and compliance features to provide administrators with deeper insights and control over personnel management.

1.  **Time & Attendance Tracking:**
    *   **Worked vs. Planned Hours:** Develop a system for drivers to log their actual start and end times.
    *   **Geofence-based Time Logging:** Implement an automatic "stamp in/out" system using geofencing to capture when drivers arrive at and leave the main depot/office.
    *   ~~**Multi-Day Timeline View:** Enhance the workforce page with a timeline visualization, allowing administrators to compare planned vs. actual worked hours for each driver over selectable periods (e.g., week, month).~~ (Completed)
    *   **Overtime Management:** Implement a workflow for administrators to review, approve, or decline logged overtime, whether entered manually or captured automatically.
2.  **Personnel File Enhancements:**
    *   ~~**Centralized Contact Info:** Redesign the personnel card to display all key personalia (address, phone, email, emergency contact, next of kin, children) in one accessible location.~~ (Completed)
    *   ~~**Administrative Notes:** Add a dedicated, private text field on each driver's profile for administrator comments.~~ (Completed)
    *   **Salary & Seniority Tracking:** Add fields for salary details and track seniority based on the start date.
3.  **Contract Management:**
    *   ~~**Digital Contracts:** Create a system to store contract details, including contracted hours, role, and start date.~~ (Completed)
    *   ~~**Contract History:** Implement versioning for contracts, allowing administrators to view a complete history of a driver's roles and contract changes over time.~~ (Completed)
4.  **Compliance & Planning Alerts:**
    *   **Working Hours Directive:** Integrate a rules engine into the schedule planner that alerts administrators in real-time if they attempt to create a schedule that violates legal or contractually agreed-upon working hour limits.

## Phase 3: End-to-End Verification & Process Integrity

This phase focuses on building the features that ensure what is planned is what actually happens in the physical world, creating a full, verifiable chain of custody.

1.  **Proof of Delivery (POD) System:** Build the complete POD workflow (signatures, photos, barcode scans).
2.  **Vehicle Loading & Manifest System:** Implement the barcode-scanning workflow for verifying loaded items.
3.  **Integrated Digital Vehicle Inspections:** Build a comprehensive, in-app vehicle inspection module with customizable checklists, media attachments, defect management, and shareable PDF reports.

## Phase 4: Intelligent Automation & Optimization

This is the phase where we leverage all the data and structures from the previous phases to enable true, intelligent automation.

1.  **Install & Integrate Google OR-Tools:** Integrate Google's optimization library into the backend.
2.  **Advanced Data Definitions (Tier 2):** Expand the data models to include all detailed properties required for optimization:
    *   **Goods:** Size, weight, form, temperature requirements, ADR status.
    *   **Vehicles:** Detailed capacity, dimensions, and special capabilities.
    *   **Places:** Add "Opening Hours" to ensure deliveries are only scheduled at valid times.
    *   **Drivers:** Utilize `Driver Profiles` (working hours, skills, certifications) as constraints.
3.  **Constraint-Based Automatic Route Generation (Tier 3):** Use Google OR-Tools to automatically generate optimized, multi-stop daily routes based on all defined constraints (Goods, Vehicles, Places, and Drivers).
4.  **Geofence-based Delivery Alerts:** Automatically flag potential delivery errors by comparing GPS location with the planned stop's address.

## Phase 5: Commercialization & Multi-Tenancy

This phase focuses on building the features necessary to offer the application as a multi-tenant, subscription-based service (SaaS).

1.  **Super-Admin & Organization Management:** Create a "Super-Admin" role (for you as the owner) with the ability to manage different customer organizations, users, and permissions.
2.  **Stripe Payment Integration:** Integrate the Stripe API to handle customer subscriptions, billing, and payments.

## Phase 6: Resilience & Accessibility

This phase focuses on extending the application's reach and ensuring it remains functional even in challenging network conditions.

1.  **Offline-Capable Mobile Application:** Develop a downloadable application (likely a PWA or native app) that allows users to access and interact with their essential data (e.g., routes, places) even when offline. The app will sync its data with the backend whenever a connection becomes available. *(Note: Firestore IndexedDB offline caching is already enabled at the data layer).*
