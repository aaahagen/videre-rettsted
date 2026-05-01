# VIDERE RettSted - Architecture

## Frontend

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui
*   **State Management**: React Context API for user session, Zustand for local UI state
*   **Deployment**: Firebase App Hosting

### Future Mobile Architecture (Phase 7)
To support App Store / Google Play distribution for drivers, the frontend architecture will eventually be split:
1.  **Admin Console:** Will remain a robust Next.js web application utilizing Server Components and App Hosting.
2.  **Driver Application:** Will be decoupled into a strictly Client-Side Rendered (CSR) architecture (either a statically exported Next.js app wrapped in Capacitor.js, or rebuilt in React Native/Expo). 
    *   *Constraint:* Driver-facing features must avoid heavy reliance on Next.js server-side features (like standard API routes or Node-based Image Optimization) to ensure a smooth transition to a native mobile wrapper.



## Multi-Tenancy & Commercialization Architecture

To support the future commercialization strategy (Phase 7), the architecture is designed to be modular.
*   **Feature Gating:** The `Organization` model in Firestore will contain an `activeModules` array (e.g., `['places', 'fleet']`).
*   **UI Level:** The frontend components (like the sidebar) will check this array and conditionally render links and dashboards only if the organization has access to that specific module.
*   **Security Level:** Firestore Security Rules will be implemented to securely restrict read/write access to collections (like `/vehicles` or `/routes`) based on the organization's `activeModules` array, ensuring data security even if the UI is bypassed.

## Backend

*   **Database**: Cloud Firestore
*   **Storage**: Cloud Storage for Firebase
*   **Authentication**: Firebase Authentication
*   **Functions**: Cloud Functions for Firebase (for backend logic like sending invitations and data aggregation).

## Data Privacy & GDPR Principle

*   **Anonymization of Contributions:** To comply with GDPR and enhance user privacy, personally identifiable information (like names) will **not** be stored directly within content data objects like `places`.
*   **Author Identification:** All contributions (creations, edits) will be logged using the user's non-personally identifiable `userId`.
*   **Client-Side Resolution:** When the UI needs to display an author's name, it will resolve it client-side by looking up the `userId` in the `/users` collection. This decouples content from personal data and provides control over who can see the information.
*   **Data Retention & Audit Trails:** Time stamps (`workLogs`) are subject to automated data retention policies, with a daily job deleting records older than 3 years. Furthermore, accessing sensitive user data, such as an admin viewing a driver's time approvals, triggers an explicit audit log stored securely in a `/logs` collection.


## Core Philosophy: Function-First Design

This project adheres to a "Function-First" design philosophy. The UI is built to serve the physical reality of the logistics operator, prioritizing speed, offline resilience, and error prevention over superficial aesthetics.

## Backend Abstraction & API Layer

To ensure future flexibility and ease of migration, all interactions with the backend are encapsulated within a dedicated abstraction layer.

- **`src/lib/database.ts`**: Defines a generic interface for raw data operations (CRUD).
- **`src/lib/firebase/database.ts`**: The main aggregator for the database interface using Firebase Firestore. It delegates specific operations to domain-specific modules.
- **`src/lib/db/*`**: Domain-specific database modules implementing the actual Firestore logic:
    - `users.ts`: Profile management and role resolution.
    - `places.ts`: Last-meter delivery location database.
    - `orders.ts`: Order intake, bulk import, and status tracking.
    - `routes.ts`: Planning, optimization, and assignment.
    - `vehicles.ts`: Fleet registry and compliance.
    - `manifests.ts`: Terminal loading and verification.
    - `workLogs.ts`: Time and attendance tracking.
    - `courses.ts`: LMS course library and user assignments.
    - `logs.ts`: Security audit and GDPR logging.
- **`src/lib/auth.ts`**: Defines a generic interface for authentication operations.
- **`src/lib/firebase/auth.ts`**: The Firebase implementation of the auth interface.
- **`src/lib/storage.ts`**: A generic interface for file storage operations.
- **`src/lib/firebase/storage.ts`**: The Firebase Storage implementation.

### Technical Debt Mitigation Strategy (Scaling Plan)
As the application transitions from MVP to Enterprise Scale, the following architectural refactoring is planned/ongoing:

1.  **Database Repository Pattern (Addressing the "God Object"):**
    *   *Current State:* Completed. `src/lib/firebase/database.ts` has been split into domain-specific repositories within the `src/lib/db/` directory. The main file now acts as an aggregator, fulfilling the `Database` interface.
    *   *Resolution:* Maintain the domain-specific repository structure for any new database entities to ensure maintainability and isolate domain logic.

2.  **React Server Components (RSC) Migration:**
    *   *Current State:* Heavy reliance on Client Components (`'use client'`) and `useEffect` for data fetching.
    *   *Resolution:* Shift data fetching to Server Components (e.g., `OrdersPage` fetches initial data server-side). 

3.  **Automated Testing Suite Integration:**
    *   *Current State:* Jest (unit) and Playwright (E2E) infrastructure is established.
    *   *Resolution:* Maintain and expand test coverage for all new features, specifically focusing on the loading and POD flows.

### API-First Principle for Business Intelligence (Phase 5)
For high-level data aggregation and KPI reporting, we will adopt an API-first principle. This involves:
- **Dedicated Cloud Functions:** All strategic data (e.g., total kilometers driven, overtime hours) will be calculated in dedicated, secure Cloud Functions.
- **Internal & External API:** These functions will serve a dual purpose:
    1.  They will provide data directly to the in-app "Owner's Super Dashboard."
    2.  They will be exposed via a secure, versioned API endpoint for consumption by third-party BI tools.

## Security Rules (Firestore)

The security model is fundamentally based on multi-tenancy and a strict role hierarchy. All queries and writes from the client **must** be validated against the user's `orgId` and their specific `role` within `firestore.rules`.

### Strict Rule Enforcement (Scaling Requirement)
To ensure enterprise-grade security and prevent cross-tenant data leaks, `firestore.rules` are strictly defined. 
*   Every collection verifies `isUserInOrg(resource.data.orgId)`.
*   Role-based access control (RBAC) is enforced at the database level.
*   **LMS Security:** Courses are organization-specific. Assignments are only readable by the assigned user or an admin.

### Role Hierarchy
The application enforces granular authorization levels:

1.  **Driver / Contractor (`role: 'driver' | 'contractor'`)**:
    *   **Scope:** Bound strictly to a single `orgId`.
    *   **Permissions:** Read access to routes and places. Operational writes (stops, POD, inspections, course completion).

2.  **Warehouse / Loader (`role: 'loader'`)**:
    *   **Scope:** Bound strictly to a single `orgId`.
    *   **Permissions:** Access to the manifest and loading modules. Can scan and mark items as loaded. Access to the dedicated **Loader Dashboard**.

3.  **Route Planner (`role: 'planner'`)**:
    *   **Scope:** Bound strictly to a single `orgId`.
    *   **Permissions:** Administrative access for creating and optimizing routes. Lacks access to sensitive HR/Payroll data.

4.  **Organization Admin (`role: 'admin'`)**:
    *   **Scope:** Bound strictly to a single `orgId`.
    *   **Permissions:** Full operational CRUD rights. Can manage personnel, fleet, and organization settings.

5.  **Organization Owner (`role: 'owner'`)**:
    *   Highest authority within a specific organization. Includes all admin rights plus export and deletion capabilities.

6.  **Super Admin (`role: 'super_admin'`)**:
    *   **Scope:** Global. Used for platform management and multi-tenancy support.

### Access Control Architecture
*   **Routing Segregation:** The UI dynamically adapts based on role (e.g., Loaders only see the manifest view, Admins see the full dashboard).
