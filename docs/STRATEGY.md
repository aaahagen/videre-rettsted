
# Development Strategy & Roadmap

This document outlines the phased implementation plan for future features. The goal is to build new functionality in a logical order that minimizes technical conflicts and delivers value incrementally.

## Phase 1: Foundational Enhancements & Core Data Models

The goal of this phase is to establish the foundational data structures and add high-value, standalone features that improve daily operations and communication.

1.  **Core Fleet Management:** Create the database structure and UI for `Vehicle Profiles`.
2.  **Workforce Management & Driver Profiles:** Create the database structure and UI for `Driver Profiles` to manage workforce details (e.g., working hours, certifications, skills).
3.  **Authentication & Security Enhancements:**
    *   **Multi-Factor Authentication (MFA):** Implement mandatory MFA for all users with an "Admin" role to enhance security.
    *   **Super-Admin Login:** Enable "Sign in with Google" as an exclusive, convenient login method for the Super-Admin account.
    *   **Standard User Login:** Maintain the secure email-and-password system for all regular (non-admin) users.
4.  **Monitor Page UI/UX Refinements:**
    *   **Card Content & Layout:**
        *   Add a direct link from a place on the monitor page to its detailed place page.
        *   Review and simplify the status indicators (e.g., consolidating progress bars).
        *   Review all text and labels for clarity and conciseness (e.g., `...flere gjenstående stopp...`).
    *   **Timestamps:**
        *   Display a timestamp for each individually completed stop within the card view.
        *   When a route is fully completed, display a prominent final completion timestamp on the card (e.g., "Finished at 14:32").
    *   **Interactivity:**
        *   Implement an "expand/collapse" feature on route cards to allow planners to see the full list of stops on demand without leaving the monitor page.
5.  **Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.
6.  **Driver Location & Timestamps:** Capture GPS location and timestamps for an audit trail for every stop.
7.  **Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.

## Phase 2: End-to-End Verification & Process Integrity

This phase focuses on building the features that ensure what is planned is what actually happens in the physical world, creating a full, verifiable chain of custody.

1.  **Proof of Delivery (POD) System:** Build the complete POD workflow (signatures, photos, barcode scans).
2.  **Vehicle Loading & Manifest System:** Implement the barcode-scanning workflow for verifying loaded items.
3.  **Integrated Digital Vehicle Inspections:** Build a comprehensive, in-app vehicle inspection module with customizable checklists, media attachments, defect management, and shareable PDF reports.

## Phase 3: Intelligent Automation & Optimization

This is the phase where we leverage all the data and structures from the previous phases to enable true, intelligent automation.

1.  **Install & Integrate Google OR-Tools:** Integrate Google's optimization library into the backend.
2.  **Advanced Data Definitions (Tier 2):** Expand the data models to include all detailed properties required for optimization:
    *   **Goods:** Size, weight, form, temperature requirements, ADR status.
    *   **Vehicles:** Detailed capacity, dimensions, and special capabilities.
    *   **Places:** Add "Opening Hours" to ensure deliveries are only scheduled at valid times.
    *   **Drivers:** Utilize `Driver Profiles` (working hours, skills, certifications) as constraints.
3.  **Constraint-Based Automatic Route Generation (Tier 3):** Use Google OR-Tools to automatically generate optimized, multi-stop daily routes based on all defined constraints (Goods, Vehicles, Places, and Drivers).
4.  **Geofence-based Delivery Alerts:** Automatically flag potential delivery errors by comparing GPS location with the planned stop's address.

## Phase 4: Commercialization & Multi-Tenancy

This phase focuses on building the features necessary to offer the application as a multi-tenant, subscription-based service (SaaS).

1.  **Super-Admin & Organization Management:** Create a "Super-Admin" role (for you as the owner) with the ability to manage different customer organizations, users, and permissions.
2.  **Stripe Payment Integration:** Integrate the Stripe API to handle customer subscriptions, billing, and payments.

## Phase 5: Resilience & Accessibility

This phase focuses on extending the application's reach and ensuring it remains functional even in challenging network conditions.

1.  **Offline-Capable Mobile Application:** Develop a downloadable application (likely a PWA or native app) that allows users to access and interact with their essential data (e.g., routes, places) even when offline. The app will sync its data with the backend whenever a connection becomes available.
