# Development Strategy & Roadmap

This document outlines the phased implementation plan for future features. The goal is to build new functionality in a logical order that minimizes technical conflicts and delivers value incrementally.

## Phase 1: Foundational Enhancements & Core Data Models (Completed)

The goal of this phase is to establish the foundational data structures and add high-value, standalone features that improve daily operations and communication.
(All items completed)

## Phase 2: Advanced Workforce Management & HR Integration (Completed)

This phase expands on the initial workforce module, introducing comprehensive HR and compliance features to provide administrators with deeper insights and control over personnel management.
- **Attendance Statistics:** A daily attendance overview card on the Admin Dashboard detailing check-ins, active presence, and check-outs. (Completed)
- **Expanded Personnel Statistics:** Added an "Annet" (Other) category to the workforce statistics view for specialized status overrides. (Completed)
- **Learning Management System (LMS) Module:** A comprehensive training and certification system. (Completed)
    - **Course Library:** Admins can create and manage modules (PDF, Video, Text).
    - **Assignment:** Courses can be assigned organization-wide.
    - **User Progress:** Users can complete lessons through a sequential player and earn certifications.

## Phase 3: End-to-End Verification & Process Integrity (Completed)

This phase focuses on building the features that ensure what is planned is what actually happens in the physical world, creating a full, verifiable chain of custody.

1.  **Comprehensive Proof of Delivery (POD) System (Completed):** Industry-standard models capturing GPS, photo evidence, and failure exceptions.
2.  **Vehicle Loading & Manifest System (Completed):** 
    *   **Loader Dashboard:** A dedicated, high-efficiency view for terminal staff.
    *   **Manifest Verification:** Logic to link orders to vehicles and track scanning history.
    *   **Rapid Scan-to-Receive:** Ingestion engine for 3rd party packages with real-time assignment.
3.  **Digital Vehicle Inspections (Completed):** Pre/Post-trip safety checks and damage reporting integrated into the route flow.

## Phase 4: Intelligent Automation & Order Management (In Progress)

This phase leverages the data structures from previous phases to manage incoming jobs and enable intelligent automation.

1.  **Multi-Modal Order Intake & Management (In Progress):** 
    *   **Manual Registration (Completed):** UI for manual input with volumetric calculations.
    *   **Bulk CSV Import (Completed):** Tool for importing high-volume order data with auto-mapping.
    *   **API Intake (Planned):** Secure REST endpoint for external TMS/ERP ingestion.

2.  **Constraint-Based Routing Engine (In Progress):** 
    Develop the logic to match order requirements (e.g., 3 pallets, frozen) against vehicle capabilities and time constraints.
    *   **Place Opening Hours (Critical Constraint):** 
        *   **Phase A (Data):** Extend the `Place` model to store a 7-day schedule (open/close times or marked closed). (Planned)
        *   **Phase B (Route Logic):** Upgrade route planning to warn planners if a calculated ETA falls outside a location's opening hours. (Planned)
    *   **Implementation:** Integrate Google OR-Tools for constraint-based automatic route generation.
    *   **Crucial Constraint:** Automation must be an *opt-in enhancement*, supporting manual overrides at all times.

## Phase 5: Business Intelligence & Data Exposure (Planned)

This phase focuses on aggregating the rich operational data collected in previous phases into high-level, strategic insights for business owners.

1.  **Develop Backend Data Aggregation Layer:** Create dedicated, efficient backend Cloud Functions to compute Key Performance Indicators (KPIs).

2.  **API-First Design:** Expose these aggregated KPIs through a secure, well-documented API endpoint for internal and external consumption.

3.  **Build the "Strategic Dashboard":** Create a new dashboard view composed of clean widgets to visualize Terminal, Workforce, and Fleet analytics.

## Phase 6: Compliance & Risk Management (Planned)
This phase introduces a comprehensive suite of tools to ensure the company operates in full compliance with Norwegian and EU transport regulations.

1.  **Centralized Deadline & Certificate Management:** Tracking YSK, ADR, Driver's Licenses, and EU-kontroll with proactive alerts (90/60/30 days).
2.  **Tachograph & Driving Time Analysis:** Analysis of breaches of driving and rest time regulations (EU 561/2006).
3.  **Digital Compliance Archive:** Centralized storage for employment contracts and audit records.

## Phase 7: Commercialization & Multi-Tenancy (Planned)

Transforming the application into a subscription-based SaaS.

1.  **Modular Feature Gating:** Update the core model to include `activeModules` for role-based and subscription-based UI rendering.
2.  **Stripe Payment Integration:** Automated billing and module unlocking.

## Phase 8: Resilience & Native Mobile Distribution (Planned)

1.  **App Store & Google Play Distribution:** Packaging the driver-facing application via Capacitor.js.
2.  **Native Hardware Integration:** Deep camera and geolocation API access.
3.  **True Offline Storage:** Persistent native device storage for network-dead zones.
