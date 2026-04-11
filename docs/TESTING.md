# Testing Strategy & QA Plan

This document outlines the testing strategy for VIDERE RettSted. As we focus intensely on the **Physical Execution Layer** (the real-time loop between Dispatcher, Loader, and Driver), our testing must reflect the fast-paced, low-margin-for-error reality of a terminal and a truck cab.

## Core Operational Loops

Before any major release or when refactoring core data models, the following manual QA scripts must be executed in sequence to ensure the fundamental value proposition of the product remains intact.

### Loop 1: Order Intake & Route Planning (The Dispatcher)

**Goal:** Verify an administrator can quickly create orders, define constraints, and assign them to a route without the system allowing invalid assignments.

1.  **Test Order Creation (Item Counts)**
    *   Navigate to `/dashboard/orders/new`.
    *   Create a new order with barcode `TEST-PALL-01`.
    *   Set **Antall Kolli/Paller** (`numberOfItems`) to `3`.
    *   Set Form to "Pall". Toggle "ADR" to ON.
    *   *Verification:* Ensure it appears in the Orders list (`/dashboard/orders`). Clicking it opens the details page correctly showing 3 items, the "Pall" form, and the ADR requirement.
2.  **Test Route Generation & Assignment**
    *   Navigate to `/dashboard/routes/new`.
    *   Create a new route (e.g., "Morgenrute Nord").
    *   Add the destination for `TEST-PALL-01` to the route.
    *   Assign the order `TEST-PALL-01` to this route.
    *   *Verification:* The route planner should dynamically display the aggregated weight/volume and show the ADR warning badge.
3.  **Test Constraint Warnings (Future)**
    *   *Preparation:* Ensure a vehicle exists in Fleet Management that does *not* have ADR capabilities.
    *   Assign this non-ADR vehicle to "Morgenrute Nord".
    *   *Verification:* The system must instantly display a prominent warning that the vehicle violates the order's constraints.

### Loop 2: The Loading Manifest (The Terminal Worker)

**Goal:** Verify a loader can use a scanner (or manual fallback) to accurately account for every single item on a route, preventing misloads and missing packages.

*Prerequisite: Complete Loop 1 to have an active route with assigned orders.*

1.  **Manifest Generation**
    *   Navigate to `/dashboard/manifests`.
    *   *Verification:* A new manifest for "Morgenrute Nord" should appear with a "Venter" (Pending) status and `0%` progress.
2.  **Item-Level Scanning**
    *   Open the "Morgenrute Nord" manifest.
    *   Type `TEST-PALL-01` into the scanner input and press Enter (simulating a barcode scan).
    *   *Verification:* The counter for that order should change to `1/3`. A success toast should appear. The overall progress bar should advance.
3.  **Manual Override & Exception Handling**
    *   Click the `+` button on the `TEST-PALL-01` order.
    *   *Verification:* The counter should change to `2/3`.
    *   Click the `-` button.
    *   *Verification:* The counter should drop back to `1/3`.
4.  **Completion & Over-scan Protection**
    *   Scan `TEST-PALL-01` two more times to reach max capacity.
    *   *Verification:* The counter hits `3/3`. The row turns green, the status text changes to "Lastet", and the `+` button becomes disabled.
    *   Scan `TEST-PALL-01` one more time.
    *   *Verification:* A warning toast says "Alle varer lastet" (All items loaded). The counter must *not* exceed `3/3`.
5.  **Invalid Scan Protection**
    *   Scan a random barcode like `FEIL-KODE-99`.
    *   *Verification:* A destructive red toast says "Ukjent strekkode".
6.  **Secure Finalization**
    *   While an order is partially loaded (e.g., `1/3`), click "Fullfør lasting" (Finalize loading).
    *   *Verification:* A browser confirmation dialog *must* pop up warning that items are missing. Cancel it.
    *   Get all orders on the manifest to their max capacity. Click "Verifiser & Fullfør".
    *   *Verification:* It should succeed without a warning, return the user to the manifest list, and the manifest status should change to verified/completed.

### Loop 3: Execution & Proof of Delivery (The Driver)

**Goal:** Verify a driver can navigate to the exact spot, understand what to deliver, and capture undeniable proof that the delivery occurred.

*Prerequisite: Complete Loop 2 to have a verified manifest ready for a driver.*

1.  **Route Execution**
    *   Log in as a Driver user. Navigate to the assigned route.
    *   *Verification:* The driver should see the "Viktig Ruteinformasjon" (Important Route Info) if notes exist.
2.  **Proof of Delivery (POD) Enforcement**
    *   Tap a stop to mark it complete.
    *   Select "Satt igjen ved dør" (Left at door) as the delivery method.
    *   *Verification:* The UI must dynamically enforce the capture of a photo. The submission button should be disabled until a photo is taken/uploaded.
3.  **Exception / Damage Reporting**
    *   Initiate POD on another stop. Select "Forsøk mislykkes" (Failed attempt).
    *   *Verification:* The UI must force the driver to select a failure reason (e.g., "Kunde ikke tilstede", "Skadet gods").
4.  **Real-Time Data Flow**
    *   Submit a successful POD.
    *   *Verification (Admin Side):* Log in as an Admin. Navigate to `/dashboard/monitor`. The route should show the stop as completed with the exact timestamp. The overall "Dagens Status" statistics should increment.

## General UI/UX Testing Guidelines

*   **Mobile-First Responsiveness:** All driver-facing and loader-facing screens (especially the Manifest scanner and Route execution views) must be tested on mobile device emulators (e.g., iPhone 12/SE dimensions) to ensure buttons are tap-friendly and tables do not break the viewport horizontally.
*   **Offline Resilience (IndexedDB):** For Driver views, simulate offline mode in Chrome DevTools. Verify that the route structure remains visible and that attempting to complete a stop queues the action rather than crashing the app.
