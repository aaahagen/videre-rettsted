# Engineering, Design & QA Guidelines: VIDERE RettSted

This document outlines the technical architecture, design philosophy, and quality assurance protocols for building and maintaining VIDERE RettSted.

---

## 1. Architecture

### Frontend
*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui
*   **State Management**: React Context API (Session), Zustand (Local UI state)
*   **Deployment**: Firebase App Hosting

#### Next.js 15 Migration Notes (Async APIs)
Starting with Next.js 15, certain APIs that were previously synchronous are now asynchronous. When writing or refactoring Page components:
- **`params` and `searchParams`:** These are now Promises. You MUST unwrap them using `await` (in Server Components) or the `use()` hook (in Client Components).
- **Layouts:** `params` in Layouts are also Promises and must be unwrapped.

### Future Mobile Architecture (Phase 8)
To support App Store/Google Play distribution, the frontend will eventually be split:
1.  **Admin Console:** Remains a robust Next.js web application utilizing Server Components.
2.  **Driver Application:** Decoupled into a strictly Client-Side Rendered (CSR) architecture (Capacitor.js or React Native). Driver features must avoid heavy reliance on Next.js server-side features.

### Backend & API Layer
*   **Database**: Cloud Firestore
*   **Storage**: Cloud Storage for Firebase
*   **Authentication**: Firebase Authentication
*   **Functions**: Cloud Functions for Firebase (data aggregation, billing).

**Backend Abstraction (`src/lib/db/*`)**
All interactions with the backend are encapsulated within domain-specific repositories. **Never write raw Firebase queries directly in UI components.**
*   `src/lib/database.ts`: The main interface aggregator.
*   `src/lib/db/`: Contains domain files (`users.ts`, `orders.ts`, `manifests.ts`, etc.).
*   `src/lib/auth.ts` & `src/lib/storage.ts`: Interfaces for Auth and Storage.

**Consistency Rules for DB Functions:**
- Functions that modify or fetch data specific to an organization MUST accept `orgId` as a parameter to ensure strict multi-tenancy and compatibility with security rules.

### External Integrations
*   **Fail-Safe Geocoding (`src/lib/geocoding.ts`):** Google Maps Geocoding API is primary; OpenStreetMap (Nominatim) is the automatic fallback to prevent rate-limit failures.
*   **API-First BI (Phase 5):** Cloud Functions will calculate strategic KPIs (total km, overtime) and expose them via secure REST endpoints for external dashboards.

### Security Rules (Firestore)
*   Strict Role-Based Access Control (RBAC) enforced at the database level (`firestore.rules`).
*   Every collection verifies `isUserInOrg(resource.data.orgId)` to guarantee multi-tenancy isolation.
*   **GDPR Logging:** Accessing sensitive user data (e.g., admins viewing driver time approvals) triggers an explicit audit log.

---

## 2. Design System & UI Guidelines

### Core Philosophy: Function-First Design
The UI prioritizes speed, offline resilience, and error prevention over superficial aesthetics. It is built for the loading ramp and the truck cab.
- **Clarity over Clutter:** Every element must serve a purpose.
- **Reliability:** Native HTML inputs (especially `<input type="date">`) are preferred over custom, heavy libraries to ensure mobile robustness.

### Layout System
- **Role-Based Routing:** All users hit `/dashboard`. The UI dynamically adapts (Loaders see manifest tools, Planners see routing, Drivers see active assignments).
- **Responsive Containers:** Main content uses `max-w-7xl` to prevent ultra-wide stretching. Sidebars are mobile-responsive (burger menu).

### Core Components
- **Cards (`<Card>`):** Primary structural component for data grouping and form sections.
- **Dialogs (`<Dialog>`):** Used for complex creation/editing tasks (e.g., "Edit Vehicle") to maintain context.
- **Data Display:** Use `<PlaceGrid>` for image-heavy content, horizontal scrolling tables for timelines, and standard tables for dense transactional data.

### Color & Typography
- **Primary:** Deep blue (`#1A237E`) for main actions.
- **Background:** Light blue-gray (`#F0F4F8`).
- **Font:** 'Inter' or similar legible sans-serif.

---

## 3. Testing Strategy & QA Plan

VIDERE RettSted focuses intensely on the **Physical Execution Layer**. Testing must reflect the low-margin-for-error reality of logistics.

### Mobile-First Verification
All driver and loader screens (Manifest scanner, Route execution) **must** be tested on mobile emulators to ensure tap targets (min 44x44px) and table layouts do not break the viewport.

### Core Operational Loops (Manual QA)
Before any major release, execute these loops to guarantee system integrity:

**Loop 1: Order Intake & Route Planning (The Dispatcher)**
1.  Create an order with specific item counts, forms (Pallet), and constraints (ADR).
2.  Assign the order to a route. Verify weight/volume aggregation works.
3.  Assign a non-capable vehicle to the route and verify the constraint engine triggers a warning.

**Loop 2: The Loading Manifest (The Terminal Worker)**
1.  Generate a manifest for a route.
2.  Use the scanner input to scan an item barcode. Verify the counter increments (e.g., `1/3`).
3.  Test over-scan protection (scanning `4/3` must trigger an error toast).
4.  Test invalid barcode scanning (must trigger an error).
5.  Attempt to finalize an incomplete manifest (must trigger a browser confirmation dialog).

**Loop 3: Execution & Proof of Delivery (The Driver)**
1.  Log in as a Driver and open the active route.
2.  Trigger POD for a stop. Select "Satt igjen ved dør". Verify the UI forces a photo upload before submission.
3.  Trigger POD for a failed attempt. Verify the UI forces a failure reason selection.
4.  Verify real-time flow: As a driver completes a stop, log in as an Admin and verify the `/dashboard/monitor` instantly updates.
