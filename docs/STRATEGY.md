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
- **Web-Based Training Module:** A lightweight Learning Management System (LMS) integrated into the workforce page.
    - **Course Management:** Administrators will be able to create, upload (e.g., PDFs, videos), and manage a library of training courses.
    - **Assignment & Tracking:** Courses can be assigned to individual employees or roles. The system will track completion status, dates, and send reminders for required recertifications.

## Phase 3: End-to-End Verification & Process Integrity (In Progress)

This phase focuses on building the features that ensure what is planned is what actually happens in the physical world, creating a full, verifiable chain of custody.

1.  **Comprehensive Proof of Delivery (POD) System (Completed):**
    *   **Data Models & Redundancy:** Implemented industry-standard models capturing GPS accuracy, specific delivery methods (e.g., 'left_at_door'), categorical photo evidence, and failure exceptions.
    *   **Driver UI:** Built a responsive POD Modal integrated directly into the route completion flow. It dynamically enforces logic (e.g., requiring photos if left at the door, capturing failure reasons) and compresses images client-side before upload.
2.  **Vehicle Loading & Manifest System (In Progress):**
    *   **"Loader" Role:** A restricted user role for warehouse staff.
    *   **Manifest Verification (Completed):** Logic implemented to link orders to vehicles/routes and track exactly when and by whom an item was scanned and loaded.
    *   **Manifest UI (Completed):** Built the `/dashboard/manifests` UI for loaders, including item-level barcode scanning, manual overrides for loading progress, and full verification workflows.
    *   *Next Steps:* Implement Barcode/QR code generation and printing from the Order details view.
3.  **Digital Vehicle Inspections (Backend complete):**
    *   **Inspection Models:** Database schemas created for logging pre/post-trip checks (tires, brakes, fluids) and reporting damages with photos.
    *   *Next Steps:* Build the driver/mechanic UI form.

## Phase 4: Intelligent Automation & Order Management (In Progress)

This phase leverages the data structures from previous phases to manage incoming jobs and enable intelligent automation. A key focus is transforming the application to support high-volume terminal operations.

1.  **Multi-Modal Order Intake & Management (In Progress):** 
    The system must handle orders originating from various sources, balancing external interoperability with internal efficiency.
    *   **Manual Registration (Completed):** UI (`/dashboard/orders/new`) built for administrators to manually input order details (destinations, physical details, special requirements). *Future enhancement:* Capture precise physical dimensions (`height`, `length`, `depth`) for volumetric weight calculations.
    *   **Rapid "Scan-to-Receive" (Planned):** For acting as a middleman/hub for 3rd party carriers where API integration is unavailable. Terminal workers will use a dedicated mobile view to rapidly scan incoming 3rd party barcodes. The system will instantly generate a "shell" order, allowing the worker to quickly sort the package to a specific route or zone.
    *   **Bulk Import (Planned):** Allow administrators to upload CSV/Excel spreadsheets to generate orders en masse.
    *   **API Intake & Data Enrichment (Future Enhancement):** 
        *   **API Foundation:** The backend schema is designed to seamlessly accept orders pushed from external systems (TMS/ERP) via Electronic Data Interchange (EDI) or REST APIs.
        *   **Data Enrichment Workflow:** Orders received via API may lack specific data required for automated route planning. A manual verification step will allow administrators to review, enrich, and approve these orders.

2.  **Intelligent Labeling & Item-Level Tracking (Planned):**
    The system must accommodate both external and internally generated tracking standards down to the individual item (e.g., pallet) level.
    *   **Item-Level Tracking:** Evolve the `Order` model to generate and track individual barcodes for each item within a multi-item order (e.g., 5 distinct barcodes for an order of 5 pallets).
    *   **3rd Party Goods (Cross-Docking):** The system must respect and track existing 3rd party barcodes without requiring re-labeling.
    *   **Own Goods (Pick & Pack):** When producing or repacking goods, the system will offer an "Auto-Generate Labels" feature.
    *   **Hybrid Barcode Strategy:** Automatically generated labels will feature both:
        *   **External Compliance (GS1-128):** Industry-standard SSCC numbers for interoperability with external partners.
        *   **Internal Efficiency (QR Code):** Data-rich QR codes containing extensible payloads (SSCC, destination, notes, safety data links) for rapid, offline-capable internal scanning.

3.  **Constraint-Based Routing Engine (Planned):** 
    Develop the logic to match order requirements (e.g., 3 pallets, frozen) against vehicle capabilities (e.g., has refrigeration, capacity for 5 pallets).
    *   *Implementation:* Integrate Google OR-Tools for constraint-based automatic route generation.
    *   *Crucial Constraint:* Automation must be an *opt-in enhancement*, not a restrictive cage. The system must always support fully manual route creation, drag-and-drop overrides, and real-time ad-hoc adjustments to account for real-world unpredictability.

## Phase 5: Business Intelligence & Data Exposure (Planned)

This phase focuses on aggregating the rich operational data collected in previous phases into high-level, a href="https://github.com/features/actions"strategic insights for business owners. This will be implemented via a new "Strategic Dashboard" section for administrators, following an API-first principle.

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

## Phase 6: Compliance & Risk Management (Planned)
This phase introduces a comprehensive suite of tools to ensure the company operates in full compliance with Norwegian and EU transport regulations, minimizing risk and preparing the business for official audits (veikontroll and virksomhetskontroll).

1.  **Centralized Deadline & Certificate Management:** A core module for tracking all time-sensitive licenses and certifications.
    *   **Automated Tracking:** The system will track expiry dates for:
        *   **Personnel:** YSK (Professional Driver Competence), ADR (Hazardous Goods) certificates, Driver's Licenses (Førerkort), and Driver Cards (Sjåførkort).
        *   **Vehicles:** EU-kontroll, ADR-godkjenning (annual check for hazardous goods vehicles).
        *   **Company:** Fellesskapsløyve (Community License) and individual Løyveutskrifter (vehicle permits).
    *   **Proactive Alerts:** Automatic email and in-app notifications will be sent to administrators and relevant employees 90, 60, and 30 days before an expiration date.

2.  **Tachograph & Driving Time Analysis:** Integration to manage and analyze driver and vehicle data.
    *   **Data Download Reminders:** Automated reminders to download data from vehicle units (every 90 days) and driver cards (every 28 days).
    *   **Violation Analysis:** The system will analyze tachograph data for breaches of driving and rest time regulations (EU 561/2006). It will flag infringements for internal review.
    *   **Secure Archiving:** All downloaded tachograph data will be securely stored for the mandatory 12-month period, ready for audits.

3.  **Digital Compliance Archive:** A unified document repository for all regulatory needs.
    *   **Centralized Storage:** A single, searchable location for storing:
        *   Employment contracts and working time records.
        *   Tachograph analysis reports.
        *   Vehicle inspection and maintenance records.
        *   HMS (HSE) internal control documentation.
        *   Records of completed internal and external audits.
    *   **Audit-Ready:** This feature will allow administrators to quickly compile and export all necessary documentation in the event of a `virksomhetskontroll` (company audit).

4.  **Incident & Audit Log:**
    *   A dedicated log to systematically record events like roadside inspections, accidents, and internal deviations, including corrective actions taken.

5.  **User-Facing Compliance Dashboards & Visualizations:**
    *   **Driver Dashboard:** A dedicated, simple visual widget on the driver's main dashboard that clearly displays the status and upcoming deadlines for their personal compliance items (YSK, Driver's License, next Tachograph download).
    *   **Administrator Dashboard:** A compact, high-level infographic on the admin dashboard summarizing the overall compliance status of the workforce and fleet. This includes upcoming EU-controls for vehicles and a summary of driver duty statuses.
    *   **Enhanced Workforce View:** The employee cards on the main workforce page will be enhanced to show key compliance dates (e.g., YSK expiry) directly, allowing for quick, at-a-glance status checks by administrators.
    *   **Admin-Controlled Driver Dashboard Banner:** A system for administrators to create and schedule informational banners on the driver's dashboard. This will support rich text and images for seasonal reminders (e.g., winter chain checks), safety campaigns, or other timely announcements.

6.  **Regulatory & Company Knowledge Base:**
    *   **Driver View:** A dedicated section on the driver's dashboard providing direct links to essential external regulations (e.g., Lovdata, Statens vegvesen) and internal company policy documents.
    *   **Admin View:** A comprehensive resource center in the admin menu allowing administrators to manage the links and documents available to drivers, ensuring information is always up-to-date.

## Phase 7: Commercialization & Multi-Tenancy

This phase focuses on building the features necessary to offer the application as a multi-tenant, subscription-based service (SaaS).

1.  **Super-Admin & Organization Management:** Create a "Super-Admin" role (for the platform owner) with the ability to manage different customer organizations, users, and permissions.
2.  **Stripe Payment Integration:** Integrate the Stripe API to handle customer subscriptions, billing, and payments.

## Phase 8: Resilience & Native Mobile Distribution

This phase focuses on extending the application's reach, ensuring offline reliability, and removing technical friction for drivers by distributing a native application.

1.  **App Store & Google Play Distribution:** Package the driver-facing portion of the application for official store distribution (via Capacitor.js or React Native). This eliminates the need for users to manually "Add to Home Screen" and increases perceived trust.
2.  **Native Hardware Integration:** Leverage native APIs for:
    *   **High-Quality Camera Access:** Crucial for rapid barcode scanning and clear Proof of Delivery (POD) photo capture.
    *   **Background Geolocation:** Enable reliable "Always-on" location tracking to trigger geofence alerts even when the app is minimized.
    *   **Native Push Notifications:** Utilize Apple APNs and Firebase Cloud Messaging (FCM) for highly reliable schedule updates and dispatch alerts.
3.  **True Offline Capabilities:** Move beyond browser-based IndexedDB (which can be aggressively cleared by the OS) and implement persistent, native device storage to guarantee the app remains functional in severe network dead zones.

## Phase 9: Telematics & Hardware Ecosystem (Exploratory)

This phase focuses on closing the gap between the software plan and the physical realities of the vehicle, moving beyond reliance on the driver's smartphone.

1.  **OEM & Third-Party API Aggregation:** Investigate and build integrations with major vehicle manufacturers (Volvo Connect, Scania Fleet) and popular aftermarket telematics providers (e.g., ABAX, GSGroup) to automatically ingest real odometer readings, fuel consumption, and diagnostic trouble codes (DTCs).
2.  **Proprietary Hardware Development (R&D):** Since the telematics landscape is fragmented and many companies operate mixed or older fleets, explore the feasibility of designing and manufacturing a proprietary 'VIDERE' OBD-II plug-and-play tracker. This would guarantee a unified, low-cost, and reliable data stream directly into our Fleet Management module, independent of the vehicle's age or brand.
