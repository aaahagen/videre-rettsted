# Domain & Logic: VIDERE RettSted

## 1. Project Overview & Target Audience
VIDERE RettSted solves the "last-meter" delivery problem by providing photos, descriptions, and specific entrance maps that standard GPS misses. It is a central hub for route execution, fleet management, and workforce compliance.

- **Admins (Hjelpefunksjonærer)**: Tech-savvy individuals setting up organizations and managing users.
- **Drivers**: The primary users. The UI for them must be extremely intuitive and mobile-first.

## 2. Multi-Tenancy & Data Architecture
The system is multi-tenant from the ground up to support commercialization. All top-level Firestore collections containing org-specific data **must** be sub-collections of a primary `organizations` collection or include strict `orgId` filtering.
*   **Correct Example:** `/organizations/{org_id}/vehicles/{vehicle_id}` or `where("orgId", "==", user.orgId)`

### Onboarding Architecture
*   **Path A: Organization Registration (Self-Serve):** A secure Cloud Function creates the Organization, assigns the creator `role: 'admin'`, and links them.
*   **Path B: Employee Invitation (Closed Loop):** Admins generate secure, expiring invitation links. Users follow the link, setting their password and inheriting the correct `orgId` and role.
*   **Super Admin:** The platform owner utilizes the `super_admin` role for global management.

## 3. Core Features & Business Logic

### A. Place Management ("Last Meter")
*   Visual database of exact delivery locations with direct camera upload (max 8 images).
*   Automatic client-side downscaling of images before upload.
*   Customizable text fields (e.g., "Beskrivelse & Instruksjoner").
*   Hashtag categorization and a user-specific "Favorite" system.
*   **Delivery Windows:** Places can have weekly schedules; if none are registered, 24/7 access is assumed.
*   **Physical Firewalls:** Places can have max height/width/weight limits. If none are registered, open access is assumed.

### B. Order & Manifest Operations
*   **Dual Intake:** Orders must be created manually (for redundancy/ad-hoc) or via Bulk CSV/API.
*   **Goods Specification:** Orders strictly define payload (dimensions, weight, pallet count, ADR/Thermo needs).
*   **Hierarchical Barcodes:** SSCC-style pallets containing specific Collies, tracked down to the line item.
*   **Loader Dashboard:** A dedicated interface for terminal staff to scan packages onto vehicles via `Manifests`.

### C. Route Execution & POD
*   **Cyborg Planning:** Automated routing provides suggestions and warnings; planners maintain ultimate drag-and-drop manual control.
*   **Constraint-Based Routing:** Engine validates Capability (ADR/Thermo), Capacity (Weight/Volume), Physical (Height/Width), and Temporal (Time windows/Shifts) constraints.
*   **Distribution Strategy:** Planners can choose "Fill First" (efficiency) or "Balanced" (workload fairness).
*   **Personnel Priority:** Internal employees are routed before external contractors.
*   **Internal Tasks:** Planners can assign non-delivery routes (e.g., workshop runs).
*   **Proof of Delivery (POD):** Strict workflow requiring timestamped, geocoded photo evidence or explicit failure reasons ("Left at door", "Recipient unavailable").

### D. Fleet Management
*   Registry tracking dimensions, capacities, and capabilities (tail-lift, ADR).
*   **Digital Inspections:** Drivers perform pre/post-trip safety checks.
*   **Damage Triage Workflow:** Reported damages automatically flag the vehicle as "Observasjon" and create a structured report. Admins track workshop orders and repair receipts to return vehicles to "Klar" status.
*   *(Future: Odometer tracking via driver prompts).*

### E. Workforce Management & HR
*   **Driver Profiles:** Store contact info, emergency contacts, legal info (SSN, Tax Code), and private admin notes.
*   **Document Storage:** Upload certificates, digital contracts, and background checks.
*   **Time & Attendance:** Geofence-enforced stamping for fixed locations, GPS tracking for flexible locations.
*   **Approval Workflow:** Overtime requires explicit admin review.
*   *(Future: Peer approval restriction to prevent admins approving their own logs).*

## 4. Language Support
- Primary: Norwegian (Bokmål). Architecture must support future i18n.
