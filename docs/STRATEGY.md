# Development Strategy & Roadmap

This document outlines the phased implementation plan for future features. The goal is to build new functionality in a logical order that minimizes technical conflicts and delivers value incrementally.

## Phase 1: Foundational Enhancements & Core Data Models (Completed)

The goal of this phase is to establish the foundational data structures and add high-value, standalone features that improve daily operations and communication.
(All items completed)

## Phase 2: Advanced Workforce Management & HR Integration (Completed)

This phase expands on the initial workforce module, introducing comprehensive HR and compliance features to provide administrators with deeper insights and control over personnel management.
(Time & Attendance Tracking, Overtime Management, etc.)
*Future additions:*
- **Attendance Statistics:** A daily attendance overview card on the Admin Dashboard detailing check-ins, active presence, and check-outs.
- **Expanded Personnel Statistics:** Adding an "Annet" (Other) category to the workforce statistics view.

## Phase 3: End-to-End Verification & Process Integrity (In Progress)

This phase focuses on building the features that ensure what is planned is what actually happens in the physical world, creating a full, verifiable chain of custody.

1.  **Comprehensive Proof of Delivery (POD) System (Completed):**
    *   **Data Models & Redundancy:** Implemented industry-standard models capturing GPS accuracy, specific delivery methods (e.g., 'left_at_door'), categorical photo evidence, and failure exceptions.
    *   **Driver UI:** Built a responsive POD Modal integrated directly into the route completion flow. It dynamically enforces logic (e.g., requiring photos if left at the door, capturing failure reasons) and compresses images client-side before upload.
2.  **Vehicle Loading & Manifest System (Backend complete):**
    *   **"Loader" Role:** A restricted user role for warehouse staff.
    *   **Manifest Verification:** Logic implemented to link orders to vehicles/routes and track exactly when and by whom an item was scanned and loaded.
    *   *Next Steps:* Build the `/dashboard/manifests` UI for loaders.
3.  **Digital Vehicle Inspections (Backend complete):**
    *   **Inspection Models:** Database schemas created for logging pre/post-trip checks (tires, brakes, fluids) and reporting damages with photos.
    *   *Next Steps:* Build the driver/mechanic UI form.

## Phase 4: Intelligent Automation & Optimization (In Progress)

This is the phase where we leverage all the data and structures from the previous phases to enable true, intelligent automation.
1.  **Order Management Module (Completed):** The UI (`/dashboard/orders`) and backend to handle incoming delivery jobs have been built.
    *   **Manual Intake:** A robust form for administrators to manually register new orders.
    *   **Hybrid Barcode Strategy (Future Enhancement):** Implement a dual-system for generating and using barcodes to ensure both external compatibility and internal efficiency. Printed labels will feature both a traditional barcode and a QR code.
        *   **1. External Compliance (The "License Plate"):**
            *   **Standard:** The system will generate industry-standard **GS1 SSCC (Serial Shipping Container Code)** numbers to uniquely identify each logistics unit (pallet, container, etc.).
            *   **Symbology:** This SSCC will be encoded in a **GS1-128 linear barcode**. This is mandatory for interoperability with external partners and the global supply chain.
        *   **2. Internal Efficiency (The "Digital Twin"):**
            *   **Standard:** The system will also generate a **QR Code** for the same logistics unit.
            *   **Data-Rich:** Unlike the linear barcode, this QR code will contain a rich data payload. This can include the SSCC, destination address, special handling instructions, a direct link to the order in the app, and other relevant details.
            *   **Benefits:** This provides significant advantages for internal operations: faster, omni-directional scanning via smartphone for drivers; high damage resistance; and the ability to access detailed information without a database lookup, which is ideal for offline scenarios.
    *   **API Intake (Foundation):** The backend schema is designed to seamlessly accept orders pushed from external systems (TMS/ERP) in the future.
2.  **Constraint-Based Engine:** Develop the logic to match order requirements (e.g., 3 pallets, frozen) against vehicle capabilities (e.g., has refrigeration, capacity for 5 pallets).

(Google OR-Tools integration, Constraint-Based Automatic Route Generation)
*Crucial Constraint:* Automation must be an *opt-in enhancement*, not a restrictive cage. The system must always support fully manual route creation, drag-and-drop overrides, and real-time ad-hoc adjustments to account for real-world unpredictability.

## Phase 5: Business Intelligence & Data Exposure (Planned)

This phase focuses on aggregating the rich operational data collected in previous phases into high-level, strategic insights for business owners. This will be implemented via a new "Strategic Dashboard" section for administrators, following an API-first principle.

1.  **Develop Backend Data Aggregation Layer:** Create dedicated, efficient backend Cloud Functions to compute Key Performance Indicators (KPIs) without impacting frontend performance. These functions will be the single source of truth for all strategic data.

2.  **API-First Design:** Expose these aggregated KPIs through a secure, well-documented API endpoint. This ensures that the same data powering our internal dashboard can be seamlessly consumed by third-party business intelligence tools (e.g., Geckoboard, Klipfolio, Power BI).

3.  **Build the "Strategic Dashboard":** Create a new dashboard view composed of clean widgets to visualize the following KPIs:
    *   **Workforce Analytics:**
        *   **Overtime Analysis:** A long-term view comparing approved overtime hours against planned/standard hours.
        *   **Contractor Usage:** Statistics on the utilization of hired extras, including total hours and percentage of the workforce.
        *   **Absence-based KPIs:** Long-term statistics for sickness and other types of leave.
    *   **Fleet Management Analytics:**
        *   **Vehicle Status Overview:** A dedicated module showing the operational status of all vehicles (e.g., Active, In Workshop, Off-road).
        *   **Maintenance & Inspection Tracking:** Proactive alerts for upcoming regulated check-ups (e.g., EU-Kontroll), service intervals, and workshop visits.
    *   **Route Performance Analytics:**
        *   **Long-term Route Efficiency:** Statistics on average route completion times versus estimates over historical periods.
## Phase 6: Commercialization & Multi-Tenancy

This phase focuses on building the features necessary to offer the application as a multi-tenant, subscription-based service (SaaS).

1.  **Super-Admin & Organization Management:** Create a "Super-Admin" role (for the platform owner) with the ability to manage different customer organizations, users, and permissions.
2.  **Stripe Payment Integration:** Integrate the Stripe API to handle customer subscriptions, billing, and payments.

## Phase 7: Resilience & Native Mobile Distribution

This phase focuses on extending the application's reach, ensuring offline reliability, and removing technical friction for drivers by distributing a native application.

1.  **App Store & Google Play Distribution:** Package the driver-facing portion of the application for official store distribution (via Capacitor.js or React Native). This eliminates the need for users to manually "Add to Home Screen" and increases perceived trust.
2.  **Native Hardware Integration:** Leverage native APIs for:
    *   **High-Quality Camera Access:** Crucial for rapid barcode scanning and clear Proof of Delivery (POD) photo capture.
    *   **Background Geolocation:** Enable reliable "Always-on" location tracking to trigger geofence alerts even when the app is minimized.
    *   **Native Push Notifications:** Utilize Apple APNs and Firebase Cloud Messaging (FCM) for highly reliable schedule updates and dispatch alerts.
3.  **True Offline Capabilities:** Move beyond browser-based IndexedDB (which can be aggressively cleared by the OS) and implement persistent, native device storage to guarantee the app remains functional in severe network dead zones.
## Phase 8: Telematics & Hardware Ecosystem (Exploratory)

This phase focuses on closing the gap between the software plan and the physical realities of the vehicle, moving beyond reliance on the driver's smartphone.

1.  **OEM & Third-Party API Aggregation:** Investigate and build integrations with major vehicle manufacturers (Volvo Connect, Scania Fleet) and popular aftermarket telematics providers (e.g., ABAX, GSGroup) to automatically ingest real odometer readings, fuel consumption, and diagnostic trouble codes (DTCs).
2.  **Proprietary Hardware Development (R&D):** Since the telematics landscape is fragmented and many companies operate mixed or older fleets, explore the feasibility of designing and manufacturing a proprietary 'VIDERE' OBD-II plug-and-play tracker. This would guarantee a unified, low-cost, and reliable data stream directly into our Fleet Management module, independent of the vehicle's age or brand.
