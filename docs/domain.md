 # Domain & Logic: VIDERE RettSted

## 1. Project Overview & Target Audience
VIDERE RettSted solves the "last-meter" delivery problem by providing photos, descriptions, and specific entrance maps that standard GPS misses. It is a central hub for route execution, fleet management, and workforce compliance.

- **Owners (Eiere / Økonomi)**: The top executives and finance department. They need high-level, exclusive dashboards for subscription management, global statistics (API-ready), and core database manipulation without the clutter of daily operations.
- **Admins (Hjelpefunksjonærer)**: Tech-savvy individuals setting up organizations and managing users, fleet, and routing.
- **Drivers**: The primary users. The UI for them must be extremely intuitive and mobile-first.
- **HMS Responsible (HMS Ansvarlig)**: A specialized role focused solely on safety. They have access only to the Places database and a dedicated HMS dashboard. Their editing rights are restricted to the safety checklists (HMS Sjekkliste) of a place.
- **Salesman (Selger)**: A specialized role for account managers. They have access only to the Places database. Their editing rights are restricted to the place's core details (address, photos) and a dedicated "Sales Message" field designed for temporary notes to drivers.

## 2. Multi-Tenancy & Data Architecture
The system is multi-tenant from the ground up to support commercialization. All top-level Firestore collections containing org-specific data **must** be sub-collections of a primary `organizations` collection or include strict `orgId` filtering.
*   **Correct Example:** `/organizations/{org_id}/vehicles/{vehicle_id}` or `where("orgId", "==", user.orgId)`

### Onboarding Architecture
*   **Path A: Organization Registration (Self-Serve):** A secure Cloud Function creates the Organization, assigns the creator `role: 'owner'`, and links them.
*   **Path B: Employee Invitation (Closed Loop):** Admins generate secure, expiring invitation links. Users follow the link, setting their password and inheriting the correct `orgId` and role.
*   **Super Admin:** The platform owner utilizes the `super_admin` role for global management.

## 3. Core Features & Business Logic

### A. Executive Dashboard (Owner Role)
*   **Exclusive Design:** A minimalist, premium UI devoid of daily operational clutter.
*   **Subscription & Billing:** Easy interface for upgrading/downgrading plans and viewing billing history.
*   **High-Level Analytics:** Key Performance Indicators (KPIs) like total completed routes, fleet health, and user counts. Data must be structured for easy export via secure REST APIs for external systems.
*   **Core Data Management:** Ability to manage the master database of Places (RettSted) to ensure data quality.

### B. Place Management ("Last Meter")
*   Visual database of exact delivery locations with direct camera upload (max 15 images).
*   Automatic client-side downscaling of images before upload.
*   Customizable text fields (e.g., "Beskrivelse & Instruksjoner").
*   Hashtag categorization and a user-specific "Favorite" system.
*   **Delivery Windows:** Places can have weekly schedules; if none are registered, 24/7 access is assumed.
*   **Physical Firewalls:** Places can have max height/width/weight limits. If none are registered, open access is assumed.
*   **Sales Messages:** Temporary, high-visibility notes added by salespeople to inform drivers about specific customer requirements. These messages have an expiration date.
*   **Avvikshåndtering (Danger Reports):** An integrated loop for drivers to report physical hazards at delivery locations. 
    *   Open reports flag the location visually (Red).
    *   Reports require an explanation and optional photographic evidence to be marked as resolved (Green).
    *   Dedicated dashboard at `/dashboard/reports` for global oversight of hazards.
*   **HMS Checklists:** Places can require a safety checklist to be completed. 
    *   Admins define questions and subheadings for organization-level grouping at `/dashboard/hms/settings`.
    *   **Drag-and-Drop Reordering:** Admins can intuitively rearrange the order of questions and subheadings using a drag-and-drop interface.
    *   Drivers/HMS Responsibles complete the checklists at the place level.
    *   **Modification Tracking:** If an HMS checklist is edited, the system automatically updates the completion timestamp and the name of the last contributor.
    *   A full audit log and CSV export are available at `/dashboard/hms`.
    *   **Visibility:** Completed HMS results are displayed with date/time stamps and investigator details directly in the detailed Place view (Sidebar). 
    *   **Filtered Summary:** To keep drivers focused, the HMS result card only displays subheadings and the items marked as "JA" (checked).

### C. Order & Manifest Operations
*   **Dual Intake:** Orders must be created manually (for redundancy/ad-hoc) or via Bulk CSV/API.
*   **Goods Specification:** Orders strictly define payload (dimensions, weight, pallet count, ADR/Thermo needs).
*   **Hierarchical Barcodes:** SSCC-style pallets containing specific Collies, tracked down to the line item.
*   **Loader Dashboard:** A dedicated interface for terminal staff to scan packages onto vehicles via `Manifests`.

### D. Route Execution & POD
*   **Cyborg Planning:** Automated routing provides suggestions and warnings; planners maintain ultimate drag-and-drop manual control.
*   **Constraint-Based Routing**: Engine validates Capability (ADR/Thermo), Capacity (Weight/Volume), Physical (Height/Width), and Temporal (Time windows/Shifts) constraints.
*   **Intelligent Vehicle Coupling**: The engine automatically forms logical setups (e.g., Tractor + Semi-trailer, Truck + Swap-body) based on availability and compatibility.
*   **Organization-Aware Optimization**: The routing engine utilizes the organization's `mainDepot` coordinates for all distance and range calculations.
*   **Intelligent Capacity Modeling**: Vehicle weight constraints are evaluated against dynamic curb weight estimates based on the *entire setup* (Power Unit + Passive Unit).
*   **Distribution Strategy:** Planners can choose "Fill First" (efficiency) or "Balanced" (workload fairness).
*   **Personnel Priority:** Internal employees are routed before external contractors.
*   **Internal Tasks:** Planners can assign non-delivery routes (e.g., workshop runs).
*   **Proof of Delivery (POD):** Strict workflow requiring timestamped, geocoded photo evidence or explicit failure reasons ("Left at door", "Recipient unavailable").

### E. Fleet Management
*   Registry tracking dimensions, capacities, and capabilities (tail-lift, ADR).
*   **Physical Specifications:** Vehicles track both payload capacity and `emptyWeight` (curb weight) for precise operational planning.
*   **Digital Inspections:** Drivers perform pre/post-trip safety checks.
*   **Damage Triage Workflow:** Reported damages automatically flag the vehicle as "Observasjon" and create a structured report. Admins track workshop orders and repair receipts to return vehicles to "Klar" status.
*   **Odometer Tracking:** Real-time tracking of vehicle mileage updated during driver inspections.

### F. Workforce Management & HR
*   **Driver Profiles:** Store contact info, emergency contacts, legal info (SSN, Tax Code), and private admin notes.
*   **Document Storage:** Upload certificates, digital contracts, and background checks.
*   **Time & Attendance:** Geofence-enforced stamping for fixed locations, GPS tracking for flexible locations.
*   **Approval Workflow:** Overtime requires explicit admin review.
*   *(Future: Peer approval restriction to prevent admins approving their own logs).*

## 4. Resilience & Updates
*   **PWA Lifecycle:** The application is designed as a Progressive Web App. 
*   **Update Notifier:** Users are automatically notified when a new version of the app is available, ensuring they always have access to the latest security fixes and features.

## 5. Language Support
- Primary: Norwegian (Bokmål). Architecture must support future i18n.
