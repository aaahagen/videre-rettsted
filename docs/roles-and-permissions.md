# Roles and Permissions: VIDERE RettSted

This document defines the Role-Based Access Control (RBAC) model for VIDERE RettSted.

## 1. Role Definitions

| Role | Description |
| :--- | :--- |
| **Super Admin** | Platform owner. Has unrestricted access to all organizations and global settings. |
| **Organization Owner** | Highest level within an organization. Focuses on executive oversight, billing, and core data. |
| **Organization Admin** | Manages day-to-day organization setup, users, fleet, and routing. |
| **Route Planner** | Responsible for planning and managing routes and manifests. |
| **Warehouse / Loader** | Terminal staff focused on scanning and loading goods onto vehicles. |
| **Driver / Contractor** | Primary mobile users executing routes, performing inspections, and reporting issues. |
| **HMS Responsible** | Specialized role for safety compliance and place-specific safety checklists. |
| **Salesman** | Specialized role for managing place core details and temporary sales messages. |

## 2. Permissions Matrix

| Feature / Area | Super Admin | Owner | Admin | Planner | Loader | Driver | HMS Resp. | Salesman |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **App Eier Section** | Full | - | - | - | - | - | - | - |
| **Org. Settings & Billing** | Full | Full | - | - | - | - | - | - |
| **User Management** | Full | Full | Full | - | - | - | - | - |
| **Audit Logs (GDPR)** | View | View | View | - | - | - | - | - |
| **Place Management** | Full | Full | Full | View | View | View | View* | View* |
| **- Edit Place Core** | Yes | Yes | Yes | - | - | - | - | Yes |
| **- Edit HMS Checklist** | Yes | Yes | Yes | - | - | - | Yes | - |
| **- Edit Sales Message** | Yes | Yes | Yes | - | - | - | - | Yes |
| **- Danger Reports** | Manage | Manage | Manage | View | - | Create | - | - |
| **Fleet Management** | Full | Full | Full | View | - | Inspect | - | - |
| **Workforce Management** | Full | Full | Full | View | - | Self | - | - |
| **Route Planning** | Full | Full | Full | Full | View | - | - | - |
| **Manifests & Loading** | Full | Full | Full | Full | Full | View | - | - |
| **Route Execution (App)** | Yes | Yes | Yes | Yes | - | Yes | - | - |
| **Time & Attendance** | Manage | Manage | Manage | View | - | Self | - | - |
| **HMS Dashboard** | View | View | View | - | - | - | Full | - |

\* *Restricted view or specific edit rights as noted.*

## 3. Detailed Role Permissions

### Super Admin
- Full access to all organizations.
- Manage global application settings and platform-level users.
- Can perform any action within any organization.

### Organization Owner
- **Dashboard:** Access to Executive Dashboard (`/dashboard/owner`).
- **Billing:** Manage subscription and Stripe integration.
- **Users:** Full user management (Invite, Role, Delete).
- **Settings:** Full organization settings.
- **Data:** Export/Import organization data.
- **Deletion:** Can delete the entire organization.

### Organization Admin
- **Dashboard:** Access to Admin Dashboard (`/dashboard/admin`).
- **Users:** Manage users (except deleting the Owner).
- **Fleet:** Full fleet management (Add/Edit vehicles, manage status).
- **Workforce:** Full workforce management (Add/Edit profiles, approve time).
- **Places:** Full place management.
- **Safety:** Manage global HMS settings and resolve Danger Reports.

### Route Planner
- **Logistics:** Full access to Routes and Orders.
- **Planning:** Create, edit, and delete routes. Assign drivers and vehicles.
- **Manifests:** Create and manage manifests.
- **Visibility:** View-only access to Fleet, Workforce, and Places.

### Warehouse / Loader
- **Operations:** Access to Loader Dashboard.
- **Scanning:** Scan packages onto manifests.
- **Visibility:** View routes and manifests.

### Driver / Contractor
- **App:** Primary access to mobile-optimized features.
- **Execution:** Execute assigned routes, scan PODs.
- **Safety:** Perform vehicle inspections, report damages, and report hazards (Danger Reports).
- **Attendance:** Punch-in/out for shifts.
- **Profile:** View and edit own profile.

### HMS Responsible
- **Places:** View all places. Edit only HMS-specific fields/checklists.
- **Dashboard:** Access to HMS Dashboard (`/dashboard/hms`) to monitor compliance.

### Salesman
- **Places:** View all places. Edit core details (address, photos) and Sales Messages.
- **Restrictions:** No access to logistics, fleet, or workforce data.
